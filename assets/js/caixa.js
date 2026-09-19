/* =========================================================
   Rei Burgão — Caixa e relatórios
   Criasiteweb

   Trabalha em cima dos mesmos pedidos que o painel já recebe.
   Nada é digitado duas vezes: as vendas vêm dos pedidos,
   e a loja só acrescenta as despesas e fecha o caixa.
   ========================================================= */

/* como classificar a forma de pagamento que veio do site */
const FORMAS = [
  { chave: "dinheiro", rotulo: "Dinheiro", teste: /dinheiro/i,        icone: "💵" },
  { chave: "pix",      rotulo: "Pix",      teste: /pix/i,             icone: "⚡" },
  { chave: "cartao",   rotulo: "Cartão",   teste: /cart[ãa]o|d[ée]bito|cr[ée]dito/i, icone: "💳" }
];

function formaDe(pedido) {
  const t = String(pedido.pagamento || "");
  const achou = FORMAS.find(f => f.teste.test(t));
  return achou ? achou.chave : "outro";
}

/* a taxa do pedido; pedidos antigos não têm o campo, então lê do texto */
function taxaDoRegistro(p) {
  if (typeof p.taxa === "number") return p.taxa;
  const m = String(p.texto || "").match(/Taxa de entrega:\s*R?\$?\s*([\d.,]+)/i);
  return m ? paraNumero(m[1]) : 0;
}

/* =========================================================
   Soma tudo de uma lista de pedidos
   ========================================================= */
function apurar(pedidos) {
  const valem = pedidos.filter(p => p.status !== "recusado");
  const r = {
    quantidade: valem.length,
    recusados: pedidos.length - valem.length,
    bruto: 0,          // tudo que o cliente pagou
    taxas: 0,          // parte do motoboy
    liquido: 0,        // venda da cozinha, sem a taxa
    porForma: { dinheiro: 0, pix: 0, cartao: 0, outro: 0 },
    contagem: { dinheiro: 0, pix: 0, cartao: 0, outro: 0 }
  };
  valem.forEach(p => {
    const total = Number(p.total) || 0;
    const taxa = taxaDoRegistro(p);
    const forma = formaDe(p);
    r.bruto += total;
    r.taxas += taxa;
    r.porForma[forma] += total;
    r.contagem[forma] += 1;
  });
  r.liquido = r.bruto - r.taxas;
  return r;
}

function somaDespesas(lista) {
  return (lista || []).reduce((t, d) => t + (Number(d.valor) || 0), 0);
}
