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
  browserLocalPersistence, setPersistence, updatePassword,
  EmailAuthProvider, reauthenticateWithCredential
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import {
  getFirestore, collection, query, where, orderBy, onSnapshot, getDocs,
  doc, getDoc, setDoc, updateDoc, deleteDoc, Timestamp, runTransaction
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

import { FIREBASE_CONFIG, CONTA_LOJA } from "./firebase-config.js";

const app  = initializeApp(FIREBASE_CONFIG);
const auth = getAuth(app);
const db   = getFirestore(app);

/* ========================= atalhos ========================= */
const el = (s, r = document) => r.querySelector(s);
const els = (s, r = document) => [...r.querySelectorAll(s)];

const ETAPAS = {
  novo:       { rotulo: "Novo",        proxima: "preparando", acao: "Aceitar e imprimir", avisar: "Avisar que recebemos" },
  preparando: { rotulo: "Preparando",  proxima: "saiu",       acao: "Saiu para entrega",  avisar: "Avisar que está pronto" },
  saiu:       { rotulo: "A caminho",   proxima: "concluido",  acao: "Concluir",              avisar: "Avisar que saiu para entrega" },
  concluido:  { rotulo: "Concluído",   proxima: null,         acao: null, reabre: true,      avisar: "Agradecer" },
  recusado:   { rotulo: "Recusado",    proxima: null,         acao: null, reabre: true,      avisar: "Avisar que não dá" }
};

let pedidos = [];          // os do dia que está na tela, mais novos primeiro
let primeiraCarga = true;  // não apita ao abrir a tela
let filtro = "abertos";    // abertos | todos | historico
let dataHistorico = null;  // "AAAA-MM-DD" quando olhando um dia passado

/* ========================= proteções de funcionamento =========================
   Esta tela fica aberta a noite inteira num balcão. Três coisas podem
   estragá-la em silêncio, e cada uma tem aqui a sua rede de segurança. */

/* 1) O navegador bloqueia som até alguém tocar na página. Sem isto, o pedido
      chegaria e ninguém ouviria o apito. */
function avisarSomBloqueado(bloqueado) {
  const f = el("[data-aviso-som]");
  if (f) f.hidden = !bloqueado;
}

/* 2) Um erro solto deixaria a tela morta sem ninguém perceber. */
function avisarErro() {
  const f = el("[data-aviso-erro]");
  if (f) f.hidden = false;
}
window.addEventListener("error", avisarErro);
window.addEventListener("unhandledrejection", avisarErro);
document.addEventListener("click", e => {
  if (e.target.closest("[data-recarregar]")) location.reload();
});

/* 3) O espaço do aparelho pode encher e travar as comandas guardadas. */
window.guardarComSeguranca = function (chave, texto) {
  try { localStorage.setItem(chave, texto); return true; }
  catch (e) {
    try {
      /* joga fora o que é descartável e tenta de novo */
      localStorage.removeItem("rb_comanda_seq");
      localStorage.setItem(chave, texto);
      return true;
    } catch (e2) {
      alert("A memória deste aparelho está cheia. Feche as comandas antigas ou use outro navegador.");
      return false;
    }
  }
};

/* ========================= alerta sonoro ========================= */
/* Gerado na hora pelo navegador — sem arquivo de som para carregar. */
let audioCtx = null;
function apitar(vezes = 3) {
  if (localStorage.getItem("rb_som") === "nao") return;
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
      /* ainda suspenso quer dizer que o navegador exige um toque na tela */
      setTimeout(() => avisarSomBloqueado(audioCtx.state === "suspended"), 300);
    } else {
      avisarSomBloqueado(false);
    }
    for (let i = 0; i < vezes; i++) {
      const t0 = audioCtx.currentTime + i * 0.38;
      const osc = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();   // segunda voz: dobra o corpo do som
      const vol = audioCtx.createGain();
      const forte = audioCtx.createDynamicsCompressor();  // empurra o volume para cima
      forte.threshold.setValueAtTime(-28, t0);
      forte.ratio.setValueAtTime(12, t0);
      osc.type = "square";                        // onda cheia, corta o barulho da cozinha
      osc2.type = "sine";
      osc.frequency.setValueAtTime(950, t0);
      osc.frequency.setValueAtTime(1300, t0 + 0.14);
      osc2.frequency.setValueAtTime(475, t0);
      osc2.frequency.setValueAtTime(650, t0 + 0.14);
      vol.gain.setValueAtTime(0.0001, t0);
      vol.gain.exponentialRampToValueAtTime(1.0, t0 + 0.02);
      vol.gain.setValueAtTime(1.0, t0 + 0.26);
      vol.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.34);
      osc.connect(vol); osc2.connect(vol);
      vol.connect(forte); forte.connect(audioCtx.destination);
      osc.start(t0); osc.stop(t0 + 0.36);
      osc2.start(t0); osc2.stop(t0 + 0.36);
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
    lerEstadoLoja();
    carregarAjustesCardapio();
    carregarCaixa(hojeISO()).then(() => {
      if (window.rbAoCarregarComandas) window.rbAoCarregarComandas();
    });
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
let diaEscutado = null;

function faixaDoDia(iso) {
  /* iso = "AAAA-MM-DD"; sem iso, é hoje */
  const d = new Date((iso || hojeISO()) + "T00:00:00");
  d.setHours(VIRADA_H, 0, 0, 0);
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
  diaEscutado = hojeISO();
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
    if (!(["caixa", "cardapio"].includes(filtro) && ocupadoNaTela())) desenhar();
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
  /* pedido do site vem como texto; comanda do balcão já vem com a lista pronta */
  if (Array.isArray(p.itens) && p.itens.length) {
    return p.itens.map(i => `${i.q}x ${esc(i.nome)}`).join(" · ");
  }
  const lido = p.texto ? lerPedido(p.texto) : null;
  if (!lido || !lido.itens.length) return "";
  return lido.itens.map(i => `${i.q}x ${esc(i.nome)}`).join(" · ");
}

function cartao(p) {
  if (p.balcao) return cartaoBalcao(p);
  const etapa = ETAPAS[p.status] || ETAPAS.novo;
  const entrega = /entrega/i.test(p.tipo || "");
  const noLocal = /restaurante|mesa/i.test(p.tipo || "");
  return `
  <article class="pedido" data-status="${esc(p.status)}" data-id="${esc(p.id)}">
    <header>
      <span class="num">#${esc(p.numero)}</span>
      <span class="etapa e-${esc(p.status)}">${esc(etapa.rotulo)}</span>
      <span class="hora" title="${horaDe(p.criadoEm)}">${tempoDesde(p.criadoEm)}</span>
    </header>

    <div class="quem">
      <strong>${esc(p.cliente) || "Sem nome"}</strong>
      <span class="tipo ${entrega ? "t-entrega" : noLocal ? "t-mesa" : "t-retirada"}">${
        entrega ? "Entrega" : noLocal ? "No restaurante" : "Retirada"
      }</span>
    </div>

    ${p.fone ? `<span class="fone">${esc(p.fone)}</span>` : ""}
    ${entrega && p.endereco ? `<p class="endereco">${esc(p.endereco)}</p>` : ""}

    <p class="itens">${resumoItens(p)}</p>
    ${p.pagamento ? `<p class="pagto">${esc(p.pagamento)}</p>` : ""}

    <div class="rodape">
      <span class="total">${reais(p.total || 0)}</span>
      ${p.impresso ? `<span class="jaimpresso">impresso</span>` : ""}
    </div>

    <div class="acoes">
      <button type="button" class="principal" data-imprimir="${esc(p.id)}">Imprimir</button>
      ${etapa.proxima ? `<button type="button" data-avancar="${esc(p.id)}">${esc(etapa.acao)}</button>` : ""}
      ${p.status === "novo" ? `<button type="button" class="recusar" data-recusar="${esc(p.id)}">Recusar</button>` : ""}
      ${p.fone ? `<button type="button" class="avisar" data-avisar="${esc(p.id)}">${esc(etapa.avisar || "Avisar cliente")}</button>` : ""}
      ${etapa.reabre ? `<button type="button" class="reabrir" data-reabrir="${esc(p.id)}">Reabrir pedido</button>` : ""}
    </div>
  </article>`;
}

/* cartão de uma comanda fechada no balcão: é registro de venda, não pedido
   em andamento — por isso só mostra o que foi vendido e como foi pago */
function cartaoBalcao(v) {
  const entrega = /entrega/i.test(v.tipo || "");
  const noLocal = /restaurante|mesa/i.test(v.tipo || "");
  return `
  <article class="pedido do-balcao" data-status="concluido" data-id="${esc(v.id)}">
    <header>
      <span class="num">#${esc(v.numero)}</span>
      <span class="etapa e-balcao">Balcão</span>
      <span class="hora">${esc(v.hora || "")}</span>
    </header>

    <div class="quem">
      <strong>${esc(v.cliente) || "Sem nome"}</strong>
      <span class="tipo ${entrega ? "t-entrega" : noLocal ? "t-mesa" : "t-retirada"}">${
        entrega ? "Entrega" : noLocal ? "No restaurante" : "Retirada"
      }</span>
    </div>

    ${entrega && v.endereco ? `<p class="endereco">${esc(v.endereco)}</p>` : ""}
    <p class="itens">${resumoItens(v)}</p>
    ${v.forma || v.pagamento ? `<p class="pagto">${esc(v.forma || v.pagamento)}</p>` : ""}

    <div class="rodape">
      <span class="total">${reais(v.total || 0)}</span>
      <span class="jaimpresso">lançada no caixa</span>
    </div>
  </article>`;
}

function desenhar() {
  const lista = el("[data-lista]");
  const noCaixa  = filtro === "caixa";
  const noBalcao = filtro === "balcao";
  const noEditor = filtro === "cardapio";
  el("[data-caixa]").hidden  = !noCaixa;
  el("[data-balcao]").hidden = !noBalcao;
  el("[data-editor]").hidden = !noEditor;
  document.body.classList.toggle("ver-papel", noBalcao);
  lista.hidden = noCaixa || noBalcao || noEditor;
  el("[data-resumo]").hidden = noCaixa || noBalcao || noEditor || !(pedidos.length || (caixaDoDia.comandas || []).length);

  if (noEditor) {
    els("[data-filtro]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.filtro === filtro)));
    el("[data-caixa-data]").hidden = true;
    if (typeof edDesenhar === "function") edDesenhar();
    return;
  }

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
  /* as comandas fechadas no balcão são vendas do dia como as outras:
     aparecem em "Todos de hoje" e no histórico, nunca em "Em aberto" */
  const doBalcao = (caixaDoDia.comandas || []).map(v =>
    Object.assign({}, v, { id: v.id, balcao: true, status: v.status || "concluido" }));
  const todosDoDia = pedidos.concat(doBalcao);
  const visiveis = filtro === "abertos" ? pedidos.filter(abertos) : todosDoDia;

  el("[data-contador]").textContent =
    filtro === "historico" ? "" : (pedidos.filter(p => p.status === "novo").length || "");
  els("[data-filtro]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.filtro === filtro)));
  el("[data-caixa-data]").hidden = filtro !== "historico";

  resumoDoDia();

  if (!visiveis.length) {
    lista.innerHTML =
      filtro === "abertos"
        ? `<p class="vazio">Nenhum pedido em aberto. Quando chegar um novo, o computador vai apitar.</p>`
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
  const doBalcao = caixaDoDia.comandas || [];
  const tudo = pedidos.concat(doBalcao);
  const valem = tudo.filter(p => p.status !== "recusado" && p.status !== "novo");
  if (!tudo.length) { caixa.hidden = true; return; }
  const soma = valem.reduce((t, p) => t + (Number(p.total) || 0), 0);
  const recusados = tudo.filter(p => p.status === "recusado").length;
  caixa.hidden = false;
  caixa.innerHTML = `
    <span><b>${valem.length}</b> ${valem.length === 1 ? "pedido" : "pedidos"}</span>
    <span><b>${reais(soma)}</b> em vendas</span>
    ${recusados ? `<span class="rec">${recusados} recusado${recusados > 1 ? "s" : ""}</span>` : ""}
    <span class="dia">${filtro === "historico" ? formatarData(dataHistorico) : "hoje"}</span>`;
}

/* atualiza os "há X min" sem recarregar nada */
/* O painel fica aberto dias seguidos: quando o dia comercial vira, passa
   sozinho para o dia novo (pedidos e caixa), a não ser que estejam olhando
   um dia passado. */
function ocupadoNaTela() {
  const a = document.activeElement;
  if (a && a.matches && a.matches("input, textarea, select") && a.closest("[data-caixa], [data-editor], [data-ed-lista], [data-tela-painel]")) return true;
  const rel = el("[data-relatorio-mes]");
  return !!(rel && !rel.hidden);
}
setInterval(async () => {
  if (el("[data-tela-painel]").hidden) return;
  pintarLoja();
  if (diaEscutado && diaEscutado !== hojeISO() && !dataHistorico) {
    escutarPedidos();
    await carregarCaixa(hojeISO());
    if (window.rbAoCarregarComandas) window.rbAoCarregarComandas();
  }
  /* atualiza os "há X min"; nas telas de digitar, só se ninguém estiver no meio */
  if (["caixa", "cardapio", "balcao"].includes(filtro)) {
    if (filtro === "caixa" && !ocupadoNaTela()) desenhar();
    return;
  }
  if (pedidos.length) desenhar();
}, 60000);


/* =========================================================
   Caixa do dia e relatório do mês
   As contas ficam em caixa.js; aqui é só tela e gravação.
   ========================================================= */
let caixaDoDia = { despesas: [], fechado: false };
let diaDoCaixa = null;

/* data AAAA-MM-DD no relógio da loja. Não usar toISOString: ele dá o dia em
   UTC, que em Suzano vira às 21h, no meio do expediente. Venda, despesa,
   numeração e o botão da loja pulavam para o dia seguinte depois das 21h. */
function isoLocal(d) {
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") +
    "-" + String(d.getDate()).padStart(2, "0");
}
/* O expediente vai até a meia-noite e o último pedido ainda está saindo depois
   dela. Por isso o "dia" do painel vira às 4h da manhã, não à meia-noite: o
   pedido das 23h58 não some da tela às 00h01 e o caixa da noite fica inteiro. */
const VIRADA_H = 4;
function diaComercial(d) { return isoLocal(new Date(d.getTime() - VIRADA_H * 3600000)); }
function hojeISO() { return diaComercial(new Date()); }
/* o botão da loja conversa com o site do cliente, que usa a data do calendário */
function hojeCalendario() { return isoLocal(new Date()); }

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
    /* as comandas ficam de fora: elas têm gravação própria (transação), e
       mandar a lista velha daqui apagaria a comanda que outro aparelho fechou */
    const { comandas, ...resto } = caixaDoDia;
    await setDoc(doc(db, "caixa", diaDoCaixa), resto, { merge: true });
    return true;
  } catch (e) {
    alert("Não consegui salvar. Verifique a internet e tente de novo.");
    return false;
  }
}

/* Comanda do balcão: grava sempre no caixa de HOJE, lendo o que está no
   servidor na hora (transação). Assim dois aparelhos não apagam a comanda
   um do outro, e olhar o caixa de outro dia não desvia a venda para lá. */
async function mexerNasComandasDeHoje(mudar) {
  const hoje = hojeISO();
  const ref = doc(db, "caixa", hoje);
  const comandas = await runTransaction(db, async t => {
    const d = await t.get(ref);
    const lista = mudar(((d.exists() && d.data().comandas) || []).slice());
    t.set(ref, { comandas: lista }, { merge: true });
    return lista;
  });
  if (diaDoCaixa === hoje) caixaDoDia.comandas = comandas;
}

function linhaValor(rot, valor, cls = "") {
  return `<div class="cx-linha ${cls}"><span>${rot}</span><b>${reais(valor)}</b></div>`;
}

function desenharCaixa() {
  const alvo = el("[data-caixa]");
  if (!alvo) return;
  const doBalcao = (caixaDoDia.comandas || []);
  const a = apurar(pedidos.concat(doBalcao));
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
            <span>${f.rotulo} <i>${a.contagem[f.chave]}x</i></span>
            <b>${reais(a.porForma[f.chave])}</b>
          </div>`).join("")}
        ${a.porForma.outro ? linhaValor("Outros", a.porForma.outro) : ""}
        ${linhaValor("Total recebido", a.bruto, "forte")}
      </section>

      <section class="cx-cartao">
        <h3>Fechamento</h3>
        ${linhaValor("Vendas (com taxa)", a.bruto)}
        ${linhaValor("− Taxa do motoboy", a.taxas, "menos")}
        ${linhaValor("− Mercadoria", desp, "menos")}
        <div class="cx-linha lucro"><span>= Lucro do dia</span><b>${reais(lucro)}</b></div>
        <p class="cx-nota">${a.quantidade} ${a.quantidade === 1 ? "venda" : "vendas"}${doBalcao.length ? ` · ${doBalcao.length} do balcão` : ""}${a.recusados ? ` · ${a.recusados} recusado${a.recusados > 1 ? "s" : ""}` : ""}</p>
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
      <button type="button" data-relatorio>Relatório do mês</button>
    </div>

    <div class="cx-relatorio" data-relatorio-mes hidden></div>`;
}

/* ---------- relatório mensal ---------- */
const NOMES_MES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho",
                   "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

/* Seletor de mês em forma de calendário: um botão só na tela, que abre uma
   gradezinha com os doze meses e setas para trocar de ano. Meses que ainda
   não chegaram ficam apagados. */
let anoDoSeletor = new Date().getFullYear();
let seletorAberto = false;

function barraDeMeses(selecionado) {
  const sel = String(selecionado || hojeISO());
  const [anoSel, mesSel] = sel.split("-").map(Number);
  const rotulo = `${NOMES_MES[mesSel - 1]} de ${anoSel}`;

  if (!seletorAberto) {
    return `<div class="cx-meses">
      <button type="button" class="cx-mes-abre" data-abrir-meses>${rotulo} <i>▾</i></button>
    </div>`;
  }

  /* Sem trava de ano nem de mês: ele pode consultar qualquer período, para
     trás ou para a frente, e o sistema não precisa de manutenção com o tempo. */
  const grade = NOMES_MES.map((nome, i) => {
    const m = i + 1;
    const ativo = anoDoSeletor === anoSel && m === mesSel;
    const iso = `${anoDoSeletor}-${String(m).padStart(2, "0")}-01`;
    return `<button type="button" data-mes="${iso}" class="${ativo ? "ativo" : ""}">${nome.slice(0, 3)}</button>`;
  }).join("");

  return `<div class="cx-meses">
    <button type="button" class="cx-mes-abre aberto" data-abrir-meses>${rotulo} <i>▴</i></button>
    <div class="cx-calendario">
      <div class="cx-cal-ano">
        <button type="button" data-ano="${anoDoSeletor - 1}" aria-label="Ano anterior">‹</button>
        <b>${anoDoSeletor}</b>
        <button type="button" data-ano="${anoDoSeletor + 1}" aria-label="Próximo ano">›</button>
      </div>
      <div class="cx-cal-grade">${grade}</div>
    </div>
  </div>`;
}

let mesDoRelatorio = hojeISO();

async function relatorioMes(iso) {
  const alvo = el("[data-relatorio-mes]");
  mesDoRelatorio = iso || hojeISO();
  anoDoSeletor = Number(String(mesDoRelatorio).slice(0, 4)) || anoDoSeletor;
  const [ano, mes] = mesDoRelatorio.split("-");
  alvo.hidden = false;
  alvo.innerHTML = barraDeMeses(mesDoRelatorio) + `<p class="vazio">Somando o mês…</p>`;

  const de = new Date(+ano, +mes - 1, 1, VIRADA_H);
  const ate = new Date(+ano, +mes, 1, VIRADA_H);
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
        ? diaComercial(p.criadoEm.toDate()) : "?";
      (porDia[dia] = porDia[dia] || []).push(p);
    });

    /* mercadoria do mês: soma o que foi lançado no caixa de cada dia */
    const prefixo = `${ano}-${mes}`;
    let mercadoria = 0;
    const gastoPorDia = {};
    try {
      const cx = await getDocs(collection(db, "caixa"));
      cx.docs.forEach(d => {
        if (!d.id.startsWith(prefixo)) return;
        const dados = d.data() || {};
        const soma = somaDespesas(dados.despesas);
        gastoPorDia[d.id] = soma;
        mercadoria += soma;
        /* as comandas do balcão são vendas como as outras */
        (dados.comandas || []).forEach(v => {
          (porDia[d.id] = porDia[d.id] || []).push(v);
          todos.push(v);
        });
      });
    } catch (e) { /* sem acesso ao caixa: o relatório sai sem a mercadoria */ }

    const a = apurar(todos);
    const dias = Object.keys(porDia).sort();
    const melhor = dias.reduce((m, d) =>
      apurar(porDia[d]).bruto > (m.v || 0) ? { d, v: apurar(porDia[d]).bruto } : m, {});
    const sobrou = a.liquido - mercadoria;
    const diasComVenda = dias.length || 1;

    alvo.innerHTML = barraDeMeses(mesDoRelatorio) + `
      <h3>Relatório de ${de.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}</h3>
      <div class="cx-grade">

        <section class="cx-cartao destaque-mes">
          <h3>O mês em números</h3>
          ${linhaValor("Faturamento total (com a taxa)", a.bruto, "forte")}
          ${linhaValor("− O motoboy ganhou", a.taxas, "menos")}
          ${linhaValor("= Venda da comanda", a.liquido)}
          ${linhaValor("− Gastou de mercadoria", mercadoria, "menos")}
          <div class="cx-linha lucro"><span>= Líquido do mês</span><b>${reais(sobrou)}</b></div>
          <p class="cx-nota">
            ${a.quantidade} ${a.quantidade === 1 ? "pedido" : "pedidos"} em ${dias.length} ${dias.length === 1 ? "dia" : "dias"}
            · média de ${reais(a.quantidade ? a.bruto / a.quantidade : 0)} por pedido
            · ${reais(a.bruto / diasComVenda)} por dia
          </p>
          ${melhor.d ? `<p class="cx-nota">Melhor dia: ${formatarData(melhor.d)} com ${reais(melhor.v)}</p>` : ""}
          ${mercadoria === 0 ? `<p class="cx-nota">Nenhum gasto de mercadoria foi lançado neste mês.</p>` : ""}
        </section>

        <section class="cx-cartao">
          <h3>Por forma de pagamento</h3>
          ${FORMAS.map(f => `<div class="cx-linha"><span>${f.rotulo} <i>${a.contagem[f.chave]}x</i></span><b>${reais(a.porForma[f.chave])}</b></div>`).join("")}
          ${a.porForma.outro ? linhaValor("Outros", a.porForma.outro) : ""}
          ${linhaValor("Total recebido", a.bruto, "forte")}
        </section>

      </div>

      <table class="cx-tabela">
        <thead><tr><th>Dia</th><th>Pedidos</th><th>Faturou</th><th>Motoboy</th><th>Mercadoria</th><th>Líquido</th></tr></thead>
        <tbody>
          ${dias.map(d => {
            const x = apurar(porDia[d]);
            const g = gastoPorDia[d] || 0;
            return `<tr>
              <td>${formatarData(d)}</td>
              <td>${x.quantidade}</td>
              <td>${reais(x.bruto)}</td>
              <td>${reais(x.taxas)}</td>
              <td>${reais(g)}</td>
              <td><b>${reais(x.liquido - g)}</b></td>
            </tr>`;
          }).join("")}
        </tbody>
        <tfoot>
          <tr>
            <th>Total do mês</th>
            <th>${a.quantidade}</th>
            <th>${reais(a.bruto)}</th>
            <th>${reais(a.taxas)}</th>
            <th>${reais(mercadoria)}</th>
            <th>${reais(sobrou)}</th>
          </tr>
        </tfoot>
      </table>`;
  } catch (e) {
    console.error(e);
    alvo.innerHTML = barraDeMeses(mesDoRelatorio) + `<p class="vazio">Não consegui montar o relatório. Verifique a internet.</p>`;
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

  if (e.target.closest("[data-abrir-meses]")) {
    seletorAberto = !seletorAberto;
    relatorioMes(mesDoRelatorio); return;
  }

  const ba = e.target.closest("[data-ano]");
  if (ba) { anoDoSeletor = Number(ba.dataset.ano); relatorioMes(mesDoRelatorio); return; }

  const bm = e.target.closest("[data-mes]");
  if (bm) { seletorAberto = false; relatorioMes(bm.dataset.mes); return; }

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
    /* quando o pedido sai para entrega, oferece avisar o cliente na hora:
       é o momento em que ele mais quer saber */
    if (status === "saiu") {
      const p = achar(id);
      if (p && p.fone) {
        p.status = "saiu";
        setTimeout(() => {
          if (confirm("Avisar o cliente pelo WhatsApp que o pedido saiu para entrega?")) avisarCliente(p);
        }, 150);
      }
    }
  } catch (e) {
    alert("Não consegui salvar a mudança. Verifique a internet e tente de novo.");
  }
}


/* ========================= ponte com a comanda do balcão =========================
   A comanda fechada vira uma venda de verdade: fica guardada dentro do caixa do
   dia e entra no total por forma de pagamento, junto com os pedidos do site. */
window.rbComandas = {
  dia: () => diaDoCaixa,
  listar: () => (caixaDoDia.comandas || []).slice(),

  gravar: async (c) => {
    /* pode acontecer de fecharem uma comanda antes do caixa terminar de
       carregar: sem isto a gravação iria para um dia indefinido e se perderia */
    /* se falhar, o erro sobe: o balcão mantém a comanda aberta e avisa */
    await mexerNasComandasDeHoje(lista => {
      const i = lista.findIndex(x => x.id === c.id);
      if (i >= 0) lista[i] = c; else lista.push(c);
      return lista;
    });
    desenharCaixa();
    if (filtro !== "caixa" && filtro !== "balcao") desenhar();
    return true;
  },

  remover: async (id) => {
    if (!diaDoCaixa) await carregarCaixa(hojeISO());
    const ref = doc(db, "caixa", diaDoCaixa);
    const comandas = await runTransaction(db, async t => {
      const d = await t.get(ref);
      const lista = ((d.exists() && d.data().comandas) || []).filter(x => x.id !== id);
      t.set(ref, { comandas: lista }, { merge: true });
      return lista;
    });
    caixaDoDia.comandas = comandas;
    desenharCaixa();
    if (filtro !== "caixa" && filtro !== "balcao") desenhar();
    return true;
  }
};

/* ========================= avisar o cliente ========================= */
/* Abre o WhatsApp do cliente com a mensagem já escrita, conforme a etapa.
   É um toque do atendente — nada é enviado sozinho. */
/* Sem emojis de propósito: no aparelho do cliente eles chegavam como
   quadradinho, o que passa impressão de mensagem quebrada. Acentos normais. */
const RECADOS = {
  novo: p => `Oi ${primeiroNome(p)}! Recebemos seu pedido *#${p.numero}* aqui no Rei Burgão. Já vamos preparar!`,
  preparando: p => `Oi ${primeiroNome(p)}! Seu pedido *#${p.numero}* já está sendo preparado. Fica pronto em cerca de 40 minutos.`,
  saiu: p => /entrega/i.test(p.tipo || "")
    ? `Oi ${primeiroNome(p)}! Seu pedido *#${p.numero}* saiu para entrega e chega em instantes. Bom apetite!`
    : `Oi ${primeiroNome(p)}! Seu pedido *#${p.numero}* está pronto para retirada. Te esperamos!`,
  concluido: p => `Oi ${primeiroNome(p)}! Obrigado pela preferência. Qualquer coisa é só chamar. Bom apetite!`,
  recusado: p => `Oi ${primeiroNome(p)}! Infelizmente não vamos conseguir atender seu pedido *#${p.numero}* agora. Desculpe pelo transtorno!`
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
  if (filtro === "balcao" || filtro === "cardapio") { desenhar(); return; }
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
    carregarCaixa(dataHistorico).then(() => carregarHistorico(dataHistorico));
  } else {
    dataHistorico = null;
    escutarPedidos();   // volta para o dia de hoje, ao vivo
    if (diaDoCaixa !== hojeISO()) carregarCaixa(hojeISO()).then(desenhar);
  }
  desenhar();
}));

function ontemISO() {
  const d = new Date(hojeISO() + "T12:00:00"); d.setDate(d.getDate() - 1);
  return isoLocal(d);
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
  const hoje = hojeISO();
  if (!dataHistorico || dataHistorico === hoje) {
    filtro = "todos"; dataHistorico = null; escutarPedidos();
    carregarCaixa(hoje).then(desenhar);
  } else {
    carregarCaixa(dataHistorico).then(() => carregarHistorico(dataHistorico));
  }
});

const botaoSom = el("[data-som]");
function pintarSom() {
  const ligado = localStorage.getItem("rb_som") !== "nao";
  botaoSom.textContent = ligado ? "Som ligado" : "Som desligado";
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

/* o primeiro toque em qualquer lugar libera o som no navegador */
["click", "keydown", "touchstart"].forEach(ev =>
  document.addEventListener(ev, function liberar() {
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === "suspended") audioCtx.resume().then(() => avisarSomBloqueado(false));
      else avisarSomBloqueado(false);
    } catch (e) {}
  }, { once: true, passive: true })
);

/* confere o som assim que a tela abre, sem esperar chegar pedido */
setTimeout(() => {
  try {
    const t = new (window.AudioContext || window.webkitAudioContext)();
    avisarSomBloqueado(t.state === "suspended");
    t.close();
  } catch (e) {}
}, 1200);

/* ========================= aviso de internet caída =========================
   O painel é a porta de entrada dos pedidos: se a internet cair, quem está no
   balcão precisa saber na hora, e não descobrir depois com o cliente ligando. */
function pintarConexao(ok) {
  const c = el("[data-conexao]");
  if (!c) return;
  c.dataset.ok = ok ? "sim" : "nao";
  c.textContent = ok ? "Conectado" : "SEM INTERNET";
}
window.addEventListener("offline", () => pintarConexao(false));
window.addEventListener("online", () => {
  pintarConexao(true);
  escutarPedidos();
  lerEstadoLoja();
});

/* ========================= cardápio editado pelo dono ========================= */
/* Gravar sem ter lido o que está no servidor apagaria preços e fotos do dono
   (a gravação troca o documento inteiro). Então: não leu, não grava. */
let ajustesLidos = false;
async function garantirAjustesLidos() {
  if (!ajustesLidos) await carregarAjustesCardapio();
  return ajustesLidos;
}

async function carregarAjustesCardapio() {
  try {
    const d = await getDoc(doc(db, "publico", "cardapio"));
    if (d.exists()) window.ajustes = d.data().itens || {};
    ajustesLidos = true;
  } catch (e) { /* sem acesso: o cardápio do arquivo continua valendo */ }
  if (typeof edDesenhar === "function") edDesenhar();
}

window.salvarCardapio = async function (silencioso) {
  if (!(await garantirAjustesLidos())) return false;
  try {
    await setDoc(doc(db, "publico", "cardapio"), {
      itens: window.ajustes || {},
      mudadoEm: Timestamp.now()
    });
    if (!silencioso && typeof marcarSujo === "function") marcarSujo(false);
    return true;
  } catch (e) { return false; }
};

el("[data-ed-salvar]").addEventListener("click", async () => {
  const b = el("[data-ed-salvar]"), st = el("[data-ed-status]");
  b.disabled = true; st.textContent = "Salvando…"; st.dataset.sujo = "false";
  if (!ajustesLidos) {
    st.textContent = "Não consegui ler o cardápio salvo. Clique em Atualizar sistema e tente de novo.";
    st.dataset.sujo = "true"; b.disabled = false; return;
  }
  try {
    await setDoc(doc(db, "publico", "cardapio"), {
      itens: window.ajustes || {},
      mudadoEm: Timestamp.now()
    });
    st.textContent = "Salvo. O site muda em até 2 minutos.";
    if (typeof marcarSujo === "function") marcarSujo(false);
    setTimeout(() => { if (st.textContent.startsWith("Salvo")) st.textContent = ""; }, 6000);
  } catch (e) {
    st.textContent = "Não consegui salvar. Verifique a internet e tente de novo.";
    st.dataset.sujo = "true";
  }
  b.disabled = false;
});

/* ========================= abrir e fechar a loja =========================
   O selo do site do cliente segue o horário; este botão manda nele.
   Serve para fechar antes da hora (acabou o pão) ou abrir fora do horário. */
let lojaAberta = null;   // null = seguir o horário

function pintarLoja() {
  const b = el("[data-loja-estado]");
  if (!b) return;
  const fechada = lojaAberta === false;
  const agora = new Date(), h = agora.getHours();
  const noHorario = agora.getDay() !== 1 && h >= 18;   // terça a domingo, 18h à meia-noite
  b.textContent = fechada ? "Loja fechada" : noHorario ? "Loja aberta" : "Fora do horário";
  b.setAttribute("aria-pressed", String(!fechada));
  b.dataset.fechada = String(fechada);
}

async function lerEstadoLoja() {
  try {
    const d = await getDoc(doc(db, "publico", "loja"));
    const v = d.exists() ? d.data() : null;
    /* o ajuste na mão vale só para o dia em que foi feito: no dia seguinte
       a loja volta a seguir o horário sozinha, sem ninguém precisar lembrar */
    lojaAberta = (v && v.dia === hojeCalendario()) ? (v.aberta !== false) : null;
  } catch (e) { lojaAberta = null; }
  pintarLoja();
}

/* Dois estados, de propósito:
   "No horário normal" = o site abre e fecha sozinho, das 18h à meia-noite.
   "Fechada agora"     = fecha antes da hora (acabou o pão, faltou gás).

   O botão NUNCA força a loja a ficar aberta fora do horário: se alguém
   esquecesse ligado, o site aceitaria pedido às 3h da manhã. Para mudar o
   horário de funcionamento, fale com a Criasiteweb. */
el("[data-loja-estado]").addEventListener("click", async () => {
  const fechando = lojaAberta !== false;
  const aviso = fechando
    ? "Fechar a loja agora?\n\nO site vai mostrar FECHADO e não deixa o cliente enviar pedido, mesmo dentro do horário."
    : "Voltar ao horário normal?\n\nO site volta a abrir e fechar sozinho, das 18h à meia-noite, de terça a domingo.";
  if (!confirm(aviso)) return;

  const antes = lojaAberta;
  lojaAberta = fechando ? false : null;
  pintarLoja();
  try {
    if (fechando) {
      await setDoc(doc(db, "publico", "loja"), {
        aberta: false,
        dia: hojeCalendario(),      // o fechamento vale só hoje
        mudadoEm: Timestamp.now()
      });
    } else {
      /* volta ao automático: sem dia válido, o site segue o horário */
      await setDoc(doc(db, "publico", "loja"), {
        aberta: true,
        dia: "",
        mudadoEm: Timestamp.now()
      });
    }
  } catch (e) {
    lojaAberta = antes; pintarLoja();
    alert("Não consegui salvar. Verifique a internet e tente de novo.");
  }
});

/* ========================= atualizar o sistema =========================
   O navegador guarda a página para abrir mais rápido, e às vezes fica com uma
   versão antiga. Este botão joga fora o que estiver guardado e busca a nova. */
el("[data-atualizar]").addEventListener("click", async () => {
  const b = el("[data-atualizar]");
  b.disabled = true; b.textContent = "Atualizando…";
  try {
    if (window.caches && caches.keys) {
      const nomes = await caches.keys();
      await Promise.all(nomes.map(n => caches.delete(n)));
    }
  } catch (e) {}
  const u = new URL(location.href);
  u.searchParams.set("atualizado", String(Date.now()));
  location.replace(u.toString());
});

/* ========================= trocar a senha da loja ========================= */
el("[data-trocar-senha]").addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return alert("Entre no painel antes de trocar a senha.");

  const atual = prompt("Para sua segurança, digite a senha que você usa hoje:");
  if (atual === null) return;
  if (!atual.trim()) return alert("A senha de hoje não pode ficar em branco.");

  const nova = prompt("Agora digite a NOVA senha (pelo menos 6 letras ou números):");
  if (nova === null) return;
  if (nova.trim().length < 6) return alert("A nova senha precisa ter pelo menos 6 letras ou números.");

  const confere = prompt("Digite a nova senha de novo para conferir:");
  if (confere === null) return;
  if (confere !== nova) return alert("As duas não bateram. Nada foi alterado — tente de novo.");

  try {
    await reauthenticateWithCredential(user, EmailAuthProvider.credential(CONTA_LOJA, atual));
    await updatePassword(user, nova);
    alert("Pronto! A senha da loja foi trocada.\n\nAnote em lugar seguro: quem for abrir o painel em outro aparelho vai precisar dela.");
  } catch (err) {
    const cod = String(err && err.code || "");
    if (/wrong-password|invalid-credential|invalid-login/.test(cod))
      alert("A senha de hoje está errada. Nada foi alterado.");
    else if (/weak-password/.test(cod))
      alert("Essa senha é fraca demais. Use pelo menos 6 letras ou números.");
    else if (/requires-recent-login/.test(cod))
      alert("Por segurança, saia do painel, entre de novo e troque a senha logo em seguida.");
    else if (/network/.test(cod))
      alert("Sem internet. Tente de novo quando a conexão voltar.");
    else
      alert("Não consegui trocar a senha agora. Tente de novo em instantes.");
  }
});

/* A taxa de entrega NÃO se digita aqui: ela varia de bairro para bairro e vem
   da tabela do site, junto com o pedido. */
