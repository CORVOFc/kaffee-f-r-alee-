(function() {
    "use strict";
    function iniciar() {
        const gato = document.querySelector(".menu .gato-site");
        const menu = document.querySelector(".menu");
        if (!gato || !menu) {
            console.warn("[gato] .menu .gato-site não encontrado");
            return;
        }
        const paginaAtual = (() => {
            const path = window.location.pathname;
            const fim = path.split("/").pop();
            if (!fim || fim === "") return "index.html";
            return fim;
        })();
        const links = [ ...menu.querySelectorAll("a") ];
        if (!links.length) return;
        const linkAtivo = links.find(a => {
            const href = (a.getAttribute("href") || "").split("#")[0].split("?")[0];
            if (!href) return false;
            const arquivoHref = href.split("/").pop();
            return arquivoHref === paginaAtual;
        });
        if (linkAtivo) {
            gato.classList.add("sobre-link");
            linkAtivo.classList.add("gato-link-ativo");
            linkAtivo.appendChild(gato);
        }
        console.log("[gato] Inicializado. Link ativo:", linkAtivo?.textContent?.trim() || "nenhum");
    }
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", iniciar);
    } else {
        iniciar();
    }
    window.__gatoDebug = {
        iniciar: iniciar
    };
})();
