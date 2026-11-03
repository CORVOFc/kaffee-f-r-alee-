(function() {
    "use strict";
    const SECTION_INFO = {
        conta: {
            id: "sec-minha-conta",
            title: "Minha conta",
            eyebrow: "SEU ESPAÇO PESSOAL",
            icon: "activity"
        },
        acessos: {
            id: "sec-meus-acessos",
            title: "Meus acessos",
            eyebrow: "ÁREAS PESSOAIS",
            icon: "clock"
        },
        operacional: {
            id: "sec-operacional",
            title: "Operacional",
            eyebrow: "RECURSOS DA UNIDADE",
            icon: "package"
        },
        administracao: {
            id: "sec-administracao",
            title: "Administração",
            eyebrow: "RECURSOS ADMINISTRATIVOS",
            icon: "settings"
        }
    };
    const MODULE_LIBRARY = {
        "dados-pessoais": {
            title: "Dados pessoais",
            description: "Atualize nome e telefone da sua conta.",
            icon: "user",
            permission: "perfil.visualizar"
        },
        seguranca: {
            title: "Segurança",
            description: "Altere sua senha usando a sessão segura do Supabase.",
            icon: "shield",
            permission: "perfil.seguranca"
        },
        preferencias: {
            title: "Preferências",
            description: "Salve preferências de navegação neste dispositivo.",
            icon: "sliders",
            permission: "perfil.preferencias"
        },
        enderecos: {
            title: "Endereços",
            description: "Cadastre, edite e desative seus endereços de entrega.",
            icon: "pin",
            permission: "enderecos.proprios"
        },
        "meus-pedidos": {
            title: "Meus pedidos",
            description: "Consulte pedidos vinculados à sua sessão.",
            icon: "receipt",
            permission: "pedidos.proprios"
        },
        favoritos: {
            title: "Favoritos",
            description: "Consulte sua lista e abra a página de favoritos.",
            icon: "heart",
            permission: "favoritos.proprios"
        },
        carrinho: {
            title: "Carrinho",
            description: "Veja seus itens e continue para o checkout.",
            icon: "cart",
            permission: "carrinho.proprio"
        },
        historico: {
            title: "Histórico",
            description: "Consulte pedidos anteriores da sua conta.",
            icon: "clock",
            permission: "historico.proprio"
        },
        notificacoes: {
            title: "Notificações",
            description: "Consulte e marque como lidas as notificações da sua conta.",
            icon: "bell",
            permission: "notificacoes.proprias"
        },
        cardapio: {
            title: "Cardápio",
            description: "Abra as categorias disponíveis no site.",
            icon: "coffee",
            permission: "cardapio.visualizar"
        },
        "pedidos-unidade": {
            title: "Pedidos da unidade",
            description: "Consulte pedidos da cafeteria e envie transições aceitas pelo servidor.",
            icon: "receipt",
            permission: "pedidos.operacional"
        },
        produtos: {
            title: "Produtos",
            description: "Consulte o catálogo operacional e altere disponibilidade.",
            icon: "package",
            permission: "produtos.visualizar"
        },
        categorias: {
            title: "Categorias",
            description: "Adicione, edite, ordene, ative/desative e remova categorias sem produtos vinculados.",
            icon: "layers",
            permission: "categorias.visualizar"
        },
        estoque: {
            title: "Estoque",
            description: "Consulte estoque e movimentos disponíveis.",
            icon: "box",
            permission: "estoque.visualizar"
        },
        relatorios: {
            title: "Relatórios",
            description: "Veja pedidos e totais registrados para a unidade.",
            icon: "chart",
            permission: "relatorios.visualizar"
        },
        "status-unidade": {
            title: "Status da unidade",
            description: "Consulte dados da cafeteria e integrações registradas.",
            icon: "activity",
            permission: "unidade.status"
        },
        usuarios: {
            title: "Usuários",
            description: "Edite perfis, promova papéis e desative ou reative contas.",
            icon: "users",
            permission: "usuarios.gerenciar"
        },
        gestores: {
            title: "Gestores",
            description: "Consulte perfis com papel de gestor.",
            icon: "users",
            permission: "gestores.gerenciar"
        },
        "categorias-admin": {
            title: "Gerenciar categorias",
            description: "Adicione, edite, ordene, desative ou remova categorias sem produtos associados.",
            icon: "layers",
            permission: "categorias.gerenciar"
        },
        permissoes: {
            title: "Permissões",
            description: "Consulte as associações de papel fornecidas pelo Supabase.",
            icon: "shield",
            permission: "permissoes.gerenciar"
        },
        configuracoes: {
            title: "Configurações",
            description: "Consulte configurações disponíveis para a unidade.",
            icon: "settings",
            permission: "configuracoes.gerenciar"
        },
        logs: {
            title: "Logs / Auditoria",
            description: "Consulte registros de auditoria permitidos pela política.",
            icon: "chart",
            permission: "logs.visualizar"
        },
        "musicas-admin": {
            title: "Músicas e playlists",
            description: "Cadastre e mantenha playlists e músicas da cafeteria.",
            icon: "music",
            permission: "musicas.gerenciar"
        }
    };
    const MODULES_BY_SECTION = {
        conta: [ "dados-pessoais", "seguranca", "preferencias", "enderecos" ],
        acessos: [ "meus-pedidos", "favoritos", "carrinho", "historico", "notificacoes", "cardapio" ],
        operacional: [ "pedidos-unidade", "produtos", "categorias", "estoque", "relatorios", "status-unidade" ],
        administracao: [ "usuarios", "gestores", "categorias-admin", "permissoes", "configuracoes", "logs", "musicas-admin" ]
    };
    const PERMISSIONS = {
        pessoal: [ "perfil.visualizar", "perfil.seguranca", "perfil.preferencias", "enderecos.proprios", "notificacoes.proprias", "pedidos.proprios", "favoritos.proprios", "carrinho.proprio", "historico.proprio", "cardapio.visualizar" ],
        operacional: [ "pedidos.operacional", "produtos.visualizar", "categorias.visualizar", "estoque.visualizar", "relatorios.visualizar", "unidade.status" ],
        administracao: [ "usuarios.gerenciar", "gestores.gerenciar", "categorias.gerenciar", "permissoes.gerenciar", "configuracoes.gerenciar", "logs.visualizar", "musicas.gerenciar" ]
    };
    function createRole({label: label, area: area, metrics: metrics, sections: sections, permissions: permissions, quick: quick}) {
        return Object.freeze({
            label: label,
            area: area,
            metrics: metrics,
            sections: sections,
            modules: sections.flatMap(section => MODULES_BY_SECTION[section].map(id => ({
                ...MODULE_LIBRARY[id],
                id: id,
                section: section
            }))),
            permissions: permissions,
            quick: quick
        });
    }
    const ROLE_CONTENT = Object.freeze({
        cliente: createRole({
            label: "Cliente",
            area: "Minha conta",
            sections: [ "conta", "acessos" ],
            metrics: [ [ "Pedidos", "receipt" ], [ "Favoritos", "heart" ], [ "Itens no carrinho", "cart" ]],
            permissions: PERMISSIONS.pessoal,
            quick: [ "conta", "acessos" ]
        }),
        gestor: createRole({
            label: "Gestor",
            area: "Operacional",
            sections: [ "conta", "acessos", "operacional" ],
            metrics: [ [ "Produtos", "package" ], [ "Pedidos", "receipt" ], [ "Estoque", "box" ], [ "Vendas", "activity" ] ],
            permissions: [ ...PERMISSIONS.pessoal, ...PERMISSIONS.operacional ],
            quick: [ "conta", "acessos", "operacional" ]
        }),
        admin: createRole({
            label: "Desenvolvedor",
            area: "Operacional e administração",
            sections: [ "conta", "acessos", "operacional", "administracao" ],
            metrics: [ [ "Produtos", "package" ], [ "Gestores", "users" ], [ "Pedidos", "receipt" ], [ "Clientes", "users" ] ],
            permissions: [ ...PERMISSIONS.pessoal, ...PERMISSIONS.operacional, ...PERMISSIONS.administracao ],
            quick: [ "conta", "acessos", "operacional", "administracao" ]
        })
    });
    const $ = (selector, root) => (root || document).querySelector(selector);
    const text = value => String(value == null ? "" : value);
    const processedEvents = new WeakSet;
    let activePermissions = new Set;
    function el(tag, className, value) {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (value != null) node.textContent = value;
        return node;
    }
    function iconImage(name) {
        const image = el("img", "icono-ui");
        image.src = `assets/icons/${name}.svg`;
        image.alt = "";
        image.setAttribute("aria-hidden", "true");
        return image;
    }
    function showWaitingState(message, title) {
        $("#profile-state").textContent = "SEM SESSÃO";
        $("#profile-initial").textContent = "K";
        $("#profile-name").textContent = "Não disponível";
        $("#profile-email").textContent = "Não disponível";
        $("#profile-phone").textContent = "Não disponível";
        $("#profile-role").textContent = "Não disponível";
        $("#role-empty-title").textContent = title || "Aguardando seu perfil";
        $("#role-empty-copy").textContent = message || "Aguardando a sessão autenticada e o perfil ativo do Supabase.";
        $("#role-empty").hidden = false;
        $("#metrics-section").hidden = true;
        $("#role-sections").replaceChildren();
        $("#role-sections").hidden = true;
        $("#quick-grid").replaceChildren();
        $("#quick-section").hidden = true;
    }
    function getSuppliedPermissions(profile) {
        if (Array.isArray(profile.permissions)) return profile.permissions;
        if (Array.isArray(profile.permissoes)) return profile.permissoes;
        return null;
    }
    function getProfileName(profile) {
        return text(profile.nome_completo || profile.nome || profile.name).trim();
    }
    function updateProfile(profile, role) {
        const name = getProfileName(profile);
        const email = text(profile.email).trim();
        const phone = text(profile.telefone || profile.phone || profile.celular).trim();
        const initial = Array.from(name || role.label)[0] || "K";
        $("#profile-state").textContent = role.label.toLocaleUpperCase("pt-BR");
        $("#profile-initial").textContent = initial.toLocaleUpperCase("pt-BR");
        $("#profile-name").textContent = name || "Nome não fornecido pelo perfil";
        $("#profile-email").textContent = email || "E-mail não fornecido pelo perfil";
        $("#profile-phone").textContent = phone || "Telefone não fornecido pelo perfil";
        $("#profile-role").textContent = role.label;
        $("#role-empty").hidden = true;
    }
    function makeMetric([label, icon]) {
        const card = el("article", "cartao-metrica");
        const symbol = el("span", "metrica-icone");
        symbol.setAttribute("aria-hidden", "true");
        symbol.append(iconImage(icon));
        const copy = el("span", "metrica-conteudo");
        copy.append(el("span", "metrica-rotulo", label), el("strong", "metrica-valor", "—"), el("small", "metrica-nota", "Carregando dados…"));
        card.append(symbol, copy);
        return card;
    }
    function makeModuleCard(module) {
        const card = el("button", "cartao-modulo");
        card.type = "button";
        card.dataset.moduleId = module.id;
        card.dataset.permission = module.permission;
        const icon = el("span", "modulo-icone");
        icon.setAttribute("aria-hidden", "true");
        icon.append(iconImage(module.icon));
        card.append(icon, el("h3", "modulo-titulo", module.title), el("p", "modulo-descricao", module.description), el("span", "modulo-estado", "Abrir recurso"));
        return card;
    }
    function makeSection(sectionKey, modules) {
        const info = SECTION_INFO[sectionKey];
        const section = el("section", "grupo-modulos");
        section.id = info.id;
        section.setAttribute("aria-labelledby", `${info.id}-titulo`);
        const heading = el("div", "hub-heading");
        const copy = el("div");
        copy.append(el("p", "rotulo-secao", info.eyebrow));
        const title = el("h2", "", info.title);
        title.id = `${info.id}-titulo`;
        copy.append(title);
        heading.append(copy, el("span", "hub-aside", "Recursos previstos para este perfil"));
        const grid = el("div", "grade-modulos");
        modules.forEach(module => grid.append(makeModuleCard(module)));
        section.append(heading, grid);
        if (sectionKey === "conta") {
            const actions = el("div", "perfil-conta-acoes");
            const logout = el("button", "botao-sair-conta", "Sair da conta");
            logout.type = "button";
            logout.dataset.action = "logout";
            actions.append(logout);
            section.append(actions);
        }
        return section;
    }
    function makeQuickLink(sectionKey) {
        const info = SECTION_INFO[sectionKey];
        const link = el("a", "atalho-perfil");
        link.href = `#${info.id}`;
        const icon = el("span", "atalho-icone");
        icon.setAttribute("aria-hidden", "true");
        icon.append(iconImage(info.icon));
        const copy = el("span", "atalho-conteudo");
        copy.append(el("strong", "", info.title), el("small", "", "Ir para esta seção"));
        link.append(icon, copy);
        return link;
    }
    function renderProfile(candidate) {
        const profile = candidate && candidate.profile && typeof candidate.profile === "object" ? candidate.profile : candidate;
        if (!profile || typeof profile !== "object") {
            showWaitingState();
            return;
        }
        const roleKey = text(profile.tipo_usuario).trim().toLocaleLowerCase("pt-BR");
        if (!Object.prototype.hasOwnProperty.call(ROLE_CONTENT, roleKey)) {
            const roleLabel = text(profile.papel_exibicao || profile.tipo_usuario).trim() || "Acesso não configurado";
            updateProfile(profile, { label: roleLabel });
            $("#profile-state").textContent = "ACESSO LIMITADO";
            $("#profile-role").textContent = roleLabel;
            $("#metrics-grid").replaceChildren();
            $("#metrics-section").hidden = true;
            $("#role-sections").replaceChildren();
            $("#role-sections").hidden = true;
            $("#quick-grid").replaceChildren();
            $("#quick-section").hidden = true;
            $("#role-empty-title").textContent = "Dados pessoais disponíveis";
            $("#role-empty-copy").textContent = "Nome, e-mail e telefone foram carregados. O tipo de acesso ainda não possui módulos configurados; nenhuma permissão administrativa foi concedida.";
            $("#role-empty").hidden = false;
            return;
        }
        const role = {
            ...ROLE_CONTENT[roleKey],
            label: text(profile.papel_exibicao).trim() || ROLE_CONTENT[roleKey].label
        };
        const suppliedPermissions = getSuppliedPermissions(profile);
        activePermissions = new Set(suppliedPermissions || role.permissions);
        const logoutFallback = $("#logout-fallback");
        if (logoutFallback) logoutFallback.hidden = true;
        updateProfile(profile, role);
        $("#metrics-title").textContent = role.area === "Minha conta" ? "Seu resumo" : `Resumo ${role.area.toLocaleLowerCase("pt-BR")}`;
        $("#metrics-grid").replaceChildren(...role.metrics.map(makeMetric));
        $("#metrics-section").hidden = false;
        const host = $("#role-sections");
        host.replaceChildren();
        const visibleSections = [];
        role.sections.forEach(sectionKey => {
            const modules = role.modules.filter(module => module.section === sectionKey && activePermissions.has(module.permission));
            if (!modules.length && sectionKey !== "conta") return;
            host.append(makeSection(sectionKey, modules));
            visibleSections.push(sectionKey);
        });
        host.hidden = host.children.length === 0;
        const quick = $("#quick-grid");
        quick.replaceChildren(...role.quick.filter(key => visibleSections.includes(key)).map(makeQuickLink));
        $("#quick-section").hidden = quick.children.length === 0;
        if (!visibleSections.length) {
            $("#role-empty-title").textContent = "Nenhum módulo disponibilizado";
            $("#role-empty-copy").textContent = "O perfil foi recebido, mas as permissões informadas não liberaram módulos para exibição.";
            $("#role-empty").hidden = false;
        }
    }
    function handleProfileEvent(event) {
        if (processedEvents.has(event)) return;
        processedEvents.add(event);
        renderProfile(event.detail);
    }
    function initialize() {
        document.addEventListener("perfil-autenticado", handleProfileEvent);
        window.addEventListener("perfil-autenticado", handleProfileEvent);
        showWaitingState();
        if (window.perfilAutenticado) renderProfile(window.perfilAutenticado);
    }
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, {
        once: true
    }); else initialize();
})();
