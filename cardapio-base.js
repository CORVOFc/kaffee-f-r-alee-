(function() {
    "use strict";
    const ICONS_BASE = new URL("../assets/icons/", document.currentScript.src);
    const normalizar = valor => String(valor || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const dinheiro = valor => Number(valor || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
    const criar = (tag, classe, texto) => {
        const el = document.createElement(tag);
        if (classe) el.className = classe;
        if (texto !== undefined) el.textContent = texto;
        return el;
    };
    let produtoSelecionado = null;
    const botaoAdicionar = document.querySelector("#btnAdd");
    if (botaoAdicionar) {
        botaoAdicionar.addEventListener("click", () => {
            const produto = produtoSelecionado;
            if (!produto) return;
            const sessao = window.appSessao && window.appSessao();
            if (!sessao) {
                window.location.href = "../login.html";
                return;
            }
            window.carrinhoStore.adicionarAoCarrinho(produto, sessao.user.id);
            window.location.href = "../Carrinho/carrinho.html";
        });
    }
    const pagina = normalizar(document.body.dataset.categoriaPagina || window.location.pathname.split("/").pop().replace(".html", ""));
    const regrasCategoria = {
        bebidas: [ "bebida", "cafe" ],
        salgados: [ "salgado", "lanche" ],
        doces: [ "doce" ],
        paes: [ "pao", "pae", "bread" ],
        refrigerantes: [ "refrigerante", "bebida" ]
    };
    const nomeRelacao = valor => normalizar(Array.isArray(valor) ? valor.map(item => item && item.nome).join(" ") : valor && valor.nome);
    const categoriasConhecidas = {
        "8c7bb4cf-4eb2-41d2-8af7-331474bc97bb": "bebidas",
        "90ed5ae4-bf94-4af6-86e8-7fc826b6853b": "cafes",
        "a5c5f573-7862-40c8-a8f3-f00cdc6a968f": "paes"
    };
    const nomeCategoria = produto => nomeRelacao(produto.categorias_cardapio) || categoriasConhecidas[produto.categoria_id] || normalizar(`${produto.categoria_nome || ""} ${produto.nome || ""} ${produto.tipo || ""}`);
    const nomeIntolerancia = produto => nomeRelacao(produto.intolerancias);
    const nomeCaracteristica = produto => normalizar(Array.isArray(produto.caracteristicas) && produto.caracteristicas.length ? produto.caracteristicas.join(" ") : nomeRelacao(produto.caracteristicas_produtos));
    const temCaracteristica = (produto, nome) => {
        const alvo = normalizar(nome);
        if (Array.isArray(produto.caracteristicas)) {
            return produto.caracteristicas.some(item => normalizar(item) === alvo);
        }
        return nomeCaracteristica(produto).split(/[,;|]/).some(item => normalizar(item).trim() === alvo);
    };
    let produtos = [];
    const estadoAbas = new Map;
    function pertenceCategoria(produto) {
        return (regrasCategoria[pagina] || []).some(item => nomeCategoria(produto).includes(item));
    }
    function temRestricao(produto, aba) {
        const intolerancia = nomeIntolerancia(produto);
        const caracteristica = nomeCaracteristica(produto);
        const tipo = normalizar(produto.tipo);
        const nome = normalizar(produto.nome);
        if (aba === "lactose") return intolerancia.includes("lactose");
        if (aba === "fodmaps") return intolerancia.includes("fodmap");
        if (aba === "gluten") return intolerancia.includes("gluten");
        if (aba === "cafeina" || aba === "semcafeina-especiais") return intolerancia.includes("cafeina") || nome.includes("descafeinado");
        if (aba === "alcoholicos" || aba === "alcoolicos") return caracteristica.includes("alcool");
        if (aba === "classicos") return tipo === "classico" || !caracteristica.includes("alcool") && tipo !== "especial";
        return true;
    }
    function textoProduto(produto) {
        return normalizar(`${produto.nome || ""} ${produto.tipo || ""} ${produto.categoria_nome || ""} ${nomeCategoria(produto)} ${nomeCaracteristica(produto)}`);
    }
    function pertenceSubcategoria(produto, id) {
        const texto = textoProduto(produto);
        if (id.includes("geladas")) return temCaracteristica(produto, "frios");
        if (id.includes("quentes")) {
            return !temCaracteristica(produto, "frios");
        }
        return true;
    }
    function produtoEspecial(produto) {
        const tipo = normalizar(produto.tipo);
        return tipo === "especial" || tipo === "classico" || Boolean(nomeIntolerancia(produto)) || nomeCaracteristica(produto).includes("alcool");
    }
    function abrir(produto) {
        const modal = document.querySelector("#produtoModal");
        const overlay = document.querySelector("#modalOverlay");
        if (!modal || !overlay) return;
        const imagem = document.querySelector("#modalImg");
        if (imagem) {
            imagem.src = produto.imagem_url || "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500";
            imagem.alt = produto.nome || "Produto";
        }
        const nome = document.querySelector("#modalNome");
        if (nome) nome.textContent = produto.nome || "Produto";
        const descricao = document.querySelector("#modalDesc");
        if (descricao) descricao.textContent = produto.descricao || "Produto da nossa cafeteria.";
        const preco = document.querySelector("#modalPreco");
        if (preco) preco.textContent = dinheiro(produto.preco);
        produtoSelecionado = produto;
        modal.classList.add("ativo");
        overlay.classList.add("ativo");
    }
    function card(produto) {
        const artigo = criar("article", "produto-cardapio");
        artigo.tabIndex = 0;

        // --- INÍCIO DO CÓDIGO DO CORAÇÃO ANIMADO ---
        const favoritoContainer = criar("div", "heart-container");
        
        const inputCheckbox = document.createElement("input");
        inputCheckbox.type = "checkbox";
        inputCheckbox.id = `toggle-heart-${produto.id}`; // ID único
        inputCheckbox.className = "heart-checkbox";
        
        // Verifica se o produto já está nos favoritos para deixar o coração marcado ao carregar a página
        const sessao = window.appSessao && window.appSessao();
        if (sessao) {
            const chave = `kaffee_fuer_alle_favoritos_${sessao.user.id}`;
            try {
                const ids = JSON.parse(localStorage.getItem(chave) || "[]");
                if (ids.includes(produto.id)) {
                    inputCheckbox.checked = true;
                }
            } catch (_) {}
        }

        const labelCoracao = document.createElement("label");
        labelCoracao.htmlFor = `toggle-heart-${produto.id}`;
        labelCoracao.className = "heart-label";
        labelCoracao.setAttribute("aria-label", "Adicionar aos favoritos");
        labelCoracao.textContent = "❤"; // Caractere do coração

        favoritoContainer.append(inputCheckbox, labelCoracao);

        // Lógica de clique
        inputCheckbox.addEventListener("change", (evento) => {
            evento.stopPropagation(); // Impede de abrir o modal do produto
            const sessaoAtual = window.appSessao && window.appSessao();
            if (!sessaoAtual) {
                window.location.href = "../login.html";
                inputCheckbox.checked = false;
                return;
            }
            
            const chave = `kaffee_fuer_alle_favoritos_${sessaoAtual.user.id}`;
            let ids = [];
            try { ids = JSON.parse(localStorage.getItem(chave) || "[]"); } catch (_) {}
            
            if (inputCheckbox.checked) {
                if (!ids.includes(produto.id)) ids.push(produto.id);
            } else {
                ids = ids.filter(id => id !== produto.id);
            }
            
            localStorage.setItem(chave, JSON.stringify(ids));
        });
        // --- FIM DO CÓDIGO DO CORAÇÃO ANIMADO ---

        artigo.append(favoritoContainer, criar("strong", null, produto.nome || "Produto"), criar("span", "preco-item", dinheiro(produto.preco)));
        
        artigo.addEventListener("click", (e) => {
            // Se o clique foi no coração, não abre o modal do produto
            if (e.target.closest('.heart-container')) return; 
            abrir(produto);
        });
        
        artigo.addEventListener("keydown", e => {
            if ((e.key === "Enter" || e.key === " ") && !e.target.closest('.heart-container')) abrir(produto);
        });
        
        return artigo;
    }
    function renderizarAlvo(alvo, lista) {
        alvo.replaceChildren();
        if (!lista.length) {
            alvo.appendChild(criar("p", "mensagem-produtos", "Nenhum produto encontrado para este filtro."));
            return;
        }
        lista.forEach(produto => alvo.appendChild(card(produto)));
    }
    function renderizar() {
        const daCategoria = produtos.filter(pertenceCategoria);
        const colunas = [ ...document.querySelectorAll(".coluna-cardapio") ];
        colunas.forEach(coluna => {
            const abas = coluna.querySelector(".abas");
            const aba = abas ? estadoAbas.get(abas) || abas.querySelector(".aba-btn.ativo")?.dataset.aba : null;
            const alvos = [ ...coluna.querySelectorAll("[id]") ].filter(el => /bebidas|salgados|doces|paes|refrigerantes/.test(el.id));
            let lista = daCategoria;
            if (abas && aba) lista = lista.filter(produto => temRestricao(produto, aba));
            distribuirEmContainers(lista, coluna);
        });
    }
    function distribuirEmContainers(lista, coluna) {
        const alvos = [ ...coluna.querySelectorAll("[id]") ].filter(el => /geladas|quentes|frios|regulares|especiais|latas|gasosas|variacoes/.test(el.id));
        alvos.forEach(alvo => {
            const id = normalizar(alvo.id);
            let itens = lista;
            if (id.includes("geladas")) {
                itens = lista.filter(produto => temCaracteristica(produto, "frios"));
            } else if (id.includes("quentes")) {
                itens = lista.filter(produto => !temCaracteristica(produto, "frios"));
            } else if (id.includes("frios")) {
                itens = lista.filter(produto => temCaracteristica(produto, "frios"));
            } else if (id.includes("especiais")) {
                itens = lista.filter(produtoEspecial);
            } else if (id.includes("regulares")) {
                itens = lista.filter(produto => !produtoEspecial(produto));
            } else if (id.includes("latas")) {
                itens = lista.filter(produto => temCaracteristica(produto, "latas"));
            } else if (id.includes("gasosas") || id.includes("variacoes")) {
                itens = lista.filter(produto => !produtoEspecial(produto));
            }
            renderizarAlvo(alvo, itens);
        });
    }
    document.addEventListener("DOMContentLoaded", async () => {
        document.querySelectorAll(".abas").forEach(abas => abas.querySelectorAll(".aba-btn").forEach(botao => botao.addEventListener("click", () => {
            estadoAbas.set(abas, botao.dataset.aba);
            abas.querySelectorAll(".aba-btn").forEach(item => item.classList.toggle("ativo", item === botao));
            renderizar();
        })));
        document.querySelector("#btnFecharModal")?.addEventListener("click", () => {
            document.querySelector("#produtoModal")?.classList.remove("ativo");
            document.querySelector("#modalOverlay")?.classList.remove("ativo");
        });
        document.querySelector("#modalOverlay")?.addEventListener("click", () => {
            document.querySelector("#produtoModal")?.classList.remove("ativo");
            document.querySelector("#modalOverlay")?.classList.remove("ativo");
        });
        document.querySelector(".botao-voltar")?.addEventListener("click", () => {
            window.location.href = "../cardapio.html";
        });
        try {
            produtos = await window.carregarProdutos();
            renderizar();
        } catch (erro) {
            console.error("Erro ao carregar produtos:", erro);
            produtos = [];
            renderizar();
        }
    });
})();
