(function() {
    const ICONS_BASE = new URL("../assets/icons/", document.currentScript.src);
    "use strict";
    const $ = seletor => document.querySelector(seletor);
    const normalizar = valor => String(valor || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const dinheiro = valor => Number(valor || 0).toLocaleString("pt-br", {
        style: "currency",
        currency: "BRL"
    });
    let produtos = [];
    let categoriaAtual = "todos";
    let buscaAtual = "";
    let usuarioId = null;
    function chave() {
        return `kaffee_fuer_alle_favoritos_${usuarioId || "visitante"}`;
    }
    function idsFavoritos() {
        try {
            return new Set(JSON.parse(localStorage.getItem(chave()) || "[]"));
        } catch (_) {
            return new Set;
        }
    }
    function salvarFavoritos(ids) {
        localStorage.setItem(chave(), JSON.stringify([ ...ids ]));
    }
    function categoria(produto) {
        return normalizar(produto.categorias_cardapio && produto.categorias_cardapio.nome);
    }
    function categoriaCompatível(produto) {
        const nome = categoria(produto);
        if (categoriaAtual === "todos") return true;
        const regras = {
            bebidas: [ "bebida", "cafe" ],
            doces: [ "doce" ],
            paes: [ "pao" ],
            refrigerantes: [ "refrigerante" ],
            salgados: [ "salgado", "lanche" ]
        };
        return (regras[categoriaAtual] || []).some(item => nome.includes(item));
    }
    function card(produto, ids) {
        const artigo = document.createElement("article");
        artigo.className = "card";
        artigo.dataset.categoria = categoria(produto);
        artigo.dataset.produtoId = produto.id;
        const imagem = document.createElement("img");
        imagem.src = produto.imagem_url || "img/cafe da juju.png";
        imagem.alt = produto.nome;
        imagem.loading = "lazy";
        const tipo = document.createElement("span");
        tipo.className = "categoria";
        tipo.textContent = categoria(produto).toUpperCase() || "PRODUTO";
        const nome = document.createElement("h3");
        nome.textContent = produto.nome;
        const preco = document.createElement("strong");
        preco.textContent = dinheiro(produto.preco);
        const remover = document.createElement("button");
        remover.type = "button";
        remover.className = "favorito-remover";
        const icon = document.createElement("img");
        icon.className = "icono-ui";
        icon.src = new URL("heart-filled.svg", ICONS_BASE).href;
        icon.alt = "";
        icon.setAttribute("aria-hidden", "true");
        remover.append(icon);
        remover.setAttribute("aria-label", `Remover ${produto.nome} dos favoritos`);
        remover.addEventListener("click", () => {
            ids.delete(produto.id);
            salvarFavoritos(ids);
            renderizar();
            mostrarToast(`${produto.nome} removido dos favoritos.`);
        });
        const detalhes = document.createElement("button");
        detalhes.type = "button";
        detalhes.className = "ver-detalhes";
        detalhes.textContent = "Ver detalhes";
        detalhes.addEventListener("click", (evento) => {
            evento.stopPropagation();
            
            
            if (typeof window.abrirModalProduto === "function") {
                window.abrirModalProduto(produto);
            } else {
                console.warn("Modal não encontrado. Redirecionando...");
                
                const nomeCategoria = categoria(produto);
                const destino = nomeCategoria.includes("refrigerante") ? "refrigerantes" : nomeCategoria.includes("salgado") || nomeCategoria.includes("lanche") ? "salgados" : nomeCategoria.includes("pao") ? "paes" : nomeCategoria.includes("doce") ? "doces" : "bebidas";
                window.location.href = `produtoCardapio/${destino}.html`;
            }
        });
        artigo.append(imagem, remover, tipo, nome, preco, detalhes);
        return artigo;
    }
    function renderizar() {
        const area = $("#carrossel");
        const vazio = $("#favoritos-vazio");
        if (!area) return;
        const ids = idsFavoritos();
        const lista = produtos.filter(produto => ids.has(produto.id) && categoriaCompatível(produto) && normalizar(produto.nome).includes(buscaAtual));
        area.replaceChildren();
        lista.forEach(produto => area.appendChild(card(produto, ids)));
        if (vazio) vazio.hidden = lista.length > 0;
        const contador = document.querySelector("#quantidade-total-de-favoritos");
        if (contador) contador.textContent = String(ids.size);
    }
    function mostrarToast(texto) {
        const toast = $("#toast");
        if (!toast) return;
        toast.textContent = texto;
        toast.classList.add("visivel");
        window.setTimeout(() => toast.classList.remove("visivel"), 2200);
    }
    document.addEventListener("DOMContentLoaded", () => {
        $("#proximo")?.addEventListener("click", () => $("#carrossel")?.scrollBy({
            left: 250,
            behavior: "smooth"
        }));
        $("#anterior")?.addEventListener("click", () => $("#carrossel")?.scrollBy({
            left: -250,
            behavior: "smooth"
        }));
        $("#campo-de-pesquisa")?.addEventListener("input", evento => {
            buscaAtual = normalizar(evento.target.value);
            renderizar();
        });
        $("#formulario-pesquisa")?.addEventListener("reset", () => {
            buscaAtual = "";
            window.setTimeout(renderizar, 0);
        });
        document.querySelectorAll(".chip").forEach(botao => botao.addEventListener("click", () => {
            categoriaAtual = botao.dataset.categoria;
            document.querySelectorAll(".chip").forEach(item => item.classList.toggle("ativo", item === botao));
            renderizar();
        }));
    });
    window.addEventListener("app:ready", async evento => {
        usuarioId = evento.detail && evento.detail.user ? evento.detail.user.id : null;
        try {
            produtos = await window.carregarProdutos();
            renderizar();
        } catch (erro) {
            console.error("Favoritos:", erro);
            renderizar();
        }
    });
})();
