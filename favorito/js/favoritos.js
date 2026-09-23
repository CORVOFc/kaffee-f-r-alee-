/* 01. Ícones e referências */
lucide.createIcons();

const carrossel = document.getElementById("carrossel");
const anterior = document.getElementById("anterior");
const proximo = document.getElementById("proximo");
const pesquisa = document.getElementById("campo-de-pesquisa");
const formularioPesquisa = document.getElementById("formulario-pesquisa");
const modal = document.getElementById("modal-produto");
const fechar = document.getElementById("fechar-modal");
const toast = document.getElementById("toast");
const contadorFavoritos = document.getElementById(
  "quantidade-total-de-favoritos",
);
const modalPerfil = document.getElementById("modal-perfil");
const formularioPerfil = document.getElementById("formulario-perfil");
const botaoEditarPerfil = document.getElementById("botao-editar-perfil");
const fecharModalPerfil = document.getElementById("fechar-modal-perfil");

/* 02. Usuário demonstrativo para o front-end */
const usuarioSalvo = JSON.parse(localStorage.getItem("usuario") || "null");
const usuario = usuarioSalvo || {
  nome: "Usuário",
  foto: "img/perfil/default.png",
};

const nomeUsuario = usuario.nome || "Usuário";
const fotoUsuario = usuario.foto || "img/perfil/default.png";

document.getElementById("nome-do-usuario-logado").textContent = nomeUsuario;
document.getElementById("imagem-do-usuario").src = fotoUsuario;

/*
  BACK-END:
  Quando o login/Supabase Auth estiver pronto, substituir o usuário
  demonstrativo acima por uma sessão real e descomentar este bloco:

  const usuarioLogado = JSON.parse(
    localStorage.getItem("usuario") || "null",
  );

  if (!usuarioLogado) {
    window.location.href = "login.html";
  }

  const nomeUsuarioLogado = usuarioLogado.nome || usuarioLogado.name;
  const fotoUsuarioLogado =
    usuarioLogado.foto || usuarioLogado.avatar || "img/perfil/default.png";

  document.getElementById("nome-do-usuario-logado").textContent =
    nomeUsuarioLogado;
  document.getElementById("imagem-do-usuario").src = fotoUsuarioLogado;
*/

/* 03. Toast */
let temporizadorToast;

function mostrarToast(mensagem) {
  toast.textContent = mensagem;
  toast.classList.add("visivel");
  clearTimeout(temporizadorToast);
  temporizadorToast = window.setTimeout(() => {
    toast.classList.remove("visivel");
  }, 2400);
}

/* 04. Skeleton loading */
window.setTimeout(() => {
  document.querySelectorAll(".card.carregando").forEach((card) => {
    card.classList.remove("carregando");
  });
}, 450);

/* 05. Carrossel com scroll snap */
proximo.addEventListener("click", () => {
  carrossel.scrollBy({ left: 250, behavior: "smooth" });
});

anterior.addEventListener("click", () => {
  carrossel.scrollBy({ left: -250, behavior: "smooth" });
});

/* 06. Contador e coração com IDs únicos */
function atualizarContadorFavoritos() {
  const total = document.querySelectorAll(".toggle-heart:checked").length;
  contadorFavoritos.textContent = String(total);
}

document.querySelectorAll(".toggle-heart").forEach((coracao) => {
  coracao.addEventListener("change", () => {
    const rotulo = document.querySelector(`label[for="${coracao.id}"]`);
    const produto = coracao.closest(".card")?.querySelector("h3")?.textContent;
    const favoritado = coracao.checked;

    rotulo?.setAttribute(
      "aria-label",
      favoritado
        ? `Remover ${produto} dos favoritos`
        : `Adicionar ${produto} aos favoritos`,
    );
    atualizarContadorFavoritos();
    mostrarToast(
      favoritado
        ? `${produto} adicionado aos favoritos.`
        : `${produto} removido dos favoritos.`,
    );
  });
});

atualizarContadorFavoritos();

/* 07. Pesquisa */
function filtrarProdutos() {
  const valor = pesquisa.value.toLowerCase().trim();

  document.querySelectorAll(".card").forEach((card) => {
    const nome = card.querySelector("h3").textContent.toLowerCase();
    card.hidden = !nome.includes(valor);
  });
}

pesquisa.addEventListener("input", filtrarProdutos);
formularioPesquisa.addEventListener("reset", () => {
  window.setTimeout(() => {
    pesquisa.value = "";
    filtrarProdutos();
  }, 0);
});

/* 08. Cinco categorias visuais */
document.querySelectorAll(".chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    document
      .querySelectorAll(".chip")
      .forEach((item) => item.classList.remove("ativo"));
    chip.classList.add("ativo");

    const categoria = chip.dataset.categoria;
    document.querySelectorAll(".card").forEach((card) => {
      card.hidden =
        categoria !== "todos" && card.dataset.categoria !== categoria;
    });
  });
});

/* 09. Modal com transição visual */
document.querySelectorAll(".ver-detalhes").forEach((botao) => {
  botao.addEventListener("click", () => modal.showModal());
});

fechar.addEventListener("click", () => modal.close());

/* 10. Jornal favorito */
const botaoRemoverJornal = document.getElementById("botao-remover-jornal");
botaoRemoverJornal.addEventListener("click", () => {
  botaoRemoverJornal.classList.add("jornal-removendo");
  botaoRemoverJornal.setAttribute("aria-pressed", "false");
  botaoRemoverJornal.setAttribute(
    "aria-label",
    "Adicionar Gazeta aos jornais favoritos",
  );
  mostrarToast("Jornal removido dos favoritos.");

  window.setTimeout(() => {
    botaoRemoverJornal.closest(".jornal")?.remove();
  }, 260);
});

/* 11. Perfil editável */
botaoEditarPerfil.addEventListener("click", () => {
  const atual = JSON.parse(localStorage.getItem("usuario") || "{}");
  document.getElementById("campo-nome-perfil").value = atual.nome || "";
  document.getElementById("campo-foto-perfil").value = atual.foto || "";
  modalPerfil.showModal();
});

fecharModalPerfil.addEventListener("click", () => modalPerfil.close());
formularioPerfil.addEventListener("submit", (evento) => {
  evento.preventDefault();
  const dados = Object.fromEntries(new FormData(formularioPerfil));
  localStorage.setItem("usuario", JSON.stringify(dados));
  window.location.reload();
});

