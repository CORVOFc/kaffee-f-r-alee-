/* ============================================================
   MAIN.JS - JavaScript compartilhado do Kaffee Für Alle
   ============================================================ */

// ===== FOOTER DINÂMICO =====
document.addEventListener('DOMContentLoaded', function() {
    // Nav links do footer
    const footerNav = document.getElementById('footer-nav');
    if (footerNav) {
      const links = ['Produtos', 'Estúdio', 'Clientes', 'Preços', 'Blog', 'Privacidade', 'Termos'];
      footerNav.innerHTML = links.map(l => `<a href="#">${l}</a>`).join('');
    }
  
    // Social links do footer
    const footerSocials = document.getElementById('footer-socials');
    if (footerSocials) {
      const socials = [
        { label: 'Twitter', href: '#' },
        { label: 'LinkedIn', href: '#' },
        { label: 'GitHub', href: '#' },
        { label: 'Facebook', href: '#' },
        { label: 'Instagram', href: '#' }
      ];
      footerSocials.innerHTML = socials.map(({ label, href }) => 
        `<a href="${href}">${label}</a>`
      ).join('');
    }
  
    // Header search toggle
    const searchBtn = document.querySelector('.BarraPesquisa .botao');
    if (searchBtn) {
      searchBtn.addEventListener('click', function(e) {
        e.preventDefault();
        const input = this.closest('.BarraPesquisa').querySelector('.texto');
        if (input) {
          input.classList.toggle('ativo');
          if (input.classList.contains('ativo')) {
            input.focus();
          }
        }
      });
    }
  });
  
  // ===== UTILITÁRIOS =====
  function formatarPreco(valor) {
    return 'R$ ' + parseFloat(valor).toFixed(2).replace('.', ',');
  }
  
  function limparHTML(texto) {
    const div = document.createElement('div');
    div.innerHTML = texto;
    return (div.textContent || '').replace(/\s+/g, ' ').trim();
  }
  
  function criarSlug(texto) {
    return texto.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }