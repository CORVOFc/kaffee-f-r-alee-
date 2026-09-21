/*
 * Produtos.js - Carrossel da página inicial
 * Busca produtos do Supabase, seleciona 10 aleatórios e renderiza nos carrosséis.
 * Adiciona botão "Clique aqui para mais produtos" ao final.
 */

(function() {
    'use strict';
  
    console.log('🔧 Iniciando Produtos.js...');
  
    // CONFIGURAÇÃO DO SUPABASE (igual aos outros scripts)
    if (typeof window.supabaseClient === 'undefined') {
        const SUPABASE_URL = 'https://sldvrltkeatmjdpbtrpe.supabase.co';
        const SUPABASE_ANON_KEY = 'sb_publishable_5KknAcAqzEhEhvdhRfYLbg_PCC_i9rT';
        
        if (typeof window.supabase !== 'undefined') {
            window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        } else {
            console.error('❌ Supabase não está disponível!');
            return;
        }
    }
  
    // FUNÇÃO AUXILIAR: Embaralhar e pegar N itens aleatórios
    function pegarAleatorios(array, quantidade) {
        const copia = [...array];
        for (let i = copia.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [copia[i], copia[j]] = [copia[j], copia[i]];
        }
        return copia.slice(0, quantidade);
    }
  
    // FUNÇÃO PARA CRIAR UM CARD DE PRODUTO (igual ao usado nas outras páginas)
    function criarCardProduto(produto) {
        const card = document.createElement('div');
        card.className = 'product-card cream'; // pode ser brown também, mas usaremos cream
        card.style.cursor = 'pointer';
  
        const precoFormatado = new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(produto.preco);
  
        card.innerHTML = `
            <div class="product-image-wrapper">
                <div class="product-image-circle">
                    <img src="${produto.imagem || 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=150&h=150&fit=crop'}" alt="${produto.nome}">
                </div>
            </div>
            <h3 class="product-name">${produto.nome || 'Produto'}</h3>
            <div class="product-price-badge">${precoFormatado}</div>
        `;
  
        // Ao clicar no card, abre o modal com os dados do produto
        card.addEventListener('click', () => {
            abrirModalProduto(produto);
        });
  
        return card;
    }
  
    // FUNÇÃO PARA ABRIR O MODAL (usando a mesma estrutura do modal.js)
    function abrirModalProduto(produto) {
        const modal = document.getElementById('produtoModal');
        const overlay = document.getElementById('modalOverlay');
        if (!modal || !overlay) {
            console.warn('Modal não encontrado');
            return;
        }
  
        // Preenche os dados
        document.getElementById('modalImg').src = produto.imagem || 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500';
        document.getElementById('modalImg').alt = produto.nome || 'Produto';
        document.getElementById('modalNome').textContent = produto.nome || 'Produto';
        document.getElementById('modalDesc').textContent = produto.descricao || 'Descrição não disponível';
        document.getElementById('modalPreco').textContent = new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(produto.preco);
  
        // Guarda o ID do produto no botão "Adicionar ao Carrinho" (se existir)
        const btnAdd = document.getElementById('btnAdd');
        if (btnAdd) {
            btnAdd.dataset.produtoId = produto.id;
            // Remove listeners antigos para evitar duplicação
            btnAdd.replaceWith(btnAdd.cloneNode(true));
            const novoBtn = document.getElementById('btnAdd');
            novoBtn.addEventListener('click', () => {
                adicionarAoCarrinho(produto.id);
            });
        }
  
        modal.classList.add('ativo');
        overlay.classList.add('ativo');
    }
  
    // FUNÇÃO PARA FECHAR O MODAL (global, chamada pelo modal.js ou diretamente)
    window.fecharModalProduto = function() {
        const modal = document.getElementById('produtoModal');
        const overlay = document.getElementById('modalOverlay');
        if (modal) modal.classList.remove('ativo');
        if (overlay) overlay.classList.remove('ativo');
    };
  
    // FUNÇÃO PARA ADICIONAR AO CARRINHO (com verificação de login)
    async function adicionarAoCarrinho(idProduto) {
        // Verifica login
        let usuario = null;
        try {
            const usuarioSalvo = sessionStorage.getItem('usuarioLogado');
            if (usuarioSalvo) {
                usuario = JSON.parse(usuarioSalvo);
            }
        } catch (e) {
            console.error('Erro ao ler sessão:', e);
        }
  
        if (!usuario || !usuario.user_id) {
            alert('⚠️ Você precisa estar logado para adicionar ao carrinho!');
            window.location.href = '../cadastro/cadastro.html';
            return;
        }
  
        // Busca o produto completo (precisa estar no estado global ou buscar novamente)
        // Vamos usar os dados já carregados no array produtosGlobal
        const produto = window.produtosGlobal ? window.produtosGlobal.find(p => p.id == idProduto) : null;
        if (!produto) {
            alert('Produto não encontrado.');
            return;
        }
  
        // Lê carrinho local
        let carrinhoLocal = JSON.parse(localStorage.getItem('carrinho_local') || '[]');
        const produtoExistente = carrinhoLocal.find(item => item.produto_id == idProduto);
  
        if (produtoExistente) {
            produtoExistente.quantidade += 1;
        } else {
            carrinhoLocal.push({
                produto_id: produto.id,
                nome: produto.nome,
                preco: produto.preco,
                imagem: produto.imagem,
                tipo: produto.tipo || '',
                quantidade: 1,
                usuario_id: usuario.user_id
            });
        }
  
        localStorage.setItem('carrinho_local', JSON.stringify(carrinhoLocal));
        alert('✅ Produto adicionado ao carrinho!');
        window.location.href = '../Carrinho/carrinho.html';
    }
  
    // FUNÇÃO PRINCIPAL: CARREGAR PRODUTOS E PREENCHER OS CARROSSÉIS
    async function carregarProdutosCarrossel() {
        console.log('📥 Carregando produtos para os carrosséis...');
  
        try {
            if (typeof window.supabaseClient === 'undefined' || !window.supabaseClient) {
                console.warn('⚠️ Supabase não disponível, usando dados mock');
                // Dados mock (caso não tenha conexão)
                const mock = [
                    { id: 1, nome: 'Café Especial', preco: 12.90, descricao: 'Café gourmet selecionado', imagem: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=150&h=150&fit=crop', categoria: 'bebidas', tipo: 'cafeina' },
                    { id: 2, nome: 'Cappuccino', preco: 15.90, descricao: 'Cappuccino cremoso', imagem: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=150&h=150&fit=crop', categoria: 'bebidas', tipo: 'lactose' },
                    { id: 3, nome: 'Bolo de Chocolate', preco: 18.00, descricao: 'Bolo de chocolate úmido', imagem: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=150&h=150&fit=crop', categoria: 'doces', tipo: 'regular' },
                    { id: 4, nome: 'Pão Francês', preco: 2.50, descricao: 'Pão fresco', imagem: 'https://images.unsplash.com/photo-1608134372202-4102b63b3708?w=150&h=150&fit=crop', categoria: 'paes', tipo: 'regular' },
                    { id: 5, nome: 'Mousse de Maracujá', preco: 11.00, descricao: 'Mousse leve', imagem: 'https://images.unsplash.com/photo-1570466526438-66d144b98a4e?w=150&h=150&fit=crop', categoria: 'doces', tipo: 'frio' },
                ];
                window.produtosGlobal = mock;
                renderizarCarrosseis(mock);
                return;
            }
  
            const { data, error } = await window.supabaseClient
                .from('produtos')
                .select('id, nome, preco, descricao, imagem, categoria, tipo')
                .order('nome', { ascending: true });
  
            if (error) {
                console.error('❌ Erro do Supabase:', error);
                return;
            }
  
            console.log('✅ Dados recebidos:', data);
            window.produtosGlobal = data || [];
  
            // Seleciona 10 aleatórios
            const aleatorios = pegarAleatorios(window.produtosGlobal, 10);
            renderizarCarrosseis(aleatorios);
  
        } catch (error) {
            console.error('❌ Erro ao carregar produtos:', error);
        }
    }
  
    // FUNÇÃO PARA RENDERIZAR OS CARDS NOS CARROSSÉIS
    function renderizarCarrosseis(produtos) {
        const carrossel1 = document.getElementById('carrossel-1');
        const carrossel2 = document.getElementById('carrossel-2');
  
        if (!carrossel1 || !carrossel2) {
            console.warn('Carrosséis não encontrados');
            return;
        }
  
        // Limpa os containers (remove o texto de carregamento)
        carrossel1.innerHTML = '';
        carrossel2.innerHTML = '';
  
        // Se não houver produtos, mostra mensagem
        if (!produtos || produtos.length === 0) {
            const msg = document.createElement('p');
            msg.style.cssText = 'color: #fff; text-align: center; width: 100%; padding: 20px;';
            msg.textContent = 'Nenhum produto disponível no momento.';
            carrossel1.appendChild(msg);
            carrossel2.appendChild(msg);
            return;
        }
  
        // Função para adicionar cards e o botão "Ver mais"
        function preencherCarrossel(container, lista) {
            lista.forEach(produto => {
                container.appendChild(criarCardProduto(produto));
            });
  
            // Botão "Clique aqui para mais produtos"
            const btnVerMais = document.createElement('div');
            btnVerMais.className = 'product-card cream';
            btnVerMais.style.cssText = 'flex: 0 0 200px; display: flex; align-items: center; justify-content: center; cursor: pointer; background-color: #F5E6D3; border: 2px dashed #6B4423;';
            btnVerMais.innerHTML = `
                <a href="../cardapio.html" style="text-decoration: none; color: #3D2817; font-family: 'Cinzel Decorative', serif; font-weight: bold; font-size: 1.2rem; text-align: center; padding: 1rem;">
                    Clique aqui<br>para mais produtos
                </a>
            `;
            container.appendChild(btnVerMais);
        }
  
        // Para o carrossel 1, pega os primeiros 10 (já são 10)
        preencherCarrossel(carrossel1, produtos);
  
        // Para o carrossel 2, pega outros 10 aleatórios (ou os mesmos, mas podemos sortear novamente)
        // Vamos sortear novamente para variar
        const produtos2 = window.produtosGlobal ? pegarAleatorios(window.produtosGlobal, 10) : produtos;
        preencherCarrossel(carrossel2, produtos2);
  
        console.log(`✅ Carrosséis preenchidos com ${produtos.length} produtos cada.`);
    }
  
    // INICIALIZAÇÃO
    document.addEventListener('DOMContentLoaded', () => {
        console.log('🔧 Inicializando Produtos.js...');
        
        // Configura o fechamento do modal (já existe no modal.js, mas garantimos)
        const btnFechar = document.getElementById('btnFecharModal');
        const overlay = document.getElementById('modalOverlay');
        if (btnFechar) btnFechar.addEventListener('click', window.fecharModalProduto);
        if (overlay) overlay.addEventListener('click', window.fecharModalProduto);
  
        // Carrega os produtos
        carregarProdutosCarrossel();
    });
  
    console.log('✅ Produtos.js carregado com sucesso!');
  })();