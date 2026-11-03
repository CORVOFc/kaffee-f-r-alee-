(function() {
    "use strict";
    const container = document.querySelector(".BarraPesquisa");
    if (!container) return;
    const input = container.querySelector(".texto");
    const botao = container.querySelector(".botao");
    if (!input || !botao) return;
    const prefixo = (() => {
        const path = window.location.pathname;
        if (path.includes("/Carrinho/") || path.includes("/Perfil/") || path.includes("/produtoCardapio/") || path.includes("/cadastro/")) {
            return "../";
        }
        return "";
    })();
    const dropdown = document.createElement("div");
    dropdown.id = "pesquisa-dropdown";
    dropdown.className = "pesquisa-dropdown";
    dropdown.hidden = true;
    const colunas = {};
    [ [ "produtos", "Cardápio" ], [ "noticias", "Jornais" ], [ "musicas", "Músicas" ] ].forEach(([tipo, titulo]) => {
        const coluna = document.createElement("section");
        coluna.className = "pesquisa-coluna";
        coluna.dataset.coluna = tipo;
        const cabecalho = document.createElement("h3");
        cabecalho.textContent = titulo;
        const lista = document.createElement("ul");
        coluna.append(cabecalho, lista);
        dropdown.appendChild(coluna);
        colunas[tipo] = lista;
    });
    container.appendChild(dropdown);
    const normalizar = valor => String(valor || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
    const limpar = () => Object.values(colunas).forEach(lista => lista.replaceChildren());
    const mensagemVazia = (lista, texto) => {
        const item = document.createElement("li");
        item.className = "pesquisa-vazio";
        item.textContent = texto;
        lista.appendChild(item);
    };
    const consultar = async promise => {
        try {
            const resposta = await promise;
            if (resposta.error) {
                console.warn("[pesquisa] Erro Supabase:", resposta.error.message);
                return [];
            }
            return resposta.data || [];
        } catch (erro) {
            console.warn("[pesquisa] Indisponível:", erro.message || erro);
            return [];
        }
    };
    async function aguardarSupabase() {
        let tentativas = 0;
        while (!window.supabaseClient && tentativas < 60) {
            await new Promise(r => setTimeout(r, 50));
            tentativas++;
        }
        return Boolean(window.supabaseClient);
    }
    async function abrirProdutoNoModal(produtoBasico) {
        console.log("[pesquisa] Clicou no produto:", produtoBasico);
        const pronto = await aguardarSupabase();
        if (!pronto) {
            console.error("[pesquisa] Supabase não disponível");
            return;
        }
        const {data: data, error: error} = await window.supabaseClient.from("produtos").select(`\n          id, nome, descricao, preco, imagem_url, disponivel, destaque, tipo,\n          categorias_cardapio (id, nome),\n          intolerancias (id, nome)\n        `).eq("id", produtoBasico.id).single();
        if (error || !data) {
            console.error("[pesquisa] Erro ao buscar produto:", error);
            return;
        }
        const produto = {
            ...data,
            caracteristicas: [],
            caracteristica_nome: null
        };
        if (typeof window.abrirModalProduto === "function") {
            window.abrirModalProduto(produto);
        } else {
            console.warn("[pesquisa] window.abrirModalProduto não está definida — usando fallback.");
            window.location.href = `${prefixo}cardapio.html?busca=${encodeURIComponent(produto.nome)}`;
        }
    }
    function renderizarProdutos(produtos) {
        const lista = colunas.produtos;
        if (!produtos || !produtos.length) {
            mensagemVazia(lista, "Nada encontrado");
            return;
        }
        produtos.slice(0, 5).forEach(item => {
            const li = document.createElement("li");
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "pesquisa-resultado";
            btn.textContent = item.nome || "Produto";
            btn.addEventListener("click", async e => {
                e.preventDefault();
                e.stopPropagation();
                dropdown.hidden = true;
                input.value = "";
                await abrirProdutoNoModal(item);
            });
            li.appendChild(btn);
            lista.appendChild(li);
        });
    }
    function renderizarLinks(tipo, dados, linkBuilder) {
        const lista = colunas[tipo];
        if (!dados || !dados.length) {
            mensagemVazia(lista, "Nada encontrado");
            return;
        }
        dados.slice(0, 5).forEach(dado => {
            const li = document.createElement("li");
            const a = document.createElement("a");
            a.href = linkBuilder(dado);
            a.textContent = dado.nome || dado.titulo || dado.artista || "Resultado";
            li.appendChild(a);
            lista.appendChild(li);
        });
    }
    async function buscar(valor) {
        const termo = normalizar(valor);
        if (termo.length < 2) {
            dropdown.hidden = true;
            return;
        }
        const pronto = await aguardarSupabase();
        if (!pronto) {
            console.error("[pesquisa] Supabase não disponível para busca");
            return;
        }
        const cliente = window.supabaseClient;
        const produtosPromise = consultar(cliente.from("produtos").select("id, nome, descricao").ilike("nome", `%${termo}%`).eq("disponivel", true).limit(5));
        const musicasPromise = consultar(cliente.from("musicas").select("id, titulo, artista").or(`titulo.ilike.%${termo}%,artista.ilike.%${termo}%`).limit(5));
        const listaJornais = Array.isArray(window.jornaisDisponiveis) ? window.jornaisDisponiveis : [];
        const noticias = listaJornais.filter(jornal => {
            const texto = normalizar(`${jornal.nome} ${jornal.categoria}`);
            return texto.includes(termo);
        });
        const [produtos, musicas] = await Promise.all([ produtosPromise, musicasPromise ]);
        console.log("[pesquisa] Resultados:", {
            produtos: produtos,
            noticias: noticias,
            musicas: musicas
        });
        limpar();
        renderizarProdutos(produtos);
        renderizarLinks("noticias", noticias, item => `${prefixo}noticias.html#/jornal/${encodeURIComponent(item.nome)}`);
        renderizarLinks("musicas", musicas, item => `${prefixo}musica.html?busca=${encodeURIComponent(item.titulo)}`);
        dropdown.hidden = false;
    }
    let temporizador = null;
    input.addEventListener("input", () => {
        window.clearTimeout(temporizador);
        temporizador = window.setTimeout(() => buscar(input.value), 250);
    });
    input.addEventListener("focus", () => {
        if (input.value.length >= 2) buscar(input.value);
    });
    botao.addEventListener("click", evento => {
        evento.preventDefault();
        input.focus();
        if (input.value.length >= 2) buscar(input.value);
    });
    document.addEventListener("click", evento => {
        if (!container.contains(evento.target)) dropdown.hidden = true;
    });
    document.addEventListener("keydown", evento => {
        if (evento.key === "Escape") {
            dropdown.hidden = true;
            input.blur();
        }
    });
    window.__pesquisaDebug = {
        buscar: buscar,
        abrirProdutoNoModal: abrirProdutoNoModal,
        dropdown: dropdown,
        jornais: () => window.jornaisDisponiveis
    };
})();
