(function() {
    "use strict";
    const SUPABASE_URL = "https://dkdcxyluvsphudideejm.supabase.co";
    const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrZGN4eWx1dnNwaHVkaWRlZWptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk2MjI4NzgsImV4cCI6MjEwNTE5ODg3OH0.vj_L2LjI0nbgXz-kR08E11dLxJHdCivNA-AmPfXbe7g";
    const cliente = () => window.supabaseClient;
    if (!window.supabaseClient && window.supabase) window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
        }
    });
    const executar = async promise => {
        const resposta = await promise;
        if (resposta.error) throw resposta.error;
        return resposta.data;
    };
    const tentarReferencias = async promise => {
        try {
            return await executar(promise);
        } catch (erro) {
            console.warn("Referência opcional não carregada:", erro.message || erro);
            return [];
        }
    };
    async function usuarioAtual() {
        const resposta = await cliente().auth.getUser();
        const user = resposta.data.user || null;
        return user && !user.is_anonymous ? user : null;
    }
    async function perfilAtual() {
        const user = await usuarioAtual();
        if (!user) return null;
        return executar(cliente().from("perfis").select("*").eq("usuario_auth_id", user.id).eq("ativo", true).maybeSingle());
    }
    async function associacoesDoUsuario(perfilId) {
        if (!perfilId) return [];
        return executar(cliente().from("usuarios_cafeterias").select("cafeteria_id,funcao").eq("usuario_id", perfilId));
    }
    async function obterCafeteriaPadrao() {
        if (window.__cafeteriaId) return window.__cafeteriaId;
        const user = await usuarioAtual();
        if (user) {
            try {
                const perfil = await perfilAtual();
                const associacoes = await associacoesDoUsuario(perfil && perfil.id);
                if (associacoes.length) {
                    window.__cafeteriaId = associacoes[0].cafeteria_id;
                    return window.__cafeteriaId;
                }
            } catch (erro) {
                console.warn("Associação do usuário indisponível; usando cafeteria ativa:", erro.message || erro);
            }
        }
        const resposta = await cliente().from("cafeterias").select("id").eq("ativa", true).order("criado_em").limit(1).maybeSingle();
        if (resposta.error) throw resposta.error;
        if (!resposta.data) throw new Error("Nenhuma cafeteria ativa foi configurada.");
        window.__cafeteriaId = resposta.data.id;
        return window.__cafeteriaId;
    }
    async function cafeteriaAtual() {
        const id = await obterCafeteriaPadrao();
        return executar(cliente().from("cafeterias").select("*").eq("id", id).single());
    }
    async function carregarProdutos(opcoes = {}) {
        const cafeteriaId = opcoes.cafeteriaId || await obterCafeteriaPadrao();
        let consulta = cliente().from("produtos").select("id,cafeteria_id,categoria_id,nome,descricao,preco,imagem_url,destaque,disponivel,tipo,intolerancia_id,caracteristica_id").eq("cafeteria_id", cafeteriaId).eq("disponivel", true).order("nome");
        if (opcoes.destaque === true) consulta = consulta.eq("destaque", true);
        if (opcoes.categoriaId) consulta = consulta.eq("categoria_id", opcoes.categoriaId);
        const resposta = await consulta;
        if (resposta.error) throw resposta.error;
        const produtos = resposta.data || [];
        const idsCategorias = [ ...new Set(produtos.map(item => item.categoria_id).filter(Boolean)) ];
        const idsIntolerancias = [ ...new Set(produtos.map(item => item.intolerancia_id).filter(Boolean)) ];
        const idsCaracteristicas = [ ...new Set(produtos.map(item => item.caracteristica_id).filter(Boolean)) ];
        const idsProdutos = produtos.map(item => item.id).filter(Boolean);
        const tentarReferencias = async consulta => {
            try {
                return await executar(consulta);
            } catch (erro) {
                console.warn("Referência opcional não carregada:", erro.message || erro);
                return [];
            }
        };
        const [categorias, intolerancias, caracteristicas, associacoesCaracteristicas] = await Promise.all([ idsCategorias.length ? tentarReferencias(cliente().from("categorias_cardapio").select("id,nome,ativa").in("id", idsCategorias)) : [], idsIntolerancias.length ? tentarReferencias(cliente().from("intolerancias").select("id,nome").in("id", idsIntolerancias)) : [], idsCaracteristicas.length ? tentarReferencias(cliente().from("caracteristicas_produtos").select("id,nome").in("id", idsCaracteristicas)) : [], idsProdutos.length ? tentarReferencias(cliente().from("produto_caracteristicas").select("produto_id,caracteristica_id,caracteristicas_produtos(id,nome)").in("produto_id", idsProdutos)) : [] ]);
        const porId = lista => new Map(lista.map(item => [ item.id, item ]));
        const categoriasPorId = porId(categorias);
        const intoleranciasPorId = porId(intolerancias);
        const caracteristicasPorId = porId(caracteristicas);
        const caracteristicasPorProduto = new Map;
        associacoesCaracteristicas.forEach(associacao => {
            const caracteristica = associacao.caracteristicas_produtos || caracteristicasPorId.get(associacao.caracteristica_id);
            if (!caracteristica) return;
            const lista = caracteristicasPorProduto.get(associacao.produto_id) || [];
            lista.push(caracteristica);
            caracteristicasPorProduto.set(associacao.produto_id, lista);
        });
        return produtos.filter(produto => {
            const categoria = categoriasPorId.get(produto.categoria_id);
            return !produto.categoria_id || Boolean(categoria && categoria.ativa !== false);
        }).map(produto => {
            const antigas = caracteristicasPorId.get(produto.caracteristica_id);
            const multiplas = caracteristicasPorProduto.get(produto.id) || [];
            const caracteristicasDoProduto = antigas ? [ antigas, ...multiplas.filter(item => item.id !== antigas.id) ] : multiplas;
            return {
                ...produto,
                categorias_cardapio: categoriasPorId.get(produto.categoria_id) || null,
                intolerancias: intoleranciasPorId.get(produto.intolerancia_id) || null,
                caracteristicas_produtos: caracteristicasDoProduto,
                produto_caracteristicas: caracteristicasDoProduto.map(item => ({
                    caracteristicas_produtos: item
                })),
                caracteristicas: caracteristicasDoProduto.map(item => item.nome).filter(Boolean),
                caracteristica_nome: caracteristicasDoProduto[0]?.nome || null
            };
        });
    }
    async function carregarCategorias(cafeteriaId) {
        const id = cafeteriaId || await obterCafeteriaPadrao();
        return executar(cliente().from("categorias_cardapio").select("*").eq("cafeteria_id", id).eq("ativa", true).order("ordem"));
    }
    async function carregarPermissoes(perfilId) {
        return associacoesDoUsuario(perfilId);
    }
    async function criarPedidoSeguro(cafeteriaId, tipoEntrega, enderecoEntregaId, observacoes, itens) {
        return executar(cliente().rpc("criar_pedido_seguro", {
            p_cafeteria_id: cafeteriaId,
            p_tipo_entrega: tipoEntrega,
            p_endereco_entrega_id: enderecoEntregaId,
            p_observacoes: observacoes,
            p_itens: itens
        }));
    }
    const consultaCafeteria = async (tabela, colunas = "*", cafeteriaId) => executar(cliente().from(tabela).select(colunas).eq("cafeteria_id", cafeteriaId || await obterCafeteriaPadrao()));
    window.usuarioAtual = usuarioAtual;
    window.perfilAtual = perfilAtual;
    window.carregarPermissoes = carregarPermissoes;
    window.obterCafeteriaPadrao = obterCafeteriaPadrao;
    window.cafeteriaAtual = cafeteriaAtual;
    window.carregarProdutos = carregarProdutos;
    window.carregarCategorias = carregarCategorias;
    window.criarPedidoSeguro = criarPedidoSeguro;
    window.criarConta = async (email, senha, nome) => executar(cliente().auth.signUp({
        email: email,
        password: senha,
        options: {
            data: {
                nome_completo: nome
            }
        }
    }));
    window.fazerLogin = async (email, senha) => executar(cliente().auth.signInWithPassword({
        email: email,
        password: senha
    }));
    window.fazerLogout = async () => executar(cliente().auth.signOut());
    window.carregarEnderecosCliente = async () => {
        const perfil = await perfilAtual();
        return executar(cliente().from("enderecos_cliente").select("*").eq("cliente_id", perfil.id).eq("ativo", true).order("principal", {
            ascending: false
        }));
    };
    window.carregarPedidosDoCliente = async () => {
        const perfil = await perfilAtual();
        if (!perfil) throw new Error("Não há perfil autenticado para consultar pedidos.");
        return executar(cliente().from("pedidos").select("id,status,subtotal,taxa_entrega,total,tipo_entrega,criado_em,itens_pedido(nome_produto_no_momento,quantidade,preco_unitario,subtotal)").eq("cliente_id", perfil.id).order("criado_em", {
            ascending: false
        }));
    };
    window.carregarPedidosDaCafeteria = async cafeteriaId => consultaCafeteria("pedidos", "*,itens_pedido(*)", cafeteriaId);
    window.atualizarStatusPedido = async (id, status) => executar(cliente().rpc("avancar_status_pedido", {
        p_pedido_id: id,
        p_novo_status: status
    }));
    window.cancelarPedido = async id => executar(cliente().rpc("cancelar_pedido", {
        p_pedido_id: id
    }));
    window.carregarProdutosGestor = async cafeteriaId => {
        const produtos = await executar(cliente().from("produtos").select("id,nome,preco,disponivel,imagem_url,categoria_id,categorias_cardapio(nome),intolerancias(nome),caracteristica_id,caracteristicas_produtos(nome)").eq("cafeteria_id", cafeteriaId || await obterCafeteriaPadrao()).order("nome"));
        const ids = produtos.map(produto => produto.id).filter(Boolean);
        const associacoes = ids.length ? await tentarReferencias(cliente().from("produto_caracteristicas").select("produto_id,caracteristica_id,caracteristicas_produtos(id,nome)").in("produto_id", ids)) : [];
        const porProduto = new Map;
        associacoes.forEach(associacao => {
            const caracteristica = associacao.caracteristicas_produtos;
            if (!caracteristica) return;
            const lista = porProduto.get(associacao.produto_id) || [];
            lista.push(caracteristica);
            porProduto.set(associacao.produto_id, lista);
        });
        return produtos.map(produto => ({
            ...produto,
            caracteristicas_produtos: porProduto.get(produto.id) || produto.caracteristicas_produtos || []
        }));
    };
    window.alternarDisponibilidadeProduto = async (id, disponivel) => executar(cliente().from("produtos").update({
        disponivel: disponivel
    }).eq("id", id));
    window.carregarEstoqueAbaixoMinimo = async cafeteriaId => consultaCafeteria("estoque", "*,produtos(nome)", cafeteriaId);
    window.carregarMovimentosEstoque = async estoqueId => executar(cliente().from("movimentos_estoque").select("*").eq("estoque_id", estoqueId).order("criado_em", {
        ascending: false
    }));
    window.carregarVendasDoDia = async cafeteriaId => consultaCafeteria("pedidos", "*", cafeteriaId);
    window.carregarLogs = async cafeteriaId => executar(cliente().from("logs_auditoria").select("*").eq("cafeteria_id", cafeteriaId || await obterCafeteriaPadrao()).order("criado_em", {
        ascending: false
    }).limit(100));
    window.carregarStatusIntegracoes = async cafeteriaId => consultaCafeteria("integracoes", "*", cafeteriaId);
    window.carregarNoticiasPublicadas = async cafeteriaId => executar(cliente().from("noticias").select("*").eq("cafeteria_id", cafeteriaId || await obterCafeteriaPadrao()).eq("publicada", true).order("publicada_em", {
        ascending: false
    }));
    window.carregarPlaylistsComMusicas = async cafeteriaId => executar(cliente().from("playlists").select("*,musicas(*)").eq("cafeteria_id", cafeteriaId || await obterCafeteriaPadrao()).eq("ativa", true).order("nome"));
    window.carregarNotificacoes = async () => {
        const perfil = await perfilAtual();
        return executar(cliente().from("notificacoes").select("*").eq("usuario_id", perfil.id).order("criado_em", {
            ascending: false
        }));
    };
    window.carregarTodosPerfis = async () => executar(cliente().from("perfis").select("id,nome_completo,email,tipo_usuario,ativo,criado_em,usuarios_cafeterias(cafeteria_id,funcao)").order("criado_em", {
        ascending: false
    }));
    window.adminListarPerfis = async () => executar(cliente().rpc("admin_listar_perfis"));
    window.adminListarCafeterias = async () => executar(cliente().rpc("admin_listar_cafeterias"));
    window.adminEditarPerfil = async (perfilId, nomeCompleto, telefone) => executar(cliente().rpc("admin_editar_perfil", {
        p_perfil_id: perfilId,
        p_nome_completo: nomeCompleto,
        p_telefone: telefone
    }));
    window.adminDefinirPapelUsuario = async (perfilId, papel, cafeteriaId) => executar(cliente().rpc("admin_definir_papel_usuario", {
        p_perfil_id: perfilId,
        p_papel: papel,
        p_cafeteria_id: cafeteriaId || null
    }));
    window.adminDefinirAtivoUsuario = async (perfilId, ativo) => executar(cliente().rpc("admin_definir_ativo_usuario", {
        p_perfil_id: perfilId,
        p_ativo: ativo
    }));
    window.adminListarCategorias = async cafeteriaId => executar(cliente().rpc("admin_listar_categorias", {
        p_cafeteria_id: cafeteriaId || await obterCafeteriaPadrao()
    }));
    window.adminCriarCategoria = async (cafeteriaId, nome, descricao, ordem) => executar(cliente().rpc("admin_criar_categoria", {
        p_cafeteria_id: cafeteriaId,
        p_nome: nome,
        p_descricao: descricao || null,
        p_ordem: ordem
    }));
    window.adminEditarCategoria = async (categoriaId, nome, descricao, ordem, ativa) => executar(cliente().rpc("admin_editar_categoria", {
        p_categoria_id: categoriaId,
        p_nome: nome,
        p_descricao: descricao || null,
        p_ordem: ordem,
        p_ativa: ativa
    }));
    window.adminExcluirCategoria = async categoriaId => executar(cliente().rpc("admin_excluir_categoria", {
        p_categoria_id: categoriaId
    }));
    window.perfilListarEnderecos = async () => executar(cliente().rpc("perfil_listar_enderecos"));
    window.perfilSalvarEndereco = async (enderecoId, endereco) => executar(cliente().rpc("perfil_salvar_endereco", {
        p_endereco_id: enderecoId,
        p_nome_endereco: endereco.nome_endereco,
        p_rua: endereco.rua,
        p_numero: endereco.numero,
        p_complemento: endereco.complemento || null,
        p_bairro: endereco.bairro,
        p_cidade: endereco.cidade,
        p_estado: endereco.estado,
        p_cep: endereco.cep,
        p_principal: Boolean(endereco.principal)
    }));
    window.perfilDefinirEnderecoPrincipal = async enderecoId => executar(cliente().rpc("perfil_definir_endereco_principal", {
        p_endereco_id: enderecoId
    }));
    window.perfilDesativarEndereco = async enderecoId => executar(cliente().rpc("perfil_desativar_endereco", {
        p_endereco_id: enderecoId
    }));
    window.perfilMarcarNotificacaoLida = async notificacaoId => executar(cliente().rpc("perfil_marcar_notificacao_lida", {
        p_notificacao_id: notificacaoId
    }));
    window.acompanharPedidosDaCafeteria = async (cafeteriaId, callback) => cliente().channel(`pedidos-cafeteria-${cafeteriaId}`).on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "pedidos",
        filter: `cafeteria_id=eq.${cafeteriaId}`
    }, callback).subscribe();
    window.acompanharPedido = async (pedidoId, callback) => cliente().channel(`pedido-${pedidoId}`).on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "pedidos",
        filter: `id=eq.${pedidoId}`
    }, callback).subscribe();
    window.registrarAuditoria = async (acao, entidade, entidadeId, dadosAnteriores, dadosNovos, cafeteriaId) => executar(cliente().from("logs_auditoria").insert({
        usuario_id: (await perfilAtual()).id,
        cafeteria_id: cafeteriaId || await obterCafeteriaPadrao(),
        acao: acao,
        entidade: entidade,
        entidade_id: entidadeId,
        dados_anteriores: dadosAnteriores,
        dados_novos: dadosNovos
    }));
    window.carregarPlaylistsComMusicas = async cafeteriaId => {
        const id = cafeteriaId || await obterCafeteriaPadrao();
        const playlists = await executar(cliente().from("playlists").select("id, nome, descricao, imagem_url, musicas(id, titulo, artista, url_audio, imagem_url, duracao_segundos, ordem, ativa)").eq("cafeteria_id", id).eq("ativa", true).order("nome"));
        return playlists;
    };
    window.carregarMusicas = async playlistId => {
        let consulta = cliente().from("musicas").select("*").eq("ativa", true).order("ordem");
        if (playlistId) consulta = consulta.eq("playlist_id", playlistId);
        return executar(consulta);
    };
    window.uploadMusica = async arquivo => {
        const user = await usuarioAtual();
        if (!user) throw new Error("Faça login para subir músicas.");
        const nomeUnico = `${Date.now()}-${arquivo.name.replace(/\s+/g, "-")}`;
        const caminho = `mp3/${nomeUnico}`;
        const {error: error} = await cliente().storage.from("musicas").upload(caminho, arquivo, {
            cacheControl: "3600",
            upsert: false
        });
        if (error) throw error;
        const {data: data} = cliente().storage.from("musicas").getPublicUrl(caminho);
        return data.publicUrl;
    };
    window.cadastrarMusica = async dados => executar(cliente().from("musicas").insert({
        playlist_id: dados.playlist_id,
        titulo: dados.titulo,
        artista: dados.artista,
        url_audio: dados.url_audio,
        imagem_url: dados.imagem_url || null,
        ordem: dados.ordem || 0,
        ativa: true
    }));
    window.atualizarMusica = async (id, dados) => executar(cliente().from("musicas").update(dados).eq("id", id));
    window.apagarMusica = async id => executar(cliente().from("musicas").delete().eq("id", id));
    window.cadastrarPlaylist = async dados => {
        const cafeteriaId = await obterCafeteriaPadrao();
        return executar(cliente().from("playlists").insert({
            cafeteria_id: cafeteriaId,
            nome: dados.nome,
            descricao: dados.descricao || "",
            imagem_url: dados.imagem_url || null,
            ativa: true
        }));
    };
    window.garantirPerfilProprio = async () => executar(cliente().rpc("perfil_garantir_proprio"));
})();
