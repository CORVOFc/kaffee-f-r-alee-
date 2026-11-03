(function() {
    "use strict";
    const PERMISSOES_POR_PAPEL = {
        cliente: [ "perfil.visualizar", "perfil.seguranca", "perfil.preferencias", "enderecos.proprios", "notificacoes.proprias", "pedidos.proprios", "favoritos.proprios", "carrinho.proprio", "historico.proprio", "cardapio.visualizar" ],
        gestor: [ "perfil.visualizar", "perfil.seguranca", "perfil.preferencias", "enderecos.proprios", "notificacoes.proprias", "pedidos.proprios", "favoritos.proprios", "carrinho.proprio", "historico.proprio", "cardapio.visualizar", "pedidos.operacional", "produtos.visualizar", "categorias.visualizar", "estoque.visualizar", "relatorios.visualizar", "unidade.status" ],
        admin: [ "perfil.visualizar", "perfil.seguranca", "perfil.preferencias", "enderecos.proprios", "notificacoes.proprias", "pedidos.proprios", "favoritos.proprios", "carrinho.proprio", "historico.proprio", "cardapio.visualizar", "pedidos.operacional", "produtos.visualizar", "categorias.visualizar", "estoque.visualizar", "relatorios.visualizar", "unidade.status", "usuarios.gerenciar", "gestores.gerenciar", "categorias.gerenciar", "permissoes.gerenciar", "configuracoes.gerenciar", "logs.visualizar", "musicas.gerenciar" ]
    };
    const normalizar = valor => String(valor || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();
    function resolverPapel(perfil, associacoes) {
        const tipo = normalizar(perfil.tipo_usuario);
        const funcoes = associacoes.map(item => normalizar(item.funcao));
        const valores = [ tipo, ...funcoes ];
        if (valores.some(valor => [ "desenvolvedor", "developer", "admin", "administrador" ].includes(valor))) return "admin";
        if (valores.some(valor => [ "gestor", "manager" ].includes(valor))) return "gestor";
        if ([ "cliente", "customer" ].includes(tipo)) return "cliente";
        return null;
    }
    function nomeDaAutenticacao(usuario) {
        const metadata = usuario && usuario.user_metadata || {};
        return metadata.nome_completo || metadata.full_name || metadata.name || "";
    }
    function perfilDaAutenticacao(sessao) {
        const usuario = sessao.user || {};
        const metadata = usuario.user_metadata || {};
        return {
            id: null,
            usuario_auth_id: usuario.id || null,
            nome_completo: nomeDaAutenticacao(usuario),
            email: usuario.email || "",
            telefone: metadata.telefone || metadata.phone || "",
            tipo_usuario: "",
            papel_exibicao: "Acesso não configurado"
        };
    }
    function publicarPerfil(perfil, sessao, associacoes, papel) {
        const usuario = sessao.user || {};
        const valores = [ perfil.tipo_usuario, ...associacoes.map(item => item.funcao) ].map(normalizar);
        const papelExibicao = papel === "admin" ? "Desenvolvedor" : papel === "gestor" ? "Gestor" : papel === "cliente" ? "Cliente" : String(perfil.papel_exibicao || perfil.tipo_usuario || "Acesso não configurado");
        const permissoesExplicitas = associacoes.map(item => String(item.funcao || "")).filter(funcao => funcao.includes("."));
        const permissoesBase = papel ? PERMISSOES_POR_PAPEL[papel] : [];
        const projetado = {
            id: perfil.id || null,
            usuario_auth_id: perfil.usuario_auth_id || usuario.id || null,
            nome_completo: perfil.nome_completo || nomeDaAutenticacao(usuario),
            email: perfil.email || usuario.email || "",
            telefone: perfil.telefone || usuario.user_metadata && (usuario.user_metadata.telefone || usuario.user_metadata.phone) || "",
            tipo_usuario: papel || perfil.tipo_usuario || "",
            papel_exibicao: papelExibicao,
            permissions: permissoesExplicitas.length ? permissoesBase.filter(permissao => permissoesExplicitas.includes(permissao)) : permissoesBase
        };
        window.__perfilAtualRaw = perfil;
        window.__perfilAssociacoes = associacoes;
        window.dispatchEvent(new CustomEvent("perfil-autenticado", {
            detail: {
                profile: projetado,
                rawProfile: perfil,
                session: sessao,
                associations: associacoes,
                role: papel
            }
        }));
        return projetado;
    }
    function publicarErro(mensagem) {
        window.dispatchEvent(new CustomEvent("perfil-erro", {
            detail: {
                message: mensagem
            }
        }));
    }
    async function carregarPerfil(sessao) {
        let perfil = sessao.perfil || null;
        let erroPerfil = null;
        try {
            if (!perfil && typeof window.perfilAtual === "function") {
                try {
                    perfil = await window.perfilAtual();
                } catch (erro) {
                    erroPerfil = erro;
                }
            }
            if (!perfil && typeof window.garantirPerfilProprio === "function") {
                try {
                    perfil = await window.garantirPerfilProprio();
                    erroPerfil = null;
                } catch (erro) {
                    erroPerfil = erro;
                }
            }
            if (!perfil) {
                const parcial = perfilDaAutenticacao(sessao);
                if (!parcial.email && !parcial.nome_completo && !parcial.telefone) {
                    throw erroPerfil || new Error("Não foi encontrado um perfil ativo para esta conta.");
                }
                publicarPerfil(parcial, sessao, [], null);
                const diagnostico = erroPerfil && erroPerfil.message ? ` Detalhe técnico: ${erroPerfil.message}` : "";
                publicarErro(`A sessão foi autenticada, mas ainda não existe um registro pessoal ativo em public.perfis. Os dados disponíveis no Auth foram exibidos; aplique a migration supabase/perfil_admin_categorias.sql para habilitar a recuperação segura do perfil.${diagnostico}`);
                return;
            }
            if (perfil.ativo === false) throw new Error("Este perfil está desativado. Fale com a administração da cafeteria.");
            let associacoes = Array.isArray(sessao.permissoes) ? sessao.permissoes : [];
            if (!associacoes.length && perfil.id && typeof window.carregarPermissoes === "function") {
                try {
                    associacoes = await window.carregarPermissoes(perfil.id);
                } catch (erro) {
                    console.warn("Associações de cafeteria indisponíveis; os dados pessoais continuam disponíveis:", erro.message || erro);
                }
            }
            const papel = resolverPapel(perfil, associacoes) || sessao.role || null;
            publicarPerfil(perfil, sessao, associacoes, papel);
            sessao.perfil = perfil;
            sessao.permissoes = associacoes;
            sessao.role = papel;
            window.__sessaoApp = sessao;
            if (!papel) publicarErro("Seus dados pessoais foram carregados, mas o tipo de acesso registrado não corresponde a um papel configurado. As áreas operacionais e administrativas permanecerão ocultas.");
        } catch (erro) {
            console.error("[perfil] Erro ao carregar a integração:", erro);
            publicarErro(erro.message || "Não foi possível carregar o perfil.");
        }
    }
    window.addEventListener("app:ready", evento => {
        if (evento.detail) carregarPerfil(evento.detail);
    }, {
        once: true
    });
})();
