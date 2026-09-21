/*
 * Integração da página bebidas.html com o Supabase.
 * Versão: Cardápio público SEM bloqueio de visualização.
 */

(function() {
    'use strict';
  
    console.log('🔧 Iniciando bebidasbc.js...');
  
    // CONFIGURAÇÃO DO SUPABASE
    if (typeof window.supabaseClient === 'undefined') {
        const SUPABASE_URL = 'https://sldvrltkeatmjdpbtrpe.supabase.co';
        const SUPABASE_ANON_KEY = 'sb_publishable_5KknAcAqzEhEhvdhRfYLbg_PCC_i9rT';
        
        if (typeof window.supabase !== 'undefined') {
            window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        } else {
            console.error('❌ Supabase não está disponível!');
            // Fallback: carregar dados mockados
            carregarDadosMock();
            return;
        }
    }
  
   
    // ESTADO E FUNÇÕES AUXILIARES
    const estado = {
        produtos: [],
        filtroEsquerdo: 'lactose',
        filtroEspecial: 'classicos',
        produtoSelecionado: null
    };
  
    const normalizar = (valor = '') => valor
        .toString()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
  
    const escaparImagem = (url) => {
        try {
            const urlValida = new URL(url);
            return ['http:', 'https:'].includes(urlValida.protocol) ? urlValida.href : '';
        } catch {
            return '';
        }
    };
  
    const formatarPreco = (preco) => {
        const valor = parseFloat(preco);
        return Number.isFinite(valor)
            ? valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
            : 'Preço indisponível';
    };
  
    // RENDERIZAÇÃO DA PÁGINA (PÚBLICA - SEM BLOQUEIO)
    function mostrarMensagem(container, mensagem, erro = false) {
        if (!container) return;
        container.innerHTML = `
            <p class="mensagem-produtos${erro ? ' mensagem-erro' : ''}" style="padding: 20px; text-align: center; color: #666;">
                ${mensagem}
            </p>
        `;
    }
  
    function criarCard(produto) {
        const card = document.createElement('article');
        card.className = 'produto-cardapio';
        card.tabIndex = 0;
        card.setAttribute('role', 'button');
        card.setAttribute('aria-label', `Ver detalhes de ${produto.nome || 'bebida'}`);
  
        const nome = document.createElement('strong');
        nome.textContent = produto.nome || 'Bebida sem nome';
        nome.style.fontFamily = "'Quicksand', sans-serif";
  
        const preco = document.createElement('span');
        preco.className = 'preco-item';
        preco.textContent = formatarPreco(produto.preco);
  
        card.append(nome, preco);
        card.addEventListener('click', (e) => {
            e.stopPropagation();
            abrirModal(produto);
        });
        card.addEventListener('keydown', (evento) => {
            if (evento.key === 'Enter' || evento.key === ' ') {
                evento.preventDefault();
                abrirModal(produto);
            }
        });
        return card;
    }
  
    function renderizar(containerId, produtos) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.warn(`⚠️ Container ${containerId} não encontrado`);
            return;
        }
        container.replaceChildren();
        
        if (!produtos || !produtos.length) {
            mostrarMensagem(container, 'Nenhuma bebida encontrada para este filtro.');
            return;
        }
        
        produtos.forEach((produto) => container.appendChild(criarCard(produto)));
    }
  
    function produtoAtendeFiltro(produto, filtro) {
        const tipo = normalizar(produto.tipo);
        const filtros = {
            lactose: ['sem lactose', 'lactose'],
            fodmaps: ['low fodmap', 'fodmap'],
            cafeina: ['sem cafeina', 'cafeina'],
            gluten: ['sem gluten', 'gluten']
        };
        return (filtros[filtro] || [normalizar(filtro)]).some((termo) => tipo.includes(termo));
    }
  
    function atualizarTela() {
        console.log('Atualizando tela...');
        
        const geladas = estado.produtos.filter((produto) => {
            const categoria = normalizar(produto.categoria);
            return categoria.includes('gelado') && produtoAtendeFiltro(produto, estado.filtroEsquerdo);
        });
  
        const quentes = estado.produtos.filter((produto) => {
            const categoria = normalizar(produto.categoria);
            return categoria.includes('quente') && produtoAtendeFiltro(produto, estado.filtroEsquerdo);
        });
  
        const especiais = estado.produtos.filter((produto) => {
            const categoria = normalizar(produto.categoria);
            const tipo = normalizar(produto.tipo);
            if (!categoria.includes('bebidas especiais')) return false;
            if (estado.filtroEspecial === 'classicos') return !tipo.includes('Sem alcool') && !tipo.includes('cafeina');
            return tipo.includes(normalizar(estado.filtroEspecial));
        });
  
        console.log(` Geladas: ${geladas.length}, Quentes: ${quentes.length}, bebidas especiais: ${especiais.length}`);
  
        renderizar('bebidas-geladas', geladas);
        renderizar('bebidas-quentes', quentes);
        renderizar('bebidas-especiais', especiais);
    }
  
    function configurarAbas() {
        document.querySelectorAll('.abas').forEach((grupo) => {
            grupo.querySelectorAll('.aba-btn').forEach((botao) => {
                botao.addEventListener('click', () => {
                    grupo.querySelectorAll('.aba-btn').forEach((item) => item.classList.remove('ativo'));
                    botao.classList.add('ativo');
                    const valor = botao.dataset.aba;
                    const colunas = document.querySelectorAll('.coluna-cardapio');
                    if (grupo.closest('.coluna-cardapio') === colunas[0]) {
                        estado.filtroEsquerdo = valor;
                    } else {
                        estado.filtroEspecial = valor;
                    }
                    atualizarTela();
                });
            });
        });
    }
  
    function abrirModal(produto) {
        estado.produtoSelecionado = produto;
        const botaoAdicionar = document.getElementById('btnAdd');
        if (botaoAdicionar) botaoAdicionar.dataset.produtoId = String(produto.id);
        document.getElementById('modalImg').src = escaparImagem(produto.imagem) || 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800';
        document.getElementById('modalImg').alt = produto.nome || 'Bebida';
        document.getElementById('modalNome').textContent = produto.nome || '';
        document.getElementById('modalDesc').textContent = produto.descricao || 'Deliciosa bebida da nossa cafeteria';
        document.getElementById('modalPreco').textContent = formatarPreco(produto.preco);
        document.getElementById('produtoModal').classList.add('ativo');
        document.getElementById('modalOverlay').classList.add('ativo');
    }
  
    function fecharModal() {
        document.getElementById('produtoModal')?.classList.remove('ativo');
        document.getElementById('modalOverlay')?.classList.remove('ativo');
    }
  
    // VERIFICAÇÃO DE LOGIN - SOMENTE PARA O CARRINHO
    function verificarLogin() {
        try {
            const usuarioSalvo = sessionStorage.getItem('usuarioLogado');
            if (usuarioSalvo) {
                const usuario = JSON.parse(usuarioSalvo);
                if (usuario && usuario.user_id) {
                    return usuario;
                }
            }
        } catch (e) {
            console.error('Erro ao ler sessão:', e);
        }
        return null;
    }
  
    // FUNÇÃO DO CARRINHO COM VERIFICAÇÃO DE LOGIN
    async function adicionarAoCarrinho(idProduto) {
        // VERIFICA LOGIN - SÓ AQUI BLOQUEIA!
        const usuario = verificarLogin();
        
        if (!usuario) {
            alert('⚠️ Você precisa estar logado para adicionar ao carrinho!');
            window.location.href = '../cadastro/cadastro.html'; 
            return;
        }
  
        const produto = estado.produtos.find(p => p.id == idProduto);
        if (!produto) {
            alert('Produto não encontrado.');
            return;
        }
  
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
                tipo: produto.tipo,
                quantidade: 1,
                usuario_id: usuario.user_id
            });
        }
  
        localStorage.setItem('carrinho_local', JSON.stringify(carrinhoLocal));
        alert('✅ Produto adicionado ao carrinho!');
        window.location.href = '../Carrinho/carrinho.html'; 
    }
  
    async function carregarBebidas() {
        console.log('📥 Carregando bebidas...');
        
        const containers = ['bebidas-geladas', 'bebidas-quentes', 'bebidas-especiais'];
        containers.forEach((id) => {
            const container = document.getElementById(id);
            if (container) mostrarMensagem(container, '⏳ Carregando bebidas...');
        });
  
        try {
            // VERIFICAR SE O SUPABASE ESTÁ DISPONÍVEL
            if (typeof window.supabaseClient === 'undefined' || !window.supabaseClient) {
                console.warn('⚠️ Supabase não disponível, usando dados mock');
                carregarDadosMock();
                return;
            }
  
            const { data, error } = await window.supabaseClient
                .from('produtos')
                .select('id, nome, preco, descricao, imagem, categoria, tipo')
                .order('nome', { ascending: true });
  
            if (error) {
                console.error('❌ Erro do Supabase:', error);
                carregarDadosMock();
                return;
            }
  
            console.log('✅ Dados recebidos:', data);
            estado.produtos = data || [];
            console.log(`📦 ${estado.produtos.length} produtos carregados`);
            atualizarTela();
            
        } catch (error) {
            console.error('❌ Erro ao buscar produtos:', error);
            carregarDadosMock();
        }
    }
  
    // INICIALIZAÇÃO
    document.addEventListener('DOMContentLoaded', () => {
        console.log('🔧 DOM carregado, inicializando página de bebidas...');
        
        // GARANTIR QUE A PÁGINA ESTÁ VISÍVEL
        document.body.style.display = 'block';
        document.body.style.visibility = 'visible';
        document.body.style.opacity = '1';
        
        configurarAbas();
        
        document.getElementById('btnFecharModal')?.addEventListener('click', fecharModal);
        document.getElementById('modalOverlay')?.addEventListener('click', fecharModal);
        
        document.getElementById('btnAdd')?.addEventListener('click', async () => {
            const produto = estado.produtoSelecionado;
            const prodottoId = produto?.id || document.getElementById('btnAdd').dataset.produtoId;
  
            if (!prodottoId) {
                console.error('❌ Nenhum produto selecionado');
                alert('Selecione um produto novamente.');
                return;
            }
  
            await adicionarAoCarrinho(prodottoId);
        });
        
        carregarBebidas();
    });
  
    // EXPOR FUNÇÕES GLOBAIS
    window.fecharModalBebidas = fecharModal;
    window.atualizarTelaBebidas = atualizarTela;
  
    console.log('✅ bebidasbc.js carregado com sucesso!');
  })();