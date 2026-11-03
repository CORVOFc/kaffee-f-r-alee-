(function() {
    "use strict";
    function urlDoAplicativo(destino) {
        const segmentos = window.location.pathname.split("/").filter(Boolean);
        const pastasDoApp = [ "carrinho", "produtocardapio", "favorito" ];
        const indicePasta = segmentos.findIndex(segmento => pastasDoApp.includes(segmento.toLowerCase()));
        const raiz = indicePasta >= 0 ? segmentos.slice(0, indicePasta) : segmentos.slice(0, -1);
        const prefixo = `/${raiz.length ? `${raiz.join("/")}/` : ""}`;
        return new URL(`${prefixo}${destino}`, window.location.origin).href;
    }
    const modal = document.getElementById("produtoModal");
    const overlay = document.getElementById("modalOverlay");
    const btnFechar = document.getElementById("btnFecharModal");
    const btnAdd = document.getElementById("btnAdd");
    const imgModal = document.getElementById("modalImg");
    const nomeModal = document.getElementById("modalNome");
    const descModal = document.getElementById("modalDesc");
    const precoModal = document.getElementById("modalPreco");
    let produtoAtual = null;
    function imagemOuPadrao(url) {
        if (url && typeof url === "string" && (url.startsWith("http") || url.startsWith("/"))) {
            return url;
        }
        return "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800";
    }
    function formatarPreco(v) {
        return Number(v || 0).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
    }
    window.abrirModalProduto = function(produto) {
        if (!produto) return;
        produtoAtual = produto;
        imgModal.src = imagemOuPadrao(produto.imagem_url);
        imgModal.alt = produto.nome || "Produto";
        nomeModal.textContent = produto.nome || "Produto";
        descModal.textContent = produto.descricao || "Delicioso produto da nossa cafeteria.";
        precoModal.textContent = formatarPreco(produto.preco);
        btnAdd.dataset.produtoId = produto.id || "";
        modal.classList.add("ativo");
        overlay.classList.add("ativo");
    };
    function fecharModal() {
        modal.classList.remove("ativo");
        overlay.classList.remove("ativo");
        produtoAtual = null;
    }
    if (btnFechar) btnFechar.addEventListener("click", fecharModal);
    if (overlay) overlay.addEventListener("click", fecharModal);
    document.addEventListener("keydown", e => {
        if (e.key === "Escape" && modal && modal.classList.contains("ativo")) {
            fecharModal();
        }
    });
    function verificarLoginLocal() {
        return window.__usuarioAtual || null;
    }
    async function obterUsuario() {
        if (window.__usuarioAtual) return window.__usuarioAtual;
        if (typeof window.usuarioAtual === "function") {
            const u = await window.usuarioAtual();
            window.__usuarioAtual = u;
            return u;
        }
        return null;
    }
    async function adicionarAoCarrinho(idProduto) {
        const usuario = await obterUsuario();
        if (!usuario) {
            alert("Você precisa estar logado para adicionar ao carrinho.");
            window.location.href = urlDoAplicativo("login.html");
            return;
        }
        let produto = produtoAtual;
        if (!produto && window.produtosGlobal) {
            produto = window.produtosGlobal.find(p => String(p.id) === String(idProduto));
        }
        if (!produto) {
            alert("Produto não encontrado.");
            return;
        }
        if (!window.carrinhoStore) {
            alert("Carrinho indisponível. Recarregue a página.");
            return;
        }
        window.carrinhoStore.adicionarAoCarrinho(produto, usuario.id);
        alert("Produto adicionado ao carrinho!");
        window.location.href = urlDoAplicativo("Carrinho/carrinho.html");
    }
    if (btnAdd) {
        btnAdd.addEventListener("click", async () => {
            const id = btnAdd.dataset.produtoId;
            if (!id) {
                alert("Selecione um produto.");
                return;
            }
            await adicionarAoCarrinho(id);
        });
    }
})();
