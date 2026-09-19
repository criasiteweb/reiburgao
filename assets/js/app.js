/* =========================================================
   Rei Burgão — cardápio digital + carrinho + WhatsApp
   Criasiteweb
   ---------------------------------------------------------
   PARA EDITAR: o bloco LOJA abaixo tem tudo que muda.
   Preços e itens vêm do cardápio oficial da lanchonete.
   ========================================================= */

const LOJA = {
  nome: "Rei Burgão",
  /* ⚠️ MODO TESTE — este é o WhatsApp do Matheus (Criasiteweb), para os
     pedidos de teste NÃO caírem no celular do dono da lanchonete.
     ANTES DE ENTREGAR, trocar de volta para: "5511976385099"  */
  whatsapp: "5511988097416",   // TESTE — número real da loja: 5511976385099
  endereco: "R. Eunice Cerqueira Innocencio, 245 — Jd. Quaresmeira, Suzano/SP",
  abre: 18,                            // hora de abertura (Google)
  fecha: 23,                           // [CONFIRMAR] horário de fechamento
  diasFechados: [],                    // [CONFIRMAR] ex.: [1] fecha segunda (0=dom)

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
    raioKm: 10,                        // [CONFIRMAR com o dono]
    cidades: {
      "Suzano": {                      // [CONFIRMAR] bairros e valores
        "Jardim Quaresmeira": 3,      // informado pelo Matheus — [CONFIRMAR com o dono]
        "Vila Amorim": null,
        "Centro": null,
        "Jardim Imperador": null,
        "Cidade Miguel Badra": null,
        "Parque Maria Helena": null,
        "Vila Urupês": null,
        "Jardim Revista": null,
        "Boa Vista": null,
        "Casa Branca": null
      },
      "Poá": {
        "Centro": null,
        "Vila Varela": null,
        "Jardim Nova Poá": null,
        "Cidade Kemel": null,
        "Vila Perracini": null
      },
      "Mogi das Cruzes": {
        "Centro": null,
        "Braz Cubas": null,
        "Jundiapeba": null,
        "César de Souza": null,
        "Vila Suíssa": null
      }
    },
    /* quando o cliente diz que o bairro dele não está na lista */
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
const ADD_LANCHE = [
  { n: "Ovo", p: 2.0 },
  { n: "Salada", p: 2.0 },
  { n: "Aneis de cebola", p: 5.0 },
  { n: "Bacon", p: 6.0 },
  { n: "Queijo ou cheddar", p: 6.0 },
  { n: "Hambúrguer extra", p: 9.0 }
];
const ADD_DOG = [
  { n: "Queijo", p: 4.0 },
  { n: "Bacon", p: 4.0 },
  { n: "Calabresa", p: 4.0 }
];
const OPC_COMBO = ["Burguer", "Cheddar", "Salada"];

/* ---- grupos do cardápio ---- */
const GRUPOS = [
  { id: "artesanais",  rotulo: "Artesanais",   titulo: "Hambúrgueres artesanais", nota: "Hambúrguer 150g no pão de brioche GG. Todos acompanham fritas." },
  { id: "tradicionais",rotulo: "Tradicionais", titulo: "Hambúrgueres tradicionais", nota: "Pão de hambúrguer GG com 2 hambúrgueres de 56g e maionese temperada." },
  { id: "hotdog",      rotulo: "Hot Dog",      titulo: "Hot dog", nota: "Adicione queijo, bacon ou calabresa por R$ 4,00 cada." },
  { id: "combos",      rotulo: "Combos",       titulo: "Combo na caixa", nota: "Acompanha fritas, nuggets, anel de cebola, molho e refrigerante. Você escolhe cada lanche." },
  { id: "porcoes",     rotulo: "Porções",      titulo: "Porções", nota: "" },
  { id: "bebidas",     rotulo: "Bebidas",      titulo: "Bebidas", nota: "" }
];

/* ---- itens ---- */
const CARDAPIO = [
  /* ARTESANAIS */
  { id:"a1", g:"artesanais", n:"Rei Burguer + Fritas", d:"Pão de brioche GG, maionese temperada, hambúrguer 150g, queijo mussarela e fritas.", p:22.90, add:"lanche", tag:"Mais pedido" , f:"rei-burguer" },
  { id:"a2", g:"artesanais", n:"Rei Salada + Fritas", d:"Pão de brioche GG, maionese temperada, hambúrguer 150g, queijo mussarela, alface, tomate e fritas.", p:24.90, add:"lanche" , f:"rei-salada" },
  { id:"a3", g:"artesanais", n:"Rei Egg + Fritas", d:"Pão de brioche GG, maionese temperada, hambúrguer 150g, queijo mussarela, ovo e fritas.", p:25.90, add:"lanche" , f:"rei-egg" },
  { id:"a4", g:"artesanais", n:"Rei Cheddar + Fritas", d:"Pão de brioche GG, maionese temperada, hambúrguer 150g, queijo mussarela, cheddar e fritas.", p:25.90, add:"lanche" , f:"rei-cheddar" },
  { id:"a5", g:"artesanais", n:"Rei Bacon + Fritas", d:"Pão de brioche GG, maionese temperada, hambúrguer 150g, queijo mussarela, bacon e fritas.", p:28.90, add:"lanche" , f:"rei-bacon" },
  { id:"a6", g:"artesanais", n:"Rei Frango Salada + Fritas", d:"Pão de brioche GG, maionese temperada, frango, queijo mussarela, alface, tomate e fritas.", p:27.90, add:"lanche" , f:"frango-salada" },
  { id:"a7", g:"artesanais", n:"Rei Frango Cheddar + Fritas", d:"Pão de brioche GG, maionese temperada, frango, queijo mussarela, cheddar e fritas.", p:28.90, add:"lanche" , f:"frango-cheddar" },
  { id:"a8", g:"artesanais", n:"Rei Frango Egg + Fritas", d:"Pão de brioche GG, maionese temperada, frango, queijo mussarela, ovo e fritas.", p:29.90, add:"lanche" , f:"frango-egg" },
  { id:"a9", g:"artesanais", n:"Rei Frango Bacon + Fritas", d:"Pão de brioche GG, maionese temperada, frango, queijo mussarela, bacon e fritas.", p:33.90, add:"lanche" , f:"frango-bacon" },
  { id:"a10",g:"artesanais", n:"Mega Rei + Fritas", d:"Pão de brioche GG, maionese temperada, hambúrguer 200g, bacon, ovo, cebola empanada, queijo mussarela e cheddar, alface, tomate e fritas.", p:34.90, add:"lanche", tag:"O maior" , f:"mega-rei" },

  /* TRADICIONAIS */
  { id:"t1", g:"tradicionais", n:"X Burguer", d:"Pão de hambúrguer GG, maionese temperada, 2 hambúrgueres 56g e queijo.", p:14.90, add:"lanche" , f:"x-burguer" },
  { id:"t2", g:"tradicionais", n:"X Salada", d:"Pão de hambúrguer GG, maionese temperada, 2 hambúrgueres 56g, queijo e salada.", p:16.90, add:"lanche" , f:"x-salada" },
  { id:"t3", g:"tradicionais", n:"X Egg", d:"Pão de hambúrguer GG, maionese temperada, 2 hambúrgueres 56g, queijo e ovo.", p:16.90, add:"lanche" , f:"x-egg" },
  { id:"t4", g:"tradicionais", n:"X Cheddar", d:"Pão de hambúrguer GG, maionese temperada, 2 hambúrgueres 56g, queijo e cheddar.", p:16.90, add:"lanche" , f:"x-cheddar" },
  { id:"t5", g:"tradicionais", n:"X Bacon", d:"Pão de hambúrguer GG, maionese temperada, 2 hambúrgueres 56g, queijo e bacon.", p:19.90, add:"lanche" , f:"x-bacon" },
  { id:"t6", g:"tradicionais", n:"X Egg Bacon", d:"Pão de hambúrguer GG, maionese temperada, 2 hambúrgueres 56g, queijo, ovo e bacon.", p:21.90, add:"lanche" , f:"x-egg-bacon" },

  /* HOT DOG */
  { id:"h1", g:"hotdog", n:"Hot Dog Tradicional", d:"Pão de hot dog, maionese temperada, catchup, 1 salsicha, milho, cheddar, purê e batata palha.", p:9.90, add:"dog" , f:"hotdog" },
  { id:"h2", g:"hotdog", n:"Dogão Tradicional", d:"Pão de dogão, maionese temperada, catchup, 2 salsichas, milho, purê, cheddar e batata palha.", p:14.90, add:"dog" , f:"hotdog" },

  /* COMBOS */
  { id:"c1", g:"combos", n:"Combo Tradicional — 2 lanches", d:"Hambúrguer 56g tradicional. Acompanha fritas, nuggets, anel de cebola, molho e refrigerante.", p:64.90, escolhas:2 , f:"combo-1" },
  { id:"c2", g:"combos", n:"Combo Tradicional — 3 lanches", d:"Hambúrguer 56g tradicional. Acompanha fritas, nuggets, anel de cebola, molho e refrigerante.", p:79.90, escolhas:3 , f:"combo-2" },
  { id:"c3", g:"combos", n:"Combo Tradicional — 4 lanches", d:"Hambúrguer 56g tradicional. Acompanha fritas, nuggets, anel de cebola, molho e refrigerante.", p:99.90, escolhas:4 , f:"combo-3" },
  { id:"c4", g:"combos", n:"Combo Tradicional — 5 lanches", d:"Hambúrguer 56g tradicional. Acompanha fritas, nuggets, anel de cebola, molho e refrigerante.", p:109.90, escolhas:5 , f:"combo-4" },
  { id:"c5", g:"combos", n:"Combo Artesanal — 2 lanches", d:"Hambúrguer artesanal 150g. Acompanha fritas, nuggets, anel de cebola, molho e refrigerante.", p:79.90, escolhas:2, tag:"Família" , f:"combo-5" },
  { id:"c6", g:"combos", n:"Combo Artesanal — 3 lanches", d:"Hambúrguer artesanal 150g. Acompanha fritas, nuggets, anel de cebola, molho e refrigerante.", p:99.90, escolhas:3 , f:"combo-6" },
  { id:"c7", g:"combos", n:"Combo Artesanal — 4 lanches", d:"Hambúrguer artesanal 150g. Acompanha fritas, nuggets, anel de cebola, molho e refrigerante.", p:119.90, escolhas:4 , f:"combo-7" },
  { id:"c8", g:"combos", n:"Combo Artesanal — 5 lanches", d:"Hambúrguer artesanal 150g. Acompanha fritas, nuggets, anel de cebola, molho e refrigerante.", p:149.90, escolhas:5 , f:"combo-8" },

  /* PORÇÕES */
  { id:"p1", g:"porcoes", n:"Fritas Simples P (200g)", d:"Sal, maionese e catchup (opcional).", p:12.90 , f:"fritas" },
  { id:"p2", g:"porcoes", n:"Fritas Simples M (350g)", d:"Sal, maionese e catchup (opcional).", p:17.90 , f:"fritas" },
  { id:"p3", g:"porcoes", n:"Fritas Simples G (600g)", d:"Sal, maionese e catchup (opcional).", p:23.90 , f:"fritas" },
  { id:"p4", g:"porcoes", n:"Fritas Completa P (250g)", d:"Sal, maionese, catchup, bacon e cheddar.", p:16.90 , f:"fritas-completa" },
  { id:"p5", g:"porcoes", n:"Fritas Completa M (400g)", d:"Sal, maionese, catchup, bacon e cheddar.", p:21.90 , f:"fritas-completa" },
  { id:"p6", g:"porcoes", n:"Fritas Completa G (650g)", d:"Sal, maionese, catchup, bacon e cheddar.", p:27.90 , f:"fritas-completa" },
  { id:"p7", g:"porcoes", n:"Nuggets Perdigão — 10 unidades", d:"Empanado crocante.", p:10.90 , f:"nuggets" },
  { id:"p8", g:"porcoes", n:"Nuggets Perdigão — 20 unidades", d:"Empanado crocante.", p:18.90 , f:"nuggets" },
  { id:"p9", g:"porcoes", n:"Nuggets Perdigão — 30 unidades", d:"Empanado crocante.", p:27.90 , f:"nuggets" },
  { id:"p10",g:"porcoes", n:"Cebola Empanada — 10 unidades", d:"Aneis empanados na hora.", p:13.90 , f:"cebola" },
  { id:"p11",g:"porcoes", n:"Cebola Empanada — 20 unidades", d:"Aneis empanados na hora.", p:23.90 , f:"cebola" },
  { id:"p12",g:"porcoes", n:"Cebola Empanada — 30 unidades", d:"Aneis empanados na hora.", p:32.90 , f:"cebola" },

  /* BEBIDAS */
  { id:"b1", g:"bebidas", n:"Coca-Cola 2,5 litros", d:"", p:17.90 , f:"coca-25" },
  { id:"b2", g:"bebidas", n:"Coca-Cola 1 litro", d:"", p:11.90 , f:"coca-1l" },
  { id:"b3", g:"bebidas", n:"Sprite 2 litros", d:"", p:15.90 , f:"sprite" },
  { id:"b4", g:"bebidas", n:"Fanta laranja ou uva", d:"", p:15.90 , f:"fanta" },
  { id:"b5", g:"bebidas", n:"Kuat 2 litros", d:"", p:11.90 , f:"kuat" },
  { id:"b6", g:"bebidas", n:"Sukita 2 litros", d:"", p:11.90 , f:"sukita" },
  { id:"b7", g:"bebidas", n:"Pepsi 1,5 litros", d:"", p:11.90 , f:"pet15" },
  { id:"b8", g:"bebidas", n:"Dolly 2 litros", d:"", p:8.90 , f:"dolly" },
  { id:"b9", g:"bebidas", n:"Refrigerante 600 ml", d:"", p:9.90 , f:"refri600" },
  { id:"b10",g:"bebidas", n:"Lata 350 ml", d:"", p:5.90 , f:"lata350" },
  { id:"b11",g:"bebidas", n:"Sufresh lata", d:"", p:5.00 , f:"sufresh" },
  { id:"b12",g:"bebidas", n:"Dollynho", d:"", p:3.50 , f:"dollynho" },
  { id:"b13",g:"bebidas", n:"Suco de caixa 1 litro", d:"", p:9.00 , f:"suco" },
  { id:"b14",g:"bebidas", n:"Heineken 330 ml", d:"", p:11.90 , f:"heineken" },
  { id:"b15",g:"bebidas", n:"Cerveja 269 ml", d:"", p:5.00 , f:"cerveja" }
];

/* ========================= utilidades ========================= */
const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const reais = v => "R$ " + v.toFixed(2).replace(".", ",");
const CHAVE = "reiburgao:carrinho";

let carrinho = [];
try { carrinho = JSON.parse(localStorage.getItem(CHAVE) || "[]"); } catch (e) { carrinho = []; }

/* ========================= cardápio ========================= */
function montarCardapio() {
  const alvo = $("[data-cardapio]");
  const filtros = $("[data-filtros]");

  filtros.innerHTML =
    `<button type="button" role="tab" aria-selected="true" data-f="todos">Tudo</button>` +
    GRUPOS.map(g => `<button type="button" role="tab" aria-selected="false" data-f="${g.id}">${g.rotulo}</button>`).join("");

  alvo.innerHTML = GRUPOS.map(g => {
    const itens = CARDAPIO.filter(i => i.g === g.id);
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
                <img src="assets/img/fotos/${i.f}.jpg" alt="${i.n}" loading="lazy" decoding="async" width="560" height="420" />
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
  mf.src = `assets/img/fotos/${it.f}.jpg`;
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
function salvar() { try { localStorage.setItem(CHAVE, JSON.stringify(carrinho)); } catch (e) {} }

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
function taxaEntrega() {
  if (!LOJA.entrega || !LOJA.entrega.ativa) return null;
  if (tipoEscolhido() !== "Entrega") return 0;
  const bairro = $("[data-bairro]") ? $("[data-bairro]").value : "";
  if (!bairro) return null;
  if (bairro === SEM_LISTA) return LOJA.entrega.foraDaLista;
  const cidade = $("[data-cidade]").value;
  const v = (LOJA.entrega.cidades[cidade] || {})[bairro];
  return (typeof v === "number") ? v : null;
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

  $("[data-taxa-valor]").textContent = taxa === null ? "a combinar" : reais(taxa);
  $("[data-total-geral]").textContent = reais(subtotal() + (taxa || 0));

  if (aviso) {
    const fora = $("[data-bairro]") && $("[data-bairro]").value === SEM_LISTA;
    aviso.hidden = !fora;
    if (fora) aviso.textContent =
      `A loja entrega num raio de cerca de ${LOJA.entrega.raioKm} km. Confirmamos a taxa pelo WhatsApp antes de preparar.`;
  }
  atualizarTotais();
}

/* o rodapé do carrinho também precisa refletir a taxa */
function atualizarTotais() {
  const entrega = tipoEscolhido() === "Entrega";
  const taxa = entrega ? (taxaEntrega() || 0) : 0;
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

  const tipo = f.tipo.value;
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

  const taxa = tipo === "Entrega" ? taxaEntrega() : 0;
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
      itens: carrinho.reduce((s, l) => s + l.q, 0)
    });
  }

  st.dataset.erro = "false";
  st.textContent = "Abrindo o WhatsApp com seu pedido…";
  window.open(`https://wa.me/${LOJA.whatsapp}?text=${encodeURIComponent(texto)}`, "_blank", "noopener");

  /* confirmação na própria tela, para o cliente não ficar sem resposta
     caso o WhatsApp demore a abrir ou o navegador bloqueie a janela */
  mostrarConfirmacao(f.nome.value.trim());
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

/* ========================= status aberto / fechado ========================= */
function statusLoja() {
  const selo = $("[data-status-selo]");
  const txt = $("[data-status-texto]");
  const agora = new Date();
  const h = agora.getHours() + agora.getMinutes() / 60;
  const fechadoHoje = LOJA.diasFechados.includes(agora.getDay());
  const aberto = !fechadoHoje && (h >= LOJA.abre && h < LOJA.fecha);
  selo.dataset.aberto = String(aberto);
  txt.textContent = aberto ? "Aberto agora" : `Fechado · abre às ${LOJA.abre}h`;
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
  setInterval(statusLoja, 60000);
  efeitos();

  $$("[data-abrir-carrinho]").forEach(b => b.addEventListener("click", () => abrirCarrinho(true)));
  $("[data-fechar-carrinho]").addEventListener("click", () => abrirCarrinho(false));
  $("[data-veu]").addEventListener("click", () => abrirCarrinho(false));

  $("[data-ir-combos]").addEventListener("click", () => {
    const b = $('[data-filtros] [data-f="combos"]');
    b.click();
    $("#cardapio").scrollIntoView({ behavior: "smooth", block: "start" });
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
    const entrega = form.tipo.value === "Entrega";
    campos.hidden = !entrega;
    $("[data-caixa-retirada]").hidden = entrega;
    $(".aviso-taxa").hidden = !entrega;
    const opcCartao = [...form.pagamento.options].find(o => o.value.startsWith("Cartão"));
    if (opcCartao) { opcCartao.value = opcCartao.textContent = entrega ? "Cartão na entrega" : "Cartão"; }
    atualizarTaxa();
  }));
  document.querySelector("[name=bairroOutro]").addEventListener("input", atualizarTaxa);
  document.querySelector("[name=endereco]").addEventListener("input", pedirBairro);
  montarEntrega();
  form.pagamento.addEventListener("change", () => { troco.hidden = form.pagamento.value !== "Dinheiro"; });
});
