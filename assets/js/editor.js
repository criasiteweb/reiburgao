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
        ${v.f ? `<img src="assets/img/fotos/${edEscapa(v.f)}.jpg" alt="" loading="lazy"
                     onerror="this.replaceWith(Object.assign(document.createElement('span'),{className:'ed-semfoto',textContent:'sem foto'}))">`
              : `<span class="ed-semfoto">sem foto</span>`}
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
        <label class="ed-off">
          <input type="checkbox" data-ed-campo="off" ${v.off ? "checked" : ""} />
          <span>Acabou</span>
        </label>
        <button type="button" class="ed-voltar" data-ed-voltar title="Voltar ao original">desfazer</button>
      </div>
    </div>`;
  }).join("") || `<p class="ed-vazio">Nenhum item com esse nome.</p>`;
}

function edDesenhar() { edDesenharGrupos(); edDesenharLista(); }

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

document.addEventListener("change", e => {
  const campo = e.target.closest('[data-ed-campo="off"]');
  if (!campo) return;
  const caixa = campo.closest("[data-ed-id]");
  const id = caixa.dataset.edId;
  window.ajustes[id] = window.ajustes[id] || {};
  if (campo.checked) window.ajustes[id].off = true; else delete window.ajustes[id].off;
  if (!Object.keys(window.ajustes[id]).length) delete window.ajustes[id];
  caixa.classList.toggle("esgotado", campo.checked);
  caixa.classList.toggle("mudou", !!window.ajustes[id]);
  marcarSujo(true);
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
