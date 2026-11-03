(function() {
    "use strict";
    const dinheiro = v => Number(v || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
    const $ = s => document.querySelector(s);
    let sessao;
    let itens = [];
    function renderizar() {
        const lista = $("#lista-produtos");
        const resumo = $("#resumo-pedido");
        lista.replaceChildren();
        resumo.replaceChildren();
        if (!itens.length) {
            const vazio = document.createElement("p");
            vazio.className = "estado-vazio";
            vazio.textContent = "Seu carrinho está vazio.";
            lista.appendChild(vazio);
            $("#botao-finalizar").disabled = true;
            return;
        }
        $("#botao-finalizar").disabled = false;
        itens.forEach((item, indice) => {
            const artigo = document.createElement("article");
            artigo.className = "item-produto";
            const info = document.createElement("div");
            info.className = "informacoes-produto";
            const nome = document.createElement("h2");
            nome.textContent = item.nome;
            const detalhe = document.createElement("p");
            detalhe.className = "descricao-produto";
            detalhe.textContent = item.descricao || "Produto da cafeteria";
            const preco = document.createElement("span");
            preco.className = "preco-produto";
            preco.textContent = dinheiro(item.preco * item.quantidade);
            info.append(nome, detalhe, preco);
            const controles = document.createElement("div");
            controles.className = "controle-quantidade";
            [ [ "−", -1 ], [ String(item.quantidade), 0 ], [ "+", 1 ] ].forEach(([texto, delta]) => {
                const botao = document.createElement("button");
                botao.type = "button";
                botao.textContent = texto;
                if (delta) botao.addEventListener("click", () => {
                    item.quantidade = Math.max(1, item.quantidade + delta);
                    salvar();
                }); else botao.disabled = true;
                controles.appendChild(botao);
            });
            const remover = document.createElement("button");
            remover.type = "button";
            remover.className = "botao-remover";
            remover.setAttribute("aria-label", `Excluir ${item.nome} do carrinho`);
            const textoRemover = document.createElement("span");
            textoRemover.className = "botao-remover__texto";
            textoRemover.textContent = "Excluir";
            const iconeRemover = document.createElement("span");
            iconeRemover.className = "botao-remover__icone";
            iconeRemover.setAttribute("aria-hidden", "true");
            const imagemRemover = document.createElement("img");
            imagemRemover.className = "botao-remover__svg";
            imagemRemover.src = "../assets/icons/trash.svg";
            imagemRemover.alt = "";
            iconeRemover.appendChild(imagemRemover);
            remover.append(textoRemover, iconeRemover);
            remover.addEventListener("click", () => {
                itens.splice(indice, 1);
                salvar();
            });
            artigo.append(info, controles, remover);
            lista.appendChild(artigo);
        });
        const total = itens.reduce((soma, item) => soma + Number(item.preco) * item.quantidade, 0);
        const linha = document.createElement("p");
        linha.className = "linha-resumo";
        linha.textContent = `Total: ${dinheiro(total)}`;
        resumo.appendChild(linha);
    }
    function salvar() {
        window.carrinhoStore.salvarCarrinho(sessao.user.id, itens);
        renderizar();
    }
    window.addEventListener("app:ready", evento => {
        sessao = evento.detail;
        if (!sessao) return;
        itens = window.carrinhoStore.lerCarrinho(sessao.user.id);
        renderizar();
    });
    document.addEventListener("DOMContentLoaded", () => {
        $("#botao-finalizar").addEventListener("click", () => {
            if (itens.length) window.location.href = "etapas.html";
        });
    });
})();
