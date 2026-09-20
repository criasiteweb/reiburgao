/* =========================================================
   Rei Burgão — Cardápio (dados)
   Criasiteweb

   Fica num arquivo só, usado pelo site do cliente (index.html)
   e pela comanda do balcão dentro do painel (painel.html).
   Mudou o preço aqui, muda nos dois lugares.
   ========================================================= */

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
