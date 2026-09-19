/* =========================================================
   Rei Burgão — MODO LOJA (impressão de comanda)
   Criasiteweb
   ---------------------------------------------------------
   Esta página é só para a lanchonete. O atendente cola aqui
   o pedido que chegou no WhatsApp (ou abre o link da comanda)
   e imprime na impressora térmica 80mm.

   Duas formas de imprimir:
   1) "Imprimir comanda"  -> usa a impressão normal do aparelho.
      Funciona no PC (impressora instalada por USB) e no celular
      Android com o RawBT instalado como serviço de impressão.
   2) "Imprimir direto"   -> manda o texto pronto para o RawBT
      sem abrir janela de impressão. Só no Android.
   ========================================================= */

const LOJA = {
  nome: "REI BURGÃO LANCHES",
  endereco: "R. Eunice Cerqueira Innocencio, 245",
  bairro: "Jd. Quaresmeira — Suzano/SP",
  fone: "(11) 97638-5099",
  colunas: 48,                          // 80mm na fonte padrão = 48 colunas
  rawbt: "ru.a402d.rawbtprinter"        // pacote do app RawBT
};

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const COLS = LOJA.colunas;

/* ========================= utilidades ========================= */
function reais(n) {
  return "R$ " + Number(n || 0).toFixed(2).replace(".", ",");
}
function paraNumero(txt) {
  const d = String(txt || "").replace(/[^\d,.-]/g, "").replace(/\.(?=\d{3}\b)/g, "").replace(",", ".");
  const n = parseFloat(d);
  return isNaN(n) ? 0 : n;
}
function semAcento(s) {
  return String(s).normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[—–]/g, "-").replace(/[“”]/g, '"').replace(/[‘’]/g, "'");
}
function agora() {
  const d = new Date();
  const p = n => String(n).padStart(2, "0");
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
}
function b64u(s) {
  const bytes = new TextEncoder().encode(s);
  let bin = ""; bytes.forEach(b => bin += String.fromCharCode(b));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function deb64u(s) {
  const t = s.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(t + "=".repeat((4 - t.length % 4) % 4));
  return new TextDecoder().decode(Uint8Array.from(bin, c => c.charCodeAt(0)));
}

/* ---- montagem de linhas de 48 colunas (texto da impressora) ---- */
function linhaLR(esq, dir) {
  const e = String(esq), d = String(dir);
  if (e.length + d.length + 1 > COLS) return e + "\n" + " ".repeat(Math.max(0, COLS - d.length)) + d;
  return e + " ".repeat(COLS - e.length - d.length) + d;
}
function centro(s) {
  const t = String(s);
  return " ".repeat(Math.max(0, Math.floor((COLS - t.length) / 2))) + t;
}
function quebra(s, recuo = "") {
  const largura = Math.max(8, COLS - recuo.length);
  const saida = [];
  let linha = "";
  for (const p of String(s).split(/\s+/).filter(Boolean)) {
    if (!linha) { linha = p; continue; }
    if ((linha + " " + p).length > largura) { saida.push(linha); linha = p; }
    else linha += " " + p;
  }
  if (linha) saida.push(linha);
  return saida.map(l => recuo + l);
}

/* ========================= leitura do pedido ========================= */
/* Lê o texto que o site gera e manda para o WhatsApp. Se não reconhecer
   nada, devolve null e a gente imprime o texto cru mesmo. */
function lerPedido(bruto) {
  if (!bruto || !bruto.trim()) return null;

  const linhas = bruto
    .replace(/\r/g, "")
    .split("\n")
    // tira prefixo de exportação do WhatsApp: [19/09/2026 20:14] Fulano:
    .map(l => l.replace(/^\[?\d{1,2}\/\d{1,2}\/\d{2,4}[^\]]*\]?\s*[^:]{0,40}:\s?/, ""))
    .map(l => l.replace(/‎/g, ""));

  const pedido = { itens: [], subtotal: 0, cliente: "", fone: "", tipo: "", endereco: "", pagamento: "", obs: "" };
  let ultimo = null;

  for (const cru of linhas) {
    const limpa = cru.replace(/[*_~]/g, "");
    const t = limpa.trim();
    if (!t) continue;

    // item: "• 2x X-Bacon — R$ 25,00"
    const it = t.match(/^[•·\-•]\s*(\d+)\s*x\s*(.+?)\s*[—\-–]\s*R\$\s*([\d.,]+)$/i);
    if (it) {
      ultimo = { q: parseInt(it[1], 10), nome: it[2].trim(), total: paraNumero(it[3]), lanches: "", adds: "", obs: "" };
      pedido.itens.push(ultimo);
      continue;
    }
    // detalhe do item (vem indentado no texto original)
    const det = limpa.match(/^\s+(Lanches|Adicionais|Obs)\s*:\s*(.+)$/i);
    if (det && ultimo) {
      const chave = det[1].toLowerCase();
      if (chave === "lanches") ultimo.lanches = det[2].trim();
      else if (chave === "adicionais") ultimo.adds = det[2].trim();
      else ultimo.obs = det[2].trim();
      continue;
    }
    // campos do rodapé
    const c = t.match(/^(Subtotal|Cliente|WhatsApp|Como receber|Endereço|Endereco|Pagamento|Observações|Observacoes)\s*:\s*(.*)$/i);
    if (c) {
      const v = c[2].trim();
      switch (c[1].toLowerCase()) {
        case "subtotal": pedido.subtotal = paraNumero(v); break;
        case "cliente": pedido.cliente = v; break;
        case "whatsapp": pedido.fone = v; break;
        case "como receber": pedido.tipo = v; break;
        case "endereço": case "endereco": pedido.endereco = v; break;
        case "pagamento": pedido.pagamento = v; break;
        default: pedido.obs = v;
      }
      ultimo = null;
      continue;
    }
    ultimo = null;
  }

  if (!pedido.itens.length && !pedido.cliente) return null;
  if (!pedido.subtotal) pedido.subtotal = pedido.itens.reduce((s, i) => s + i.total, 0);
  return pedido;
}

/* ========================= a comanda ========================= */
function taxaAtual() {
  const v = paraNumero($("[data-taxa]").value);
  return v > 0 ? v : 0;
}

function numeroComanda(novo) {
  const hoje = new Date().toISOString().slice(0, 10);
  let s = { dia: hoje, n: 0 };
  try { s = JSON.parse(localStorage.getItem("rb_comanda_seq")) || s; } catch (e) {}
  if (s.dia !== hoje) s = { dia: hoje, n: 0 };
  if (novo) { s.n += 1; localStorage.setItem("rb_comanda_seq", JSON.stringify(s)); }
  return String(s.n || 1).padStart(3, "0");
}

/* ---- versão em texto puro (é o que vai para a impressora via RawBT) ---- */
function comandaTexto(p, num, semAcentos) {
  const L = [];
  const barra = "=".repeat(COLS);
  const tracos = "-".repeat(COLS);
  const taxa = taxaAtual();

  L.push(barra, centro(LOJA.nome), centro(LOJA.endereco), centro(LOJA.bairro), centro(LOJA.fone), barra);
  L.push(linhaLR(`COMANDA ${num}`, agora()));
  L.push(tracos);

  p.itens.forEach(i => {
    L.push(linhaLR(`${i.q}x ${i.nome.toUpperCase()}`, reais(i.total)));
    if (i.lanches) quebra(i.lanches, "   > ").forEach(l => L.push(l));
    if (i.adds)    quebra("+ " + i.adds, "   ").forEach(l => L.push(l));
    if (i.obs)     quebra("OBS: " + i.obs, "   ").forEach(l => L.push(l));
  });

  L.push(tracos);
  L.push(linhaLR("SUBTOTAL", reais(p.subtotal)));
  if (p.tipo && /entrega/i.test(p.tipo)) L.push(linhaLR("TAXA DE ENTREGA", taxa ? reais(taxa) : "a combinar"));
  L.push(linhaLR("TOTAL", reais(p.subtotal + taxa)));
  L.push(barra);

  const campo = (rot, val) => { if (val) quebra(val, "").forEach((l, k) => L.push(k === 0 ? `${rot.padEnd(9)}${l}` : " ".repeat(9) + l)); };
  campo("CLIENTE", p.cliente);
  campo("FONE", p.fone);
  campo("RECEBER", (p.tipo || "").toUpperCase());
  campo("ENDERECO", p.endereco);
  campo("PAGTO", p.pagamento);
  campo("OBS", p.obs);
  L.push(barra);
  L.push(centro("Pedido feito pelo site"));

  const txt = L.join("\n");
  return semAcentos ? semAcento(txt) : txt;
}

/* ---- versão bonita em HTML (é o que sai no botão "Imprimir comanda") ---- */
function comandaHTML(p, num) {
  const taxa = taxaAtual();
  const linha = (a, b, cls = "") => `<div class="lin ${cls}"><span>${a}</span><b>${b}</b></div>`;
  const esc = s => String(s).replace(/[<>&]/g, c => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c]));

  const itens = p.itens.map(i => `
    <div class="item">
      <div class="lin forte"><span>${i.q}x ${esc(i.nome)}</span><b>${reais(i.total)}</b></div>
      ${i.lanches ? `<div class="sub">&rsaquo; ${esc(i.lanches)}</div>` : ""}
      ${i.adds ? `<div class="sub">+ ${esc(i.adds)}</div>` : ""}
      ${i.obs ? `<div class="sub obs">OBS: ${esc(i.obs)}</div>` : ""}
    </div>`).join("");

  const dado = (rot, val) => val ? `<div class="dado"><i>${rot}</i><span>${esc(val)}</span></div>` : "";

  return `
    <div class="cab">
      <strong>${LOJA.nome}</strong>
      <span>${LOJA.endereco}</span>
      <span>${LOJA.bairro}</span>
      <span>${LOJA.fone}</span>
    </div>
    <div class="lin num"><span>COMANDA ${num}</span><b>${agora()}</b></div>
    <hr />
    ${itens}
    <hr />
    ${linha("Subtotal", reais(p.subtotal))}
    ${p.tipo && /entrega/i.test(p.tipo) ? linha("Taxa de entrega", taxa ? reais(taxa) : "a combinar") : ""}
    ${linha("TOTAL", reais(p.subtotal + taxa), "total")}
    <hr />
    ${dado("Cliente", p.cliente)}
    ${dado("Fone", p.fone)}
    ${dado("Receber", (p.tipo || "").toUpperCase())}
    ${dado("Endereço", p.endereco)}
    ${dado("Pagamento", p.pagamento)}
    ${dado("Observações", p.obs)}
    <div class="rodape">Pedido feito pelo site</div>`;
}

/* ========================= impressão ========================= */
const ESC_CORTE  = "\x1D\x56\x41\x10";          // GS V A — corte com avanço
const ESC_GAVETA = "\x1B\x70\x30\x19\xFA";      // ESC p — abre a gaveta de dinheiro

function ehAndroid() { return /Android/i.test(navigator.userAgent); }

function mandarRawBT(texto) {
  const url = "intent:" + encodeURIComponent(texto) +
              "#Intent;scheme=rawbt;package=" + LOJA.rawbt + ";end;";
  window.location.href = url;
}

function avisar(msg, erro) {
  const el = $("[data-aviso]");
  el.textContent = msg;
  el.dataset.erro = erro ? "true" : "false";
  el.hidden = !msg;
}

/* ========================= histórico ========================= */
function historico(lista) {
  if (lista) { localStorage.setItem("rb_comandas", JSON.stringify(lista.slice(0, 30))); return lista; }
  try { return JSON.parse(localStorage.getItem("rb_comandas")) || []; } catch (e) { return []; }
}

function guardar(bruto, num, resumo) {
  const lista = historico();
  lista.unshift({ t: Date.now(), num, resumo, bruto });
  historico(lista);
  desenharHistorico();
}

function desenharHistorico() {
  const alvo = $("[data-historico]");
  const lista = historico();
  $("[data-historico-vazio]").hidden = lista.length > 0;
  alvo.innerHTML = lista.map((c, i) => {
    const d = new Date(c.t);
    const h = String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
    return `<li><button type="button" data-reabrir="${i}">
      <b>#${c.num}</b><span>${c.resumo}</span><i>${h}</i></button></li>`;
  }).join("");
}

/* ========================= estado da tela ========================= */
let pedidoAtual = null;
let numeroAtual = null;

function processar(bruto, novoNumero) {
  const p = lerPedido(bruto);
  const papel = $("[data-papel]");

  if (!p) {
    pedidoAtual = null;
    papel.innerHTML = `<div class="cru">${(bruto || "").replace(/[<>&]/g, c => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c])) || "Cole o pedido acima para ver a comanda aqui."}</div>`;
    $("[data-acoes]").hidden = !bruto.trim();
    avisar(bruto.trim() ? "Não reconheci o formato do pedido — vou imprimir o texto do jeito que está." : "", false);
    return;
  }

  pedidoAtual = p;
  numeroAtual = numeroComanda(novoNumero);
  papel.innerHTML = comandaHTML(p, numeroAtual);
  $("[data-acoes]").hidden = false;
  avisar("", false);
}

function textoParaImprimir() {
  const sem = $("[data-semacento]").checked;
  if (pedidoAtual) return comandaTexto(pedidoAtual, numeroAtual, sem);
  const cru = $("[data-entrada]").value;
  return sem ? semAcento(cru) : cru;
}

function resumoCurto() {
  if (!pedidoAtual) return "Pedido";
  const q = pedidoAtual.itens.reduce((s, i) => s + i.q, 0);
  return `${pedidoAtual.cliente || "Sem nome"} · ${q} ${q === 1 ? "item" : "itens"}`;
}

/* ========================= início ========================= */
document.addEventListener("DOMContentLoaded", () => {
  const entrada = $("[data-entrada]");

  // taxa de entrega fica guardada no aparelho
  const taxa = $("[data-taxa]");
  taxa.value = localStorage.getItem("rb_taxa") || "";
  taxa.addEventListener("input", () => {
    localStorage.setItem("rb_taxa", taxa.value);
    if (pedidoAtual) $("[data-papel]").innerHTML = comandaHTML(pedidoAtual, numeroAtual);
  });

  $("[data-semacento]").checked = localStorage.getItem("rb_semacento") !== "nao";
  $("[data-semacento]").addEventListener("change", e => {
    localStorage.setItem("rb_semacento", e.target.checked ? "sim" : "nao");
  });

  entrada.addEventListener("input", () => processar(entrada.value, false));

  $("[data-colar]").addEventListener("click", async () => {
    try {
      const t = await navigator.clipboard.readText();
      if (!t.trim()) return avisar("A área de transferência está vazia.", true);
      entrada.value = t;
      processar(t, true);
    } catch (e) {
      avisar("Seu navegador não deixou colar sozinho — cole no campo com o dedo mesmo.", true);
      entrada.focus();
    }
  });

  $("[data-limpar]").addEventListener("click", () => {
    entrada.value = ""; pedidoAtual = null;
    processar("", false);
    entrada.focus();
  });

  $("[data-imprimir]").addEventListener("click", () => {
    if (!$("[data-entrada]").value.trim()) return avisar("Cole o pedido primeiro.", true);
    guardar(entrada.value, numeroAtual || numeroComanda(false), resumoCurto());
    window.print();
  });

  $("[data-direto]").addEventListener("click", () => {
    if (!$("[data-entrada]").value.trim()) return avisar("Cole o pedido primeiro.", true);
    if (!ehAndroid()) return avisar("A impressão direta é só no celular Android com o RawBT. No computador use o botão “Imprimir comanda”.", true);
    guardar(entrada.value, numeroAtual || numeroComanda(false), resumoCurto());
    mandarRawBT(textoParaImprimir() + "\n\n\n" + ESC_CORTE);
    avisar("Mandado para a impressora.", false);
  });

  $("[data-gaveta]").addEventListener("click", () => {
    if (!ehAndroid()) return avisar("Abrir a gaveta pelo site só funciona no Android com o RawBT.", true);
    mandarRawBT(ESC_GAVETA);
  });

  $("[data-historico]").addEventListener("click", e => {
    const b = e.target.closest("[data-reabrir]");
    if (!b) return;
    const c = historico()[Number(b.dataset.reabrir)];
    if (!c) return;
    entrada.value = c.bruto;
    processar(c.bruto, false);
    numeroAtual = c.num;
    $("[data-papel]").innerHTML = pedidoAtual ? comandaHTML(pedidoAtual, numeroAtual) : $("[data-papel]").innerHTML;
    window.scrollTo({ top: 0, behavior: "smooth" });
    avisar("Comanda #" + c.num + " reaberta — é só imprimir de novo.", false);
  });

  // pedido chegando por link: comanda.html#p=<dados>
  const h = location.hash.replace(/^#/, "");
  const m = h.match(/^p=(.+)$/);
  if (m) {
    try {
      const t = deb64u(m[1]);
      entrada.value = t;
      processar(t, true);
    } catch (e) { avisar("O link da comanda veio quebrado.", true); }
  } else {
    processar("", false);
  }

  desenharHistorico();
});
