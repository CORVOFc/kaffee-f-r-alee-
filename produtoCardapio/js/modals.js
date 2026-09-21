// js/modals.js - Funções auxiliares para modais

/**
 * Fecha o modal de produtos
 */
function fecharModalProduto() {
  const modal = document.getElementById('produtoModal');
  const overlay = document.getElementById('modalOverlay');
  if (modal) modal.classList.remove('ativo');
  if (overlay) overlay.classList.remove('ativo');
}

/**
* Abre o modal de produtos
* @param {object} produto - Dados do produto
*/
function abrirModalProduto(produto) {
  if (!produto) return;
  
  const modal = document.getElementById('produtoModal');
  const overlay = document.getElementById('modalOverlay');
  
  if (modal) {
      document.getElementById('modalNome').textContent = produto.nome || 'Produto';
      document.getElementById('modalDesc').textContent = produto.descricao || '';
      document.getElementById('modalPreco').textContent = formatarPreco(produto.preco);
      document.getElementById('modalImg').src = produto.imagem || 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800';
      modal.classList.add('ativo');
  }
  if (overlay) overlay.classList.add('ativo');
}

// Expõe funções globalmente
window.fecharModalProduto = fecharModalProduto;
window.abrirModalProduto = abrirModalProduto;

console.log('✅ modals.js carregado com sucesso!');