/* =========================================================
   Rei Burgão — tela do Modo Loja (comanda.html)
   As funções de montar a comanda ficam em comanda-core.js,
   compartilhadas com o painel de pedidos (painel.html).
   ========================================================= */

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
