// js/carrinho.js
import { supabase } from './supabaseClient.js';

// ---------- Identificação do usuário ----------
function getUsuarioId() {
  // Se você tiver autenticação, use supabase.auth.user() ou sessionStorage
  let id = sessionStorage.getItem('usuarioId');
  if (!id) {
    id = crypto.randomUUID(); // gera um ID único para a sessão
    sessionStorage.setItem('usuarioId', id);
  }
  return id;
}

// ---------- Buscar itens do carrinho (com JOIN na tabela produtos) ----------
export async function buscarCarrinho() {
  const usuarioId = getUsuarioId();

  // 1. Tenta buscar do Supabase
  const { data, error } = await supabase
    .from('carrinho')
    .select(`
      id,
      quantidade,
      produtos (id, nome, preço, imagem, descricão)
    `)
    .eq('usuario_id', usuarioId);

  if (error) {
    console.error('Erro ao buscar carrinho:', error);
    // Fallback: tenta pegar do localStorage
    return JSON.parse(localStorage.getItem('kffee_carrinho')) || [];
  }

  // Transforma os dados para um formato mais simples
  const itens = data.map(item => ({
    id: item.id,
    produto_id: item.produtos.id,
    nome: item.produtos.nome,
    preco: parseFloat(item.produtos.preço.replace(',', '.')), // converte "15,20" -> 15.20
    imagem: item.produtos.imagem,
    descricao: item.produtos.descricão,
    quantidade: item.quantidade
  }));

  // Atualiza cache local
  localStorage.setItem('kffee_carrinho', JSON.stringify(itens));
  return itens;
}

// ---------- Adicionar produto ao carrinho ----------
export async function adicionarAoCarrinho(produtoId) {
  // Verifica se o usuário está logado (exemplo)
  if (!sessionStorage.getItem('usuarioLogado')) {
    alert('Você precisa estar logado para adicionar ao carrinho.');
    window.location.href = 'cadastro/cadastro.html';
    return;
  }

  const usuarioId = getUsuarioId();

  // 1. Verifica se o produto já está no carrinho (busca local para agilizar)
  let carrinhoLocal = JSON.parse(localStorage.getItem('kffee_carrinho')) || [];
  const existente = carrinhoLocal.find(item => item.produto_id === produtoId);

  if (existente) {
    // Atualiza a quantidade no Supabase
    const { error } = await supabase
      .from('carrinho')
      .update({ quantidade: existente.quantidade + 1 })
      .eq('usuario_id', usuarioId)
      .eq('produto_id', produtoId);

    if (error) {
      console.error('Erro ao atualizar quantidade:', error);
      // Fallback: atualiza localmente
      existente.quantidade += 1;
      localStorage.setItem('kffee_carrinho', JSON.stringify(carrinhoLocal));
    } else {
      existente.quantidade += 1;
      localStorage.setItem('kffee_carrinho', JSON.stringify(carrinhoLocal));
    }
  } else {
    // Busca os dados do produto na tabela produtos
    const { data: produto, error: prodError } = await supabase
      .from('produtos')
      .select('id, nome, preço, imagem, descricão')
      .eq('id', produtoId)
      .single();

    if (prodError || !produto) {
      alert('Produto não encontrado.');
      return;
    }

    // Insere novo item no carrinho
    const { error } = await supabase
      .from('carrinho')
      .insert({
        usuario_id: usuarioId,
        produto_id: produtoId,
        quantidade: 1
      });

    if (error) {
      console.error('Erro ao inserir no carrinho:', error);
      // Fallback: adiciona localmente
      carrinhoLocal.push({
        produto_id: produtoId,
        nome: produto.nome,
        preco: parseFloat(produto.preço.replace(',', '.')),
        imagem: produto.imagem,
        descricao: produto.descricão,
        quantidade: 1
      });
      localStorage.setItem('kffee_carrinho', JSON.stringify(carrinhoLocal));
    } else {
      carrinhoLocal.push({
        produto_id: produtoId,
        nome: produto.nome,
        preco: parseFloat(produto.preço.replace(',', '.')),
        imagem: produto.imagem,
        descricao: produto.descricão,
        quantidade: 1
      });
      localStorage.setItem('kffee_carrinho', JSON.stringify(carrinhoLocal));
    }
  }

  atualizarContador();
  alert(`"${existente ? existente.nome : produto.nome}" adicionado ao carrinho!`);
}

// ---------- Remover item ----------
export async function removerItem(produtoId) {
  const usuarioId = getUsuarioId();

  const { error } = await supabase
    .from('carrinho')
    .delete()
    .eq('usuario_id', usuarioId)
    .eq('produto_id', produtoId);

  if (error) {
    console.error('Erro ao remover item:', error);
  }

  // Atualiza cache local
  let carrinho = JSON.parse(localStorage.getItem('kffee_carrinho')) || [];
  carrinho = carrinho.filter(item => item.produto_id !== produtoId);
  localStorage.setItem('kffee_carrinho', JSON.stringify(carrinho));

  atualizarContador();
  // Se estiver na página do carrinho, re-renderiza
  if (window.location.pathname.includes('Carrinho')) {
    renderizarCarrinho();
  }
}

// ---------- Atualizar quantidade (delta = +1 ou -1) ----------
export async function atualizarQuantidade(produtoId, delta) {
  const usuarioId = getUsuarioId();
  let carrinho = JSON.parse(localStorage.getItem('kffee_carrinho')) || [];
  const item = carrinho.find(i => i.produto_id === produtoId);
  if (!item) return;

  const novaQtd = Math.max(1, item.quantidade + delta);

  // Atualiza no Supabase
  const { error } = await supabase
    .from('carrinho')
    .update({ quantidade: novaQtd })
    .eq('usuario_id', usuarioId)
    .eq('produto_id', produtoId);

  if (error) {
    console.error('Erro ao atualizar quantidade:', error);
    item.quantidade = novaQtd;
    localStorage.setItem('kffee_carrinho', JSON.stringify(carrinho));
  } else {
    item.quantidade = novaQtd;
    localStorage.setItem('kffee_carrinho', JSON.stringify(carrinho));
  }

  atualizarContador();
  if (window.location.pathname.includes('Carrinho')) {
    renderizarCarrinho();
  }
}

// ---------- Finalizar pedido (limpar carrinho) ----------
export async function finalizarPedido() {
  const usuarioId = getUsuarioId();

  const { error } = await supabase
    .from('carrinho')
    .delete()
    .eq('usuario_id', usuarioId);

  if (error) {
    console.error('Erro ao finalizar pedido:', error);
    alert('Houve um erro ao finalizar. Tente novamente.');
    return;
  }

  // Limpa cache local
  localStorage.removeItem('kffee_carrinho');
  atualizarContador();

  // Exibe mensagem de sucesso na página
  const aviso = document.getElementById('aviso-sucesso');
  if (aviso) {
    aviso.hidden = false;
    aviso.querySelector('span:last-child').textContent = 'Pedido recebido. Seu café estará esperando por você.';
  }

  // Re-renderiza (vazio)
  renderizarCarrinho();
}

// ---------- Atualizar contador (header) ----------
function atualizarContador() {
  const carrinho = JSON.parse(localStorage.getItem('kffee_carrinho')) || [];
  const total = carrinho.reduce((acc, item) => acc + item.quantidade, 0);
  const contador = document.getElementById('contadorCarrinho');
  if (contador) {
    contador.textContent = total;
    contador.style.display = total > 0 ? 'inline-block' : 'none';
  }
}

// ---------- Renderizar carrinho na página ----------
export async function renderizarCarrinho() {
  const container = document.getElementById('lista-produtos');
  const resumo = document.getElementById('resumo-pedido');
  const botaoFinalizar = document.getElementById('botao-finalizar');
  const aviso = document.getElementById('aviso-sucesso');

  // Busca os itens (do Supabase ou cache)
  const itens = await buscarCarrinho();

  if (!itens || itens.length === 0) {
    container.innerHTML = `
      <div class="estado-vazio">
        <span class="icone-vazio">☕</span>
        <h2>Seu carrinho está vazio</h2>
        <p>Que tal escolher um café especial?</p>
        <button onclick="window.location.href='../cardapio.html'">Ver cardápio</button>
      </div>
    `;
    resumo.innerHTML = '';
    botaoFinalizar.disabled = true;
    aviso.hidden = true;
    return;
  }

  // Gera HTML dos itens
  let htmlItens = '';
  let subtotal = 0;

  itens.forEach((item, index) => {
    const totalItem = item.preco * item.quantidade;
    subtotal += totalItem;

    htmlItens += `
      <div class="item-produto" style="--atraso: ${index * 80}ms">
        <div class="foto-produto-wrap">
          <img src="${item.imagem}" alt="${item.nome}" class="foto-produto" />
        </div>
        <div class="informacoes-produto">
          <h2>${item.nome}</h2>
          <span class="selo-produto">Café especial</span>
          <p class="descricao-produto">${item.descricao || item.nome}</p>
          <p class="detalhe-produto">Preparo artesanal</p>
        </div>
        <div class="acoes-produto">
          <span class="preco-produto">R$ ${totalItem.toFixed(2)}</span>
          <div class="linha-acoes">
            <div class="controle-quantidade">
              <button onclick="window.atualizarQuantidade(${item.produto_id}, -1)">−</button>
              <span>${item.quantidade}</span>
              <button onclick="window.atualizarQuantidade(${item.produto_id}, 1)">+</button>
            </div>
            <button class="botao-remover" onclick="window.removerItem(${item.produto_id})">
              <svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>
            </button>
          </div>
        </div>
      </div>
    `;
  });

  container.innerHTML = htmlItens;

  // Resumo
  const totalGeral = subtotal;
  resumo.innerHTML = `
    <div class="linha-resumo subtotal">
      <strong>Subtotal</strong>
      <span>R$ ${subtotal.toFixed(2)}</span>
    </div>
    <div class="linha-resumo retirada">
      <span class="rotulo-retirada">📍 Retirada</span>
      <span class="endereco">Alameda Cel. Elizio Pereira, SN - Paranaguá</span>
    </div>
    <div class="linha-resumo total">
      <strong>Total</strong>
      <strong>R$ ${totalGeral.toFixed(2)}</strong>
    </div>
  `;

  botaoFinalizar.disabled = false;
  aviso.hidden = true;
  atualizarContador();
}