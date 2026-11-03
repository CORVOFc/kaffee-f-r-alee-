(function() {
    "use strict";
  
    // =============================================================
    // 1. ESTADO E DADOS DO PEDIDO
    // =============================================================
    const estado = {
      etapa: 1,
      retirada: "loja", // "loja" ou "endereco"
      pagamento: "online", // "online" ou "entrega"
      pagamentoOnline: "pix",
      pagamentoEntrega: "dinheiro",
      cliente: { nome: "", telefone: "" },
      endereco: { bairro: "", numero: "", rua: "", complemento: "" },
      itens: [] // Será preenchido com o carrinho real
    };
  
    let progressoContainer = null;
    let conteudoContainer = null;
    let sessaoAtual = null;
  
    // =============================================================
    // 2. FUNÇÕES AUXILIARES (Criação de elementos)
    // =============================================================
    function el(tag, classes = "", texto = null, atributos = {}) {
      const elemento = document.createElement(tag);
      if (classes) elemento.className = classes;
      if (texto !== null) elemento.textContent = texto;
      for (const [chave, valor] of Object.entries(atributos)) {
        if (chave === "dataset") {
          for (const [dataChave, dataValor] of Object.entries(valor)) elemento.dataset[dataChave] = dataValor;
        } else {
          elemento.setAttribute(chave, valor);
        }
      }
      return elemento;
    }
  
    function formatarMoeda(valor) {
      return Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    }

      // Função que aplica o erro visual
    function validarCampo(idCampo, valor) {
        const wrapper = document.querySelector(`[data-campo-wrapper="${idCampo}"]`);
        const mensagemErro = document.getElementById(`erro-${idCampo}`);
        
        if (!valor || !valor.trim()) {
        // Se estiver vazio, aplica a classe de erro e mostra a mensagem
        if (wrapper) wrapper.classList.add("erro-campo");
        if (mensagemErro) mensagemErro.textContent = "Preencha este campo";
        return false;
        } else {
        // Se estiver preenchido, remove o erro
        if (wrapper) wrapper.classList.remove("erro-campo");
        if (mensagemErro) mensagemErro.textContent = "";
        return true;
        }
    }
  
    function svgEl(tag, atributos = {}) {
      const elemento = document.createElementNS("http://www.w3.org/2000/svg", tag);
      for (const [chave, valor] of Object.entries(atributos)) elemento.setAttribute(chave, valor);
      return elemento;
    }
  
    function iconeUsuario() {
      const svg = svgEl("svg", { viewBox: "0 0 24 24", class: "icone-svg", width: "24", height: "24", fill: "none", stroke: "currentColor", "stroke-width": "1.7" });
      svg.append(svgEl("circle", { cx: "12", cy: "8", r: "4" }), svgEl("path", { d: "M4.5 21c.7-4.2 3.4-6.3 7.5-6.3S18.8 16.8 19.5 21" }));
      return svg;
    }
  
    function iconeTelefone() {
      const svg = svgEl("svg", { viewBox: "0 0 24 24", class: "icone-svg", width: "24", height: "24", fill: "none", stroke: "currentColor", "stroke-width": "1.7" });
      svg.append(svgEl("path", { d: "M7 3.5 4.8 5.3c-1 1 1.4 6.1 5.4 10.1s9.1 6.4 10.1 5.4l1.8-2.2-4-3.2-2.4 2c-1.6-.8-3.1-2-4.5-3.4s-2.6-2.9-3.4-4.5l2-2.4z" }));
      return svg;
    }
  
    function iconeSeta() {
      const svg = svgEl("svg", { viewBox: "0 0 24 24", class: "seta", width: "31", height: "31", fill: "none", stroke: "currentColor", "stroke-width": "2.3" });
      svg.append(svgEl("path", { d: "m5 8 7 7 7-7" }));
      return svg;
    }
  
    function iconeXicara() {
      const svg = svgEl("svg", { viewBox: "0 0 64 64", class: "icone-xicara", width: "48", height: "48" });
      const g = svgEl("g", { fill: "none", stroke: "#faeac7", "stroke-width": "2" });
      g.append(
        svgEl("path", { d: "M18 32h28c0 11-5 17-14 17s-14-6-14-17Z" }),
        svgEl("path", { d: "M46 35h5c4 0 4 9-5 9" }),
        svgEl("path", { d: "M14 52h36" }),
        svgEl("path", { d: "M25 27c-4-4 4-7 0-12M33 27c-4-4 4-7 0-13M40 27c-4-3 3-6 0-10" })
      );
      svg.append(g);
      return svg;
    }
  
    function criarIlustracaoCafe(numero) {
      const id = `fundo-cafe-${numero}`;
      const svg = svgEl("svg", { viewBox: "0 0 124 80", width: "124", height: "80" });
      const defs = svgEl("defs");
      const grad = svgEl("radialGradient", { id: id, cx: "30%", cy: "18%" });
      grad.append(svgEl("stop", { "stop-color": "#dca66d" }), svgEl("stop", { offset: "1", "stop-color": "#54331f" }));
      defs.append(grad);
      svg.append(
        defs,
        svgEl("rect", { width: "124", height: "80", fill: `url(#${id})` }),
        svgEl("ellipse", { cx: "60", cy: "61", rx: "36", ry: "8", fill: "#2d1b12", opacity: ".55" }),
        svgEl("ellipse", { cx: "58", cy: "48", rx: "26", ry: "13", fill: "#e6d6bd" }),
        svgEl("path", { d: "M34 39c0 19 48 19 48 0", fill: "#f4e9d0" }),
        svgEl("ellipse", { cx: "58", cy: "39", rx: "24", ry: "10", fill: "#6a321b" }),
        svgEl("ellipse", { cx: "58", cy: "39", rx: "19", ry: "7", fill: "#b16c37" }),
        svgEl("path", { d: "M44 39c8-7 19-7 28 0-8 4-19 4-28 0Z", fill: "#f8e9c4" }),
        svgEl("path", { d: "M83 40c15-5 15 18 0 13", fill: "none", stroke: "#f4e9d0", "stroke-width": "5" })
      );
      return svg;
    }
  
    function criarBotaoContinuar(rotulo = "Continuar") {
      const btn = el("button", "botao-continuar", null, { type: "button", "data-acao": "avancar" });
      btn.append(iconeXicara(), el("span", "", rotulo));
      return btn;
    }
  
    function criarCampo(rotuloTexto, chave, valor, tipoIcone = "", inputMode = "", obrigatorio = true) {
        const container = el("div", "campo");
        container.append(el("label", "", rotuloTexto, { for: chave }));
        
        const atributosInput = { id: chave, "data-campo": chave, value: valor };
        if (obrigatorio) atributosInput.required = "required";
        if (inputMode) atributosInput.inputmode = inputMode;
    
        const input = el("input", "", null, atributosInput);
    
        if (tipoIcone) {
          const divIcone = el("div", "entrada-com-icone", null, { "data-campo-wrapper": chave });
          divIcone.append(tipoIcone === "usuario" ? iconeUsuario() : iconeTelefone(), input);
          container.append(divIcone);
        } else {
          input.setAttribute("data-campo-wrapper", chave);
          container.append(input);
        }
        
        // Adiciona o container para a mensagem de erro
        container.append(el("span", "mensagem-erro", "", { id: `erro-${chave}` }));
        
        return container;
      }
  
    function criarSeletor(tipo, valorAtual, opcao1, opcao2, val1, val2) {
      const estaAtivoVal1 = valorAtual === val1;
      const textoAtual = estaAtivoVal1 ? opcao1 : opcao2;
      const proximoValor = estaAtivoVal1 ? val2 : val1;
      const proximoTexto = estaAtivoVal1 ? opcao2 : opcao1;
  
      const container = el("div", "seletor", null, { "data-seletor": tipo });
      const btnSeletor = el("button", "botao-seletor", null, { type: "button", "data-acao": "abrir-seletor", "data-seletor": tipo });
      btnSeletor.append(el("span", "", textoAtual), iconeSeta());
  
      const divOpcoes = el("div", "opcoes-seletor", null, { hidden: "hidden" });
      const btnOpcao = el("button", "", proximoTexto, { type: "button", "data-acao": "escolher", "data-tipo": tipo, "data-valor": proximoValor });
      divOpcoes.append(btnOpcao);
  
      container.append(btnSeletor, divOpcoes);
      return container;
    }
  
    // =============================================================
    // 3. CÁLCULOS REAIS (Baseados no carrinho)
    // =============================================================
    function totalItens() {
      return estado.itens.reduce((soma, item) => soma + (Number(item.preco) * item.quantidade), 0);
    }
  
    function taxaEntrega() {
      return estado.retirada === "endereco" ? 3 : 0;
    }
  
    function totalPedido() {
      return totalItens() + taxaEntrega();
    }
  
    // =============================================================
    // 4. RENDERIZAÇÃO DAS ETAPAS
    // =============================================================
    function desenharProgresso() {
      progressoContainer.replaceChildren();
      for (let numero = 1; numero <= 4; numero += 1) {
        const grupo = el("div", "grupo-etapa");
        const classes = numero < estado.etapa ? "numero-etapa concluida" : numero === estado.etapa ? "numero-etapa atual" : "numero-etapa";
        const rotulo = numero < estado.etapa ? "✓" : String(numero);
        const desabilitado = numero > estado.etapa ? "disabled" : null;
        
        const btn = el("button", classes, rotulo, { type: "button", "data-etapa": numero, "aria-label": `Etapa ${numero}`, ...(desabilitado && { disabled: "disabled" }) });
        
        grupo.append(btn);
        if (numero < 4) grupo.append(el("span", "linha-etapa"));
        progressoContainer.append(grupo);
      }
    }
  
    function desenharEtapaCliente() {
      const form = el("form", "etapa etapa-cliente", null, { "data-formulario": "cliente" });
      form.append(
        criarCampo("Nome completo", "nome", estado.cliente.nome, "usuario"),
        criarCampo("Número para contato", "telefone", estado.cliente.telefone, "telefone", "tel"),
        criarBotaoContinuar()
      );
      return form;
    }
  
    function desenharEtapaRetirada() {
        const secao = el("section", "etapa etapa-retirada");
        secao.append(el("h1", "titulo", "Local de retirada"));
        secao.append(criarSeletor("retirada", estado.retirada, "Retirada no estabelecimento", "Definir local de retirada", "loja", "endereco"));
    
        if (estado.retirada === "loja") {
          secao.append(el("p", "endereco-fixo", "Alameda Cel. Eizío Pereira, S/N - 0 - Estradinha, Paranaguá"));
        } else {
          const grade = el("div", "grade-endereco");
          grade.append(
            criarCampo("Bairro", "bairro", estado.endereco.bairro, "", "", true),
            criarCampo("Nº da casa", "numero", estado.endereco.numero, "", "numeric", true),
            criarCampo("Rua", "rua", estado.endereco.rua, "", "", true),
            criarCampo("Complemento", "complemento", estado.endereco.complemento, "", "", false) // Complemento NÃO é obrigatório
          );
          secao.append(grade);
        }
    
        // ... resto do código (resumo, etc) permanece igual
        const resumo = el("div", "resumo-detalhe");
        const tempoDiv = el("div");
        const tempoStrong = el("strong", "", "35 ");
        tempoStrong.append(el("span", "", "minutos"));
        tempoDiv.append(el("p", "", "Tempo estimado"), tempoStrong);
        resumo.append(tempoDiv);
    
        if (estado.retirada !== "loja") {
          const taxaDiv = el("div");
          taxaDiv.append(el("p", "", "Taxa"), el("strong", "", formatarMoeda(3)));
          resumo.append(taxaDiv);
        }
    
        secao.append(resumo, criarBotaoContinuar());
        return secao;
      }
  
    function criarBotaoPagamento(tipo, valor, rotulo, valorAtivo, classeExtra = "") {
      const classes = `opcao-pagamento ${valor === valorAtivo ? "ativa" : ""} ${classeExtra}`.trim();
      return el("button", classes, rotulo, { type: "button", "data-acao": "pagamento", "data-tipo": tipo, "data-valor": valor });
    }
  
    function desenharEtapaPagamento() {
      const secao = el("section", "etapa etapa-pagamento");
      secao.append(el("h1", "titulo", "Método de pagamento"));
      secao.append(criarSeletor("pagamento", estado.pagamento, "Pagamento online", "Pagamento na entrega", "online", "entrega"));
  
      const divOpcoes = el("div", estado.pagamento === "online" ? "opcoes-pagamento online" : "opcoes-pagamento");
      
      if (estado.pagamento === "online") {
        divOpcoes.append(
          criarBotaoPagamento("online", "pix", "Pix", estado.pagamentoOnline),
          criarBotaoPagamento("online", "google", "Google Pay", estado.pagamentoOnline, "google"),
          criarBotaoPagamento("online", "cartao", "Cartão de crédito/débito", estado.pagamentoOnline)
        );
      } else {
        divOpcoes.append(
          criarBotaoPagamento("entrega", "dinheiro", "Dinheiro", estado.pagamentoEntrega),
          criarBotaoPagamento("entrega", "cartao", "Cartão de crédito/débito", estado.pagamentoEntrega)
        );
      }
      secao.append(divOpcoes);
  
      const resumo = el("div", "resumo-detalhe resumo-pagamento");
      const divTotal = el("div");
      divTotal.append(el("p", "", "Total a pagar"), el("strong", "", formatarMoeda(totalPedido())));
      resumo.append(divTotal);
  
      secao.append(resumo, criarBotaoContinuar());
      return secao;
    }
  
    function criarItem(produto, indice) {
        const quantidade = produto.quantidade;
        if (quantidade === 0) return null;
    
        const article = el("article", "item-pedido");
        
        // ---- INÍCIO DA ALTERAÇÃO: Puxando a imagem real do produto ----
        const divIlustra = el("div", "produto-ilustracao");
        const img = el("img", "imagem-produto-checkout");
        
        // Verifica se a imagem é um link válido, senão usa uma imagem padrão da cafeteria
        if (produto.imagem && produto.imagem.startsWith("http")) {
          img.src = produto.imagem;
        } else {
          img.src = "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500"; 
        }
        
        img.alt = produto.nome || "Produto";
        divIlustra.append(img);
        // ---- FIM DA ALTERAÇÃO ----
    
        const divTexto = el("div", "texto-item");
        divTexto.append(
          el("h2", "", produto.nome),
          el("span", "selo", produto.tipo || "Regular"),
          el("p", "", produto.descricao || "")
        );
    
        const divControle = el("div", "controle-item");
        divControle.append(el("strong", "", formatarMoeda(produto.preco * quantidade)));
        
        const linhaQtd = el("div", "linha-quantidade");
        const divQtd = el("div", "quantidade");
        
        const btnMenos = el("button", "", "−", { type: "button", "data-acao": "quantidade", "data-indice": indice, "data-mudanca": "-1", "aria-label": "Diminuir quantidade" });
        const spanQtd = el("span", "", String(quantidade));
        const btnMais = el("button", "", "+", { type: "button", "data-acao": "quantidade", "data-indice": indice, "data-mudanca": "1", "aria-label": "Aumentar quantidade" });
        divQtd.append(btnMenos, spanQtd, btnMais);
    
        const btnRemover = el("button", "remover-item", "♧", { type: "button", "data-acao": "remover", "data-indice": indice, "aria-label": "Remover item" });
        
        linhaQtd.append(divQtd, btnRemover);
        divControle.append(linhaQtd);
        
        article.append(divIlustra, divTexto, divControle);
    
        return article;
      }
  
    function desenharEtapaRevisao() {
      const secao = el("section", "etapa etapa-revisao");
      const lista = el("div", "lista-itens");
      
      estado.itens.forEach((produto, indice) => {
        const item = criarItem(produto, indice);
        if (item) lista.append(item);
      });
      secao.append(lista);
  
      const localTexto = estado.retirada === "loja"
        ? "Alameda Cel. Eizío Pereira, S/N - 0 - Estradinha, Paranaguá"
        : `${estado.endereco.rua || "Endereço"}, ${estado.endereco.numero || "S/N"}`;
  
      const caixaTotal = el("div", "caixa-total");
      
      const linhaSub = el("div", "linha-pedido");
      linhaSub.append(el("span", "", "Subtotal"), el("strong", "", formatarMoeda(totalItens())));
      
      const linhaLocal = el("div", "linha-pedido linha-local");
      linhaLocal.append(el("span", "", "Local de retirada ⌖"), el("p", "", localTexto));
      
      const linhaTotal = el("div", "linha-pedido linha-total");
      linhaTotal.append(el("span", "", "Total"), el("strong", "", formatarMoeda(totalPedido())));
  
      caixaTotal.append(linhaSub, linhaLocal, linhaTotal);
      secao.append(caixaTotal, criarBotaoContinuar("Finalizar pedido"));
      
      return secao;
    }
  
    function renderizar() {
      desenharProgresso();
      conteudoContainer.replaceChildren();
  
      const etapas = {
        1: desenharEtapaCliente,
        2: desenharEtapaRetirada,
        3: desenharEtapaPagamento,
        4: desenharEtapaRevisao
      };
  
      conteudoContainer.append(etapas[estado.etapa]());
    }
  
    // =============================================================
    // 5. FINALIZAÇÃO NO SUPABASE
    // =============================================================
    async function finalizarPedido() {
      if (!sessaoAtual || !sessaoAtual.user) {
        alert("Sessão expirada. Faça login novamente.");
        window.location.href = "../login.html";
        return;
      }
  
      if (estado.itens.length === 0) {
        alert("Seu carrinho está vazio.");
        return;
      }
  
      const botaoFinalizar = document.querySelector("[data-acao='avancar']");
      if (botaoFinalizar) {
        botaoFinalizar.disabled = true;
        botaoFinalizar.querySelector("span").textContent = "Processando...";
      }
  
      try {
        const cafeteriaId = await window.obterCafeteriaPadrao();
        
        const rotulosPagamento = { pix: "PIX", google: "Google Pay", cartao: "Cartão", dinheiro: "Dinheiro" };
        const pagamentoEscolhido = estado.pagamento === "online" ? rotulosPagamento[estado.pagamentoOnline] : rotulosPagamento[estado.pagamentoEntrega];
        
        const observacoes = `Cliente: ${estado.cliente.nome} | Tel: ${estado.cliente.telefone} | Pagamento: ${pagamentoEscolhido}`;
        
        const payloadItens = estado.itens.map(i => ({
          produto_id: i.produto_id,
          quantidade: i.quantidade,
          observacoes: i.observacoes || ""
        }));
  
        // Chama a função do seu supabaseConfig.js
        const pedidoId = await window.criarPedidoSeguro(
          cafeteriaId, 
          estado.retirada === "loja" ? "retirada_na_loja" : "entrega", 
          null, 
          observacoes, 
          payloadItens
        );
  
        // Limpa o carrinho do usuário
        window.carrinhoStore.salvarCarrinho(sessaoAtual.user.id, []);
        
        alert("Pedido finalizado com sucesso!");
        window.location.href = `../cliente.html?pedido=${encodeURIComponent(pedidoId)}`;
  
      } catch (erro) {
        console.error("Erro ao finalizar:", erro);
        alert("Não foi possível finalizar: " + (erro.message || "tente novamente."));
        if (botaoFinalizar) {
          botaoFinalizar.disabled = false;
          botaoFinalizar.querySelector("span").textContent = "Finalizar pedido";
        }
      }
    }
  
    // =============================================================
    // 6. EVENTOS DO USUÁRIO
    // =============================================================
    function configurarEventos() {
        document.addEventListener("input", evento => {
            const campoEditado = evento.target.dataset.campo;
            if (!campoEditado) return;
      
            // Limpa o erro enquanto o usuário digita
            validarCampo(campoEditado, evento.target.value);
      
            if (campoEditado === "nome" || campoEditado === "telefone") {
              estado.cliente[campoEditado] = evento.target.value;
            } else {
              estado.endereco[campoEditado] = evento.target.value;
            }
          });
    
        // Previne o envio do form padrão da Etapa 1
        document.addEventListener("submit", evento => {
            if (!evento.target.matches("[data-formulario='cliente']")) return;
            evento.preventDefault();
            
            const nomeValido = validarCampo("nome", estado.cliente.nome);
            const telefoneValido = validarCampo("telefone", estado.cliente.telefone);
      
            if (nomeValido && telefoneValido) {
              estado.etapa = 2;
              renderizar();
            }
          });
    
        document.addEventListener("click", evento => {
          const botao = evento.target.closest("button");
          if (!botao || botao.disabled) return;
    
          if (botao.dataset.etapa) {
            estado.etapa = Number(botao.dataset.etapa);
            renderizar();
            return;
          }
    
          const acao = botao.dataset.acao;
    
          if (acao === "avancar") {
            // Se estiver na Etapa 2 e for entrega, valida os campos
            if (estado.etapa === 2 && estado.retirada === "endereco") {
              const bairroValido = validarCampo("bairro", estado.endereco.bairro);
              const numeroValido = validarCampo("numero", estado.endereco.numero);
              const ruaValido = validarCampo("rua", estado.endereco.rua);
    
              if (!bairroValido || !numeroValido || !ruaValido) {
                return; // Impede de avançar se algum estiver vazio
              }
            }
    
            if (estado.etapa === 4) {
              finalizarPedido();
              return;
            }
            estado.etapa += 1;
            renderizar();
            return;
          }
    
          // ... resto do código (seletor, pagamento, quantidade, remover) permanece igual
          if (acao === "abrir-seletor") {
            const seletorAtual = document.querySelector(`[data-seletor="${botao.dataset.seletor}"]`);
            const opcoes = seletorAtual.querySelector(".opcoes-seletor");
            const estaAberto = seletorAtual.classList.toggle("aberto");
            opcoes.hidden = !estaAberto;
            return;
          }
    
          if (acao === "escolher") {
            estado[botao.dataset.tipo] = botao.dataset.valor;
            renderizar();
            return;
          }
    
          if (acao === "pagamento") {
            if (botao.dataset.tipo === "online") {
              estado.pagamentoOnline = botao.dataset.valor;
            } else {
              estado.pagamentoEntrega = botao.dataset.valor;
            }
            renderizar();
            return;
          }
    
          if (acao === "quantidade") {
            const indice = Number(botao.dataset.indice);
            const mudanca = Number(botao.dataset.mudanca);
            estado.itens[indice].quantidade = Math.max(1, estado.itens[indice].quantidade + mudanca);
            window.carrinhoStore.salvarCarrinho(sessaoAtual.user.id, estado.itens);
            renderizar();
            return;
          }
    
          if (acao === "remover") {
            const indice = Number(botao.dataset.indice);
            estado.itens.splice(indice, 1);
            window.carrinhoStore.salvarCarrinho(sessaoAtual.user.id, estado.itens);
            renderizar();
          }
        });
      }
  
    // =============================================================
    // 7. INICIALIZAÇÃO
    // =============================================================
    document.addEventListener("DOMContentLoaded", () => {
      progressoContainer = document.getElementById("progresso");
      conteudoContainer = document.getElementById("conteudo");
      
      window.addEventListener("app:ready", (evento) => {
        sessaoAtual = evento.detail;
        
        if (!sessaoAtual) {
          window.location.href = "../login.html";
          return;
        }
  
        // Puxa nome e telefone do perfil logado
        if (sessaoAtual.perfil) {
          estado.cliente.nome = sessaoAtual.perfil.nome_completo || "";
          estado.cliente.telefone = sessaoAtual.perfil.telefone || "";
        }
  
        // PUXA OS ITENS REAIS DO CARRINHO
        if (window.carrinhoStore) {
          estado.itens = window.carrinhoStore.lerCarrinho(sessaoAtual.user.id);
        }
  
        // Se o carrinho estiver vazio, volta para a tela anterior
        if (estado.itens.length === 0) {
          alert("Seu carrinho está vazio. Adicione produtos antes de continuar.");
          window.location.href = "carrinho.html";
          return;
        }
  
        configurarEventos();
        renderizar();
      });
    });
  
  })();