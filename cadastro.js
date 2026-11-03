(function() {
    "use strict";
    const toggle = document.getElementById("togglePassword");
    const senha = document.getElementById("senha");
    const form = document.getElementById("form-cadastro");
    const mensagem = document.getElementById("mensagem-status");
    const botao = document.getElementById("botao-enviar");
    const iconeToggle = toggle ? toggle.querySelector("img") : null;

    if (toggle && senha) {
        toggle.addEventListener("click", () => {
            const mostrar = senha.type === "password";
            senha.type = mostrar ? "text" : "password";
            if (iconeToggle) iconeToggle.src = mostrar ? "assets/icons/eye-off.svg" : "assets/icons/eye.svg";
            toggle.setAttribute("aria-label", mostrar ? "Ocultar senha" : "Mostrar senha");
        });
    }

    if (!form || !botao || !mensagem || !senha) return;

    form.addEventListener("submit", async evento => {
        evento.preventDefault();
        botao.disabled = true;
        mensagem.textContent = "Criando conta...";
        mensagem.className = "";
        const nome = document.getElementById("nome").value.trim();
        const email = document.getElementById("email").value.trim();
        try {
            const resultado = await window.criarConta(email, senha.value, nome);
            if (resultado.user && !resultado.session) {
                mensagem.textContent = "Conta criada. Confira sua caixa de entrada se a confirmação de e-mail estiver ativada no projeto.";
                mensagem.className = "sucesso";
            } else {
                mensagem.textContent = "Cadastro realizado. Redirecionando...";
                mensagem.className = "sucesso";
                window.setTimeout(() => window.location.replace("cliente.html"), 1000);
            }
            form.reset();
        } catch (erro) {
            console.error("Não foi possível criar a conta:", erro);
            mensagem.textContent = "Não foi possível criar a conta. Confira os dados e tente novamente.";
            mensagem.className = "erro";
        } finally {
            botao.disabled = false;
        }
    });
})();
