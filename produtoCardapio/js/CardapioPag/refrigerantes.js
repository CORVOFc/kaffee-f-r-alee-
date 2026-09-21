/*
 * Integração da página refrigerantes.html com o Supabase.
 * Versão: Cardápio público, carrinho protegido.
 * Filtros: categoria = 'bebidas', tipos: 'lata', 'gasosa', 'variacao'
 */

(function() {
  'use strict';

  console.log('🔧 Iniciando refrigerantes.js...');

  // CONFIGURAÇÃO DO SUPABASE
  if (typeof window.supabaseClient === 'undefined') {
      const SUPABASE_URL = 'https://sldvrltkeatmjdpbtrpe.supabase.co';
      const SUPABASE_ANON_KEY = 'sb_publishable_5KknAcAqzEhEhvdhRfYLbg_PCC_i9rT';
      
      if (typeof window.supabase !== 'undefined') {
          window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      } else {
          console.error('❌ Supabase não está disponível!');
          carregarDadosMock();
          return;
      }
  }

  // ESTADO
  const estado = {
      produtos: [],
      produtoSelecionado: null
  };

  // AUXILIARES
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

  // RENDERIZAÇÃO
  function mostrarMensagem(container, mensagem) {
      if (!container) return;
      container.innerHTML = `
          <p style="padding: 20px; text-align: center; color: #666;">
              ${mensagem}
          </p>
      `;
  }

  function criarCard(produto) {
      const card = document.createElement('article');
      card.className = 'produto-cardapio';
      card.tabIndex = 0;
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', `Ver detalhes de ${produto.nome || 'produto'}`);

      const nome = document.createElement('strong');
      nome.textContent = produto.nome || 'Produto sem nome';
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
          mostrarMensagem(container, 'Nenhum produto encontrado.');
          return;
      }
      
      produtos.forEach((produto) => container.appendChild(criarCard(produto)));
  }

  function atualizarTela() {
      console.log('🔄 Atualizando tela de refrigerantes...');
      
      // Filtra apenas produtos com categoria 'bebidas' (ou 'refrigerante' se preferir)
      const bebidas = estado.produtos.filter(p => normalizar(p.categoria) === 'bebidas');
      
      const latas = bebidas.filter(p => normalizar(p.tipo) === 'latas');
      const gasosas = bebidas.filter(p => normalizar(p.tipo) === 'gasosas');
      const variacoes = bebidas.filter(p => normalizar(p.tipo) === 'variacoes');

      console.log(`Latas: ${latas.length}, Gasosas: ${gasosas.length}, Variações: ${variacoes.length}`);

      renderizar('refrigerantes-latas', latas);
      renderizar('refrigerantes-gasosas', gasosas);
      renderizar('refrigerantes-variacoes', variacoes);
  }

  // MODAL
  function abrirModal(produto) {
      estado.produtoSelecionado = produto;
      const botaoAdicionar = document.getElementById('btnAdd');
      if (botaoAdicionar) botaoAdicionar.dataset.produtoId = String(produto.id);
      document.getElementById('modalImg').src = escaparImagem(produto.imagem) || 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=500';
      document.getElementById('modalImg').alt = produto.nome || 'Produto';
      document.getElementById('modalNome').textContent = produto.nome || '';
      document.getElementById('modalDesc').textContent = produto.descricao || 'Produto da nossa cafeteria';
      document.getElementById('modalPreco').textContent = formatarPreco(produto.preco);
      document.getElementById('produtoModal').classList.add('ativo');
      document.getElementById('modalOverlay').classList.add('ativo');
  }

  function fecharModal() {
      document.getElementById('produtoModal')?.classList.remove('ativo');
      document.getElementById('modalOverlay')?.classList.remove('ativo');
  }

  // VERIFICAÇÃO DE LOGIN (apenas para carrinho)
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

  // ADICIONAR AO CARRINHO (com verificação)
  async function adicionarAoCarrinho(idProduto) {
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

  // CARREGAR DO SUPABASE
  async function carregarRefrigerantes() {
      console.log('📥 Carregando refrigerantes...');
      
      const containers = ['refrigerantes-latas', 'refrigerantes-gasosas', 'refrigerantes-variacoes'];
      containers.forEach((id) => {
          const container = document.getElementById(id);
          if (container) mostrarMensagem(container, '⏳ Carregando produtos...');
      });

      try {
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
      console.log('🔧 DOM carregado, inicializando página de refrigerantes...');
      
      // Garantir visibilidade
      document.body.style.display = 'block';
      document.body.style.visibility = 'visible';
      document.body.style.opacity = '1';

      // Modal
      document.getElementById('btnFecharModal')?.addEventListener('click', fecharModal);
      document.getElementById('modalOverlay')?.addEventListener('click', fecharModal);

      // Botão adicionar
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

      carregarRefrigerantes();
  });

  // EXPOR FUNÇÕES GLOBAIS (para uso externo se necessário)
  window.fecharModalRefrigerantes = fecharModal;
  window.atualizarTelaRefrigerantes = atualizarTela;

  console.log('✅ refrigerantes.js carregado com sucesso!');
})();