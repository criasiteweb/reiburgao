/* =========================================================
   Rei Burgão — cardápio digital + carrinho + WhatsApp
   Criasiteweb
   ---------------------------------------------------------
   PARA EDITAR: o bloco LOJA abaixo tem tudo que muda.
   Preços e itens vêm do cardápio oficial da lanchonete.
   ========================================================= */

const LOJA = {
  nome: "Rei Burgão",
  /* WhatsApp real da Lanchonete Rei Burgão — os pedidos caem no celular da loja. */
  whatsapp: "5511976385099",
  endereco: "R. Eunice Cerqueira Innocencio, 245 - Jardim Quaresmeira, Suzano - SP, 08671-330",
  preparo: "40 a 60 min",              // [CONFIRMAR com o dono] tempo médio de entrega
  /* Horário confirmado pelo Matheus: terça a domingo, das 18h à meia-noite. */
  abre: 18,                            // abre às 18h
  fecha: 24,                           // fecha à meia-noite
  diasFechados: [1],                   // fecha segunda-feira (0=dom, 1=seg)

  /* =======================================================
     TABELA DE ENTREGA  —  é só isto que o Matheus preenche
     -------------------------------------------------------
     Cada bairro recebe o valor da taxa do motoboy.
       5      -> cobra R$ 5,00
       null   -> aparece "a combinar" (ainda sem preço)
     Para tirar um bairro do atendimento, basta apagar a linha.
     Para acrescentar, copiar uma linha e trocar o nome.
     ======================================================= */
  entrega: {
    ativa: true,
    raioKm: 10,
    /* Tabela do dono (PDF "taxas rei burgão", 21/09/2026): 133 bairros,
       km medido pela rua. Acima de 10 km não há entrega. */
    cidades: {
      "Suzano": {
        "Jardim Suzanópolis":     3,      // 0,2 km
        "Jardim Quaresmeira I":   3,      // 0,6 km
        "Parque Santa Rosa":      3,      // 0,8 km
        "Jardim Márcia":          4,      // 1,3 km
        "Jardim Realce":          4,      // 1,5 km
        "Jardim Vitória":         4.5,    // 1,7 km
        "Monte Cristo":           5.5,    // 2,1 km
        "Cidade Cruzeiro do Sul": 5.5,    // 2,3 km
        "Polo Educacional":       5.5,    // 2,5 km
        "Jardim São Luiz":        6,      // 2,5 km
        "Jardim Anzai":           6,      // 2,6 km
        "Jardim Imperador":       6,      // 2,6 km
        "Jardim Caxangá":         6,      // 2,6 km
        "Jadim Nena":             6,      // 2,8 km
        "Jardim Saúde":           6,      // 2,8 km
        "Jardim Japão":           6,      // 2,9 km
        "Jardim Paulista":        6,      // 3,0 km
        "Vila São Francisco":     6.5,    // 3,0 km
        "Parque Suzano":          7,      // 3,3 km
        "Vila Costa":             7,      // 3,5 km
        "Cidade Edson":           7.5,    // 3,5 km
        "Vila Figueira":          7.5,    // 3,7 km
        "Vila São Jorge":         7.5,    // 3,7 km
        "Vila Barros":            8.5,    // 4,2 km
        "Centro":                 9,      // 4,6 km
        "Vila Urupês":            9,      // 4,8 km
        "Vila Mazza":             9,      // 4,9 km
        "Vila Amorim":            9.5,    // 5,1 km
        "Jardim Luela":           10.5,   // 5,6 km
        "Vila Nova Amorim":       10.5,   // 5,7 km
        "Jardim Luella":          10.5,   // 5,7 km
        "Jardim Colorado":        11,     // 5,9 km
        "Sítio Suíço":            11.5,   // 6,0 km
        "Parque Maria Helena":    11.5,   // 6,4 km
        "Vila Maluf":             12,     // 6,6 km
        "Jardim Maite":           12,     // 6,8 km
        "Jardim Nazareth":        12,     // 6,9 km
        "Jardim Miriam":          14,     // 7,9 km
        "Jardim Revista":         14.5,   // 8,1 km
        "Jardim Dom Ângelo":      14.5,   // 8,1 km
        "Raffo":                  14.5,   // 8,1 km
        "Taba Marajoara":         14.5,   // 8,1 km
        "Rio Baixo":              14.5,   // 8,2 km
        "Cidade Miguel Badra":    14.5,   // 8,4 km
        "Vila Helena":            15,     // 8,5 km
        "Areião":                 15,     // 8,6 km
        "Jardim Leblon":          15,     // 8,7 km
        "Vila Yolanda":           15,     // 8,9 km
        "Jardim Alterópolis":     15.5,   // 9,1 km
        "Parque Alvorada":        15.5,   // 9,1 km
        "Jardim Veran":           15.5,   // 9,1 km
        "Barro Branco":           15.5,   // 9,2 km
        "Chácaras Ceres":         15.5,   // 9,2 km
        "Vila Laura":             15.5,   // 9,2 km
        "Jardim Maravilha":       16,     // 9,3 km
        "Sitío Conceição":        16,     // 9,4 km
        "Cidade Boa Vista":       16,     // 9,4 km
        "Jardim Gardênia Azul":   16,     // 9,5 km
        "Fazenda Aya":            16.5,   // 9,5 km
        "Jardim Nova América":    16.5,   // 9,7 km
        "Jardim Dona Benta":      16.5,   // 9,7 km
        "Jardim Davidenko":       16.5,   // 9,7 km
        "Jardim Soares":          17,     // 9,8 km
        "Sesc":                   17,     // 9,8 km
        "Jardim Fernandes":       17,     // 9,8 km
        "Jardim Ferraz":          17      // 10,0 km
      },
      "Poá": {
        "Jardim Nova Poá":      5,      // 1,9 km
        "Jardim Itamaraty":     5.5,    // 2,2 km
        "Jardim Obelisco":      5.5,    // 2,4 km
        "Biritiba":             6,      // 2,7 km
        "Jardim São José":      6,      // 2,8 km
        "Calmon Viana":         6,      // 2,8 km
        "Vila Archimedes":      6.5,    // 3,0 km
        "Vila Amélia":          6.5,    // 3,2 km
        "Vila Cristelo":        7,      // 3,3 km
        "Vila Ruth":            7.5,    // 3,7 km
        "Jardim Selma Helena":  7.5,    // 3,7 km
        "Jardim São Francisco": 8,      // 3,9 km
        "Vila Bandeirante":     10,     // 5,3 km
        "Vila Bandeirantes":    10,     // 5,4 km
        "Vila Anita":           10,     // 5,5 km
        "Vila Jaú":             10.5,   // 5,5 km
        "Vila Ibar":            10.5,   // 5,5 km
        "Vila Júlia":           10.5,   // 5,7 km
        "Vila Monteiro":        11,     // 6,0 km
        "Jardim Medina":        11.5,   // 6,3 km
        "Jardim Áurea":         11.5,   // 6,3 km
        "Chácara Bela Vista":   11.5,   // 6,4 km
        "Vila Varela":          12,     // 7,0 km
        "Jardim América":       12.5,   // 7,1 km
        "Vila Áurea":           12.5,   // 7,1 km
        "Jardim Santa Helena":  12.5,   // 7,2 km
        "Jardim Ivonete":       14.5    // 8,2 km
      },
      "Ferraz de Vasconcelos": {
        "Jardim Santiago":                7,      // 3,3 km
        "Jardim Yone":                    7.5,    // 3,7 km
        "Vila Corrêa":                    8.5,    // 4,2 km
        "Vila do Parque São Judas Tadeu": 8.5,    // 4,3 km
        "Jardim Juliana":                 9,      // 4,5 km
        "Sítio do Paiolzinho":            9,      // 4,6 km
        "Vila São Paulo":                 9.5,    // 5,1 km
        "Vila São Sebastião":             10,     // 5,4 km
        "Chácara Guaio":                  11.5,   // 6,1 km
        "Jardim São João":                11.5,   // 6,4 km
        "Vila Romanópolis":               11.5,   // 6,5 km
        "Vila Andeyara":                  12,     // 6,6 km
        "Parque São Francisco":           12.5,   // 7,0 km
        "Vila Santa Margarida":           12.5,   // 7,2 km
        "Vila Arbame":                    13.5,   // 7,6 km
        "Jardim Barão":                   13.5,   // 7,6 km
        "Vila do Americano":              13.5,   // 7,7 km
        "Tanquinho":                      14,     // 7,8 km
        "Jardim Vista Alegre":            14,     // 7,8 km
        "Jardim Luiz Mauro":              14.5,   // 8,1 km
        "Vila Santo Antonio":             14.5,   // 8,4 km
        "Jardim Malda":                   15,     // 8,5 km
        "Santo Antônio Paulista":         15,     // 8,7 km
        "Jardim Brigída":                 15,     // 8,9 km
        "Vila Rio Guaió":                 15,     // 9,0 km
        "Jardim Santa Rosa":              15.5,   // 9,2 km
        "Jardim Renata":                  16.5    // 9,7 km
      },
      "Itaquaquecetuba": {
        "Rancho Grande":     12.5,   // 7,1 km
        "Vila Florindo":     12.5,   // 7,2 km
        "Santa Tereza":      13,     // 7,4 km
        "Cidade Kemel":      14,     // 7,9 km
        "Jardim do Algarve": 14,     // 7,9 km
        "Vila Ursulina":     14.5,   // 8,0 km
        "Pedreira":          15,     // 8,6 km
        "Jardim Luciana":    15.5,   // 9,2 km
        "Jardim Gonçalves":  16,     // 9,3 km
        "Morro Branco":      16,     // 9,4 km
        "Vila Zeferina":     16,     // 9,5 km
        "Vila Virginia":     16.5,   // 9,6 km
        "Jardim São Paulo":  17      // 9,8 km
      }
    },

    /* =====================================================
       TAXA AUTOMÁTICA POR DISTÂNCIA
       Serve para QUALQUER endereço, mesmo bairro fora da lista.
       O site descobre onde fica o endereço e calcula a taxa.
       A tabela de bairros acima, quando tem valor, manda —
       é ela que vale para os bairros de sempre.
       ===================================================== */
    porDistancia: {
      ativa: true,
      /* degraus do dono: [km, R$]; entre dois degraus paga o meio do caminho */
      degraus: [[0, 3], [1, 3], [2, 5], [3, 6], [4, 8], [5, 9],
                [6, 11], [7, 12], [8, 14], [9, 15], [10, 17]],
      maxKm: 10,      // fora deste raio, não entrega
      fator: 1.3      // linha reta -> rua de verdade (ruas dão voltas)
    },

    /* quando não dá para descobrir a distância */
    foraDaLista: null
  },

  /* Impressão de comanda (modo loja em comanda.html).
     false = o pedido no WhatsApp continua igual, e a loja imprime
             colando o texto em comanda.html.
     true  = o pedido leva no fim um link que já abre a comanda pronta
             para a loja imprimir com um toque (o cliente vê esse link). */
  linkComanda: false
};

/* transforma texto em código para caber no link da comanda */
function paraLink(txt) {
  const bytes = new TextEncoder().encode(txt);
  let bin = ""; bytes.forEach(b => bin += String.fromCharCode(b));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/* ---- adicionais ---- */
/* ---- adicionais, grupos e itens do cardápio vivem em cardapio.js ---- */

/* O navegador guarda onde a pessoa parou e devolve ali na volta, o que fazia
   o site abrir no meio dos combos. Quem chega pelo link tem que ver o começo.
   Só respeitamos a rolagem quando o próprio endereço aponta para uma seção. */
if ("scrollRestoration" in history) history.scrollRestoration = "manual";
(function comecarNoTopo() {
  const temAncora = location.hash && location.hash.length > 1;
  if (temAncora) return;
  const subir = () => window.scrollTo(0, 0);
  subir();
  window.addEventListener("load", subir, { once: true });
})();

/* ========================= utilidades ========================= */
const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const reais = v => "R$ " + v.toFixed(2).replace(".", ",");
const CHAVE = "reiburgao:carrinho";
/* Por quanto tempo o carrinho continua guardado no aparelho. Sem isto, quem
   pedia hoje voltava amanhã e encontrava a sacola cheia do pedido antigo. */
const VALIDADE_CARRINHO = 3 * 60 * 60 * 1000;   // 3 horas

let carrinho = [];
try {
  const guardado = JSON.parse(localStorage.getItem(CHAVE) || "null");
  if (Array.isArray(guardado)) {
    carrinho = guardado;                       // formato antigo, sem hora
  } else if (guardado && Array.isArray(guardado.itens)) {
    const velho = Date.now() - (guardado.em || 0) > VALIDADE_CARRINHO;
    carrinho = velho ? [] : guardado.itens;
    if (velho) localStorage.removeItem(CHAVE);
  }
} catch (e) { carrinho = []; }

/* ========================= cardápio ========================= */
function montarCardapio() {
  const alvo = $("[data-cardapio]");
  const filtros = $("[data-filtros]");

  filtros.innerHTML =
    `<button type="button" role="tab" aria-selected="true" data-f="todos">Tudo</button>` +
    GRUPOS.filter(g => g.id !== "combos")
      .map(g => `<button type="button" role="tab" aria-selected="false" data-f="${g.id}">${g.rotulo}</button>`).join("");

  alvo.innerHTML = GRUPOS.filter(g => g.id !== "combos").map(g => {
    /* o dono marca "acabou" no painel e o item some da lista do cliente */
    const itens = CARDAPIO.filter(i => i.g === g.id && !i.off);
    return `
      <div class="grupo" data-grupo="${g.id}">
        <div class="grupo-topo">
          <h3>${g.titulo}</h3>
          <span>${itens.length} ${itens.length === 1 ? "opção" : "opções"}</span>
        </div>
        ${g.nota ? `<p class="grupo-nota">${g.nota}</p>` : ""}
        <div class="lista-itens">
          ${itens.map(i => `
            <button class="item" type="button" data-item="${i.id}">
              <span class="item-foto">
                <img src="${i.foto || `assets/img/fotos/${i.f}.jpg`}" alt="${i.n}" loading="lazy" decoding="async" width="560" height="420" />
                ${i.tag ? `<span class="etiqueta">${i.tag}</span>` : ""}
              </span>
              <span class="item-corpo">
                <span class="item-nome">${i.n}</span>
                ${i.d ? `<span class="item-desc">${i.d}</span>` : ""}
                <span class="item-rodape">
                  <span class="item-preco">${reais(i.p)}</span>
                  <span class="item-mais" aria-hidden="true">+</span>
                </span>
              </span>
            </button>`).join("")}
        </div>
      </div>`;
  }).join("");

  filtros.addEventListener("click", e => {
    const b = e.target.closest("button[data-f]");
    if (!b) return;
    $$("button", filtros).forEach(x => x.setAttribute("aria-selected", String(x === b)));
    const f = b.dataset.f;
    $$(".grupo", alvo).forEach(g => { g.hidden = f !== "todos" && g.dataset.grupo !== f; });
  });

  alvo.addEventListener("click", e => {
    const b = e.target.closest("[data-item]");
    if (b) abrirModal(b.dataset.item);
  });
}

/* ========================= modal do item ========================= */
let itemAtual = null, qtdAtual = 1;

function abrirModal(id) {
  const it = CARDAPIO.find(i => i.id === id);
  if (!it) return;
  itemAtual = it; qtdAtual = 1;

  const mf = $("[data-modal-foto]");
  mf.src = it.foto || `assets/img/fotos/${it.f}.jpg`;
  mf.alt = it.n;
  $("[data-modal-cat]").textContent = GRUPOS.find(g => g.id === it.g).titulo;
  $("[data-modal-nome]").textContent = it.n;
  const desc = $("[data-modal-desc]");
  desc.textContent = it.d || "";
  desc.hidden = !it.d;
  $("[data-modal-obs]").value = "";
  $("[data-modal-qtd]").textContent = "1";

  const extras = $("[data-modal-extras]");
  let html = "";

  if (it.escolhas) {
    html += `<div class="extras-bloco">
      <p class="extras-titulo">Escolha os ${it.escolhas} lanches</p>
      ${Array.from({ length: it.escolhas }, (_, k) => `
        <label class="escolha">Lanche ${k + 1}
          <select data-escolha>${OPC_COMBO.map(o => `<option>${o}</option>`).join("")}</select>
        </label>`).join("")}
    </div>`;
  }
  if (it.add) {
    const lista = it.add === "dog" ? ADD_DOG : ADD_LANCHE;
    html += `<div class="extras-bloco">
      <p class="extras-titulo">Adicionais (opcional)</p>
      <div class="extras-lista">
        ${lista.map(a => `
          <label class="extra">
            <input type="checkbox" data-add value="${a.n}" data-preco="${a.p}" />
            <span>${a.n}</span><b>+ ${reais(a.p)}</b>
          </label>`).join("")}
      </div>
    </div>`;
  }
  extras.innerHTML = html;

  $("[data-modal]").hidden = false;
  document.body.classList.add("travado");
  atualizarModal();
}

function precoModal() {
  if (!itemAtual) return 0;
  const adds = $$("[data-add]:checked").reduce((s, c) => s + Number(c.dataset.preco), 0);
  return (itemAtual.p + adds) * qtdAtual;
}
function atualizarModal() {
  $("[data-modal-total]").textContent = reais(precoModal());
  $("[data-modal-qtd]").textContent = String(qtdAtual);
}
function fecharModal() {
  $("[data-modal]").hidden = true;
  itemAtual = null;
  if (!$("[data-carrinho]").dataset.aberto) document.body.classList.remove("travado");
}

/* ========================= carrinho ========================= */
function salvar() {
  try {
    if (!carrinho.length) { localStorage.removeItem(CHAVE); return; }
    localStorage.setItem(CHAVE, JSON.stringify({ itens: carrinho, em: Date.now() }));
  } catch (e) {}
}

/* depois de enviar, a sacola some: o pedido já foi para o WhatsApp */
function esvaziarDepoisDoEnvio() {
  carrinho = [];
  try { localStorage.removeItem(CHAVE); } catch (e) {}
  pintarCarrinho();
  const f = $("[data-checkout]") || document.querySelector("form");
  if (f && f.reset) {
    const nome = f.nome ? f.nome.value : "";
    const fone = f.fone ? f.fone.value : "";
    f.reset();
    /* nome e telefone ficam: é a mesma pessoa pedindo de novo */
    if (f.nome) f.nome.value = nome;
    if (f.fone) f.fone.value = fone;
  }
  abrirCarrinho(false);
}

function adicionarDoModal() {
  if (!itemAtual) return;
  const adds = $$("[data-add]:checked").map(c => ({ n: c.value, p: Number(c.dataset.preco) }));
  const escolhas = $$("[data-escolha]").map(s => s.value);
  const obs = $("[data-modal-obs]").value.trim();
  const unit = itemAtual.p + adds.reduce((s, a) => s + a.p, 0);

  const assinatura = JSON.stringify([itemAtual.id, adds.map(a => a.n), escolhas, obs]);
  const igual = carrinho.find(l => l.assinatura === assinatura);
  if (igual) igual.q += qtdAtual;
  else carrinho.push({ assinatura, id: itemAtual.id, n: itemAtual.n, unit, q: qtdAtual, adds, escolhas, obs });

  salvar(); pintarCarrinho(); fecharModal(); pulsar();
}

function pulsar() {
  $$("[data-contador]").forEach(el => {
    el.animate([{ transform: "scale(1)" }, { transform: "scale(1.45)" }, { transform: "scale(1)" }], { duration: 340, easing: "ease-out" });
  });
}

const subtotal = () => carrinho.reduce((s, l) => s + l.unit * l.q, 0);
const totalItens = () => carrinho.reduce((s, l) => s + l.q, 0);

function pintarCarrinho() {
  const alvo = $("[data-itens]");
  if (!carrinho.length) {
    alvo.innerHTML = `<div class="vazio"><span>🍔</span><p>Seu carrinho está vazio.<br />Escolha um lanche no cardápio.</p></div>`;
  } else {
    alvo.innerHTML = carrinho.map((l, i) => {
      const detalhes = [
        l.escolhas.length ? "Lanches: " + l.escolhas.join(", ") : "",
        l.adds.length ? "Adicionais: " + l.adds.map(a => a.n).join(", ") : "",
        l.obs ? "Obs: " + l.obs : ""
      ].filter(Boolean).join("<br />");
      return `<div class="ci">
        <div>
          <div class="ci-nome">${l.n}</div>
          ${detalhes ? `<div class="ci-extra">${detalhes}</div>` : ""}
        </div>
        <div class="ci-preco">${reais(l.unit * l.q)}</div>
        <div class="ci-acoes">
          <button type="button" data-menos="${i}" aria-label="Diminuir">−</button>
          <b>${l.q}</b>
          <button type="button" data-mais="${i}" aria-label="Aumentar">+</button>
          <button type="button" class="ci-remover" data-remover="${i}">remover</button>
        </div>
      </div>`;
    }).join("");
  }
  const t = subtotal();
  $("[data-subtotal]").textContent = reais(t);
  $("[data-total-flutuante]").textContent = reais(t);
  if (typeof atualizarTaxa === "function") atualizarTaxa();
  $$("[data-contador]").forEach(el => el.textContent = String(totalItens()));
  $("[data-flutuante]").hidden = totalItens() === 0;
}

function abrirCarrinho(abrir) {
  const c = $("[data-carrinho]");
  if (abrir) { c.dataset.aberto = "true"; c.setAttribute("aria-hidden", "false"); $("[data-veu]").hidden = false; document.body.classList.add("travado"); }
  else { delete c.dataset.aberto; c.setAttribute("aria-hidden", "true"); $("[data-veu]").hidden = true; if ($("[data-modal]").hidden) document.body.classList.remove("travado"); }
}

/* ========================= checkout ========================= */
function soDigitos(s) { return (s || "").replace(/\D/g, ""); }
function formatarFone(v) {
  const d = soDigitos(v).slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}


/* =========================================================
   Taxa de entrega por bairro
   A tabela fica em LOJA.entrega (no topo deste arquivo).
   ========================================================= */
const SEM_LISTA = "__outro__";




/* =========================================================
   Taxa automática por distância
   Descobre onde fica o endereço do cliente (OpenStreetMap,
   grátis e sem cadastro) e calcula a taxa pelo km rodado.
   Assim qualquer bairro é atendido, não só os da lista.
   ========================================================= */
const LOJA_COORD = { lat: -23.547038, lon: -46.333554 };   // R. Eunice Cerqueira Innocencio, 245
let distanciaKm = null;       // última distância calculada
let buscaDistancia = null;

function kmEntre(a, b) {
  const R = 6371, rad = g => g * Math.PI / 180;
  const dLat = rad(b.lat - a.lat), dLon = rad(b.lon - a.lon);
  const x = Math.sin(dLat / 2) ** 2 +
            Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

function taxaPorKm(km) {
  const c = LOJA.entrega.porDistancia;
  if (!c || !c.ativa || km == null) return null;
  if (km > c.maxKm) return "fora";
  const d = c.degraus;
  let i = 1;
  while (i < d.length - 1 && km > d[i][0]) i++;
  const [k0, v0] = d[i - 1], [k1, v1] = d[i];
  const v = v0 + (v1 - v0) * (km - k0) / (k1 - k0);
  return Math.ceil(v * 2 - 1e-9) / 2;      // sobe para o R$ 0,50 seguinte
}

function pedirDistancia() {
  clearTimeout(buscaDistancia);
  buscaDistancia = setTimeout(calcularDistancia, 900);
}

async function calcularDistancia() {
  if (tipoEscolhido() !== "Entrega") return;
  const rua = document.querySelector("[name=endereco]").value.trim();
  const num = document.querySelector("[name=numero]").value.trim();
  const bairro = bairroEscolhido();
  const cidade = $("[data-cidade]").value;
  if (rua.length < 4 || !cidade) return;

  /* Tenta do mais específico para o mais genérico. O bairro fica FORA da
     busca: o nome que os Correios usam muitas vezes não é o mesmo do mapa,
     e quando não bate o mapa não devolve nada. */
  const tentativas = [
    `${rua}${num ? ", " + num : ""}, ${cidade}, SP, Brasil`,
    `${rua}, ${cidade}, SP, Brasil`,
    bairro ? `${bairro}, ${cidade}, SP, Brasil` : null
  ].filter(Boolean);

  for (const busca of tentativas) {
    try {
      const r = await fetch("https://nominatim.openstreetmap.org/search?format=json&limit=1&q=" +
                            encodeURIComponent(busca));
      const lista = await r.json();
      if (Array.isArray(lista) && lista.length) {
        const reta = kmEntre(LOJA_COORD, { lat: +lista[0].lat, lon: +lista[0].lon });
        distanciaKm = reta * (LOJA.entrega.porDistancia.fator || 1);
        atualizarTaxa();
        return;
      }
    } catch (e) {
      distanciaKm = null; atualizarTaxa(); return;   // sem internet: cai na tabela
    }
  }
  distanciaKm = null;          // nem o bairro o mapa conhece
  atualizarTaxa();
}

/* ---- CEP preenche endereço sozinho (ViaCEP) ---- */
function formatarCep(v) {
  const d = soDigitos(v).slice(0, 8);
  return d.length > 5 ? d.slice(0, 5) + "-" + d.slice(5) : d;
}

function avisoCep(texto, achou) {
  const el = $("[data-busca-cep]");
  if (!el) return;
  el.hidden = !texto;
  el.textContent = texto;
  el.dataset.achou = achou ? "sim" : "nao";
}

async function buscarCep() {
  const campo = document.querySelector("[name=cep]");
  if (!campo) return;
  const d = soDigitos(campo.value);
  if (d.length !== 8) { avisoCep("", false); return; }

  avisoCep("Buscando o endereço…", false);
  try {
    const r = await fetch(`https://viacep.com.br/ws/${d}/json/`);
    const e = await r.json();
    if (e.erro) { avisoCep("CEP não encontrado — preencha os campos abaixo.", false); return; }

    /* a loja atende essa cidade? */
    const cidades = Object.keys(LOJA.entrega.cidades);
    const cidade = cidades.find(c => c.toLowerCase() === String(e.localidade).toLowerCase());
    if (!cidade) {
      avisoCep(`A loja entrega em ${cidades.join(", ")}. O CEP informado é de ${e.localidade}.`, false);
      return;
    }

    $("[data-cidade]").value = cidade;
    preencherBairros();

    const rua = document.querySelector("[name=endereco]");
    if (e.logradouro) { rua.value = e.logradouro; ultimaBusca = cidade + "|" + e.logradouro.toLowerCase(); }
    if (e.bairro) aplicarBairro(e.bairro);

    avisoCep(`${e.logradouro || "Endereço"} — ${e.bairro || ""}, ${e.localidade}`.replace(" — ,", " —"), true);
    pedirDistancia();          // já calcula a taxa com o endereço que veio do CEP
    if (e.logradouro) document.querySelector("[name=numero]").focus();
  } catch (err) {
    avisoCep("", false);   // sem internet: o cliente preenche na mão
  }
}

/* ---- sugestão de bairro a partir da rua (ViaCEP, grátis e sem cadastro) ---- */
let buscaAgendada = null;
let ultimaBusca = "";

function avisoBusca(texto, achou) {
  const el = $("[data-busca-bairro]");
  if (!el) return;
  el.hidden = !texto;
  el.textContent = texto;
  el.dataset.achou = achou ? "sim" : "nao";
}

function pedirBairro() {
  clearTimeout(buscaAgendada);
  buscaAgendada = setTimeout(buscarBairro, 600);   // espera parar de digitar
}

async function buscarBairro() {
  const campoRua = document.querySelector("[name=endereco]");
  const selCidade = $("[data-cidade]");
  if (!campoRua || !selCidade) return;

  const rua = campoRua.value.trim().replace(/^(rua|r\.|av\.?|avenida|travessa|tv\.?)\s+/i, "");
  const cidade = selCidade.value;
  if (rua.length < 4) { avisoBusca("", false); return; }

  const chave = cidade + "|" + rua.toLowerCase();
  if (chave === ultimaBusca) return;
  ultimaBusca = chave;

  avisoBusca("Procurando o bairro…", false);
  try {
    const r = await fetch(`https://viacep.com.br/ws/SP/${encodeURIComponent(cidade)}/${encodeURIComponent(rua)}/json/`);
    const lista = await r.json();
    if (!Array.isArray(lista) || !lista.length) {
      avisoBusca("Não achei essa rua — escolha o bairro na lista abaixo.", false);
      return;
    }
    /* bairros distintos que aquela rua atravessa */
    const bairros = [...new Set(lista.map(x => x.bairro).filter(Boolean))];
    if (!bairros.length) { avisoBusca("", false); return; }

    aplicarBairro(bairros[0]);
    avisoBusca(bairros.length === 1
      ? `Bairro encontrado: ${bairros[0]}`
      : `Essa rua passa por ${bairros.length} bairros — confira se é ${bairros[0]}.`, true);
  } catch (e) {
    avisoBusca("", false);   // sem internet para consultar: o cliente escolhe na mão
  }
}

/* marca o bairro no seletor; se não estiver na tabela, acrescenta */
function aplicarBairro(nome) {
  const sel = $("[data-bairro]");
  if (!sel) return;
  const igual = [...sel.options].find(o =>
    o.value.toLowerCase() === String(nome).toLowerCase());
  if (igual) { sel.value = igual.value; }
  else {
    const op = document.createElement("option");
    op.value = nome; op.textContent = nome; op.dataset.deFora = "sim";
    sel.insertBefore(op, sel.options[sel.options.length - 1]);
    sel.value = nome;
  }
  $("[data-campo-outro]").hidden = sel.value !== SEM_LISTA;
  atualizarTaxa();
}


/* =========================================================
   Vitrine dos combos — promoção à parte, fora do cardápio
   ========================================================= */
function montarCombos() {
  const alvo = $("[data-vitrine-combos]");
  if (!alvo) return;
  const combos = CARDAPIO.filter(i => i.g === "combos");
  const menor = Math.min(...combos.map(c => c.p));

  alvo.innerHTML = combos.map(c => {
    /* quanto sai cada lanche dentro do combo, para mostrar a vantagem */
    const porLanche = c.p / c.escolhas;
    const linha = c.n.split("—");
    return `
      <button class="combo-card" type="button" data-item="${c.id}">
        <span class="combo-foto">
          <img src="${c.foto || `assets/img/fotos/${c.f}.jpg`}" alt="${c.n}" loading="lazy" decoding="async" width="560" height="420" />
          <span class="combo-selo">${c.escolhas} lanches</span>
        </span>
        <span class="combo-corpo">
          <span class="combo-tipo">${linha[0].replace("Combo", "").trim()}</span>
          <span class="combo-nome">${c.escolhas} lanches na caixa</span>
          <span class="combo-inclui">+ fritas · nuggets · anel de cebola · molho · refrigerante</span>
          <span class="combo-rodape">
            <span class="combo-preco">${reais(c.p)}</span>
            <span class="combo-unit">${reais(porLanche)} por lanche</span>
          </span>
          <span class="combo-botao">Escolher os lanches</span>
        </span>
      </button>`;
  }).join("");

  const apartir = $("[data-combo-apartir]");
  if (apartir) apartir.textContent = reais(menor);
}

function montarEntrega() {
  const selCidade = $("[data-cidade]");
  const selBairro = $("[data-bairro]");
  if (!selCidade || !selBairro || !LOJA.entrega || !LOJA.entrega.ativa) return;

  const cidades = Object.keys(LOJA.entrega.cidades);
  selCidade.innerHTML = cidades.map(c => `<option value="${c}">${c}</option>`).join("");
  preencherBairros();

  selCidade.addEventListener("change", () => {
    preencherBairros(); ultimaBusca = ""; buscarBairro(); atualizarTaxa();
  });
  selBairro.addEventListener("change", () => {
    $("[data-campo-outro]").hidden = selBairro.value !== SEM_LISTA;
    pedirDistancia();
    atualizarTaxa();
  });
  atualizarTaxa();
}

function preencherBairros() {
  const cidade = $("[data-cidade]").value;
  const bairros = Object.keys(LOJA.entrega.cidades[cidade] || {});
  $("[data-bairro]").innerHTML =
    bairros.map(b => `<option value="${b}">${b}</option>`).join("") +
    `<option value="${SEM_LISTA}">Meu bairro não está na lista</option>`;
  $("[data-campo-outro]").hidden = true;
}

/* devolve o valor da taxa, ou null quando é "a combinar" */
/* Devolve o valor da taxa, "fora" quando passa do raio, ou null
   quando ainda não dá para saber ("a combinar").
   Ordem: a tabela de bairros manda; sem ela, vale a distância. */
function taxaEntrega() {
  if (!LOJA.entrega || !LOJA.entrega.ativa) return null;
  if (tipoEscolhido() !== "Entrega") return 0;

  const sel = $("[data-bairro]");
  const bairro = sel ? sel.value : "";
  if (bairro && bairro !== SEM_LISTA) {
    const cidade = $("[data-cidade]").value;
    let v = (LOJA.entrega.cidades[cidade] || {})[bairro];
    /* bairro na divisa: procura também na outra cidade */
    if (typeof v !== "number")
      for (const c of Object.values(LOJA.entrega.cidades))
        if (typeof c[bairro] === "number") { v = c[bairro]; break; }
    if (typeof v === "number") return v;      // preço combinado com o dono
  }
  const porKm = taxaPorKm(distanciaKm);       // qualquer outro endereço
  if (porKm !== null) return porKm;
  return LOJA.entrega.foraDaLista;
}

function bairroEscolhido() {
  const sel = $("[data-bairro]");
  if (!sel) return "";
  if (sel.value === SEM_LISTA) {
    const campo = document.querySelector("[name=bairroOutro]");
    return campo ? campo.value.trim() : "";
  }
  return sel.value;
}

function tipoEscolhido() {
  const m = document.querySelector("[name=tipo]:checked");
  return m && m.value === "Entrega" ? "Entrega" : "Retirada";
}

function atualizarTaxa() {
  const entrega = tipoEscolhido() === "Entrega";
  const taxa = taxaEntrega();
  const linhaTaxa  = $("[data-linha-taxa]");
  const linhaGeral = $("[data-linha-geral]");
  const pendente   = $("[data-pendente]");
  const aviso      = $("[data-aviso-entrega]");
  if (!linhaTaxa) return;

  linhaTaxa.hidden  = !entrega;
  linhaGeral.hidden = !entrega;
  if (pendente) pendente.hidden = !(entrega && taxa === null);

  if (!entrega) { atualizarTotais(); return; }

  const foraDoRaio = taxa === "fora";
  const valor = (typeof taxa === "number") ? taxa : null;

  $("[data-taxa-valor]").textContent =
    foraDoRaio ? "fora da área" : valor === null ? "a combinar" : reais(valor);
  $("[data-total-geral]").textContent = reais(subtotal() + (valor || 0));
  if (pendente) pendente.hidden = !(entrega && valor === null && !foraDoRaio);

  if (aviso) {
    if (foraDoRaio) {
      aviso.hidden = false;
      aviso.textContent = `Esse endereço fica a cerca de ${distanciaKm.toFixed(1)} km da loja, ` +
        `acima do raio de ${LOJA.entrega.porDistancia.maxKm} km que atendemos. ` +
        `Mande o pedido assim mesmo se quiser — a loja confirma pelo WhatsApp.`;
    } else if (valor !== null && distanciaKm !== null &&
               !(LOJA.entrega.cidades[$("[data-cidade]").value] || {})[$("[data-bairro]").value]) {
      aviso.hidden = false;
      aviso.textContent = `Taxa calculada pela distância: cerca de ${distanciaKm.toFixed(1)} km até a loja.`;
    } else {
      aviso.hidden = true;
    }
  }
  atualizarTotais();
}

/* o rodapé do carrinho também precisa refletir a taxa */
function atualizarTotais() {
  const entrega = tipoEscolhido() === "Entrega";
  const t = entrega ? taxaEntrega() : 0;
  const taxa = (typeof t === "number") ? t : 0;
  const flut = $("[data-total-flutuante]");
  if (flut) flut.textContent = reais(subtotal() + taxa);
}

function enviarPedido(e) {
  e.preventDefault();
  const f = e.target;
  const st = $("[data-status]");
  const erro = (campo, msg) => {
    st.textContent = msg; st.dataset.erro = "true";
    if (campo) { campo.setAttribute("aria-invalid", "true"); campo.focus(); campo.scrollIntoView({ block: "center", behavior: "smooth" }); }
    return false;
  };
  $$("input,select", f).forEach(c => c.removeAttribute("aria-invalid"));

  if (!carrinho.length) return erro(null, "Adicione pelo menos um item do cardápio.");
  if (!f.nome.value.trim()) return erro(f.nome, "Diga seu nome para a gente te chamar.");
  if (soDigitos(f.fone.value).length < 10) return erro(f.fone, "Confira o número do WhatsApp com DDD.");

  const modo = f.tipo.value;
  if (!lojaAbertaAgora().aberto) {
    travarEnvio();
    return avisoStatus(motivoFechado());
  }
  const tipo = modo;
  if (tipo === "Entrega") {
    if (!f.endereco.value.trim()) return erro(f.endereco, "Diga o nome da rua para entregarmos.");
    if (!f.numero.value.trim())   return erro(f.numero, "Falta o número da casa ou do prédio.");
    if (!bairroEscolhido())       return erro(f.bairro, "Escolha o bairro da entrega.");
  }

  const linhas = carrinho.map(l => {
    const partes = [`• ${l.q}x ${l.n} — ${reais(l.unit * l.q)}`];
    if (l.escolhas.length) partes.push(`   Lanches: ${l.escolhas.join(", ")}`);
    if (l.adds.length) partes.push(`   Adicionais: ${l.adds.map(a => a.n).join(", ")}`);
    if (l.obs) partes.push(`   Obs: ${l.obs}`);
    return partes.join("\n");
  });

  const taxaBruta = tipo === "Entrega" ? taxaEntrega() : 0;
  const taxa = (typeof taxaBruta === "number") ? taxaBruta : null;
  const enderecoCheio = [
    `${f.endereco.value.trim()}, ${f.numero.value.trim()}`,
    f.complemento.value.trim(),
    `${bairroEscolhido()} — ${$("[data-cidade]").value}`
  ].filter(Boolean).join(" — ");

  const msg = [
    `*PEDIDO — ${LOJA.nome}*`,
    "",
    ...linhas,
    "",
    `*Subtotal: ${reais(subtotal())}*`,
    tipo === "Entrega" ? `*Taxa de entrega: ${taxa === null ? "a combinar" : reais(taxa)}*` : "",
    tipo === "Entrega" && taxa !== null ? `*Total: ${reais(subtotal() + taxa)}*` : "",
    "",
    `*Cliente:* ${f.nome.value.trim()}`,
    `*WhatsApp:* ${formatarFone(f.fone.value)}`,
    `*Como receber:* ${tipo}`,
    tipo === "Entrega" ? `*Endereço:* ${enderecoCheio}` : "",
    `*Pagamento:* ${f.pagamento.value}${f.pagamento.value === "Dinheiro" && f.troco.value.trim() ? ` (troco para ${f.troco.value.trim()})` : ""}`,
    f.obs.value.trim() ? `*Observações:* ${f.obs.value.trim()}` : "",
    "",
    "_Pedido enviado pelo site._"
  ].filter(l => l !== "").join("\n");

  const texto = LOJA.linkComanda
    ? msg + "\n🖨️ Comanda: " + location.href.replace(/[^/]*$/, "") + "comanda.html#p=" + paraLink(msg)
    : msg;

  /* manda uma cópia para o painel da loja (painel.html), que apita
     no balcão e imprime. Se falhar, o WhatsApp abaixo segue normal. */
  if (window.enviarParaPainel) {
    window.enviarParaPainel({
      texto: msg,
      cliente: f.nome.value.trim(),
      fone: formatarFone(f.fone.value),
      tipo,
      endereco: tipo === "Entrega" ? enderecoCheio : "",
      pagamento: f.pagamento.value + (f.pagamento.value === "Dinheiro" && f.troco.value.trim() ? ` (troco para ${f.troco.value.trim()})` : ""),
      total: subtotal() + (taxa || 0),
      taxa: taxa || 0,
      itens: carrinho.reduce((s, l) => s + l.q, 0)
    });
  }

  st.dataset.erro = "false";
  st.textContent = "Abrindo o WhatsApp com seu pedido…";
  window.open(`https://wa.me/${LOJA.whatsapp}?text=${encodeURIComponent(texto)}`, "_blank", "noopener");

  /* confirmação na própria tela, para o cliente não ficar sem resposta
     caso o WhatsApp demore a abrir ou o navegador bloqueie a janela */
  mostrarConfirmacao(f.nome.value.trim());
  esvaziarDepoisDoEnvio();
}

function mostrarConfirmacao(nome) {
  const caixa = document.createElement("div");
  caixa.className = "confirmado";
  caixa.innerHTML = `
    <div class="confirmado-cartao" role="dialog" aria-live="polite">
      <div class="confirmado-selo">✓</div>
      <h3>Pedido enviado${nome ? ", " + nome.split(" ")[0] : ""}!</h3>
      <p>Seu pedido já chegou no balcão do <strong>${LOJA.nome}</strong>.
         Em instantes a gente confirma por WhatsApp com o tempo de preparo.</p>
      <p class="confirmado-dica">Não abriu o WhatsApp? Toque no botão abaixo.</p>
      <a class="confirmado-btn" href="https://wa.me/${LOJA.whatsapp}" target="_blank" rel="noopener">Abrir o WhatsApp da loja</a>
      <button type="button" class="confirmado-fechar">Fechar</button>
    </div>`;
  document.body.appendChild(caixa);
  const sair = () => caixa.remove();
  caixa.querySelector(".confirmado-fechar").addEventListener("click", sair);
  caixa.addEventListener("click", e => { if (e.target === caixa) sair(); });
}

function avisoStatus(msg) {
  const st = $("[data-status]");
  if (st) { st.textContent = msg; st.dataset.erro = "true"; }
  return false;
}

/* ========================= status aberto / fechado =========================
   O horário manda, mas a loja pode abrir ou fechar na mão pelo painel.
   O estado é lido do servidor; se não der, vale o horário. */
let lojaNoManual = null;   // true = aberta na mão, false = fechada na mão

/* está aberta agora? o botão do painel manda; sem ele, vale o horário */
function lojaAbertaAgora() {
  const agora = new Date();
  const h = agora.getHours() + agora.getMinutes() / 60;
  const fechadoHoje = LOJA.diasFechados.includes(agora.getDay());
  const peloHorario = !fechadoHoje && (h >= LOJA.abre && h < LOJA.fecha);
  return {
    aberto: lojaNoManual === null ? peloHorario : lojaNoManual,
    fechadoHoje,
    naMao: lojaNoManual === false
  };
}

/* por que não dá para pedir agora, em uma frase curta e sem travessão */
function motivoFechado() {
  const e = lojaAbertaAgora();
  if (e.naMao) return "A loja está fechada no momento. Volte mais tarde.";
  if (e.fechadoHoje) return "Hoje a loja não abre. Voltamos terça às 18h.";
  return `Estamos fechados agora. Abrimos às ${LOJA.abre}h.`;
}

/* liga e desliga o botão de enviar conforme a loja */
function travarEnvio() {
  const botao = $("[data-enviar]");
  if (!botao) return;
  const { aberto } = lojaAbertaAgora();
  botao.disabled = !aberto;
  botao.dataset.fechado = String(!aberto);
  botao.textContent = aberto ? "Enviar pedido no WhatsApp" : motivoFechado();
}

function statusLoja() {
  const selo = $("[data-status-selo]");
  const txt = $("[data-status-texto]");
  const agora = new Date();
  const h = agora.getHours() + agora.getMinutes() / 60;
  const fechadoHoje = LOJA.diasFechados.includes(agora.getDay());
  const peloHorario = !fechadoHoje && (h >= LOJA.abre && h < LOJA.fecha);
  const aberto = lojaNoManual === null ? peloHorario : lojaNoManual;
  travarEnvio();

  selo.dataset.aberto = String(aberto);
  txt.textContent = aberto
    ? "Aberto agora"
    : lojaNoManual === false ? "Fechado no momento"
    : fechadoHoje ? "Fechado hoje. Abre terça às 18h"
    : `Fechado. Abre às ${LOJA.abre}h`;
}

/* ---- ajustes do cardápio feitos pelo dono no painel ----
   Preço, esgotado, nome, descrição e foto. Vêm por cima do cardápio do
   arquivo; se o servidor falhar, o arquivo continua valendo. */
async function lerCardapioAjustado() {
  const url = "https://firestore.googleapis.com/v1/projects/rei-burgao-pedidos/databases/(default)/documents/publico/cardapio";
  try {
    const r = await fetch(url, { cache: "no-store" });
    if (!r.ok) return;
    const d = await r.json();
    const itens = d && d.fields && d.fields.itens && d.fields.itens.mapValue;
    if (!itens || !itens.fields) return;

    let mudou = false;
    Object.keys(itens.fields).forEach(id => {
      const campos = (itens.fields[id].mapValue || {}).fields || {};
      const alvo = CARDAPIO.find(x => x.id === id);
      if (!alvo) return;
      if (campos.p && campos.p.doubleValue != null) { alvo.p = Number(campos.p.doubleValue); mudou = true; }
      if (campos.p && campos.p.integerValue != null) { alvo.p = Number(campos.p.integerValue); mudou = true; }
      if (campos.n && campos.n.stringValue) { alvo.n = campos.n.stringValue; mudou = true; }
      if (campos.d && campos.d.stringValue != null) { alvo.d = campos.d.stringValue; mudou = true; }
      if (campos.f && campos.f.stringValue) { alvo.f = campos.f.stringValue; mudou = true; }
      if (campos.foto && campos.foto.stringValue) { alvo.foto = campos.foto.stringValue; mudou = true; }
      alvo.off = !!(campos.off && campos.off.booleanValue);
      if (alvo.off) mudou = true;
    });

    guardarNoAparelho("cardapio", itens.fields);
    if (mudou && typeof montarCardapio === "function") montarCardapio();
  } catch (e) {
    /* servidor fora: usa a última versão boa guardada no aparelho, e na
       falta dela os preços do arquivo. O cardápio nunca some. */
    const guardado = lerDoAparelho("cardapio", 24 * 60 * 60 * 1000);
    if (!guardado) return;
    let mudou = false;
    Object.keys(guardado).forEach(id => {
      const campos = (guardado[id].mapValue || {}).fields || {};
      const alvo = CARDAPIO.find(x => x.id === id);
      if (!alvo) return;
      if (campos.p && campos.p.doubleValue != null) { alvo.p = Number(campos.p.doubleValue); mudou = true; }
      if (campos.n && campos.n.stringValue) { alvo.n = campos.n.stringValue; mudou = true; }
      if (campos.foto && campos.foto.stringValue) { alvo.foto = campos.foto.stringValue; mudou = true; }
      alvo.off = !!(campos.off && campos.off.booleanValue);
      if (alvo.off) mudou = true;
    });
    if (mudou && typeof montarCardapio === "function") montarCardapio();
  }
}

/* lê o interruptor da loja no servidor (leitura pública, sem biblioteca) */
/* guarda a última resposta boa do servidor, para o site continuar certo
   mesmo se o servidor ficar fora do ar na próxima consulta */
function guardarNoAparelho(chave, valor) {
  try { localStorage.setItem("reiburgao:" + chave, JSON.stringify({ v: valor, em: Date.now() })); } catch (e) {}
}
function lerDoAparelho(chave, validadeMs) {
  try {
    const g = JSON.parse(localStorage.getItem("reiburgao:" + chave) || "null");
    if (g && Date.now() - g.em < validadeMs) return g.v;
  } catch (e) {}
  return null;
}

async function lerEstadoLoja() {
  const url = "https://firestore.googleapis.com/v1/projects/rei-burgao-pedidos/databases/(default)/documents/publico/loja";
  try {
    const r = await fetch(url, { cache: "no-store" });
    if (!r.ok) return;
    const d = await r.json();
    const v = d && d.fields && d.fields.aberta;
    const dia = d && d.fields && d.fields.dia && d.fields.dia.stringValue;
    const ag = new Date();
    const hojeTxt = ag.getFullYear() + "-" + String(ag.getMonth() + 1).padStart(2, "0") +
      "-" + String(ag.getDate()).padStart(2, "0");
    /* O botão do painel só FECHA antes da hora, e vale só no dia em que foi
       usado. Nunca força a loja a ficar aberta fora do horário: senão um
       esquecimento deixaria o site aceitando pedido de madrugada. */
    lojaNoManual = (dia === hojeTxt && v && v.booleanValue === false) ? false : null;
    guardarNoAparelho("loja", { fechada: lojaNoManual === false, dia: hojeTxt });
    travarEnvio();
  } catch (e) {
    /* servidor fora do ar: vale a última resposta boa de hoje, e na falta
       dela o horário normal. O site nunca fica quebrado por causa disso. */
    const ag = new Date();
    const hojeTxt = ag.getFullYear() + "-" + String(ag.getMonth() + 1).padStart(2, "0") +
      "-" + String(ag.getDate()).padStart(2, "0");
    const guardado = lerDoAparelho("loja", 12 * 60 * 60 * 1000);
    lojaNoManual = (guardado && guardado.dia === hojeTxt && guardado.fechada) ? false : null;
    travarEnvio();
  }
  statusLoja();
}

/* ========================= efeitos ========================= */
function efeitos() {
  const topo = $("[data-topo]");
  const barra = $(".barra-progresso i");
  const onScroll = () => {
    topo.dataset.fixo = String(window.scrollY > 24);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    barra.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + "%";
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const io = new IntersectionObserver(es => {
    es.forEach(en => { if (en.isIntersecting) { en.target.classList.add("visivel"); io.unobserve(en.target); } });
  }, { threshold: .12, rootMargin: "0px 0px -8% 0px" });
  $$("[data-surge]").forEach(el => io.observe(el));
}

/* ========================= ligação ========================= */
document.addEventListener("DOMContentLoaded", () => {
  montarCardapio();
  pintarCarrinho();
  statusLoja();
  lerEstadoLoja();
  lerCardapioAjustado();
  setInterval(statusLoja, 60000);   // só relógio, não consulta nada

  /* As consultas ao servidor só acontecem com a aba à vista. Aba esquecida
     aberta a noite toda não fica consumindo a cota do plano gratuito, que é
     o que poderia derrubar o sistema num dia de movimento. */
  const consultarServidor = () => {
    if (document.visibilityState !== "visible") return;
    lerEstadoLoja();
    lerCardapioAjustado();
  };
  setInterval(consultarServidor, 300000);        // 5 minutos
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") consultarServidor();
  });
  efeitos();

  $$("[data-abrir-carrinho]").forEach(b => b.addEventListener("click", () => abrirCarrinho(true)));
  $("[data-fechar-carrinho]").addEventListener("click", () => abrirCarrinho(false));
  $("[data-veu]").addEventListener("click", () => abrirCarrinho(false));

  montarCombos();
  $("[data-vitrine-combos]").addEventListener("click", e => {
    const b = e.target.closest("[data-item]");
    if (b) abrirModal(b.dataset.item);
  });

  $("[data-itens]").addEventListener("click", e => {
    const mais = e.target.closest("[data-mais]"), menos = e.target.closest("[data-menos]"), rem = e.target.closest("[data-remover]");
    if (mais) carrinho[+mais.dataset.mais].q++;
    else if (menos) { const i = +menos.dataset.menos; if (--carrinho[i].q <= 0) carrinho.splice(i, 1); }
    else if (rem) carrinho.splice(+rem.dataset.remover, 1);
    else return;
    salvar(); pintarCarrinho();
  });

  $("[data-fechar-modal]").addEventListener("click", fecharModal);
  $("[data-modal]").addEventListener("click", e => { if (e.target === $("[data-modal]")) fecharModal(); });
  $$("[data-qtd]").forEach(b => b.addEventListener("click", () => {
    qtdAtual = Math.max(1, Math.min(30, qtdAtual + Number(b.dataset.qtd)));
    atualizarModal();
  }));
  $("[data-modal-add]").addEventListener("click", adicionarDoModal);
  $("[data-modal-extras]").addEventListener("change", atualizarModal);

  document.addEventListener("keydown", e => {
    if (e.key !== "Escape") return;
    if (!$("[data-modal]").hidden) fecharModal();
    else abrirCarrinho(false);
  });

  const form = $("[data-checkout]");
  form.addEventListener("submit", enviarPedido);
  form.fone.addEventListener("input", e => { e.target.value = formatarFone(e.target.value); });
  const campos = $("[data-campos-entrega]"), troco = $("[data-campo-troco]");
  $$('input[name="tipo"]', form).forEach(r => r.addEventListener("change", () => {
    const modo = form.tipo.value;                    // Entrega | Retirada no balcão | No restaurante
    const entrega = modo === "Entrega";
    const mesa = modo === "No restaurante";
    campos.hidden = !entrega;
    $("[data-caixa-retirada]").hidden = entrega || mesa;
    $("[data-caixa-mesa]").hidden = !mesa;
    $(".aviso-taxa").hidden = !entrega;
    const opcCartao = [...form.pagamento.options].find(o => o.value.startsWith("Cartão"));
    if (opcCartao) {
      opcCartao.value = opcCartao.textContent =
        entrega ? "Cartão na entrega" : "Cartão";
    }
    atualizarTaxa();
  }));
  document.querySelector("[name=bairroOutro]").addEventListener("input", atualizarTaxa);
  document.querySelector("[name=endereco]").addEventListener("input", () => { pedirBairro(); pedirDistancia(); });
  document.querySelector("[name=numero]").addEventListener("input", pedirDistancia);
  const campoCep = document.querySelector("[name=cep]");
  campoCep.addEventListener("input", e => {
    e.target.value = formatarCep(e.target.value);
    if (soDigitos(e.target.value).length === 8) buscarCep();
  });
  montarEntrega();
  const prep = $("[data-preparo]");
  if (prep && LOJA.preparo) {
    prep.hidden = false;
    prep.textContent = `⏱️ Fica pronto em cerca de ${LOJA.preparo}`;
  }
  form.pagamento.addEventListener("change", () => { troco.hidden = form.pagamento.value !== "Dinheiro"; });
});
