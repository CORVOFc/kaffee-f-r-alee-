(function() {
    "use strict";
    console.log("Produtos.js iniciado.");
    function criar(tag, classe, texto) {
        const el = document.createElement(tag);
        if (classe) el.className = classe;
        if (texto !== undefined) el.textContent = texto;
        return el;
    }
    function formatarPreco(v) {
        return Number(v || 0).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
    }
    function imagemOuPadrao(url) {
        if (url && typeof url === "string" && (url.startsWith("http") || url.startsWith("/"))) {
            return url;
        }
        return "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&h=300&fit=crop";
    }
    function pegarAleatorios(array, quantidade) {
        const copia = [ ...array ];
        for (let i = copia.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [copia[i], copia[j]] = [ copia[j], copia[i] ];
        }
        return copia.slice(0, quantidade);
    }
    function criarCardProduto(produto) {
        const card = criar("div", "product-card cream");
        const wrapper = criar("div", "product-image-wrapper");
        const circle = criar("div", "product-image-circle");
        const img = criar("img");
        img.src = imagemOuPadrao(produto.imagem_url);
        img.alt = produto.nome || "Produto";
        circle.appendChild(img);
        wrapper.appendChild(circle);
        const nome = criar("h3", "product-name", produto.nome || "Produto");
        const preco = criar("div", "product-price-badge", formatarPreco(produto.preco));
        card.append(wrapper, nome, preco);
        card.addEventListener("click", () => {
            if (typeof window.abrirModalProduto === "function") {
                window.abrirModalProduto(produto);
            }
        });
        return card;
    }
    function preencherCarrossel(container, lista) {
        container.replaceChildren();
        if (!lista || lista.length === 0) {
            const msg = criar("p", "estado-vazio-carrossel", "Nenhum produto disponível.");
            container.appendChild(msg);
            return;
        }
        lista.forEach(produto => {
            container.appendChild(criarCardProduto(produto));
        });
        const btnVerMais = criar("div", "product-card cream");
        btnVerMais.classList.add("ver-mais-produtos");
        const link = criar("a", "link-ver-mais", "Clique aqui\npara mais produtos");
        link.href = "cardapio.html";
        btnVerMais.appendChild(link);
        container.appendChild(btnVerMais);
    }
    function renderizar(produtos) {
        const carrossel1 = document.getElementById("carrossel-1");
        const carrossel2 = document.getElementById("carrossel-2");
        if (!carrossel1 || !carrossel2) return;
        const destaques = produtos.filter(p => p.destaque === true);
        const base1 = destaques.length >= 3 ? destaques : produtos;
        const base2 = pegarAleatorios(produtos, 10);
        preencherCarrossel(carrossel1, pegarAleatorios(base1, 10));
        preencherCarrossel(carrossel2, base2);
    }
    async function carregar() {
        try {
            if (!window.carregarProdutos) {
                console.warn("carregarProdutos não disponível.");
                return;
            }
            const produtos = await window.carregarProdutos();
            window.produtosGlobal = produtos || [];
            renderizar(window.produtosGlobal);
        } catch (err) {
            console.error("Erro ao carregar produtos:", err);
            renderizar([]);
        }
    }
    document.addEventListener("DOMContentLoaded", () => {
        carregar();
    });
})();
