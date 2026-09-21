/*
 * Integração da página doces.html com o Supabase.
 * Versão: Cardápio público, carrinho protegido.
 * Categoria: 'doces'
 * Tipos: 'regular', 'frio', 'lactose', 'fodmaps', 'cafeina', 'gluten'
 */

(function() {
  'use strict';

  console.log('🔧 Iniciando doces.js...');

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

  // DADOS MOCK PARA FALLBACK
  function carregarDadosMock() {
      console.log('📦 Carregando dados mock de doces (fallback)...');
      
      const produtosMock = [
          // Regulares
          { id: 401, nome: 'Brigadeiro Tradicional', preco: 8.00, descricao: 'Brigadeiro cremoso feito com chocolate de qualidade.', imagem: '', categoria: 'doces', tipo: 'regular' },
          { id: 402, nome: 'Beijinho de Coco', preco: 8.00, descricao: 'Doce de coco ralado com leite condensado.', imagem: '', categoria: 'doces', tipo: 'regular' },
          { id: 403, nome: 'Olho de Sogra', preco: 9.00, descricao: 'Ameixa com cobertura de chocolate.', imagem: '', categoria: 'doces', tipo: 'regular' },
          { id: 404, nome: 'Romeu e Julieta', preco: 10.00, descricao: 'Goiabada com queijo derretido.', imagem: '', categoria: 'doces', tipo: 'regular' },
          { id: 405, nome: 'Doce de Leite Cremoso', preco: 7.50, descricao: 'Doce de leite artesanal e cremoso.', imagem: '', categoria: 'doces', tipo: 'regular' },
          { id: 406, nome: 'Bolo de Chocolate', preco: 12.00, descricao: 'Bolo de chocolate úmido e delicioso.', imagem: '', categoria: 'doces', tipo: 'regular' },
          // Frios
          { id: 501, nome: 'Pavê de Chocolate', preco: 14.00, descricao: 'Pavê com camadas de chocolate e biscoito.', imagem: '', categoria: 'doces', tipo: 'frio' },
          { id: 502, nome: 'Torta de Morango', preco: 16.00, descricao: 'Torta fresca com morangos selecionados.', imagem: '', categoria: 'doces', tipo: 'frio' },
          { id: 503, nome: 'Mousse de Maracujá', preco: 11.00, descricao: 'Mousse leve e cremosa de maracujá.', imagem: '', categoria: 'doces', tipo: 'frio' },
          { id: 504, nome: 'Pudim de Leite', preco: 10.00, descricao: 'Pudim tradicional bem cremoso.', imagem: '', categoria: 'doces', tipo: 'frio' },
          { id: 505, nome: 'Sorvete Caseiro', preco: 9.00, descricao: 'Sorvete artesanal da casa.', imagem: '', categoria: 'doces', tipo: 'frio' },
          { id: 506, nome: 'Taça da Casa', preco: 15.00, descricao: 'Sobremesa especial servida em taça.', imagem: '', categoria: 'doces', tipo: 'frio' },
          // Especiais - Lactose
          { id: 601, nome: 'Brigadeiro Vegano', preco: 9.00, descricao: 'Brigadeiro feito com leite vegetal.', imagem: '', categoria: 'doces', tipo: 'lactose' },
          { id: 602, nome: 'Beijinho Vegano', preco: 9.00, descricao: 'Beijinho sem lactose com coco.', imagem: '', categoria: 'doces', tipo: 'lactose' },
          { id: 603, nome: 'Bolo de Chocolate Vegano', preco: 13.00, descricao: 'Bolo de chocolate totalmente vegano.', imagem: '', categoria: 'doces', tipo: 'lactose' },
          { id: 604, nome: 'Mousse de Chocolate Vegano', preco: 12.00, descricao: 'Mousse cremosa sem lactose.', imagem: '', categoria: 'doces', tipo: 'lactose' },
          // Especiais - FODMAPs
          { id: 701, nome: 'Brigadeiro Low FODMAP', preco: 10.00, descricao: 'Brigadeiro apropriado para dieta Low FODMAP.', imagem: '', categoria: 'doces', tipo: 'fodmaps' },
          { id: 702, nome: 'Bolo Simples Low FODMAP', preco: 11.00, descricao: 'Bolo sem ingredientes FODMAP.', imagem: '', categoria: 'doces', tipo: 'fodmaps' },
          { id: 703, nome: 'Pudim Low FODMAP', preco: 10.00, descricao: 'Pudim cremoso Low FODMAP.', imagem: '', categoria: 'doces', tipo: 'fodmaps' },
          { id: 704, nome: 'Biscoito Low FODMAP', preco: 7.00, descricao: 'Biscoito crocante Low FODMAP.', imagem: '', categoria: 'doces', tipo: 'fodmaps' },
          // Especiais - Sem Cafeína
          { id: 801, nome: 'Brigadeiro Sem Cafeína', preco: 8.00, descricao: 'Brigadeiro sem cafeína.', imagem: '', categoria: 'doces', tipo: 'cafeina' },
          { id: 802, nome: 'Mousse de Chocolate Branco', preco: 11.00, descricao: 'Mousse de chocolate branco.', imagem: '', categoria: 'doces', tipo: 'cafeina' },
          { id: 803, nome: 'Bolo de Baunilha', preco: 10.00, descricao: 'Bolo de baunilha macio.', imagem: '', categoria: 'doces', tipo: 'cafeina' },
          { id: 804, nome: 'Pavê de Baunilha', preco: 13.00, descricao: 'Pavê de baunilha delicioso.', imagem: '', categoria: 'doces', tipo: 'cafeina' },
          // Especiais - Sem Glúten
          { id: 901, nome: 'Brigadeiro de Farinha de Arroz', preco: 9.00, descricao: 'Brigadeiro preparado com farinha de arroz, sem gluten.', imagem: '', categoria: 'doces', tipo: 'gluten' },
          { id: 902, nome: 'Pudim de Leite Sem Gluten', preco: 10.00, descricao: 'Pudim tradicional feito sem ingredientes com trigo.', imagem: '', categoria: 'doces', tipo: 'gluten' },
          { id: 903, nome: 'Mousse de Chocolate com Polvilho', preco: 12.00, descricao: 'Mousse cremosa com base de polvilho, sem gluten.', imagem: '', categoria: 'doces', tipo: 'gluten' },
          { id: 904, nome: 'Bolo de Milho Cremoso', preco: 11.00, descricao: 'Bolo macio feito apenas com farinha de milho, naturalmente sem gluten.', imagem: '', categoria: 'doces', tipo: 'gluten' }
      ];
      
      estado.produtos = produtosMock;
      atualizarTela();
      
      // Aviso de modo offline
      const containers = ['doces-regulares', 'doces-frios', 'doces-especiais'];
      containers.forEach(id => {
          const container = document.getElementById(id);
          if (container) {
              const aviso = document.createElement('div');
              aviso.style.cssText = 'padding: 10px; background: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; text-align: center; margin-top: 10px; font-size: 12px; color: #856404;';
              aviso.textContent = '⚠️ Modo offline - dados de exemplo';
              container.prepend(aviso);
          }
      });
  }

  // ESTADO
  const estado = {
      produtos: [],
      filtroEspecial: 'lactose', // aba ativa para especiais
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
      console.log('🔄 Atualizando tela de doces...');
      
      // Filtra apenas produtos da categoria 'doces'
      const doces = estado.produtos.filter(p => normalizar(p.categoria) === 'doces');
      
      // Separa por tipo
      const regulares = doces.filter(p => normalizar(p.tipo) === 'regulares');
      const frios = doces.filter(p => normalizar(p.tipo) === 'frios');
      // Especiais: todos os tipos que estão nas abas
      const especiais = doces.filter(p => 
          ['lactose', 'fodmaps', 'cafeina', 'gluten'].includes(normalizar(p.tipo))
      );
      // Filtra especiais pela aba ativa
      const especiaisFiltrados = especiais.filter(p => normalizar(p.tipo) === estado.filtroEspecial);

      console.log(`📊 Regulares: ${regulares.length}, Frios: ${frios.length}, Especiais (${estado.filtroEspecial}): ${especiaisFiltrados.length}`);

      renderizar('doces-regulares', regulares);
      renderizar('doces-frios', frios);
      renderizar('doces-especiais', especiaisFiltrados);
  }

  // CONFIGURAÇÃO DAS ABAS
  function configurarAbas() {
      const grupoAbas = document.querySelector('.coluna-cardapio .abas');
      if (!grupoAbas) return;
      
      grupoAbas.querySelectorAll('.aba-btn').forEach((botao) => {
          botao.addEventListener('click', () => {
              grupoAbas.querySelectorAll('.aba-btn').forEach((item) => item.classList.remove('ativo'));
              botao.classList.add('ativo');
              estado.filtroEspecial = botao.dataset.aba;
              atualizarTela();
          });
      });
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
  async function carregarDoces() {
      console.log('📥 Carregando doces...');
      
      const containers = ['doces-regulares', 'doces-frios', 'doces-especiais'];
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
      console.log('🔧 DOM carregado, inicializando página de doces...');
      
      // Garantir visibilidade
      document.body.style.display = 'block';
      document.body.style.visibility = 'visible';
      document.body.style.opacity = '1';

      configurarAbas();

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

      carregarDoces();
  });

  // EXPOR FUNÇÕES GLOBAIS
  window.fecharModalDoces = fecharModal;
  window.atualizarTelaDoces = atualizarTela;

  console.log('✅ doces.js carregado com sucesso!');
})();