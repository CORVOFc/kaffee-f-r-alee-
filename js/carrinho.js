// carrinho.js - Adaptado para os IDs do seu HTML

// 1. Configuração do Supabase (usando window.supabase)
const SUPABASE_URL = 'https://sldvrltkeatmjdpbtrpe.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_5KknAcAqzEhEhvdhRfYLbg_PCC_i9rT';

let supabaseClient = null;
if (typeof window.supabase !== 'undefined') {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} else {
    console.error('❌ Biblioteca Supabase não carregada! Verifique a tag <script> no <head>.');
}

// 2. Verifica se o usuário está logado
const usuarioSalvo = sessionStorage.getItem('usuarioLogado');
if (!usuarioSalvo) {
    // Se não estiver logado, redireciona para o cadastro (ajuste o caminho se necessário)
    window.location.href = '../cadastro/cadastro.html';
} else {
    const usuario = JSON.parse(usuarioSalvo);

    // 3. Lê os itens do carrinho local (localStorage)
    const carrinhoLocal = JSON.parse(localStorage.getItem('carrinho_local') || '[]');
    // Filtra apenas os itens do usuário logado
    const itensDoUsuario = carrinhoLocal.filter(item => item.usuario_id == usuario.user_id);

    // 4. Elementos do HTML (usando os IDs corretos)
    const containerLista = document.getElementById('lista-produtos');
    const containerResumo = document.getElementById('resumo-pedido');
    const botaoFinalizar = document.getElementById('botao-finalizar');

    // Função para renderizar os itens e o resumo
    function renderizarCarrinho() {
        if (!containerLista) {
            console.error('❌ Elemento "lista-produtos" não encontrado no HTML.');
            return;
        }

        containerLista.innerHTML = '';
        let totalGeral = 0;

        // Se não houver itens, mostra uma mensagem de vazio
        if (itensDoUsuario.length === 0) {
            containerLista.innerHTML = `
                <div class="estado-vazio" style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 200px; text-align: center;">
                    <h2 style="font-family: 'Cinzel Decorative', serif; color: #5b1f0b;">Seu carrinho está vazio</h2>
                    <p style="margin: 10px 0;">Que tal escolher um delicioso café?</p>
                    <a href="../produtoCardapio/CardapioPag/bebidas.html" style="padding: 10px 20px; background: #5b1f0b; color: #fff; text-decoration: none; border-radius: 5px;">Voltar ao Cardápio</a>
                </div>
            `;
            if (botaoFinalizar) botaoFinalizar.disabled = true;
            if (containerResumo) containerResumo.innerHTML = '';
            return;
        }

        if (botaoFinalizar) botaoFinalizar.disabled = false;

        // Renderiza cada produto
        itensDoUsuario.forEach((item, index) => {
            const precoNum = parseFloat(item.preco) || 0;
            const subtotalItem = precoNum * item.quantidade;
            totalGeral += subtotalItem;

            // Se a imagem estiver vazia ou quebrada, usa uma padrão
            const imagemSrc = (item.imagem && item.imagem.startsWith('http')) ? item.imagem : 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800';

            const htmlItem = `
                <div class="item-produto" style="--atraso: ${index * 0.1}s">
                    <div class="foto-produto-wrap">
                        <img src="${imagemSrc}" alt="${item.nome}" class="foto-produto">
                    </div>
                    <div class="informacoes-produto">
                        <h2>${item.nome || 'Produto'}</h2>
                        <span class="selo-produto">Sem ${item.tipo || item.categoria || 'Café'}</span>
                        <p class="descricao-produto">${item.descricao || 'Bebida selecionada'}</p>
                    </div>
                    <div class="acoes-produto">
                        <span class="preco-produto">R$ ${subtotalItem.toFixed(2)}</span>
                        <div class="linha-acoes">
                            <div class="controle-quantidade">
                                <button onclick="alterarQuantidade(${index}, -1)">−</button>
                                <span>${item.quantidade}</span>
                                <button onclick="alterarQuantidade(${index}, 1)">+</button>
                            </div>
                            <button class="botao-remover" onclick="removerItem(${index})">
                                <svg viewBox="0 0 24 24"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z"></path></svg>
                            </button>
                        </div>
                    </div>
                </div>
            `;
            containerLista.innerHTML += htmlItem;
        });

        // Renderiza o resumo (subtotal, retirada, total)
        if (containerResumo) {
            containerResumo.innerHTML = `
                <div class="linha-resumo subtotal">
                    <span>Subtotal</span>
                    <strong>R$ ${totalGeral.toFixed(2)}</strong>
                </div>
                <div class="linha-resumo retirada">
                    <span class="rotulo-retirada">
                        <svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                        Retirada no local
                    </span>
                    <span class="endereco">Kaffee Für Alle - Rua das Flores, 123</span>
                </div>
                <div class="linha-resumo total">
                    <span>Total</span>
                    <strong>R$ ${totalGeral.toFixed(2)}</strong>
                </div>
            `;
        }
    }

    // Funções de interação (Aumentar, Diminuir e Remover)
    window.alterarQuantidade = function(index, delta) {
        if (itensDoUsuario[index].quantidade + delta > 0) {
            itensDoUsuario[index].quantidade += delta;
            const carrinhoAtualizado = carrinhoLocal.map(item => {
                if (item.produto_id === itensDoUsuario[index].produto_id) {
                    return itensDoUsuario[index];
                }
                return item;
            });
            localStorage.setItem('carrinho_local', JSON.stringify(carrinhoAtualizado));
            renderizarCarrinho();
        }
    };

    window.removerItem = function(index) {
        if (confirm('Deseja remover este item?')) {
            const carrinhoAtualizado = carrinhoLocal.filter(item => item.produto_id !== itensDoUsuario[index].produto_id);
            localStorage.setItem('carrinho_local', JSON.stringify(carrinhoAtualizado));
            window.location.reload();
        }
    };

    // Função para salvar no Supabase (Só quando clicar em Finalizar)
    window.finalizarPedido = async function() {
        if (itensDoUsuario.length === 0) return;
        if (!supabaseClient) {
            alert('Erro: Supabase não carregado.');
            return;
        }

        botaoFinalizar.disabled = true;
        botaoFinalizar.querySelector('.texto-finalizar').textContent = 'Processando...';

        try {
            const { error } = await supabaseClient
                .from('carrinho')
                .insert(itensDoUsuario.map(item => ({
                    usuario_id: usuario.user_id,
                    produto_id: item.produto_id,
                    quantidade: item.quantidade
                })));

            if (error) throw error;

            localStorage.removeItem('carrinho_local');
            alert('Pedido realizado com sucesso!');
            window.location.href = '../index.html';
        } catch (erro) {
            console.error('Erro ao finalizar pedido:', erro);
            alert('Erro ao salvar o pedido.');
            botaoFinalizar.disabled = false;
            botaoFinalizar.querySelector('.texto-finalizar').textContent = 'Continuar Pedido';
        }
    };

    // Inicializa a página
    renderizarCarrinho();

    // Adiciona o evento de clique no botão finalizar
    if (botaoFinalizar) {
        botaoFinalizar.addEventListener('click', finalizarPedido);
    }
}