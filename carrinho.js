function criarItem(item, index) {
    const precoNum = parseFloat(item.preco) || 0;
    const subtotal = precoNum * item.quantidade;
    const wrapper = criar("div", "item-produto");
    const fotoWrap = criar("div", "foto-produto-wrap");
    const img = criar("img", "foto-produto");
    img.src = item.imagem && item.imagem.startsWith("http") ? item.imagem : "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800";
    img.alt = item.nome || "Produto";
    fotoWrap.appendChild(img);
    const info = criar("div", "informacoes-produto");
    info.appendChild(criar("h2", null, item.nome || "Produto"));
    info.appendChild(criar("span", "selo-produto", item.tipo || "Produto"));
    info.appendChild(criar("p", "descricao-produto", item.descricao || ""));
    const acoes = criar("div", "acoes-produto");
    acoes.appendChild(criar("span", "preco-produto", formatarPreco(subtotal)));
    const linhaAcoes = criar("div", "linha-acoes");
    const controle = criar("div", "controle-quantidade");
    const btnMenos = criar("button", null, "−");
    btnMenos.type = "button";
    btnMenos.dataset.acao = "menos";
    btnMenos.dataset.index = String(index);
    const spanQtd = criar("span", null, String(item.quantidade));
    const btnMais = criar("button", null, "+");
    btnMais.type = "button";
    btnMais.dataset.acao = "mais";
    btnMais.dataset.index = String(index);
    controle.append(btnMenos, spanQtd, btnMais);
    const btnRemover = criar("button", "botao-remover");
    btnRemover.type = "button";
    btnRemover.dataset.acao = "remover";
    btnRemover.dataset.index = String(index);
    btnRemover.setAttribute("aria-label", "Remover item");
    btnRemover.appendChild(svgLixeira());
    linhaAcoes.append(controle, btnRemover);
    acoes.append(linhaAcoes);
    wrapper.append(fotoWrap, info, acoes);
    return wrapper;
}

async function finalizar() {
    const usuario = window.__usuarioAtual || null;
    if (!usuario) {
        alert("Você precisa estar logado.");
        window.location.href = "../login.html";
        return;
    }
    const todos = lerCarrinho();
    const itens = todos.filter(i => i.usuario_id === usuario.id);
    if (itens.length === 0) return;
    if ($botaoFinalizar) {
        $botaoFinalizar.disabled = true;
        const texto = $botaoFinalizar.querySelector(".texto-finalizar");
        if (texto) texto.textContent = "Processando...";
    }
    try {
        const payloadItens = itens.map(i => ({
            produto_id: i.produto_id,
            quantidade: i.quantidade,
            observacoes: i.observacoes || ""
        }));
        const pedidoId = await window.criarPedidoSeguro(CAFETERIA_ID, "retirada_na_loja", null, "", payloadItens);
        const restantes = todos.filter(i => i.usuario_id !== usuario.id);
        salvarCarrinho(restantes);
        if ($avisoSucesso) {
            $avisoSucesso.hidden = false;
            setTimeout(() => {
                $avisoSucesso.hidden = true;
            }, 4e3);
        }
        window.location.href = `../cliente.html?pedido=${encodeURIComponent(pedidoId)}`;
    } catch (erro) {
        console.error("Erro ao finalizar:", erro);
        alert("Não foi possível finalizar: " + (erro.message || "tente novamente."));
        if ($botaoFinalizar) {
            $botaoFinalizar.disabled = false;
            const texto = $botaoFinalizar.querySelector(".texto-finalizar");
            if (texto) texto.textContent = "Continuar Pedido";
        }
    }
}
