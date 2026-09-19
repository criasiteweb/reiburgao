/* =========================================================
   Rei Burgão — ligação com o servidor de pedidos (Firebase)
   Criasiteweb

   Estas chaves são públicas por natureza: elas apenas dizem
   ao navegador QUAL projeto procurar. Quem protege os dados
   são as regras do servidor, que só deixam a conta da loja
   ler os pedidos. Qualquer um pode ENVIAR um pedido (é o que
   o cliente faz no site), mas ninguém consegue LER a lista.
   ========================================================= */

export const FIREBASE_CONFIG = {
  apiKey: "AIzaSyATT6OnCb5uvNInvIbsA2BeiOvqt2003jg",
  authDomain: "rei-burgao-pedidos.firebaseapp.com",
  projectId: "rei-burgao-pedidos",
  storageBucket: "rei-burgao-pedidos.firebasestorage.app",
  messagingSenderId: "753598863708",
  appId: "1:753598863708:web:19873cf37107abb98b0999"
};

/* conta usada pelo balcão para entrar no painel */
export const CONTA_LOJA = "loja@reiburgao.com.br";
