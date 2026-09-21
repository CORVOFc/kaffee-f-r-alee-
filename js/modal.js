/*
 * modal.js - Controle do modal para exibição de produtos e adição ao carrinho.
 * Versão unificada para a página inicial e demais páginas.
 */

(function() {
  'use strict';

  console.log('🔧 Inicializando modal.js...');

  // Elementos do modal
  const modal = document.getElementById('produtoModal');
  const overlay = document.getElementById('modalOverlay');
  const btnFechar = document.getElementById('btnFecharModal');
  const btnAdd = document.getElementById('btnAdd');
  const imgModal = document.getElementById('modalImg');
  const nomeModal = document.getElementById('modalNome');
  const descModal = document.getElementById('modalDesc');
  const precoModal = document.getElementById('modalPreco');

  // Estado do produto atual
  let produtoAtual = null;

  // Função para abrir o modal (exposta globalmente)
  window.abrirModalProduto = function(produto) {
      if (!produto) return;

      produtoAtual = produto;

      // Preencher dados
      imgModal.src = produto.imagem && produto.imagem.startsWith('http') ? produto.imagem : 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800';
      imgModal.alt = produto.nome || 'Produto';
      nomeModal.textContent = produto.nome || 'Produto';
      descModal.textContent = produto.descricao || 'Delicioso produto da nossa cafeteria.';
      
      const preco = parseFloat(produto.preco);
      precoModal.textContent = isNaN(preco) ? 'Preço indisponível' : `R$ ${preco.toFixed(2).replace('.', ',')}`;

      // Guardar ID do produto no botão
      btnAdd.dataset.produtoId = produto.id || '';

      // Exibir modal
      modal.classList.add('ativo');
      overlay.classList.add('ativo');
  };

  // Função para fechar o modal
  function fecharModal() {
      modal.classList.remove('ativo');
      overlay.classList.remove('ativo');
      produtoAtual = null;
  }

  // Eventos de fechamento
  btnFechar.addEventListener('click', fecharModal);
  overlay.addEventListener('click', fecharModal);

  // Fechar com tecla ESC
  document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('ativo')) {
          fecharModal();
      }
  });

  // Verificação de login (copiada dos outros scripts)
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

  // Adicionar ao carrinho (com verificação de login)
  async function adicionarAoCarrinho(idProduto) {
      const usuario = verificarLogin();
      
      if (!usuario) {
          alert('⚠️ Você precisa estar logado para adicionar ao carrinho!');
          window.location.href = '../cadastro/cadastro.html'; 
          return;
      }

      // Buscar o produto completo (se não tiver, usamos o produtoAtual)
      let produto = produtoAtual;
      if (!produto || produto.id != idProduto) {
          // Tenta encontrar no estado global (se disponível)
          if (window.estado && window.estado.produtos) {
              produto = window.estado.produtos.find(p => p.id == idProduto);
          }
      }
      if (!produto) {
          alert('Produto não encontrado.');
          return;
      }

      // Ler carrinho local
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

  // Evento do botão "ADICIONAR AO CARRINHO"
  btnAdd.addEventListener('click', async () => {
      const id = btnAdd.dataset.produtoId;
      if (!id) {
          alert('Selecione um produto novamente.');
          return;
      }
      await adicionarAoCarrinho(id);
  });

  console.log('✅ modal.js carregado com sucesso.');
})();