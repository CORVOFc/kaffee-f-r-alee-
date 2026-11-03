(function() {
    "use strict";
    function destinoAposLogin() {
        const perfil = new URL("cliente.html", window.location.href);
        const solicitado = new URLSearchParams(window.location.search).get("redirect");
        if (!solicitado) return perfil.href;
        try {
            const destino = new URL(solicitado, window.location.href);
            const raiz = new URL("./", window.location.href).pathname;
            const caminhoRelativo = destino.pathname.slice(raiz.length).toLowerCase();
            if (destino.origin !== window.location.origin || !destino.pathname.startsWith(raiz) || !caminhoRelativo || caminhoRelativo === "login.html" || caminhoRelativo.startsWith("login.html/")) return perfil.href;
            return destino.href;
        } catch (erro) {
            return perfil.href;
        }
    }

    async function encerrarSessao() {
        try {
            await window.fazerLogout();
        } catch (erro) {
            console.error("Não foi possível encerrar a sessão após bloquear o acesso:", erro);
        }
    }

    function mostrarMensagem(texto, estado) {
        const campo = document.getElementById("mensagem-status");
        if (!campo) return;
        campo.textContent = texto;
        campo.className = estado;
    }

    const form = document.getElementById("form-login");
    const botao = document.getElementById("botao-login");
    const inputEmail = document.getElementById("email");
    const inputSenha = document.getElementById("password");
    if (!form || !botao || !inputEmail || !inputSenha) return;

    const aviso = new URLSearchParams(window.location.search).get("aviso");
    if (aviso === "conta-desativada") {
        mostrarMensagem("Sua conta foi desativada. O acesso foi bloqueado. Entre em contato com a administração para solicitar a reativação.", "erro");
    } else if (aviso === "perfil-indisponivel") {
        mostrarMensagem("Não foi possível validar a conta. Tente entrar novamente mais tarde.", "erro");
    }

    form.addEventListener("submit", async evento => {
        evento.preventDefault();
        botao.disabled = true;
        mostrarMensagem("Verificando...", "");
        let autenticado = false;
        try {
            await window.fazerLogin(inputEmail.value.trim(), inputSenha.value);
            autenticado = true;
            if (typeof window.garantirPerfilProprio !== "function") throw new Error("Verificação do perfil indisponível.");
            const perfil = await window.garantirPerfilProprio();
            if (perfil && perfil.ativo === false) {
                await encerrarSessao();
                mostrarMensagem("Sua conta foi desativada. O acesso foi bloqueado. Entre em contato com a administração para solicitar a reativação.", "erro");
                botao.disabled = false;
                return;
            }
            if (!perfil || perfil.ativo !== true) throw new Error("O perfil não retornou um estado ativo verificável.");
            mostrarMensagem("Login bem-sucedido.", "sucesso");
            window.setTimeout(() => window.location.replace(destinoAposLogin()), 500);
        } catch (erro) {
            console.error("Falha no login ou na verificação do perfil:", erro);
            if (autenticado) {
                await encerrarSessao();
                mostrarMensagem("Não foi possível confirmar o estado da conta. Por segurança, a sessão foi encerrada. Tente novamente mais tarde.", "erro");
            } else {
                mostrarMensagem("E-mail ou senha incorretos, ou a conta não pode ser autenticada.", "erro");
            }
            botao.disabled = false;
        }
    });
})();
