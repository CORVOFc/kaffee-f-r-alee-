(function () {
  'use strict';

  var raiz = document.documentElement;
  var corpo = document.body;
  var mensagem = document.getElementById('mensagem-perfil');
  var modais = Array.from(document.querySelectorAll('.modal-jornal'));
  var modal = modais[0] || document.getElementById('modal-perfil');
  var formulariosPerfil = Array.from(document.querySelectorAll('[data-formulario-perfil]'));
  var botaoTema = document.getElementById('botao-tema');
  var botaoSair = document.getElementById('botao-sair');
  var mensagemTemporizador;
  var perfilArmazenado = {};

  try {
    perfilArmazenado = JSON.parse(localStorage.getItem('perfil_cafe') || '{}');
  } catch (erro) {
    perfilArmazenado = {};
  }

  function aplicarTema(tema) {
    var modoClaro = tema === 'claro';
    raiz.classList.toggle('modo-claro', modoClaro);
    if (botaoTema) {
      botaoTema.textContent = modoClaro ? 'Modo escuro' : 'Modo claro';
      botaoTema.setAttribute('aria-pressed', String(modoClaro));
    }
    try {
      localStorage.setItem('kaffe_perfil_tema', tema);
    } catch (erro) {}
  }

  function temaSalvo() {
    try {
      return localStorage.getItem('kaffe_perfil_tema') || 'escuro';
    } catch (erro) {
      return 'escuro';
    }
  }

  function mostrarMensagem(texto) {
    if (!mensagem) return;
    mensagem.textContent = texto;
    mensagem.classList.add('visivel');
    window.clearTimeout(mensagemTemporizador);
    mensagemTemporizador = window.setTimeout(function () {
      mensagem.classList.remove('visivel');
    }, 3200);
  }

  function modalPorAlvo(alvo) {
    return alvo ? document.getElementById(alvo) : modal;
  }

  function abrirModal(alvo) {
    var modalAlvo = modalPorAlvo(alvo);
    if (!modalAlvo) return;
    if (typeof modalAlvo.showModal === 'function') {
      if (!modalAlvo.open) modalAlvo.showModal();
    } else {
      modalAlvo.classList.add('aberta');
      modalAlvo.setAttribute('open', '');
    }
  }

  function fecharModal(alvo) {
    var modalAlvo = typeof alvo === 'string' ? document.getElementById(alvo) : (alvo || modal);
    if (!modalAlvo) return;
    if (typeof modalAlvo.close === 'function' && modalAlvo.open) {
      modalAlvo.close();
    } else {
      modalAlvo.classList.remove('aberta');
      modalAlvo.removeAttribute('open');
    }
  }

  function preencherPerfil(perfil) {
    if (!perfil) return;
    var nome = perfil.nome_completo || perfil.nome || perfilArmazenado.nome;
    var email = perfil.email || perfilArmazenado.email;
    var telefone = perfil.telefone || perfilArmazenado.telefone;
    var camposNome = document.querySelectorAll('[data-campo="nome"]');
    var camposEmail = document.querySelectorAll('[data-campo="email"]');
    var camposTelefone = document.querySelectorAll('[data-campo="telefone"]');
    var nomesUsuario = document.querySelectorAll('[data-nome-usuario]');

    camposNome.forEach(function (campo) { campo.value = nome || ''; });
    camposEmail.forEach(function (campo) { campo.value = email || ''; });
    camposTelefone.forEach(function (campo) { campo.value = telefone || ''; });
    nomesUsuario.forEach(function (campo) {
      campo.textContent = nome ? nome.split(' ')[0] : 'Leitor';
    });
  }

  function lerDadosFormulario(formulario) {
    return Object.fromEntries(new FormData(formulario).entries());
  }

  function salvarPerfil(formulario) {
    var dados = lerDadosFormulario(formulario);
    perfilArmazenado = Object.assign({}, perfilArmazenado, dados);
    try {
      localStorage.setItem('perfil_cafe', JSON.stringify(perfilArmazenado));
    } catch (erro) {}
    preencherPerfil(perfilArmazenado);
    fecharModal(formulario.closest('.modal-jornal')?.id);
    mostrarMensagem('Perfil atualizado.');
  }

  function obterIdentificadorUsuario() {
    if (window.perfilAutenticado && window.perfilAutenticado.usuario_auth_id) {
      return window.perfilAutenticado.usuario_auth_id;
    }
    try {
      return sessionStorage.getItem('usuarioId') || window.crypto.randomUUID();
    } catch (erro) {
      return 'visitante-local';
    }
  }

  function adicionarAoCarrinho(botao) {
    var produto = {
      produto_id: botao.dataset.produtoIdentificador,
      nome: botao.dataset.produtoNome,
      preco: botao.dataset.produtoPreco,
      imagem: botao.dataset.produtoImagem || '',
      tipo: botao.dataset.produtoTipo || 'Café',
      quantidade: 1,
      usuario_id: obterIdentificadorUsuario()
    };
    var carrinho = [];
    try {
      carrinho = JSON.parse(localStorage.getItem('carrinho_local') || '[]');
    } catch (erro) {
      carrinho = [];
    }
    var existente = carrinho.find(function (item) {
      return item.produto_id === produto.produto_id && item.usuario_id === produto.usuario_id;
    });
    if (existente) {
      existente.quantidade += 1;
    } else {
      carrinho.push(produto);
    }
    try {
      localStorage.setItem('carrinho_local', JSON.stringify(carrinho));
    } catch (erro) {}
    mostrarMensagem(produto.nome + ' foi adicionado ao carrinho.');
  }

  function alternarDetalhes(botao) {
    var alvo = document.getElementById(botao.dataset.alvo);
    if (!alvo) return;
    var estaAberto = !alvo.classList.contains('oculto');
    alvo.classList.toggle('oculto', estaAberto);
    botao.textContent = estaAberto ? 'Fechar detalhes' : 'Ver detalhes';
    botao.setAttribute('aria-expanded', String(!estaAberto));
  }

  function atualizarContadorCarrinho() {
    var contador = document.getElementById('contador-carrinho');
    var carrinho = [];
    try {
      carrinho = JSON.parse(localStorage.getItem('carrinho_local') || '[]');
    } catch (erro) {}
    var total = carrinho.reduce(function (soma, item) {
      return soma + Number(item.quantidade || 0);
    }, 0);
    if (contador) contador.textContent = String(total);
  }

  function cicloStatus(botao) {
    var status = ['Preparando', 'Pronto', 'Retirado'];
    var atual = status.indexOf(botao.dataset.statusAtual);
    var proximo = status[(atual + 1) % status.length];
    botao.dataset.statusAtual = proximo;
    botao.textContent = proximo;
    botao.classList.remove('tag-aberta', 'tag-atencao', 'tag-erro');
    if (proximo === 'Preparando') botao.classList.add('tag-atencao');
    if (proximo === 'Pronto') botao.classList.add('tag-aberta');
    if (proximo === 'Retirado') botao.classList.add('tag-ok');
    mostrarMensagem('Status do pedido atualizado para ' + proximo + '.');
  }

  function filtrarPedidos(campo) {
    var termo = campo.value.trim().toLocaleLowerCase('pt-BR');
    document.querySelectorAll('[data-linha-pedido]').forEach(function (linha) {
      var visivel = linha.textContent.toLocaleLowerCase('pt-BR').indexOf(termo) !== -1;
      linha.classList.toggle('oculto', !visivel);
    });
    var visiveis = document.querySelectorAll('[data-linha-pedido]:not(.oculto)').length;
    var resultado = document.getElementById('resultado-pedidos');
    if (resultado) resultado.textContent = visiveis + ' pedido(s) encontrado(s).';
  }

  function salvarProduto(formulario) {
    var dados = lerDadosFormulario(formulario);
    var produtos = [];
    try {
      produtos = JSON.parse(localStorage.getItem('produtos_gestor') || '[]');
    } catch (erro) {}
    produtos.push({
      nome: dados.nome_produto,
      categoria: dados.categoria_produto,
      preco: dados.preco_produto,
      estoque: Number(dados.estoque_produto || 0)
    });
    try {
      localStorage.setItem('produtos_gestor', JSON.stringify(produtos));
    } catch (erro) {}
    fecharModal(formulario.closest('.modal-jornal')?.id);
    mostrarMensagem('Produto registrado na edição local.');
    renderizarProdutosGestor();
  }

  function renderizarProdutosGestor() {
    var lista = document.getElementById('lista-produtos-gestor');
    if (!lista) return;
    var produtos = [];
    try {
      produtos = JSON.parse(localStorage.getItem('produtos_gestor') || '[]');
    } catch (erro) {}
    if (!produtos.length) {
      lista.innerHTML = '<div class="estado-vazio">Nenhum produto local registrado.</div>';
      return;
    }
    lista.innerHTML = produtos.map(function (produto) {
      return '<div class="item-jornal"><div class="item-conteudo"><strong class="item-titulo">' + produto.nome + '</strong><span class="item-detalhe">' + produto.categoria + ' · ' + produto.estoque + ' unidades</span></div><span class="tag-jornal tag-aberta">Ativo</span></div>';
    }).join('');
  }

  function alternarUnidade(botao) {
    var aberto = botao.getAttribute('aria-pressed') !== 'true';
    botao.setAttribute('aria-pressed', String(aberto));
    botao.textContent = aberto ? 'Fechar unidade' : 'Abrir unidade';
    var status = document.getElementById('status-unidade');
    var texto = document.getElementById('texto-unidade');
    if (status) {
      status.textContent = aberto ? 'Aberta' : 'Fechada';
      status.classList.toggle('tag-aberta', aberto);
      status.classList.toggle('tag-erro', !aberto);
    }
    if (texto) texto.textContent = aberto ? 'A operação está recebendo pedidos.' : 'A unidade não está recebendo pedidos.';
    mostrarMensagem(aberto ? 'Unidade aberta.' : 'Unidade fechada.');
  }

  function baixarRelatorio() {
    var pedidos = Array.from(document.querySelectorAll('[data-linha-pedido]')).filter(function (linha) {
      return !linha.classList.contains('oculto');
    });
    var linhas = [['Pedido', 'Cliente', 'Itens', 'Status']];
    pedidos.forEach(function (linha) {
      var celulas = Array.from(linha.querySelectorAll('td')).map(function (celula) {
        return celula.textContent.trim().replace(/"/g, '""');
      });
      linhas.push(celulas);
    });
    var conteudo = linhas.map(function (linha) { return linha.map(function (celula) { return '"' + celula + '"'; }).join(','); }).join('\n');
    var blob = new Blob(['\ufeff' + conteudo], { type: 'text/csv;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    link.download = 'relatorio-pedidos.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    mostrarMensagem('Relatório CSV baixado.');
  }

  function alternarServico(botao) {
    var ativo = botao.getAttribute('aria-pressed') !== 'true';
    botao.setAttribute('aria-pressed', String(ativo));
    var status = botao.parentElement.querySelector('[data-status-servico]');
    if (status) status.textContent = ativo ? 'Ativo' : 'Pausado';
    mostrarMensagem(ativo ? 'Serviço ativado.' : 'Serviço pausado.');
  }

  function salvarRegistro(formulario) {
    var dados = lerDadosFormulario(formulario);
    var registros = [];
    try {
      registros = JSON.parse(localStorage.getItem('registros_desenvolvedor') || '[]');
    } catch (erro) {}
    registros.unshift({
      titulo: dados.titulo_registro,
      detalhe: dados.detalhe_registro || 'Registro técnico',
      hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    });
    try {
      localStorage.setItem('registros_desenvolvedor', JSON.stringify(registros));
    } catch (erro) {}
    formulario.reset();
    fecharModal(formulario.closest('.modal-jornal')?.id);
    renderizarRegistros();
    mostrarMensagem('Registro adicionado ao diário técnico.');
  }

  function renderizarRegistros() {
    var lista = document.getElementById('lista-registros');
    if (!lista) return;
    var registros = [];
    try {
      registros = JSON.parse(localStorage.getItem('registros_desenvolvedor') || '[]');
    } catch (erro) {}
    if (!registros.length) {
      lista.innerHTML = '<div class="estado-vazio">Nenhum registro local. Use o formulário para criar uma entrada.</div>';
      return;
    }
    lista.innerHTML = registros.map(function (registro) {
      return '<div class="registro-jornal"><span class="registro-hora">' + registro.hora + '</span><div class="item-conteudo"><strong class="registro-evento-conteudo">' + registro.titulo + '</strong><span class="registro-evento-detalhe">' + registro.detalhe + '</span></div><span class="tag-jornal tag-ok">Registrado</span></div>';
    }).join('');
  }

  function limparRegistros() {
    try {
      localStorage.removeItem('registros_desenvolvedor');
    } catch (erro) {}
    renderizarRegistros();
    mostrarMensagem('Registros locais limpos.');
  }

  function copiarTexto(botao) {
    var texto = botao.dataset.copiar || '';
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(texto).then(function () {
        mostrarMensagem('Texto copiado.');
      }, function () {
        mostrarMensagem('Não foi possível copiar o texto.');
      });
    } else {
      mostrarMensagem('Copiar não está disponível neste navegador.');
    }
  }

  function sair() {
    if (window.supabaseClient && window.supabaseClient.auth && window.supabaseClient.auth.signOut) {
      window.supabaseClient.auth.signOut().then(function () {
        window.location.href = '../cadastro/login.html';
      });
    } else {
      window.location.href = '../cadastro/login.html';
    }
  }

  document.addEventListener('click', function (evento) {
    var botaoAbrir = evento.target.closest('[data-abrir-modal]');
    if (botaoAbrir) {
      evento.preventDefault();
      abrirModal(botaoAbrir.dataset.modalAlvo);
      return;
    }

    var botaoFechar = evento.target.closest('[data-fechar-modal]');
    if (botaoFechar) {
      fecharModal(botaoFechar.closest('.modal-jornal')?.id);
      return;
    }

    var botao = evento.target.closest('[data-acao]');
    if (!botao) return;
    var acao = botao.dataset.acao;

    if (acao === 'alternar-tema') {
      aplicarTema(raiz.classList.contains('modo-claro') ? 'escuro' : 'claro');
    }
    if (acao === 'abrir-perfil') abrirModal('modal-perfil');
    if (acao === 'sair') sair();
    if (acao === 'ver-detalhes') alternarDetalhes(botao);
    if (acao === 'adicionar-ao-carrinho') {
      adicionarAoCarrinho(botao);
      atualizarContadorCarrinho();
    }
    if (acao === 'atualizar-status') cicloStatus(botao);
    if (acao === 'alternar-unidade') alternarUnidade(botao);
    if (acao === 'baixar-relatorio') baixarRelatorio();
    if (acao === 'alternar-servico') alternarServico(botao);
    if (acao === 'limpar-registros') limparRegistros();
    if (acao === 'copiar-texto') copiarTexto(botao);
  });

  document.addEventListener('input', function (evento) {
    if (evento.target.matches('[data-filtro-pedidos]')) filtrarPedidos(evento.target);
  });

  document.addEventListener('submit', function (evento) {
    var formulario = evento.target;
    if (formulariosPerfil.includes(formulario)) {
      evento.preventDefault();
      salvarPerfil(formulario);
      return;
    }
    if (formulario.matches('[data-formulario-produto]')) {
      evento.preventDefault();
      salvarProduto(formulario);
      return;
    }
    if (formulario.matches('[data-formulario-registro]')) {
      evento.preventDefault();
      salvarRegistro(formulario);
      return;
    }
  });

  modais.forEach(function (modalAtual) {
    modalAtual.addEventListener('click', function (evento) {
      if (evento.target === modalAtual) fecharModal(modalAtual.id);
    });
    modalAtual.addEventListener('close', function () {
      modalAtual.classList.remove('aberta');
    });
  });

  

  document.addEventListener('perfil-autenticado', function (evento) {
    preencherPerfil(evento.detail);
  });

  aplicarTema(temaSalvo());
  preencherPerfil(perfilArmazenado);
  atualizarContadorCarrinho();
  renderizarProdutosGestor();
  renderizarRegistros();
})();
