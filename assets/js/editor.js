/* =========================================================
   Rei Burgão — edição do cardápio pelo dono (aba "Cardápio")
   Criasiteweb

   O cardápio de verdade continua em cardapio.js. Aqui ficam só os
   AJUSTES do dono — preço, esgotado, nome, descrição e foto —
   guardados no servidor e aplicados por cima no site do cliente.

   Se o servidor falhar, o site usa os valores do arquivo.
   Ninguém fica sem cardápio.
   ========================================================= */

window.ajustes = window.ajustes || {};   // { id: {p, off, n, d, f} }
let edGrupo = "todos";
let edBusca = "";
let edSujo = false;      // tem alteração não salva?

function edEscapa(s) {
  return String(s == null ? "" : s).replace(/[<>&"]/g, c =>
    ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" }[c]));
}

/* o item com os ajustes do dono já aplicados */
function itemAjustado(i) {
  const a = window.ajustes[i.id] || {};
  return {
    p: typeof a.p === "number" ? a.p : i.p,
    n: a.n || i.n,
    d: a.d != null ? a.d : (i.d || ""),
    f: a.f || i.f || "",
    foto: a.foto || "",          // foto trocada pelo dono (fica guardada no servidor)
    off: a.off === true
  };
}

function marcarSujo(sujo) {
  edSujo = sujo;
  const st = document.querySelector("[data-ed-status]");
  if (st) {
    st.textContent = sujo ? "Alterações não salvas" : "";
    st.dataset.sujo = String(sujo);
  }
}

function edMudar(id, campo, valor) {
  window.ajustes[id] = window.ajustes[id] || {};
  const base = (typeof CARDAPIO !== "undefined" ? CARDAPIO : []).find(x => x.id === id) || {};
  /* voltou ao valor original: some o ajuste, para não guardar lixo */
  if (valor === base[campo] || valor === "" || valor === false) delete window.ajustes[id][campo];
  else window.ajustes[id][campo] = valor;
  if (!Object.keys(window.ajustes[id]).length) delete window.ajustes[id];
  marcarSujo(true);
}

function edDesenharGrupos() {
  const alvo = document.querySelector("[data-ed-grupos]");
  if (!alvo) return;
  const lista = [{ id: "todos", rotulo: "Tudo" }].concat(
    (typeof GRUPOS !== "undefined" ? GRUPOS : []).map(g => ({ id: g.id, rotulo: g.rotulo })));
  alvo.innerHTML = lista.map(g =>
    `<button type="button" class="${g.id === edGrupo ? "ativo" : ""}" data-ed-grupo="${g.id}">${g.rotulo}</button>`
  ).join("");
}

function edDesenharLista() {
  const alvo = document.querySelector("[data-ed-lista]");
  if (!alvo) return;
  const todos = typeof CARDAPIO !== "undefined" ? CARDAPIO : [];
  const t = edBusca.trim().toLowerCase();
  const lista = todos.filter(i => {
    const noGrupo = edGrupo === "todos" || i.g === edGrupo;
    const naBusca = !t || semAcento(i.n).toLowerCase().includes(semAcento(t));
    return noGrupo && naBusca;
  });

  alvo.innerHTML = lista.map(i => {
    const v = itemAjustado(i);
    const mudou = !!window.ajustes[i.id];
    return `
    <div class="ed-item ${v.off ? "esgotado" : ""} ${mudou ? "mudou" : ""}" data-ed-id="${i.id}">
      <div class="ed-foto">
        ${v.foto
          ? `<img src="${v.foto}" alt="">`
          : v.f ? `<img src="assets/img/fotos/${edEscapa(v.f)}.jpg" alt="" loading="lazy"
                       onerror="this.replaceWith(Object.assign(document.createElement('span'),{className:'ed-semfoto',textContent:'sem foto'}))">`
                : `<span class="ed-semfoto">sem foto</span>`}
        <label class="ed-trocar-foto" title="Trocar a foto">
          <input type="file" accept="image/*" data-ed-foto hidden />
          <span>trocar</span>
        </label>
      </div>

      <div class="ed-dados">
        <input class="ed-nome" type="text" value="${edEscapa(v.n)}" data-ed-campo="n" placeholder="Nome do item" />
        <textarea class="ed-desc" rows="2" data-ed-campo="d" placeholder="Descrição">${edEscapa(v.d)}</textarea>
      </div>

      <div class="ed-lado">
        <label class="ed-preco">
          <span>Preço</span>
          <input type="text" inputmode="decimal" value="${v.p.toFixed(2).replace(".", ",")}" data-ed-campo="p" />
        </label>
        <button type="button" class="ed-estoque ${v.off ? "fora" : "tem"}" data-ed-estoque>
          ${v.off ? "Esgotado" : "Disponível"}
        </button>
        <button type="button" class="ed-voltar" data-ed-voltar title="Voltar ao original">desfazer</button>
      </div>
    </div>`;
  }).join("") || `<p class="ed-vazio">Nenhum item com esse nome.</p>`;
}

function edDesenhar() { edDesenharGrupos(); edDesenharLista(); }

/* ---------- trocar a foto ----------
   A imagem é reduzida aqui no navegador antes de subir: o dono tira foto com
   o celular (3 MB) e o que vai para o servidor tem cerca de 20 KB. Sem isso,
   estouraria o espaço e o site do cliente ficaria pesado. */
function encolherImagem(arquivo, larguraMax = 460, qualidade = 0.68) {
  return new Promise((ok, falhou) => {
    const leitor = new FileReader();
    leitor.onerror = () => falhou(new Error("não consegui ler o arquivo"));
    leitor.onload = () => {
      const img = new Image();
      img.onerror = () => falhou(new Error("esse arquivo não é uma imagem"));
      img.onload = () => {
        const escala = Math.min(1, larguraMax / img.width);
        const l = Math.round(img.width * escala), a = Math.round(img.height * escala);
        const tela = document.createElement("canvas");
        tela.width = l; tela.height = a;
        tela.getContext("2d").drawImage(img, 0, 0, l, a);
        ok(tela.toDataURL("image/jpeg", qualidade));
      };
      img.src = leitor.result;
    };
    leitor.readAsDataURL(arquivo);
  });
}

/* quanto espaço as fotos já ocupam (o servidor aceita cerca de 1 MB no total) */
function espacoDasFotos() {
  let total = 0;
  Object.keys(window.ajustes || {}).forEach(id => {
    const f = window.ajustes[id].foto;
    if (f) total += f.length;
  });
  return total;
}

document.addEventListener("change", async e => {
  const campo = e.target.closest("[data-ed-foto]");
  if (!campo || !campo.files || !campo.files[0]) return;
  const caixa = campo.closest("[data-ed-id]");
  const id = caixa.dataset.edId;
  const st = document.querySelector("[data-ed-status]");

  try {
    if (st) st.textContent = "Preparando a foto…";
    const pequena = await encolherImagem(campo.files[0]);

    const antes = (window.ajustes[id] || {}).foto || "";
    if (espacoDasFotos() - antes.length + pequena.length > 900000) {
      if (st) st.textContent = "Espaço de fotos cheio. Apague alguma foto trocada antes de pôr outra.";
      campo.value = "";
      return;
    }

    window.ajustes[id] = window.ajustes[id] || {};
    window.ajustes[id].foto = pequena;
    marcarSujo(true);
    edDesenharLista();
    if (st) st.textContent = "Foto trocada. Toque em Salvar alterações.";
  } catch (err) {
    if (st) st.textContent = "Não consegui usar essa imagem. Tente outra.";
  }
  campo.value = "";
});

/* ---------- ligação com a tela ---------- */
document.addEventListener("input", e => {
  const campo = e.target.closest("[data-ed-campo]");
  if (!campo) return;
  const caixa = campo.closest("[data-ed-id]");
  if (!caixa) return;
  const id = caixa.dataset.edId;
  const qual = campo.dataset.edCampo;

  if (qual === "p") {
    const n = paraNumero(campo.value);
    if (n > 0) edMudar(id, "p", n);
  } else if (qual === "n" || qual === "d") {
    edMudar(id, qual, campo.value.trim());
  }
  caixa.classList.toggle("mudou", !!window.ajustes[id]);
});

/* Esgotar um produto é urgente: acontece no meio do movimento, com a cozinha
   cheia. Por isso este botão salva sozinho, sem depender do Salvar. */
document.addEventListener("click", async e => {
  const botao = e.target.closest("[data-ed-estoque]");
  if (!botao) return;
  const caixa = botao.closest("[data-ed-id]");
  const id = caixa.dataset.edId;

  const acabou = !botao.classList.contains("fora");
  window.ajustes[id] = window.ajustes[id] || {};
  if (acabou) window.ajustes[id].off = true; else delete window.ajustes[id].off;
  if (!Object.keys(window.ajustes[id]).length) delete window.ajustes[id];

  botao.classList.toggle("fora", acabou);
  botao.classList.toggle("tem", !acabou);
  botao.textContent = acabou ? "Esgotado" : "Disponível";
  caixa.classList.toggle("esgotado", acabou);
  caixa.classList.toggle("mudou", !!window.ajustes[id]);

  botao.disabled = true;
  const ok = window.salvarCardapio ? await window.salvarCardapio(true) : false;
  botao.disabled = false;

  const st = document.querySelector("[data-ed-status]");
  if (st) {
    st.textContent = ok
      ? (acabou ? "Marcado como esgotado. Já saiu do site." : "De volta ao cardápio do site.")
      : "Não consegui salvar. Verifique a internet.";
    st.dataset.sujo = String(!ok);
    if (ok) setTimeout(() => { if (st.dataset.sujo !== "true") st.textContent = ""; }, 5000);
  }
});

document.addEventListener("click", e => {
  const g = e.target.closest("[data-ed-grupo]");
  if (g) { edGrupo = g.dataset.edGrupo; edDesenhar(); return; }

  const v = e.target.closest("[data-ed-voltar]");
  if (v) {
    const caixa = v.closest("[data-ed-id]");
    delete window.ajustes[caixa.dataset.edId];
    marcarSujo(true);
    edDesenharLista();
    return;
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const b = document.querySelector("[data-ed-busca]");
  if (b) b.addEventListener("input", e => { edBusca = e.target.value; edDesenharLista(); });
});

/* avisa antes de sair com alteração pendente */
window.addEventListener("beforeunload", e => {
  if (edSujo) { e.preventDefault(); e.returnValue = ""; }
});
