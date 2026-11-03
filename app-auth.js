(function() {
    "use strict";
    const PROTECTED = document.body && document.body.dataset.protectedPage === "true";
    const REQUIRED_ROLE = document.body ? document.body.dataset.role : "";
    if (PROTECTED) document.body.dataset.authState = "checking";

    function baseDoAplicativo() {
        const segmentos = window.location.pathname.split("/").filter(Boolean);
        const pastasDoApp = [ "carrinho", "produtocardapio", "favorito" ];
        const indicePasta = segmentos.findIndex(segmento => pastasDoApp.includes(segmento.toLowerCase()));
        const raiz = indicePasta >= 0 ? segmentos.slice(0, indicePasta) : segmentos.slice(0, -1);
        return `/${raiz.length ? `${raiz.join("/")}/` : ""}`;
    }

    function contaAtiva(sessao) {
        return Boolean(sessao && sessao.perfil && sessao.perfil.ativo === true);
    }

    function papelDaSessao(sessao) {
        if (!contaAtiva(sessao)) return null;
        const normalizar = valor => String(valor || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();
        const tipo = normalizar(sessao.perfil.tipo_usuario);
        const funcoes = (sessao.permissoes || []).map(item => normalizar(item.funcao));
        const valores = [ tipo, ...funcoes ];
        if (valores.some(valor => [ "desenvolvedor", "developer", "admin", "administrador" ].includes(valor))) return "admin";
        if (valores.some(valor => [ "gestor", "manager" ].includes(valor))) return "gestor";
        if ([ "cliente", "customer" ].includes(tipo)) return "cliente";
        return null;
    }

    function redirecionarLogin(destino) {
        const login = new URL(`${baseDoAplicativo()}login.html`, window.location.href);
        const retorno = destino || `${window.location.pathname}${window.location.search}${window.location.hash}`;
        login.searchParams.set("redirect", retorno);
        window.location.replace(login.href);
    }

    function redirecionarComAviso(aviso) {
        const login = new URL(`${baseDoAplicativo()}login.html`, window.location.href);
        const retorno = `${window.location.pathname}${window.location.search}${window.location.hash}`;
        login.searchParams.set("aviso", aviso);
        login.searchParams.set("redirect", retorno);
        window.location.replace(login.href);
    }

    function registrarLogoutDelegado() {
        document.addEventListener("click", async evento => {
            const acionador = evento.target instanceof Element ? evento.target.closest('[data-action="logout"]') : null;
            if (!acionador) return;
            evento.preventDefault();
            if (acionador.dataset.logoutPendente === "true") return;
            acionador.dataset.logoutPendente = "true";
            acionador.disabled = true;
            try {
                await window.fazerLogout();
                window.location.replace(`${baseDoAplicativo()}index.html`);
            } catch (erro) {
                console.error("Não foi possível encerrar a sessão:", erro);
                acionador.disabled = false;
                delete acionador.dataset.logoutPendente;
            }
        });
    }

    async function carregarSessao() {
        if (!window.supabaseClient || !window.usuarioAtual) return null;
        const user = await window.usuarioAtual();
        if (!user || user.is_anonymous) return null;
        let perfil = null;
        let permissoes = [];
        try {
            perfil = await window.perfilAtual();
        } catch (erro) {
            console.warn("Perfil existente não foi consultado; tentando recuperação segura:", erro.message || erro);
        }
        if (!perfil && typeof window.garantirPerfilProprio === "function") {
            try {
                perfil = await window.garantirPerfilProprio();
            } catch (erro) {
                console.error("Não foi possível recuperar o perfil autenticado:", erro);
            }
        }
        if (contaAtiva({ perfil }) && typeof window.carregarPermissoes === "function") {
            try {
                permissoes = await window.carregarPermissoes(perfil.id);
            } catch (erro) {
                console.warn("Associações do perfil não carregadas; mantendo dados pessoais:", erro.message || erro);
            }
        }
        const sessao = {
            user: user,
            perfil: perfil,
            permissoes: permissoes,
            cafeteriaId: window.__cafeteriaId || null
        };
        sessao.role = papelDaSessao(sessao);
        window.__sessaoApp = sessao;
        return sessao;
    }

    function temPapel(sessao, papel) {
        if (!contaAtiva(sessao) || !papel) return false;
        const role = sessao.role || papelDaSessao(sessao);
        if (papel === "cliente") return role === "cliente";
        if (papel === "gestor") return role === "gestor" || role === "admin";
        if (papel === "desenvolvedor" || papel === "admin" || papel === "administrador") return role === "admin";
        return (sessao.permissoes || []).some(item => item.funcao === papel);
    }

    async function encerrarSessaoInvalida(sessao) {
        if (!sessao || !sessao.user || contaAtiva(sessao)) return false;
        try {
            await window.fazerLogout();
        } catch (erro) {
            console.error("Não foi possível encerrar a sessão de conta não ativa:", erro);
        }
        window.__sessaoApp = null;
        return true;
    }

    async function iniciar() {
        registrarLogoutDelegado();
        let tentativas = 0;
        while (!window.supabaseClient && tentativas < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            tentativas += 1;
        }
        let sessao = null;
        try {
            sessao = await carregarSessao();
        } catch (erro) {
            console.error("Não foi possível validar a sessão:", erro);
        }
        const paginaPerfil = window.location.pathname.split("/").pop().toLowerCase() === "cliente.html";
        if (sessao && sessao.user && !contaAtiva(sessao)) {
            const perfilInativo = Boolean(sessao.perfil && sessao.perfil.ativo === false);
            await encerrarSessaoInvalida(sessao);
            sessao = null;
            if (PROTECTED) {
                redirecionarComAviso(perfilInativo ? "conta-desativada" : "perfil-indisponivel");
                return;
            }
        }
        if (PROTECTED && sessao && sessao.perfil && sessao.perfil.ativo === false && !paginaPerfil) {
            window.location.replace(`${baseDoAplicativo()}cliente.html`);
            return;
        }
        if (PROTECTED && (!sessao || !sessao.user)) {
            redirecionarLogin();
            return;
        }
        if (REQUIRED_ROLE && !temPapel(sessao, REQUIRED_ROLE)) {
            if (!sessao || !sessao.user) {
                redirecionarLogin();
                return;
            }
            if (paginaPerfil) {
                if (PROTECTED) document.body.dataset.authState = "authorized";
                window.dispatchEvent(new CustomEvent("app:ready", {
                    detail: sessao
                }));
                return;
            }
            window.location.replace(`${baseDoAplicativo()}cliente.html`);
            return;
        }
        if (PROTECTED) document.body.dataset.authState = "authorized";
        document.querySelectorAll("[data-login-required]").forEach(elemento => elemento.addEventListener("click", evento => {
            if (!sessao || !sessao.user) {
                evento.preventDefault();
                redirecionarLogin(elemento.href || elemento.getAttribute("href"));
            }
        }));
        document.querySelectorAll("[data-auth-only]").forEach(elemento => {
            elemento.hidden = !sessao;
        });
        document.querySelectorAll("[data-guest-only]").forEach(elemento => {
            elemento.hidden = Boolean(sessao);
        });
        document.querySelectorAll("[data-role-only]").forEach(elemento => {
            elemento.hidden = !temPapel(sessao, elemento.dataset.roleOnly);
        });
        window.dispatchEvent(new CustomEvent("app:ready", {
            detail: sessao
        }));
    }

    window.appSessao = () => window.__sessaoApp || null;
    window.appPode = papel => temPapel(window.__sessaoApp, papel);
    window.appPapelAtual = papelDaSessao;
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar, { once: true });
    else iniciar();
})();
