/* =========================================================
   Rei Burgão — Painel de Pedidos (painel.html)
   Criasiteweb

   O pedido sai do site do cliente e cai aqui na hora.
   A loja escuta o alerta, confere e imprime.

   As funções que montam a comanda vêm de comanda-core.js.
   ========================================================= */

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import {
  getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged,
  browserLocalPersistence, setPersistence
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import {
  getFirestore, collection, query, where, orderBy, onSnapshot, getDocs,
  doc, getDoc, setDoc, updateDoc, Timestamp
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

import { FIREBASE_CONFIG, CONTA_LOJA } from "./firebase-config.js";

const app  = initializeApp(FIREBASE_CONFIG);
const auth = getAuth(app);
const db   = getFirestore(app);

/* ========================= atalhos ========================= */
const el = (s, r = document) => r.querySelector(s);
const els = (s, r = document) => [...r.querySelectorAll(s)];

const ETAPAS = {
  novo:       { rotulo: "Novo",        proxima: "preparando", acao: "✅ Aceitar e imprimir" },
  preparando: { rotulo: "Preparando",  proxima: "saiu",       acao: "Saiu para entrega" },
  saiu:       { rotulo: "A caminho",   proxima: "concluido",  acao: "Concluir" },
  concluido:  { rotulo: "Concluído",   proxima: null,         acao: null, reabre: true },
  recusado:   { rotulo: "Recusado",    proxima: null,         acao: null, reabre: true }
};

let pedidos = [];          // os do dia que está na tela, mais novos primeiro
let primeiraCarga = true;  // não apita ao abrir a tela
let filtro = "abertos";    // abertos | todos | historico
let dataHistorico = null;  // "AAAA-MM-DD" quando olhando um dia passado

/* ========================= alerta sonoro ========================= */
/* Gerado na hora pelo navegador — sem arquivo de som para carregar. */
let audioCtx = null;
function apitar(vezes = 3) {
  if (localStorage.getItem("rb_som") === "nao") return;
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === "suspended") audioCtx.resume();
    for (let i = 0; i < vezes; i++) {
      const t0 = audioCtx.currentTime + i * 0.38;
      const osc = audioCtx.createOscillator();
      const vol = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, t0);
      osc.frequency.setValueAtTime(1180, t0 + 0.14);
      vol.gain.setValueAtTime(0.0001, t0);
      vol.gain.exponentialRampToValueAtTime(0.32, t0 + 0.02);
      vol.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.30);
      osc.connect(vol); vol.connect(audioCtx.destination);
      osc.start(t0); osc.stop(t0 + 0.32);
    }
  } catch (e) { /* navegador sem áudio: o aviso visual continua valendo */ }
}

/* O alerta volta a tocar enquanto houver pedido novo sem ninguém mexer.
   Para no instante em que a loja aceita, imprime ou recusa. */
let insistir = null;

function comecarInsistencia() {
  if (insistir) return;
  insistir = setInterval(() => {
    const temNovo = pedidos.some(p => p.status === "novo");
    if (!temNovo) { pararInsistencia(); return; }
    apitar(2);
    document.title = "🔔 PEDIDO ESPERANDO — Rei Burgão";
  }, 20000);
}

function pararInsistencia() {
  clearInterval(insistir); insistir = null;
  document.title = "Painel de Pedidos | Rei Burgão";
}

function avisarNaTela(p) {
  document.title = "🔔 PEDIDO NOVO — Rei Burgão";
  setTimeout(() => { document.title = "Painel de Pedidos | Rei Burgão"; }, 12000);
  if ("Notification" in window && Notification.permission === "granted") {
    try {
      new Notification("Pedido novo — Rei Burgão", {
        body: `${p.cliente || "Cliente"} · ${p.tipo || ""} · ${reais(p.total || 0)}`,
        tag: p.id
      });
    } catch (e) {}
  }
}

/* ========================= entrar / sair ========================= */
function mostrarLogin(mostrar) {
  el("[data-tela-login]").hidden = !mostrar;
  el("[data-tela-painel]").hidden = mostrar;
}

el("[data-form-login]").addEventListener("submit", async e => {
  e.preventDefault();
  const senha = el("[data-senha]").value;
  const aviso = el("[data-erro-login]");
  const botao = el("[data-entrar]");
  aviso.textContent = "";
  botao.disabled = true; botao.textContent = "Entrando…";
  try {
    await setPersistence(auth, browserLocalPersistence);
    await signInWithEmailAndPassword(auth, CONTA_LOJA, senha);
  } catch (err) {
    const cod = String(err && err.code || "");
    aviso.textContent = /wrong-password|invalid-credential|invalid-login/.test(cod)
      ? "Senha incorreta. Confira e tente de novo."
      : /network/.test(cod)
        ? "Sem internet. Verifique a conexão do computador."
        : "Não consegui entrar agora. Tente novamente em instantes.";
  } finally {
    botao.disabled = false; botao.textContent = "Entrar";
  }
});

el("[data-sair]").addEventListener("click", async () => {
  if (!confirm("Sair do painel? Você vai precisar digitar a senha de novo.")) return;
  await signOut(auth);
});

onAuthStateChanged(auth, usuario => {
  if (usuario) {
    mostrarLogin(false);
    el("[data-senha]").value = "";
    escutarPedidos();
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
  } else {
    mostrarLogin(true);
    if (pararDeEscutar) { pararDeEscutar(); pararDeEscutar = null; }
    pedidos = []; primeiraCarga = true;
  }
});

/* ========================= ouvir os pedidos ========================= */
let pararDeEscutar = null;

function faixaDoDia(iso) {
  /* iso = "AAAA-MM-DD"; sem iso, é hoje */
  const d = iso ? new Date(iso + "T00:00:00") : new Date();
  d.setHours(0, 0, 0, 0);
  const fim = new Date(d); fim.setDate(fim.getDate() + 1);
  return { de: Timestamp.fromDate(d), ate: Timestamp.fromDate(fim) };
}

function inicioDeHoje() { return faixaDoDia().de; }

/* histórico: busca um dia já passado, uma vez só */
async function carregarHistorico(iso) {
  const { de, ate } = faixaDoDia(iso);
  el("[data-lista]").innerHTML = `<p class="vazio">Buscando os pedidos de ${formatarData(iso)}…</p>`;
  try {
    const r = await getDocs(query(
      collection(db, "pedidos"),
      where("criadoEm", ">=", de), where("criadoEm", "<", ate),
      orderBy("criadoEm", "desc")
    ));
    pedidos = r.docs.map(d => ({ id: d.id, ...d.data() }));
    numerarDoDia();
    desenhar();
  } catch (e) {
    console.error(e);
    el("[data-lista]").innerHTML = `<p class="vazio">Não consegui buscar esse dia. Verifique a internet e tente de novo.</p>`;
  }
}

function formatarData(iso) {
  if (!iso) return "hoje";
  const [a, m, d] = iso.split("-");
  return `${d}/${m}/${a}`;
}

function escutarPedidos() {
  if (pararDeEscutar) pararDeEscutar();
  /* ao (re)abrir a escuta, a primeira leva não é "pedido novo" —
     senão o painel apitaria para todos os pedidos já existentes do dia */
  primeiraCarga = true;
  const consulta = query(
    collection(db, "pedidos"),
    where("criadoEm", ">=", inicioDeHoje()),
    orderBy("criadoEm", "desc")
  );
  pararDeEscutar = onSnapshot(consulta, instantaneo => {
    marcarConexao(true);
    const novos = [];
    instantaneo.docChanges().forEach(m => {
      if (m.type === "added" && !primeiraCarga) novos.push({ id: m.doc.id, ...m.doc.data() });
    });
    pedidos = instantaneo.docs.map(d => ({ id: d.id, ...d.data() }));
    numerarDoDia();
    desenhar();
    if (filtro === "caixa") desenharCaixa();
    if (novos.length) { apitar(); novos.forEach(avisarNaTela); }
    if (pedidos.some(p => p.status === "novo")) comecarInsistencia();
    else pararInsistencia();
    primeiraCarga = false;
  }, erro => {
    marcarConexao(false);
    console.error(erro);
    el("[data-lista]").innerHTML =
      `<p class="vazio">Perdi a conexão com o servidor de pedidos. Verifique a internet — assim que voltar, os pedidos aparecem sozinhos.</p>`;
  });
}

/* o número da comanda é a ordem de chegada no dia */
function numerarDoDia() {
  const totalHoje = pedidos.length;
  pedidos.forEach((p, i) => { p.numero = String(totalHoje - i).padStart(3, "0"); });
}

function marcarConexao(ok) {
  const s = el("[data-conexao]");
  s.dataset.ok = ok ? "sim" : "nao";
  s.textContent = ok ? "Recebendo pedidos" : "Sem conexão";
}

/* ========================= desenhar a tela ========================= */
function tempoDesde(ts) {
  if (!ts || !ts.toDate) return "";
  const min = Math.floor((Date.now() - ts.toDate().getTime()) / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `há ${min} min`;
  const h = Math.floor(min / 60);
  return `há ${h}h${String(min % 60).padStart(2, "0")}`;
}

function horaDe(ts) {
  if (!ts || !ts.toDate) return "";
  return ts.toDate().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function esc(s) {
  return String(s == null ? "" : s).replace(/[<>&"]/g, c => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" }[c]));
}

function resumoItens(p) {
  const lido = p.texto ? lerPedido(p.texto) : null;
  if (!lido || !lido.itens.length) return "";
  return lido.itens.map(i => `${i.q}x ${esc(i.nome)}`).join(" · ");
}

function cartao(p) {
  const etapa = ETAPAS[p.status] || ETAPAS.novo;
  const entrega = /entrega/i.test(p.tipo || "");
  const naMesa = /^mesa/i.test(p.tipo || "");
  return `
  <article class="pedido" data-status="${esc(p.status)}" data-id="${esc(p.id)}">
    <header>
      <span class="num">#${esc(p.numero)}</span>
      <span class="etapa e-${esc(p.status)}">${esc(etapa.rotulo)}</span>
      <span class="hora" title="${horaDe(p.criadoEm)}">${tempoDesde(p.criadoEm)}</span>
    </header>

    <div class="quem">
      <strong>${esc(p.cliente) || "Sem nome"}</strong>
      <span class="tipo ${entrega ? "t-entrega" : naMesa ? "t-mesa" : "t-retirada"}">${
        entrega ? "🛵 Entrega" : naMesa ? "🪑 " + esc(p.tipo) : "🏠 Retirada"
      }</span>
    </div>

    ${p.fone ? `<span class="fone">${esc(p.fone)}</span>` : ""}
    ${entrega && p.endereco ? `<p class="endereco">${esc(p.endereco)}</p>` : ""}

    <p class="itens">${resumoItens(p)}</p>
    ${p.pagamento ? `<p class="pagto">💳 ${esc(p.pagamento)}</p>` : ""}

    <div class="rodape">
      <span class="total">${reais(p.total || 0)}</span>
      ${p.impresso ? `<span class="jaimpresso">✓ impresso</span>` : ""}
    </div>

    <div class="acoes">
      <button type="button" class="principal" data-imprimir="${esc(p.id)}">🖨️ Imprimir</button>
      ${etapa.proxima ? `<button type="button" data-avancar="${esc(p.id)}">${esc(etapa.acao)}</button>` : ""}
      ${p.status === "novo" ? `<button type="button" class="recusar" data-recusar="${esc(p.id)}">Recusar</button>` : ""}
      ${p.fone ? `<button type="button" class="avisar" data-avisar="${esc(p.id)}">📲 Avisar cliente</button>` : ""}
      ${etapa.reabre ? `<button type="button" class="reabrir" data-reabrir="${esc(p.id)}">↩︎ Reabrir pedido</button>` : ""}
    </div>
  </article>`;
}

function desenhar() {
  const lista = el("[data-lista]");
  const noCaixa  = filtro === "caixa";
  const noBalcao = filtro === "balcao";
  el("[data-caixa]").hidden  = !noCaixa;
  el("[data-balcao]").hidden = !noBalcao;
  document.body.classList.toggle("ver-papel", noBalcao);
  lista.hidden = noCaixa || noBalcao;
  el("[data-resumo]").hidden = noCaixa || noBalcao || !pedidos.length;

  if (noBalcao) {
    els("[data-filtro]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.filtro === filtro)));
    el("[data-caixa-data]").hidden = true;
    return;
  }
  if (noCaixa) {
    els("[data-filtro]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.filtro === filtro)));
    el("[data-caixa-data]").hidden = false;
    desenharCaixa();
    return;
  }
  const abertos = p => !["concluido", "recusado"].includes(p.status);
  const visiveis = filtro === "abertos" ? pedidos.filter(abertos) : pedidos;

  el("[data-contador]").textContent =
    filtro === "historico" ? "" : (pedidos.filter(p => p.status === "novo").length || "");
  els("[data-filtro]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.filtro === filtro)));
  el("[data-caixa-data]").hidden = filtro !== "historico";

  resumoDoDia();

  if (!visiveis.length) {
    lista.innerHTML =
      filtro === "abertos"
        ? `<p class="vazio">Nenhum pedido em aberto. Quando chegar um novo, o computador vai apitar. 🔔</p>`
        : filtro === "historico"
          ? `<p class="vazio">Nenhum pedido em ${formatarData(dataHistorico)}.</p>`
          : `<p class="vazio">Nenhum pedido hoje ainda.</p>`;
    return;
  }
  lista.innerHTML = visiveis.map(cartao).join("");
}

/* faturamento e contagem do dia que está na tela */
function resumoDoDia() {
  const caixa = el("[data-resumo]");
  const valem = pedidos.filter(p => p.status !== "recusado");
  if (!pedidos.length) { caixa.hidden = true; return; }
  const soma = valem.reduce((t, p) => t + (Number(p.total) || 0), 0);
  const recusados = pedidos.length - valem.length;
  caixa.hidden = false;
  caixa.innerHTML = `
    <span><b>${valem.length}</b> ${valem.length === 1 ? "pedido" : "pedidos"}</span>
    <span><b>${reais(soma)}</b> em vendas</span>
    ${recusados ? `<span class="rec">${recusados} recusado${recusados > 1 ? "s" : ""}</span>` : ""}
    <span class="dia">${filtro === "historico" ? formatarData(dataHistorico) : "hoje"}</span>`;
}

/* atualiza os "há X min" sem recarregar nada */
setInterval(() => { if (pedidos.length && !el("[data-tela-painel]").hidden) desenhar(); }, 60000);


/* =========================================================
   Caixa do dia e relatório do mês
   As contas ficam em caixa.js; aqui é só tela e gravação.
   ========================================================= */
let caixaDoDia = { despesas: [], fechado: false };
let diaDoCaixa = null;

function hojeISO() { return new Date().toISOString().slice(0, 10); }

function diaAtual() { return filtro === "historico" && dataHistorico ? dataHistorico : hojeISO(); }

async function carregarCaixa(iso) {
  diaDoCaixa = iso;
  try {
    const d = await getDoc(doc(db, "caixa", iso));
    caixaDoDia = d.exists() ? { despesas: [], fechado: false, ...d.data() } : { despesas: [], fechado: false };
  } catch (e) {
    caixaDoDia = { despesas: [], fechado: false };
  }
}

async function gravarCaixa() {
  try {
    await setDoc(doc(db, "caixa", diaDoCaixa), caixaDoDia, { merge: true });
  } catch (e) {
    alert("Não consegui salvar. Verifique a internet e tente de novo.");
  }
}

function linhaValor(rot, valor, cls = "") {
  return `<div class="cx-linha ${cls}"><span>${rot}</span><b>${reais(valor)}</b></div>`;
}

function desenharCaixa() {
  const alvo = el("[data-caixa]");
  if (!alvo) return;
  const a = apurar(pedidos);
  const desp = somaDespesas(caixaDoDia.despesas);
  const lucro = a.liquido - desp;
  const dia = diaDoCaixa === hojeISO() ? "hoje" : formatarData(diaDoCaixa);

  alvo.innerHTML = `
    <div class="cx-topo">
      <h2>Caixa de ${dia}</h2>
      ${caixaDoDia.fechado
        ? `<span class="cx-selo fechado">✓ Caixa fechado${caixaDoDia.fechadoEm ? " às " + caixaDoDia.fechadoEm : ""}</span>`
        : `<span class="cx-selo aberto">● Caixa aberto</span>`}
    </div>

    <div class="cx-grade">

      <section class="cx-cartao">
        <h3>Entrou por forma de pagamento</h3>
        ${FORMAS.map(f => `
          <div class="cx-linha">
            <span>${f.icone} ${f.rotulo} <i>${a.contagem[f.chave]}x</i></span>
            <b>${reais(a.porForma[f.chave])}</b>
          </div>`).join("")}
        ${a.porForma.outro ? linhaValor("❓ Outros", a.porForma.outro) : ""}
        ${linhaValor("Total recebido", a.bruto, "forte")}
      </section>

      <section class="cx-cartao">
        <h3>Fechamento</h3>
        ${linhaValor("Vendas (com taxa)", a.bruto)}
        ${linhaValor("− Taxa do motoboy", a.taxas, "menos")}
        ${linhaValor("= Venda da cozinha", a.liquido, "forte")}
        ${linhaValor("− Mercadoria", desp, "menos")}
        <div class="cx-linha lucro"><span>= Lucro do dia</span><b>${reais(lucro)}</b></div>
        <p class="cx-nota">${a.quantidade} ${a.quantidade === 1 ? "pedido" : "pedidos"}${a.recusados ? ` · ${a.recusados} recusado${a.recusados > 1 ? "s" : ""}` : ""}</p>
      </section>

      <section class="cx-cartao">
        <h3>Mercadoria</h3>
        <p class="cx-ajuda">Quanto saiu do caixa para repor estoque hoje. Pode lançar várias vezes.</p>
        <ul class="cx-despesas">
          ${(caixaDoDia.despesas || []).map((d, i) => `
            <li>
              <span>${d.hora || "—"}</span>
              <b>${reais(d.valor)}</b>
              <button type="button" data-apaga-despesa="${i}" title="Apagar">✕</button>
            </li>`).join("") || `<li class="vazia">Nada lançado ainda.</li>`}
        </ul>
        ${(caixaDoDia.despesas || []).length > 1
          ? `<div class="cx-linha forte"><span>Total em mercadoria</span><b>${reais(desp)}</b></div>` : ""}
        <form class="cx-form" data-form-despesa>
          <input type="text" inputmode="decimal" data-valor placeholder="0,00" required />
          <button type="submit">Lançar gasto</button>
        </form>
      </section>

    </div>

    <div class="cx-acoes">
      ${caixaDoDia.fechado
        ? `<button type="button" class="cx-reabrir" data-reabrir-caixa>Reabrir o caixa</button>`
        : `<button type="button" class="principal larga" data-fechar-caixa>Fechar o caixa de ${dia}</button>`}
      <button type="button" data-relatorio>📊 Relatório do mês</button>
    </div>

    <div class="cx-relatorio" data-relatorio-mes hidden></div>`;
}

/* ---------- relatório mensal ---------- */
async function relatorioMes(iso) {
  const alvo = el("[data-relatorio-mes]");
  const [ano, mes] = (iso || hojeISO()).split("-");
  alvo.hidden = false;
  alvo.innerHTML = `<p class="vazio">Somando o mês…</p>`;

  const de = new Date(+ano, +mes - 1, 1);
  const ate = new Date(+ano, +mes, 1);
  try {
    const r = await getDocs(query(
      collection(db, "pedidos"),
      where("criadoEm", ">=", Timestamp.fromDate(de)),
      where("criadoEm", "<", Timestamp.fromDate(ate)),
      orderBy("criadoEm", "asc")
    ));
    const todos = r.docs.map(d => d.data());
    const porDia = {};
    todos.forEach(p => {
      const dia = p.criadoEm && p.criadoEm.toDate
        ? p.criadoEm.toDate().toISOString().slice(0, 10) : "?";
      (porDia[dia] = porDia[dia] || []).push(p);
    });

    const a = apurar(todos);
    const dias = Object.keys(porDia).sort();
    const melhor = dias.reduce((m, d) =>
      apurar(porDia[d]).bruto > (m.v || 0) ? { d, v: apurar(porDia[d]).bruto } : m, {});

    alvo.innerHTML = `
      <h3>Relatório de ${de.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}</h3>
      <div class="cx-grade">
        <section class="cx-cartao">
          <h3>Resumo do mês</h3>
          ${linhaValor("Faturamento", a.bruto, "forte")}
          ${linhaValor("− Taxas de motoboy", a.taxas, "menos")}
          ${linhaValor("= Venda da cozinha", a.liquido)}
          <p class="cx-nota">${a.quantidade} pedidos em ${dias.length} ${dias.length === 1 ? "dia" : "dias"} · média de ${reais(a.quantidade ? a.bruto / a.quantidade : 0)} por pedido</p>
          ${melhor.d ? `<p class="cx-nota">Melhor dia: ${formatarData(melhor.d)} com ${reais(melhor.v)}</p>` : ""}
        </section>
        <section class="cx-cartao">
          <h3>Por forma de pagamento</h3>
          ${FORMAS.map(f => `<div class="cx-linha"><span>${f.icone} ${f.rotulo}</span><b>${reais(a.porForma[f.chave])}</b></div>`).join("")}
        </section>
      </div>
      <table class="cx-tabela">
        <thead><tr><th>Dia</th><th>Pedidos</th><th>Faturou</th><th>Taxas</th></tr></thead>
        <tbody>
          ${dias.map(d => {
            const x = apurar(porDia[d]);
            return `<tr><td>${formatarData(d)}</td><td>${x.quantidade}</td><td>${reais(x.bruto)}</td><td>${reais(x.taxas)}</td></tr>`;
          }).join("")}
        </tbody>
      </table>`;
  } catch (e) {
    console.error(e);
    alvo.innerHTML = `<p class="vazio">Não consegui montar o relatório. Verifique a internet.</p>`;
  }
}

/* ---------- cliques dentro do caixa ---------- */
document.addEventListener("click", async e => {
  if (el("[data-caixa]") && el("[data-caixa]").hidden) return;

  if (e.target.closest("[data-fechar-caixa]")) {
    if (!confirm("Fechar o caixa deste dia? Dá para reabrir depois.")) return;
    caixaDoDia.fechado = true;
    caixaDoDia.fechadoEm = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    await gravarCaixa(); desenharCaixa(); return;
  }
  if (e.target.closest("[data-reabrir-caixa]")) {
    caixaDoDia.fechado = false;
    await gravarCaixa(); desenharCaixa(); return;
  }
  if (e.target.closest("[data-relatorio]")) { relatorioMes(diaDoCaixa); return; }

  const apaga = e.target.closest("[data-apaga-despesa]");
  if (apaga) {
    caixaDoDia.despesas.splice(Number(apaga.dataset.apagaDespesa), 1);
    await gravarCaixa(); desenharCaixa();
  }
});

document.addEventListener("submit", async e => {
  const f = e.target.closest("[data-form-despesa]");
  if (!f) return;
  e.preventDefault();
  const valor = paraNumero(f.querySelector("[data-valor]").value);
  if (!(valor > 0)) return alert("Digite quanto foi gasto.");
  caixaDoDia.despesas = caixaDoDia.despesas || [];
  caixaDoDia.despesas.push({
    descricao: "Mercadoria",
    valor,
    hora: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
  });
  await gravarCaixa(); desenharCaixa();
});

/* ========================= ações ========================= */
function achar(id) { return pedidos.find(p => p.id === id); }

el("[data-lista]").addEventListener("click", async e => {
  const bi = e.target.closest("[data-imprimir]");
  const ba = e.target.closest("[data-avancar]");
  const br = e.target.closest("[data-recusar]");

  if (bi) {
    const p = achar(bi.dataset.imprimir);
    if (p) imprimir(p);
    return;
  }
  if (ba) {
    const p = achar(ba.dataset.avancar);
    const prox = p && (ETAPAS[p.status] || ETAPAS.novo).proxima;
    if (!prox) return;
    /* aceitar um pedido novo já manda a comanda para a impressora:
       é o gesto que o balcão faz de qualquer jeito, em um clique só */
    if (p.status === "novo") { imprimir(p); return; }
    await mudarStatus(p.id, prox);
    return;
  }
  if (br) {
    const p = achar(br.dataset.recusar);
    if (p && confirm(`Recusar o pedido #${p.numero} de ${p.cliente || "cliente"}?\n\nDá para voltar atrás depois, em "Todos de hoje".`)) {
      await mudarStatus(p.id, "recusado");
    }
    return;
  }

  const bw = e.target.closest("[data-avisar]");
  if (bw) {
    const p = achar(bw.dataset.avisar);
    if (p) avisarCliente(p);
    return;
  }

  const bv = e.target.closest("[data-reabrir]");
  if (bv) {
    const p = achar(bv.dataset.reabrir);
    if (p) await mudarStatus(p.id, "novo");   // volta para a fila como pedido novo
  }
});

async function mudarStatus(id, status) {
  try {
    await updateDoc(doc(db, "pedidos", id), { status });
  } catch (e) {
    alert("Não consegui salvar a mudança. Verifique a internet e tente de novo.");
  }
}


/* ========================= avisar o cliente ========================= */
/* Abre o WhatsApp do cliente com a mensagem já escrita, conforme a etapa.
   É um toque do atendente — nada é enviado sozinho. */
const RECADOS = {
  novo: p => `Oi ${primeiroNome(p)}! 👑 Recebemos seu pedido *#${p.numero}* aqui no Rei Burgão. Já vamos preparar!`,
  preparando: p => `Oi ${primeiroNome(p)}! 👑 Seu pedido *#${p.numero}* já está sendo preparado. ⏱️ Fica pronto em cerca de 40 minutos.`,
  saiu: p => /entrega/i.test(p.tipo || "")
    ? `Oi ${primeiroNome(p)}! 🛵 Seu pedido *#${p.numero}* saiu para entrega e chega em instantes. Bom apetite!`
    : `Oi ${primeiroNome(p)}! 🍔 Seu pedido *#${p.numero}* está pronto para retirada. Te esperamos!`,
  concluido: p => `Oi ${primeiroNome(p)}! Obrigado pela preferência 👑 Qualquer coisa é só chamar. Bom apetite!`,
  recusado: p => `Oi ${primeiroNome(p)}! Infelizmente não vamos conseguir atender seu pedido *#${p.numero}* agora. Desculpe pelo transtorno! 🙏`
};

function primeiroNome(p) {
  return String(p.cliente || "").trim().split(/\s+/)[0] || "tudo bem";
}

function avisarCliente(p) {
  const numero = String(p.fone || "").replace(/\D/g, "");
  if (numero.length < 10) return alert("Este pedido não veio com um WhatsApp válido.");
  const recado = (RECADOS[p.status] || RECADOS.novo)(p);
  window.open(`https://wa.me/55${numero}?text=${encodeURIComponent(recado)}`, "_blank", "noopener");
}

/* ========================= imprimir ========================= */
function imprimir(p) {
  const lido = p.texto ? lerPedido(p.texto) : null;
  const papel = el("[data-papel]");
  papel.innerHTML = lido
    ? comandaHTML(lido, p.numero)
    : `<div class="cru">${esc(p.texto || "")}</div>`;
  window.print();
  updateDoc(doc(db, "pedidos", p.id), { impresso: true }).catch(() => {});
  if (p.status === "novo") { mudarStatus(p.id, "preparando"); pararInsistencia(); }
}

/* ========================= controles de cima ========================= */
els("[data-filtro]").forEach(b => b.addEventListener("click", () => {
  filtro = b.dataset.filtro;
  if (filtro === "balcao") { desenhar(); return; }
  if (filtro === "caixa") {
    const campo = el("[data-data]");
    if (!campo.value) campo.value = hojeISO();
    dataHistorico = campo.value === hojeISO() ? null : campo.value;
    (async () => {
      if (dataHistorico) await carregarHistorico(dataHistorico); else escutarPedidos();
      await carregarCaixa(campo.value);
      desenhar();
    })();
    return;
  }
  if (filtro === "historico") {
    const campo = el("[data-data]");
    if (!campo.value) campo.value = ontemISO();
    dataHistorico = campo.value;
    el("[data-caixa-data]").hidden = false;
    carregarHistorico(dataHistorico);
  } else {
    dataHistorico = null;
    escutarPedidos();   // volta para o dia de hoje, ao vivo
  }
  desenhar();
}));

function ontemISO() {
  const d = new Date(); d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

el("[data-data]").addEventListener("change", async e => {
  if (filtro === "caixa") {
    const iso = e.target.value || hojeISO();
    dataHistorico = iso === hojeISO() ? null : iso;
    if (dataHistorico) await carregarHistorico(dataHistorico); else escutarPedidos();
    await carregarCaixa(iso);
    desenhar();
    return;
  }
  dataHistorico = e.target.value;
  const hoje = new Date().toISOString().slice(0, 10);
  if (!dataHistorico || dataHistorico === hoje) {
    filtro = "todos"; dataHistorico = null; escutarPedidos(); desenhar();
  } else {
    carregarHistorico(dataHistorico);
  }
});

const botaoSom = el("[data-som]");
function pintarSom() {
  const ligado = localStorage.getItem("rb_som") !== "nao";
  botaoSom.textContent = ligado ? "🔔 Som ligado" : "🔕 Som desligado";
  botaoSom.setAttribute("aria-pressed", String(ligado));
}
botaoSom.addEventListener("click", () => {
  const ligado = localStorage.getItem("rb_som") !== "nao";
  localStorage.setItem("rb_som", ligado ? "nao" : "sim");
  pintarSom();
  if (!ligado) apitar(1);   // acabou de ligar: toca uma vez para conferir
});
pintarSom();

el("[data-testar-som]").addEventListener("click", () => apitar(2));

/* taxa de entrega fica guardada no computador da loja */
const taxa = el("[data-taxa]");
taxa.value = localStorage.getItem("rb_taxa") || "";
taxa.addEventListener("input", () => localStorage.setItem("rb_taxa", taxa.value));
