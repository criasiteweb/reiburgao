/* =========================================================
   Rei Burgão — envio do pedido para o painel da loja
   Criasiteweb

   O site continua abrindo o WhatsApp exatamente como antes.
   Este arquivo só acrescenta uma cópia do pedido no painel,
   para o balcão receber na hora e imprimir.

   Se o envio falhar (internet do cliente caiu, servidor fora),
   NADA trava: o WhatsApp segue normalmente e o pedido chega
   do mesmo jeito. O painel é um ganho, nunca um ponto de falha.
   ========================================================= */

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp }
  from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";
import { FIREBASE_CONFIG } from "./firebase-config.js";

const db = getFirestore(initializeApp(FIREBASE_CONFIG));

/* corta textos muito longos — protege contra abuso e mantém a comanda legível */
const limitar = (s, n) => String(s == null ? "" : s).slice(0, n);

window.enviarParaPainel = async function (dados) {
  try {
    await addDoc(collection(db, "pedidos"), {
      criadoEm: serverTimestamp(),
      status:   "novo",
      impresso: false,
      texto:    limitar(dados.texto, 4000),
      cliente:  limitar(dados.cliente, 80),
      fone:     limitar(dados.fone, 25),
      tipo:     limitar(dados.tipo, 20),
      endereco: limitar(dados.endereco, 200),
      pagamento: limitar(dados.pagamento, 80),
      total:    Number(dados.total) || 0,
      taxa:     Number(dados.taxa) || 0,
      itens:    Number(dados.itens) || 0
    });
    return true;
  } catch (e) {
    console.warn("Pedido não chegou ao painel (o WhatsApp segue normal):", e);
    return false;
  }
};
