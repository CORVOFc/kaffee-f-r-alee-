(function() {
    "use strict";
    function criar(tag, classe, texto) {
        const elemento = document.createElement(tag);
        if (classe) elemento.className = classe;
        if (texto !== undefined) elemento.textContent = texto;
        return elemento;
    }
    function adicionarLinks(container, links) {
        if (!container) return;
        container.replaceChildren();
        links.forEach(item => {
            const link = criar("a", null, item.label || item);
            link.href = item.href || "#";
            container.appendChild(link);
        });
    }
    document.addEventListener("DOMContentLoaded", () => {
        adicionarLinks(document.getElementById("footer-nav"), [ {
            label: "Produtos",
            href: "cardapio.html"
        }, {
            label: "Estúdio",
            href: "musica.html"
        }, {
            label: "Clientes",
            href: "cadastro/login.html"
        }, {
            label: "Blog",
            href: "noticias.html"
        }, {
            label: "Privacidade",
            href: "#"
        }, {
            label: "Termos",
            href: "#"
        } ]);
        adicionarLinks(document.getElementById("footer-socials"), [ {
            label: "Instagram",
            href: "#"
        }, {
            label: "Facebook",
            href: "#"
        } ]);
        const searchButton = document.querySelector(".BarraPesquisa .botao");
        searchButton?.addEventListener("click", event => {
            event.preventDefault();
            const input = searchButton.closest(".BarraPesquisa")?.querySelector(".texto");
            input?.classList.toggle("ativo");
            if (input?.classList.contains("ativo")) input.focus();
        });
    });
    window.formatarPreco = valor => Number(valor || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
    window.criarSlug = texto => String(texto || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
})();

(function() {
    const params = new URLSearchParams(window.location.search);
    const busca = params.get("busca");
    if (!busca) return;
    const termo = busca.toLowerCase();
    document.querySelectorAll(".card").forEach(card => {
        const titulo = (card.querySelector("h2")?.textContent || "").toLowerCase();
        card.hidden = !titulo.includes(termo);
    });
    const main = document.querySelector(".conteudo");
    if (main && !main.querySelector(".busca-aviso")) {
        const aviso = document.createElement("p");
        aviso.className = "busca-aviso";
        aviso.classList.add("busca-aviso");
        aviso.textContent = `Resultados para: "${busca}"`;
        main.prepend(aviso);
    }
})();
