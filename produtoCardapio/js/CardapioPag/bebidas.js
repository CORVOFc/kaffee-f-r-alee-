/* ============================================================
   BEBIDAS.JS - Lógica do cardápio de bebidas
   ============================================================ */

// Dados dos produtos
const produtos = [
    // Sem Lactose
    { 
      nome: "Iced Latte de Aveia", 
      preco: "R$ 15,90", 
      descricao: "Café espresso com leite de aveia e gelo. Por que não faz mal: Substitui o leite de vaca por leite de aveia, naturalmente cremoso e sem lactose.",
      imagem: "https://images.unsplash.com/photo-1558857563-c0c3a62d0f09?w=500",
      categoria: "lactose",
      tipo: "gelada"
    },
    { 
      nome: "Limonada Suíça com Coco", 
      preco: "R$ 15,00", 
      descricao: "Limão batido com leite de coco concentrado. Por que não faz mal: Usa leite condensado de coco em vez do tradicional com leite de vaca.",
      imagem: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500",
      categoria: "lactose",
      tipo: "gelada"
    },
    { 
      nome: "Frappé de Morango com Amêndoas", 
      preco: "R$ 17,90", 
      descricao: "Morangos congelados batidos com leite de amêndoas. Por que não faz mal: Não utiliza sorvete de leite, apenas ingredientes vegetais.",
      imagem: "https://images.unsplash.com/photo-1595853035070-59a39fe84de3?w=500",
      categoria: "lactose",
      tipo: "gelada"
    },
    { 
      nome: "Cappuccino de Castanhas", 
      preco: "R$ 12,00", 
      descricao: "Café espresso com leite de castanha-de-caju vaporizado. Por que não faz mal: Leite vegetal sem lactose, com microespuma para latte art.",
      imagem: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=500",
      categoria: "lactose",
      tipo: "quente"
    },
    { 
      nome: "Chocolate Quente Vegano", 
      preco: "R$ 22,00", 
      descricao: "Cacau 100% com leite de aveia. Por que não faz mal: Sem soro de leite ou derivados, apenas ingredientes vegetais.",
      imagem: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=500",
      categoria: "lactose",
      tipo: "quente"
    },
    { 
      nome: "Golden Milk (Leite Dourado)", 
      preco: "R$ 15,00", 
      descricao: "Leite de coco com cúrcuma, canela e gengibre. Por que não faz mal: Bebida indiana à base de leite de coco, zero laticínios.",
      imagem: "https://images.unsplash.com/photo-1595152772835-219674b2a8a6?w=500",
      categoria: "lactose",
      tipo: "quente"
    },
  
    // Low FODMAP
    { 
      nome: "Água Saborizada de Pepino e Alecrim", 
      preco: "R$ 10,10", 
      descricao: "Infusão suave de pepino e alecrim na água. Por que não faz mal: Não contém suco de frutas; libera apenas óleos essenciais e aroma.",
      imagem: "https://images.unsplash.com/photo-1542314938-38c532166a29?w=500",
      categoria: "fodmaps",
      tipo: "gelada"
    },
    { 
      nome: "Chá Gelado de Hortelã com Limão Taiti", 
      preco: "R$ 12,00", 
      descricao: "Infusão de hortelã com poucas gotas de limão Taiti. Por que não faz mal: Hortelã é livre de frutose. Limão Taiti é considerado de baixo FODMAP em pequenas quantidades.",
      imagem: "https://images.unsplash.com/photo-1556881286-fc6915169721?w=500",
      categoria: "fodmaps",
      tipo: "gelada"
    },
    { 
      nome: "Cold Brew (Café Extraído a Frio)", 
      preco: "R$ 17,90", 
      descricao: "Café puro extraído a frio. Por que não faz mal: Café naturalmente livre de frutose e carboidratos fermentáveis.",
      imagem: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=500",
      categoria: "fodmaps",
      tipo: "gelada"
    },
    { 
      nome: "Chá de Camomila", 
      preco: "R$ 9,50", 
      descricao: "Infusão de camomila. Por que não faz mal: Ervas e raízes são livres do açúcar de frutas.",
      imagem: "https://images.unsplash.com/photo-1576092768241-dec231844fcd?w=500",
      categoria: "fodmaps",
      tipo: "quente"
    },
    { 
      nome: "Chá de Gengibre", 
      preco: "R$ 9,50", 
      descricao: "Infusão de gengibre fresco. Por que não faz mal: Raiz de gengibre não contém frutose.",
      imagem: "https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=500",
      categoria: "fodmaps",
      tipo: "quente"
    },
    { 
      nome: "Café Coado Tradicional", 
      preco: "R$ 12,30", 
      descricao: "Café filtrado tradicional. Por que não faz mal: Grãos de café torrado não possuem frutose.",
      imagem: "https://images.unsplash.com/photo-1510591504541-3e45ee2de7e9?w=500",
      categoria: "fodmaps",
      tipo: "quente"
    },
    { 
      nome: "Leite Quente com Essência de Baunilha", 
      preco: "R$ 15,00", 
      descricao: "Leite com essência de baunilha. Por que não faz mal: Sem sucos ou xaropes de fruta.",
      imagem: "https://images.unsplash.com/photo-1576188976115-2f87ddaa6bd8?w=500",
      categoria: "fodmaps",
      tipo: "quente"
    },
  
    // Sem Cafeína
    { 
      nome: "Chá de Hibisco Gelado com Laranja", 
      preco: "R$ 11,90", 
      descricao: "Flor de hibisco naturalmente livre de cafeína, com suco de laranja. Por que não faz mal: A flor de hibisco é naturalmente 100% livre de cafeína.",
      imagem: "https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?w=500",
      categoria: "cafeina",
      tipo: "gelada"
    },
    { 
      nome: "Pink Lemonade", 
      preco: "R$ 12,00", 
      descricao: "Suco de limão com xarope de groselha, refrescante e sem estimulantes. Por que não faz mal: Feita com suco de limão, água, gelo e xarope de groselha, não possui estimulantes.",
      imagem: "https://images.unsplash.com/photo-1588551064541-8c61529aa6d2?w=500",
      categoria: "cafeina",
      tipo: "gelada"
    },
    { 
      nome: "Frappé de Alfarroba", 
      preco: "R$ 15,90", 
      descricao: "Substituto natural do cacau, totalmente livre de estimulantes. Por que não faz mal: A alfarroba é um substituto natural do cacau que não possui nenhum estimulante.",
      imagem: "https://images.unsplash.com/photo-1517686469744-afaf98bb5c71?w=500",
      categoria: "cafeina",
      tipo: "gelada"
    },
  
    // Sem Glúten
    { 
      nome: "Smoothie de Banana com Cacau", 
      preco: "R$ 14,90", 
      descricao: "Banana batida com cacau 100% e leite de amêndoas. Por que não faz mal: Nenhum ingrediente contém trigo ou gluten.",
      imagem: "https://images.unsplash.com/photo-1622597467836-f3824a9cd6be?w=500",
      categoria: "gluten",
      tipo: "gelada"
    },
    { 
      nome: "Chocolate Quente de Milho Roxo", 
      preco: "R$ 13,50", 
      descricao: "Cremoso chocolate feito com leite de amêndoas e amido de milho. Por que não faz mal: Sem ingredientes de trigo ou derivados.",
      imagem: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=500",
      categoria: "gluten",
      tipo: "quente"
    },
    { 
      nome: "Latte de Aveia com Canela", 
      preco: "R$ 14,00", 
      descricao: "Espresso com leite de aveia e canela polvilhada. Por que não faz mal: A aveia utilizada é certificada sem gluten.",
      imagem: "https://images.unsplash.com/photo-1579885992649-8f5da09f6257?w=500",
      categoria: "gluten",
      tipo: "quente"
    }
  ];
  
  // Dados das bebidas especiais
  const especiais = {
    classicos: [
      { nome: "Frappé de Café", preco: "R$ 16,00", descricao: "Café gelado batido com sorvete de creme.", imagem: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=500" },
      { nome: "Latte Macchiato", preco: "R$ 16,00", descricao: "Leite vaporizado manchado com espresso.", imagem: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=500" },
      { nome: "Pingado", preco: "R$ 15,00", descricao: "O clássico café com leite brasileiro.", imagem: "https://images.unsplash.com/photo-1579885992649-8f5da09f6257?w=500" }
    ],
    alcoholicos: [
      { nome: "Negroni", preco: "R$ 13,50", descricao: "Coquetel clássico com infusão de café.", imagem: "https://images.unsplash.com/photo-1546171753-97d7676e4602?w=500" },
      { nome: "White Russian", preco: "R$ 13,00", descricao: "Drink cremoso de café, vodka e creme.", imagem: "https://images.unsplash.com/photo-1542489944-6cd1dc68e22e?w=500" }
    ],
    "semcafeina-especiais": [
      { nome: "Chá de Camomila", preco: "R$ 8,00", descricao: "Chá calmante de camomila sem cafeína.", imagem: "https://images.unsplash.com/photo-1576092768241-dec231844fcd?w=500" },
      { nome: "Chocolate Branco Quente", preco: "R$ 12,00", descricao: "Chocolate branco cremoso sem cafeína.", imagem: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=500" },
      { nome: "Suco de Laranja", preco: "R$ 9,00", descricao: "Suco natural de laranja.", imagem: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500" }
    ]
  };
  
  // Estado
  let intoleranciaAtiva = 'lactose';
  let especialAtiva = 'classicos';
  
  function renderizarProdutos() {
    const geladasContainer = document.getElementById('bebidas-geladas');
    const quentesContainer = document.getElementById('bebidas-quentes');
    
    if (!geladasContainer || !quentesContainer) return;
  
    const produtosFiltrados = produtos.filter(p => p.categoria === intoleranciaAtiva);
    const geladas = produtosFiltrados.filter(p => p.tipo === 'gelada');
    const quentes = produtosFiltrados.filter(p => p.tipo === 'quente');
    
    function gerarItem(item) {
      return `
        <div class="produto-cardapio" onclick="abrirModal('${item.nome.replace(/'/g, "\\'")}', '${item.preco}', '${item.descricao.replace(/'/g, "\\'")}', '${item.imagem || ''}')">
          <strong>${item.nome}</strong>
          <span class="preco-item">${item.preco}</span>
        </div>
      `;
    }
    
    geladasContainer.innerHTML = geladas.map(gerarItem).join('');
    quentesContainer.innerHTML = quentes.map(gerarItem).join('');
  }
  
  function renderizarEspeciais() {
    const container = document.getElementById('bebidas-especiais');
    if (!container) return;
    
    const lista = especiais[especialAtiva] || [];
    container.innerHTML = lista.map(item => `
      <div class="produto-cardapio" onclick="abrirModal('${item.nome.replace(/'/g, "\\'")}', '${item.preco}', '${item.descricao.replace(/'/g, "\\'")}', '${item.imagem || ''}')">
        <strong>${item.nome}</strong>
        <span class="preco-item">${item.preco}</span>
      </div>
    `).join('');
  }
  
  // Inicialização
  document.addEventListener('DOMContentLoaded', function() {
    // Abas de intolerância
    document.querySelectorAll('.coluna-cardapio:first-child .abas .aba-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        document.querySelectorAll('.coluna-cardapio:first-child .abas .aba-btn').forEach(b => b.classList.remove('ativo'));
        this.classList.add('ativo');
        intoleranciaAtiva = this.dataset.aba;
        renderizarProdutos();
      });
    });
  
    // Abas de especiais
    document.querySelectorAll('.coluna-cardapio:last-child .abas .aba-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        document.querySelectorAll('.coluna-cardapio:last-child .abas .aba-btn').forEach(b => b.classList.remove('ativo'));
        this.classList.add('ativo');
        especialAtiva = this.dataset.aba;
        renderizarEspeciais();
      });
    });
  
    renderizarProdutos();
    renderizarEspeciais();
  });