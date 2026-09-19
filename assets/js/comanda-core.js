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

  const pedido = { itens: [], subtotal: 0, taxa: null, cliente: "", fone: "", tipo: "", endereco: "", pagamento: "", obs: "" };
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
    const c = t.match(/^(Subtotal|Taxa de entrega|Total|Cliente|WhatsApp|Como receber|Endereço|Endereco|Pagamento|Observações|Observacoes)\s*:\s*(.*)$/i);
    if (c) {
      const v = c[2].trim();
      switch (c[1].toLowerCase()) {
        case "subtotal": pedido.subtotal = paraNumero(v); break;
        /* a taxa vem do próprio pedido: é a tabela por bairro do site.
           "a combinar" mantém null, e aí a comanda usa o valor do aparelho. */
        case "taxa de entrega": pedido.taxa = /combinar/i.test(v) ? null : paraNumero(v); break;
        case "total": break;
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
function taxaDoPedido(p) {
  return (p && typeof p.taxa === "number" && p.taxa > 0) ? p.taxa : taxaAtual();
}

function taxaAtual() {
  /* o campo existe no Modo Loja; no painel de pedidos lemos o valor guardado */
  const campo = $("[data-taxa]");
  const bruto = campo ? campo.value : (localStorage.getItem("rb_taxa") || "");
  const v = paraNumero(bruto);
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


/* ---- troco: "Dinheiro (troco para R$ 100)" -> quanto levar de volta ---- */
function trocoDe(pagamento, total) {
  const m = String(pagamento || "").match(/troco\s*para\s*R?\$?\s*([\d.,]+)/i);
  if (!m) return null;
  const valor = paraNumero(m[1]);
  if (!(valor > total)) return null;
  return { levou: valor, volta: valor - total };
}

/* ---- título de seção na largura do papel: "--- CLIENTE ----------" ---- */
function secao(titulo) {
  const t = ` ${titulo} `;
  const sobra = Math.max(0, COLS - t.length - 3);
  return "-".repeat(3) + t + "-".repeat(sobra);
}

/* ---- versão em texto puro (é o que vai para a impressora via RawBT) ---- */
function comandaTexto(p, num, semAcentos) {
  const L = [];
  const barra  = "=".repeat(COLS);
  const taxa   = taxaDoPedido(p);
  const entrega = /entrega/i.test(p.tipo || "");
  const total  = p.subtotal + (entrega ? taxa : 0);
  const troco  = trocoDe(p.pagamento, total);

  /* cabeçalho da loja */
  L.push(barra, centro(LOJA.nome.toUpperCase()), centro(LOJA.endereco),
         centro(LOJA.bairro), centro(LOJA.fone), barra);
  L.push(linhaLR(`COMANDA ${num}`, agora()));
  L.push(barra, "");

  /* o dado mais importante para o balcão, em destaque */
  L.push(centro(entrega ? ">>> ENTREGA <<<" : ">>> RETIRADA <<<"), "");

  /* quem é o cliente */
  L.push(secao("CLIENTE"));
  const campo = (rot, val) => {
    if (!val) return;
    const recuo = " ".repeat(10);
    /* quebra já contando o espaço do rótulo, para nada passar de COLS */
    quebra(String(val), recuo).forEach((l, k) =>
      L.push(k === 0 ? rot.padEnd(10) + l.slice(10) : l));
  };
  campo("NOME:", p.cliente);
  campo("FONE:", p.fone);
  if (entrega) campo("ENDERECO:", p.endereco);
  L.push("");

  /* o que preparar */
  L.push(secao("PEDIDO"));
  p.itens.forEach(i => {
    L.push(linhaLR(`${i.q}x ${i.nome.toUpperCase()}`, reais(i.total)));
    if (i.lanches) quebra(i.lanches, "   > ").forEach(l => L.push(l));
    if (i.adds)    quebra("+ " + i.adds, "   ").forEach(l => L.push(l));
    if (i.obs)     quebra("OBS: " + i.obs, "   ").forEach(l => L.push(l));
  });
  if (p.obs) { L.push(""); quebra("OBS DO PEDIDO: " + p.obs, "").forEach(l => L.push(l)); }
  L.push("");

  /* quanto dá */
  L.push(secao("VALORES"));
  L.push(linhaLR("SUBTOTAL", reais(p.subtotal)));
  if (entrega) L.push(linhaLR("TAXA DE ENTREGA", taxa ? reais(taxa) : "A COMBINAR"));
  L.push(linhaLR("TOTAL A PAGAR", reais(total)));
  L.push("");

  /* como recebe */
  L.push(secao("PAGAMENTO"));
  campo("FORMA:", p.pagamento || "A combinar");
  if (troco) {
    campo("RECEBE:", reais(troco.levou));
    campo("TROCO:", reais(troco.volta));
  }
  L.push("");

  L.push(barra);
  L.push(centro("Pedido feito pelo site"));
  L.push(centro(LOJA.fone));
  L.push(barra);

  const txt = L.join("\n");
  return semAcentos ? semAcento(txt) : txt;
}

/* ---- versão bonita em HTML (é o que sai no botão "Imprimir comanda") ---- */
function comandaHTML(p, num) {
  const taxa = taxaDoPedido(p);
  const entrega = /entrega/i.test(p.tipo || "");
  const total = p.subtotal + (entrega ? taxa : 0);
  const troco = trocoDe(p.pagamento, total);
  const esc = s => String(s).replace(/[<>&]/g, c => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c]));
  const linha = (a, b, cls = "") => `<div class="lin ${cls}"><span>${a}</span><b>${b}</b></div>`;
  const bloco = t => `<div class="secao">${t}</div>`;
  const dado  = (rot, val) => val ? `<div class="dado"><i>${rot}</i><span>${esc(val)}</span></div>` : "";

  const itens = p.itens.map(i => `
    <div class="item">
      <div class="lin forte"><span>${i.q}x ${esc(i.nome)}</span><b>${reais(i.total)}</b></div>
      ${i.lanches ? `<div class="sub">&rsaquo; ${esc(i.lanches)}</div>` : ""}
      ${i.adds ? `<div class="sub">+ ${esc(i.adds)}</div>` : ""}
      ${i.obs ? `<div class="sub obs">OBS: ${esc(i.obs)}</div>` : ""}
    </div>`).join("");

  return `
    <div class="cab">
      <strong>${LOJA.nome}</strong>
      <span>${LOJA.endereco}</span>
      <span>${LOJA.bairro}</span>
      <span>${LOJA.fone}</span>
    </div>
    <div class="lin num"><span>COMANDA ${num}</span><b>${agora()}</b></div>

    <div class="tarja ${entrega ? "t-entrega" : "t-retirada"}">${entrega ? "ENTREGA" : "RETIRADA"}</div>

    ${bloco("Cliente")}
    ${dado("Nome", p.cliente)}
    ${dado("Fone", p.fone)}
    ${entrega ? dado("Endereço", p.endereco) : ""}

    ${bloco("Pedido")}
    ${itens}
    ${p.obs ? `<div class="sub obs">OBS DO PEDIDO: ${esc(p.obs)}</div>` : ""}

    ${bloco("Valores")}
    ${linha("Subtotal", reais(p.subtotal))}
    ${entrega ? linha("Taxa de entrega", taxa ? reais(taxa) : "a combinar") : ""}
    ${linha("TOTAL A PAGAR", reais(total), "total")}

    ${bloco("Pagamento")}
    ${dado("Forma", p.pagamento || "A combinar")}
    ${troco ? dado("Recebe", reais(troco.levou)) : ""}
    ${troco ? `<div class="dado troco"><i>Troco</i><span>${reais(troco.volta)}</span></div>` : ""}

    <div class="rodape">Pedido feito pelo site<br />${LOJA.fone}</div>`;
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

