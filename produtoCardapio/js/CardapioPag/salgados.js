/* ============================================================
   SALGADOS.JS - Lógica do cardápio de salgados
   ============================================================ */

const salgadosRegulares = [
    { nome: "Coxinha de Frango", preco: "R$ 8,50", descricao: "Coxinha crocante com recheio cremoso de frango.", imagem: "https://images.unsplash.com/photo-1549557404-bf41b6eab080?w=500" },
    { nome: "Esfiha de Carne", preco: "R$ 9,00", descricao: "Esfiha assada com carne temperada.", imagem: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=500" },
    { nome: "Pastel de Queijo", preco: "R$ 7,50", descricao: "Pastel frito recheado com queijo derretido.", imagem: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=500" },
    { nome: "Quibe", preco: "R$ 8,00", descricao: "Quibe crocante com recheio temperado.", imagem: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500" },
    { nome: "Enroladinho de Presunto e Queijo", preco: "R$ 7,90", descricao: "Massa folhada recheada com presunto e queijo.", imagem: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=500" },
    { nome: "Bolinho de Aipim com Carne", preco: "R$ 8,90", descricao: "Bolinho cremoso de aipim com carne seca.", imagem: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=500" },
    { nome: "Croquete de Frango", preco: "R$ 8,20", descricao: "Croquete dourado recheado com frango.", imagem: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=500" },
    { nome: "Mini Sanduíche de Carne", preco: "R$ 10,00", descricao: "Mini sanduíche com carne saborosa e temperada.", imagem: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=500" }
  ];
  
  const salgadosEspeciais = {
    lactose: [
      { nome: "Empadinha Vegana", preco: "R$ 10,00", descricao: "Empadinha sem lactose com recheio de legumes.", imagem: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=500" },
      { nome: "Quiche Sem Lactose", preco: "R$ 12,00", descricao: "Quiche cremosa preparada com leite vegetal.", imagem: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=500" },
      { nome: "Esfiha de Espinafre", preco: "R$ 9,50", descricao: "Esfiha de espinafre com massa macia.", imagem: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=500" },
      { nome: "Nuggets de Grão-de-Bico", preco: "R$ 11,00", descricao: "Nuggets crocantes e sem lactose.", imagem: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=500" }
    ],
    fodmaps: [
      { nome: "Saladinha de Quinoa", preco: "R$ 14,00", descricao: "Quinoa com legumes de baixo FODMAP.", imagem: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500" },
      { nome: "Sanduíche Natural", preco: "R$ 13,00", descricao: "Sanduíche leve com ingredientes Low FODMAP.", imagem: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500" },
      { nome: "Torrada com Abacate", preco: "R$ 12,00", descricao: "Torrada com abacate e ervas suaves.", imagem: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500" },
      { nome: "Wrap de Frango", preco: "R$ 15,00", descricao: "Wrap leve com frango e salada.", imagem: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500" }
    ],
    cafeina: [
      { nome: "Mini Hambúrguer", preco: "R$ 12,00", descricao: "Mini hambúrguer saboroso, sem cafeína.", imagem: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=500" },
      { nome: "Sanduíche de Frango", preco: "R$ 13,50", descricao: "Sanduíche de frango desfiado.", imagem: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500" },
      { nome: "Esfiha de Ricota", preco: "R$ 10,00", descricao: "Esfiha recheada com ricota cremosa.", imagem: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=500" },
      { nome: "Bolinho de Arroz", preco: "R$ 8,50", descricao: "Bolinho de arroz frito e crocante.", imagem: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=500" }
    ],
    gluten: [
      { nome: "Coxinha de Frango com Farinha de Arroz", preco: "R$ 10,00", descricao: "Coxinha preparada com massa de farinha de arroz, sem gluten.", imagem: "https://images.unsplash.com/photo-1549557404-bf41b6eab080?w=500" },
      { nome: "Pastel de Queijo com Polvilho", preco: "R$ 9,00", descricao: "Pastel de polvilho assado, recheado com queijo.", imagem: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=500" },
      { nome: "Nuggets de Frango com Aveia", preco: "R$ 11,00", descricao: "Nuggets de frango empanados com aveia certificada sem gluten.", imagem: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=500" },
      { nome: "Bolinho de Batata Doce", preco: "R$ 8,50", descricao: "Bolinho frito de batata doce, naturalmente sem gluten.", imagem: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=500" }
    ]
  };
  
  let abaAtiva = 'lactose';
  
  function renderizar(id, lista) {
    const container = document.getElementById(id);
    if (!container) return;
    
    container.innerHTML = lista.map(item => `
      <div class="produto-cardapio" onclick="abrirModal('${item.nome.replace(/'/g, "\\'")}', '${item.preco}', '${item.descricao.replace(/'/g, "\\'")}', '${item.imagem || ''}')">
        <strong>${item.nome.toUpperCase()}</strong>
        <span class="preco-item">${item.preco}</span>
      </div>
    `).join('');
  }
  
  function renderizarSalgadosEspeciais() {
    renderizar('salgados-especiais', salgadosEspeciais[abaAtiva]);
  }
  
  document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.aba-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        document.querySelectorAll('.aba-btn').forEach(b => b.classList.remove('ativo'));
        this.classList.add('ativo');
        abaAtiva = this.dataset.aba;
        renderizarSalgadosEspeciais();
      });
    });
  
    renderizar('salgados-regulares', salgadosRegulares);
    renderizarSalgadosEspeciais();
  });