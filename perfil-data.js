(function() {
    "use strict";
    const $ = (selector, root = document) => root.querySelector(selector);
    const el = (tag, className, value) => {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (value !== undefined && value !== null) node.textContent = String(value);
        return node;
    };
    const moeda = value => Number(value || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
    const dataLocal = value => {
        if (!value) return "—";
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString("pt-BR");
    };
    const texto = (value, fallback = "—") => value === null || value === undefined || value === "" ? fallback : String(value);
    let current = null;
    let workspace;
    let content;
    let heading;
    let activeModuleId = "";
    const TITULOS = {
        "dados-pessoais": "Dados pessoais",
        seguranca: "Segurança",
        preferencias: "Preferências",
        enderecos: "Endereços",
        "meus-pedidos": "Meus pedidos",
        favoritos: "Favoritos",
        carrinho: "Carrinho",
        historico: "Histórico",
        cardapio: "Cardápio",
        "pedidos-unidade": "Pedidos da unidade",
        produtos: "Produtos",
        categorias: "Categorias",
        estoque: "Estoque",
        relatorios: "Relatórios",
        "status-unidade": "Status da unidade",
        notificacoes: "Notificações",
        usuarios: "Usuários",
        gestores: "Gestores",
        "categorias-admin": "Gerenciar categorias",
        permissoes: "Permissões",
        configuracoes: "Configurações",
        logs: "Logs / Auditoria",
        "musicas-admin": "Músicas e playlists"
    };
    function mensagem(text, kind = "info") {
        const node = el("p", `perfil-mensagem perfil-mensagem-${kind}`, text);
        node.setAttribute("role", kind === "erro" ? "alert" : "status");
        return node;
    }
    function setFeedback(container, text, kind = "info") {
        let item = $(".perfil-feedback", container);
        if (!item) {
            item = el("p", "perfil-feedback");
            item.setAttribute("role", kind === "erro" ? "alert" : "status");
            container.prepend(item);
        }
        item.className = `perfil-feedback perfil-mensagem-${kind}`;
        item.textContent = text;
    }
    function button(label, className, onClick) {
        const node = el("button", className || "perfil-acao", label);
        node.type = "button";
        node.addEventListener("click", onClick);
        return node;
    }
    function field(labelText, name, type, value, required = false) {
        const label = el("label", "perfil-campo", labelText);
        const input = el("input", "perfil-input");
        input.name = name;
        input.type = type || "text";
        input.value = value || "";
        input.required = required;
        label.appendChild(input);
        return {
            label: label,
            input: input
        };
    }
    function ensureWorkspace() {
        if (workspace) return;
        const host = $("#role-sections");
        if (!host) return;
        workspace = el("section", "perfil-workspace");
        workspace.id = "perfil-workspace";
        workspace.hidden = true;
        workspace.setAttribute("aria-live", "polite");
        const top = el("div", "perfil-workspace-cabecalho");
        heading = el("h2", "perfil-workspace-titulo");
        const fechar = button("Fechar", "perfil-acao perfil-acao-secundaria", () => {
            workspace.hidden = true;
        });
        top.append(heading, fechar);
        content = el("div", "perfil-workspace-conteudo");
        workspace.append(top, content);
        host.after(workspace);
    }
    function openWorkspace(moduleId) {
        ensureWorkspace();
        if (!workspace) return null;
        heading.textContent = TITULOS[moduleId] || "Recurso do perfil";
        content.replaceChildren(mensagem("Carregando dados…"));
        workspace.hidden = false;
        workspace.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
        return content;
    }
    function openLink(container, label, href) {
        const link = el("a", "perfil-acao perfil-link", label);
        link.href = href;
        container.appendChild(link);
        return link;
    }
    function renderDefinitionList(container, entries) {
        const list = el("dl", "perfil-definicoes");
        entries.forEach(([label, value]) => {
            const group = el("div", "perfil-definicao");
            group.append(el("dt", "", label), el("dd", "", texto(value)));
            list.appendChild(group);
        });
        container.appendChild(list);
    }
    function listContainer(container, emptyText) {
        const list = el("div", "perfil-lista-registros");
        if (!container) return list;
        container.appendChild(list);
        if (emptyText) list.appendChild(mensagem(emptyText));
        return list;
    }
    function replaceList(list, rows, emptyText) {
        list.replaceChildren();
        if (!rows.length) {
            list.appendChild(mensagem(emptyText));
            return;
        }
        rows.forEach(row => list.appendChild(row));
    }
    async function api(name, ...args) {
        if (typeof window[name] !== "function") throw new Error(`A integração ${name} não está disponível nesta instalação.`);
        return window[name](...args);
    }
    function favoriteIds() {
        const key = `kaffee_fuer_alle_favoritos_${current.session.user.id}`;
        try {
            const value = JSON.parse(localStorage.getItem(key) || "[]");
            return Array.isArray(value) ? value : [];
        } catch (_) {
            return [];
        }
    }
    function cartItems() {
        if (!window.carrinhoStore) return [];
        return window.carrinhoStore.lerCarrinho(current.session.user.id);
    }
    async function fetchCustomerOrders() {
        return api("carregarPedidosDoCliente");
    }
    function makeOrderRow(order, isManager = false, statuses = []) {
        const article = el("article", "perfil-registro");
        const orderId = String(order.id || "");
        const orderLabel = orderId ? orderId.slice(0, 8).toUpperCase() : "Pedido";
        const title = el("h3", "perfil-registro-titulo", `Pedido ${orderLabel}`);
        const details = el("p", "perfil-registro-detalhes", `${texto(order.status, "Status não informado")} · ${dataLocal(order.criado_em || order.created_at)} · ${moeda(order.total)}`);
        article.append(title, details);
        if (Array.isArray(order.itens_pedido) && order.itens_pedido.length) {
            const itemNames = order.itens_pedido.map(item => `${texto(item.nome_produto_no_momento, "Item")} × ${texto(item.quantidade, "1")}`).join(", ");
            article.appendChild(el("p", "perfil-registro-itens", itemNames));
        }
        const pedidoAtual = new URLSearchParams(window.location.search).get("pedido");
        if (pedidoAtual && orderId === pedidoAtual) article.classList.add("perfil-registro-destacado");
        if (isManager && orderId && statuses.length) {
            const controls = el("div", "perfil-registro-acoes");
            const select = el("input", "perfil-input");
            select.setAttribute("aria-label", `Novo status para pedido ${orderLabel}`);
            select.value = order.status || "";
            const optionList = el("datalist");
            optionList.id = `status-pedido-${orderId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
            select.setAttribute("list", optionList.id);
            statuses.forEach(status => {
                const option = el("option");
                option.value = status;
                option.label = status;
                optionList.appendChild(option);
            });
            select.placeholder = "Digite o próximo status aceito pelo servidor";
            const save = button("Atualizar status", "perfil-acao", async () => {
                save.disabled = true;
                try {
                    await api("atualizarStatusPedido", order.id, select.value);
                    await openModule("pedidos-unidade");
                } catch (error) {
                    setFeedback(article, error.message || "Não foi possível atualizar o pedido.", "erro");
                    save.disabled = false;
                }
            });
            const cancel = button("Cancelar pedido", "perfil-acao perfil-acao-perigosa", async () => {
                if (!window.confirm(`Confirmar o cancelamento do pedido ${orderLabel}?`)) return;
                cancel.disabled = true;
                try {
                    await api("cancelarPedido", order.id);
                    await openModule("pedidos-unidade");
                } catch (error) {
                    setFeedback(article, error.message || "Não foi possível cancelar o pedido.", "erro");
                    cancel.disabled = false;
                }
            });
            controls.append(select, optionList, save, cancel);
            article.appendChild(controls);
        }
        return article;
    }
    async function renderCustomerOrders(container, history = false) {
        const section = el("div", "perfil-subsecao");
        section.appendChild(el("p", "perfil-ajuda", history ? "Pedidos anteriores registrados para sua conta." : "Pedidos associados à sua sessão autenticada."));
        const list = listContainer(section, "Carregando pedidos…");
        container.appendChild(section);
        try {
            const orders = await fetchCustomerOrders();
            const sorted = [ ...orders || [] ].sort((a, b) => new Date(b.criado_em || 0) - new Date(a.criado_em || 0));
            replaceList(list, sorted.map(order => makeOrderRow(order)), "Ainda não há pedidos para exibir.");
        } catch (error) {
            replaceList(list, [ mensagem(error.message || "Não foi possível consultar pedidos. Verifique as policies de leitura do cliente.", "erro") ]);
        }
    }
    function renderPersonalData(container) {
        const profile = current.profile;
        const form = el("form", "perfil-formulario");
        const name = field("Nome completo", "nome_completo", "text", profile.nome_completo, true);
        const phone = field("Telefone", "telefone", "tel", profile.telefone, false);
        const email = field("E-mail (gerenciado pela autenticação)", "email", "email", profile.email, false);
        email.input.readOnly = true;
        email.input.setAttribute("aria-describedby", "perfil-email-ajuda");
        const emailHelp = el("small", "perfil-ajuda", "Para trocar o e-mail, use o fluxo de confirmação de e-mail do Supabase.");
        emailHelp.id = "perfil-email-ajuda";
        const save = el("button", "perfil-acao", "Salvar dados pessoais");
        save.type = "submit";
        const feedback = el("p", "perfil-feedback");
        feedback.setAttribute("role", "status");
        form.append(name.label, phone.label, email.label, emailHelp, save, feedback);
        form.addEventListener("submit", async event => {
            event.preventDefault();
            save.disabled = true;
            feedback.textContent = "Salvando…";
            try {
                const response = await window.supabaseClient.from("perfis").update({
                    nome_completo: name.input.value.trim(),
                    telefone: phone.input.value.trim() || null
                }).eq("id", profile.id).eq("usuario_auth_id", current.session.user.id);
                if (response.error) throw response.error;
                current.profile = {
                    ...current.profile,
                    nome_completo: name.input.value.trim(),
                    telefone: phone.input.value.trim() || null
                };
                feedback.textContent = "Dados pessoais atualizados.";
                document.dispatchEvent(new CustomEvent("perfil-autenticado", {
                    detail: {
                        profile: current.profile,
                        role: current.role,
                        session: current.session,
                        associations: current.associations
                    }
                }));
            } catch (error) {
                feedback.textContent = error.message || "Não foi possível salvar. Confirme a policy de atualização do próprio perfil.";
                feedback.classList.add("perfil-mensagem-erro");
            } finally {
                save.disabled = false;
            }
        });
        container.append(form);
    }
    function renderSecurity(container) {
        const form = el("form", "perfil-formulario");
        const password = field("Nova senha", "nova_senha", "password", "", true);
        password.input.minLength = 8;
        password.input.autocomplete = "new-password";
        const confirm = field("Confirmar nova senha", "confirmar_senha", "password", "", true);
        confirm.input.minLength = 8;
        confirm.input.autocomplete = "new-password";
        const submit = el("button", "perfil-acao", "Atualizar senha");
        submit.type = "submit";
        const feedback = el("p", "perfil-feedback");
        feedback.setAttribute("role", "status");
        form.append(password.label, confirm.label, submit, feedback);
        form.addEventListener("submit", async event => {
            event.preventDefault();
            if (password.input.value !== confirm.input.value) {
                feedback.textContent = "As senhas não coincidem.";
                feedback.classList.add("perfil-mensagem-erro");
                return;
            }
            submit.disabled = true;
            try {
                const response = await window.supabaseClient.auth.updateUser({
                    password: password.input.value
                });
                if (response.error) throw response.error;
                form.reset();
                feedback.textContent = "Senha atualizada com sucesso.";
                feedback.classList.remove("perfil-mensagem-erro");
            } catch (error) {
                feedback.textContent = error.message || "Não foi possível atualizar a senha.";
                feedback.classList.add("perfil-mensagem-erro");
            } finally {
                submit.disabled = false;
            }
        });
        container.appendChild(mensagem("A troca de senha é enviada diretamente ao Supabase Auth; a senha nunca é armazenada nesta página."));
        container.appendChild(form);
    }
    async function renderPreferences(container) {
        const key = `kaffee_perfil_preferencias_${current.session.user.id}`;
        let saved = {};
        try {
            saved = JSON.parse(localStorage.getItem(key) || "{}");
        } catch (_) {
            saved = {};
        }
        const form = el("form", "perfil-formulario");
        const categoryLabel = el("label", "perfil-campo", "Categoria favorita do cardápio");
        const category = el("select", "perfil-select");
        category.name = "categoria";
        const all = el("option", "", "Sem preferência");
        all.value = "";
        category.appendChild(all);
        try {
            const categories = await api("carregarCategorias");
            (categories || []).forEach(item => {
                const option = el("option", "", item.nome);
                option.value = item.id;
                category.appendChild(option);
            });
        } catch (_) {
            categoryLabel.appendChild(el("small", "perfil-ajuda", "As categorias não puderam ser carregadas agora."));
        }
        category.value = saved.categoria || "";
        categoryLabel.appendChild(category);
        const motionLabel = el("label", "perfil-opcao");
        const motion = el("input");
        motion.type = "checkbox";
        motion.name = "reduzir_efeitos";
        motion.checked = Boolean(saved.reduzir_efeitos);
        motionLabel.append(motion, document.createTextNode(" Reduzir animações neste dispositivo"));
        const submit = el("button", "perfil-acao", "Salvar preferências");
        submit.type = "submit";
        const feedback = el("p", "perfil-feedback");
        feedback.setAttribute("role", "status");
        form.append(categoryLabel, motionLabel, submit, feedback);
        form.addEventListener("submit", event => {
            event.preventDefault();
            const prefs = {
                categoria: category.value,
                reduzir_efeitos: motion.checked
            };
            localStorage.setItem(key, JSON.stringify(prefs));
            document.body.classList.toggle("perfil-reduzir-efeitos", prefs.reduzir_efeitos);
            feedback.textContent = "Preferências salvas neste dispositivo.";
        });
        document.body.classList.toggle("perfil-reduzir-efeitos", motion.checked);
        container.appendChild(mensagem("Estas preferências são locais ao navegador; o projeto ainda não possui uma tabela de preferências no Supabase."));
        container.appendChild(form);
    }
    async function renderAddresses(container) {
        const addresses = await api("perfilListarEnderecos");
        const form = el("form", "perfil-formulario");
        const formTitle = el("h3", "perfil-subtitulo", "Novo endereço");
        const name = field("Identificação do endereço", "nome_endereco", "text", "", true);
        const street = field("Rua", "rua", "text", "", true);
        const number = field("Número", "numero", "text", "", true);
        const complement = field("Complemento", "complemento", "text", "", false);
        const district = field("Bairro", "bairro", "text", "", true);
        const city = field("Cidade", "cidade", "text", "", true);
        const state = field("Estado", "estado", "text", "", true);
        const postalCode = field("CEP", "cep", "text", "", true);
        const primaryLabel = el("label", "perfil-opcao");
        const primary = el("input");
        primary.type = "checkbox";
        primaryLabel.append(primary, document.createTextNode(" Definir como endereço principal"));
        const save = el("button", "perfil-acao", "Salvar endereço");
        save.type = "submit";
        const cancelEdit = button("Cancelar edição", "perfil-acao perfil-acao-secundaria", () => {
            form.reset();
            form.dataset.addressId = "";
            formTitle.textContent = "Novo endereço";
            save.textContent = "Salvar endereço";
            cancelEdit.hidden = true;
        });
        cancelEdit.hidden = true;
        form.append(formTitle, name.label, street.label, number.label, complement.label, district.label, city.label, state.label, postalCode.label, primaryLabel, save, cancelEdit);
        form.addEventListener("submit", async event => {
            event.preventDefault();
            save.disabled = true;
            const payload = {
                nome_endereco: name.input.value.trim(),
                rua: street.input.value.trim(),
                numero: number.input.value.trim(),
                complemento: complement.input.value.trim(),
                bairro: district.input.value.trim(),
                cidade: city.input.value.trim(),
                estado: state.input.value.trim(),
                cep: postalCode.input.value.trim(),
                principal: primary.checked
            };
            try {
                await api("perfilSalvarEndereco", form.dataset.addressId || null, payload);
                await openModule("enderecos");
            } catch (error) {
                setFeedback(form, error.message || "Não foi possível salvar o endereço.", "erro");
                save.disabled = false;
            }
        });
        container.appendChild(form);
        const list = listContainer(container);
        replaceList(list, (addresses || []).filter(address => address.ativo !== false).map(address => {
            const item = el("article", "perfil-registro");
            const addressLine = `${address.rua}, ${address.numero}${address.complemento ? ` · ${address.complemento}` : ""} · ${address.bairro} · ${address.cidade}/${address.estado} · CEP ${address.cep}`;
            item.append(el("h3", "perfil-registro-titulo", `${address.nome_endereco}${address.principal ? " · Principal" : ""}`), el("p", "perfil-registro-detalhes", addressLine));
            const actions = el("div", "perfil-registro-acoes");
            const edit = button("Editar", "perfil-acao perfil-acao-secundaria", () => {
                form.dataset.addressId = address.id;
                formTitle.textContent = "Editar endereço";
                name.input.value = address.nome_endereco || "";
                street.input.value = address.rua || "";
                number.input.value = address.numero || "";
                complement.input.value = address.complemento || "";
                district.input.value = address.bairro || "";
                city.input.value = address.cidade || "";
                state.input.value = address.estado || "";
                postalCode.input.value = address.cep || "";
                primary.checked = Boolean(address.principal);
                save.textContent = "Salvar alterações";
                cancelEdit.hidden = false;
                form.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            });
            const makePrimary = button("Definir principal", "perfil-acao perfil-acao-secundaria", async () => {
                makePrimary.disabled = true;
                try {
                    await api("perfilDefinirEnderecoPrincipal", address.id);
                    await openModule("enderecos");
                } catch (error) {
                    setFeedback(item, error.message || "Não foi possível definir o endereço principal.", "erro");
                    makePrimary.disabled = false;
                }
            });
            makePrimary.disabled = Boolean(address.principal);
            const deactivate = button("Desativar", "perfil-acao perfil-acao-perigosa", async () => {
                if (!window.confirm(`Desativar o endereço “${address.nome_endereco}”?`)) return;
                deactivate.disabled = true;
                try {
                    await api("perfilDesativarEndereco", address.id);
                    await openModule("enderecos");
                } catch (error) {
                    setFeedback(item, error.message || "Não foi possível desativar o endereço.", "erro");
                    deactivate.disabled = false;
                }
            });
            actions.append(edit, makePrimary, deactivate);
            item.appendChild(actions);
            return item;
        }), "Você ainda não cadastrou um endereço ativo.");
    }
    async function renderNotifications(container) {
        const notifications = await api("carregarNotificacoes");
        const list = listContainer(container);
        replaceList(list, (notifications || []).map(notification => {
            const item = el("article", "perfil-registro");
            item.append(el("h3", "perfil-registro-titulo", notification.titulo || "Notificação"), el("p", "perfil-registro-detalhes", `${notification.mensagem || ""} · ${dataLocal(notification.criado_em)} · ${notification.lida ? "Lida" : "Não lida"}`));
            if (!notification.lida) {
                const markRead = button("Marcar como lida", "perfil-acao perfil-acao-secundaria", async () => {
                    markRead.disabled = true;
                    try {
                        await api("perfilMarcarNotificacaoLida", notification.id);
                        await openModule("notificacoes");
                    } catch (error) {
                        setFeedback(item, error.message || "Não foi possível atualizar a notificação.", "erro");
                        markRead.disabled = false;
                    }
                });
                item.appendChild(markRead);
            }
            return item;
        }), "Nenhuma notificação foi registrada para esta conta.");
    }
    async function renderFavorites(container) {
        const ids = favoriteIds();
        const count = ids.length;
        container.appendChild(mensagem(`${count} produto(s) salvo(s) nos favoritos desta conta neste navegador.`));
        openLink(container, "Abrir favoritos", "favorito.html");
        if (!count) return;
        try {
            const products = await api("carregarProdutos");
            const favorites = products.filter(product => ids.some(id => String(id) === String(product.id)));
            const list = listContainer(container);
            replaceList(list, favorites.map(product => {
                const item = el("article", "perfil-registro");
                item.append(el("h3", "perfil-registro-titulo", product.nome), el("p", "perfil-registro-detalhes", moeda(product.preco)));
                return item;
            }), "Os favoritos salvos não correspondem a produtos atualmente disponíveis.");
        } catch (error) {
            container.appendChild(mensagem(error.message || "Não foi possível carregar o catálogo para mostrar os favoritos.", "erro"));
        }
    }
    function renderCart(container) {
        const items = cartItems();
        const count = items.reduce((sum, item) => sum + Number(item.quantidade || 0), 0);
        container.appendChild(mensagem(`${count} unidade(s) no carrinho.`));
        openLink(container, "Continuar para o carrinho", "Carrinho/carrinho.html");
        const list = listContainer(container);
        replaceList(list, items.map(item => {
            const node = el("article", "perfil-registro");
            node.append(el("h3", "perfil-registro-titulo", item.nome), el("p", "perfil-registro-detalhes", `${item.quantidade} × ${moeda(item.preco)} · ${moeda(item.quantidade * item.preco)}`));
            return node;
        }), "Seu carrinho está vazio.");
    }
    function renderMenu(container) {
        container.appendChild(mensagem("Explore as categorias e os produtos disponíveis na cafeteria."));
        openLink(container, "Abrir cardápio", "cardapio.html");
    }
    async function renderManagerOrders(container) {
        const cafeteriaId = await api("obterCafeteriaPadrao");
        const orders = await api("carregarPedidosDaCafeteria", cafeteriaId);
        const statuses = [ ...new Set((orders || []).map(order => order.status).filter(Boolean)) ];
        container.appendChild(mensagem("Os pedidos são carregados para a cafeteria associada à sessão. A alteração de status é validada pelo RPC e pelas policies do servidor."));
        const list = listContainer(container);
        replaceList(list, (orders || []).map(order => makeOrderRow(order, true, statuses)), "Não há pedidos registrados para esta unidade.");
    }
    async function renderProducts(container) {
        const products = await api("carregarProdutosGestor");
        const list = listContainer(container);
        replaceList(list, (products || []).map(product => {
            const article = el("article", "perfil-registro");
            const details = el("p", "perfil-registro-detalhes", `${moeda(product.preco)} · ${product.disponivel ? "Disponível" : "Indisponível"}`);
            const toggle = button(product.disponivel ? "Tornar indisponível" : "Tornar disponível", "perfil-acao", async () => {
                toggle.disabled = true;
                try {
                    await api("alternarDisponibilidadeProduto", product.id, !product.disponivel);
                    await openModule("produtos");
                } catch (error) {
                    setFeedback(article, error.message || "Não foi possível alterar a disponibilidade.", "erro");
                    toggle.disabled = false;
                }
            });
            article.append(el("h3", "perfil-registro-titulo", product.nome), details, toggle);
            return article;
        }), "Não há produtos disponíveis na consulta da unidade.");
    }
    async function renderCategories(container) {
        const cafeteriaId = await api("obterCafeteriaPadrao");
        const categories = await api("adminListarCategorias", cafeteriaId);
        const form = el("form", "perfil-formulario");
        form.appendChild(el("h3", "perfil-subtitulo", "Adicionar categoria"));
        const name = field("Nome", "nome", "text", "", true);
        const description = field("Descrição (opcional)", "descricao", "text", "", false);
        const order = field("Ordem", "ordem", "number", String((categories || []).length), false);
        order.input.min = "0";
        const create = el("button", "perfil-acao", "Adicionar categoria");
        create.type = "submit";
        form.append(name.label, description.label, order.label, create);
        form.addEventListener("submit", async event => {
            event.preventDefault();
            create.disabled = true;
            try {
                await api("adminCriarCategoria", cafeteriaId, name.input.value.trim(), description.input.value.trim(), Number(order.input.value || 0));
                await openModule(activeModuleId);
            } catch (error) {
                setFeedback(form, error.message || "Não foi possível adicionar a categoria.", "erro");
                create.disabled = false;
            }
        });
        container.appendChild(form);
        const list = listContainer(container);
        replaceList(list, (categories || []).map(category => {
            const item = el("article", "perfil-registro");
            const details = el("p", "perfil-registro-detalhes", `${category.ativa ? "Ativa" : "Inativa"} · Ordem ${texto(category.ordem, "0")} · ${texto(category.descricao, "Sem descrição")}`);
            const actions = el("div", "perfil-registro-acoes");
            const edit = button("Editar", "perfil-acao perfil-acao-secundaria", () => {
                const editForm = el("form", "perfil-formulario perfil-formulario-edicao");
                const editName = field("Nome", "nome", "text", category.nome, true);
                const editDescription = field("Descrição", "descricao", "text", category.descricao || "", false);
                const editOrder = field("Ordem", "ordem", "number", String(category.ordem ?? 0), false);
                editOrder.input.min = "0";
                const save = el("button", "perfil-acao", "Salvar categoria");
                save.type = "submit";
                editForm.append(editName.label, editDescription.label, editOrder.label, save);
                editForm.addEventListener("submit", async event => {
                    event.preventDefault();
                    save.disabled = true;
                    try {
                        await api("adminEditarCategoria", category.id, editName.input.value.trim(), editDescription.input.value.trim(), Number(editOrder.input.value || 0), Boolean(category.ativa));
                        await openModule(activeModuleId);
                    } catch (error) {
                        setFeedback(editForm, error.message || "Não foi possível editar a categoria.", "erro");
                        save.disabled = false;
                    }
                });
                item.appendChild(editForm);
                edit.disabled = true;
            });
            const toggle = button(category.ativa ? "Desativar" : "Ativar", "perfil-acao perfil-acao-secundaria", async () => {
                toggle.disabled = true;
                try {
                    await api("adminEditarCategoria", category.id, category.nome, category.descricao || "", Number(category.ordem || 0), !category.ativa);
                    await openModule(activeModuleId);
                } catch (error) {
                    setFeedback(item, error.message || "Não foi possível alterar o estado da categoria.", "erro");
                    toggle.disabled = false;
                }
            });
            const remove = button("Remover", "perfil-acao perfil-acao-perigosa", async () => {
                if (!window.confirm(`Remover a categoria “${category.nome}”? Só é possível excluir categorias sem produtos associados; caso contrário, desative-a.`)) return;
                remove.disabled = true;
                try {
                    await api("adminExcluirCategoria", category.id);
                    await openModule(activeModuleId);
                } catch (error) {
                    setFeedback(item, error.message || "Não foi possível remover a categoria.", "erro");
                    remove.disabled = false;
                }
            });
            actions.append(edit, toggle, remove);
            item.append(el("h3", "perfil-registro-titulo", category.nome), details, actions);
            return item;
        }), "Nenhuma categoria foi encontrada para esta cafeteria.");
        container.appendChild(mensagem("A remoção física é bloqueada pelo servidor quando há produtos associados. Nesse caso, desative a categoria para preservá-los."));
    }
    async function renderStock(container) {
        const rows = await api("carregarEstoqueAbaixoMinimo");
        const list = listContainer(container);
        replaceList(list, (rows || []).map(stock => {
            const article = el("article", "perfil-registro");
            const name = stock.produtos && stock.produtos.nome || stock.nome || stock.produto_nome || "Item de estoque";
            const quantity = stock.quantidade_atual ?? stock.quantidade ?? stock.estoque_atual;
            const minimum = stock.quantidade_minima ?? stock.estoque_minimo ?? stock.minimo;
            article.append(el("h3", "perfil-registro-titulo", name), el("p", "perfil-registro-detalhes", `Quantidade: ${texto(quantity)} · Mínimo: ${texto(minimum)}`));
            if (stock.id) {
                const movements = button("Ver movimentos", "perfil-acao perfil-acao-secundaria", async () => {
                    try {
                        const values = await api("carregarMovimentosEstoque", stock.id);
                        const moveList = el("div", "perfil-lista-registros");
                        replaceList(moveList, (values || []).map(movement => {
                            const row = el("article", "perfil-registro");
                            const description = Object.entries(movement).filter(([key, value]) => ![ "id", "estoque_id" ].includes(key) && [ "string", "number" ].includes(typeof value)).slice(0, 5).map(([key, value]) => `${key}: ${value}`).join(" · ");
                            row.appendChild(el("p", "perfil-registro-detalhes", description || "Movimento registrado"));
                            return row;
                        }), "Nenhum movimento encontrado.");
                        article.appendChild(moveList);
                        movements.disabled = true;
                    } catch (error) {
                        setFeedback(article, error.message || "Não foi possível carregar os movimentos.", "erro");
                    }
                });
                article.appendChild(movements);
            }
            return article;
        }), "Nenhum registro de estoque foi retornado.");
        container.appendChild(mensagem("O nome da função existente sugere itens abaixo do mínimo, mas a consulta atual retorna os registros da tabela estoque; a filtragem dependerá da policy/schema do banco."));
    }
    async function renderReports(container) {
        const cafeteriaId = await api("obterCafeteriaPadrao");
        const orders = await api("carregarVendasDoDia", cafeteriaId);
        const today = new Date;
        const todayOrders = (orders || []).filter(order => {
            const date = new Date(order.criado_em || order.created_at || 0);
            return !Number.isNaN(date.getTime()) && date.toDateString() === today.toDateString();
        });
        const total = todayOrders.reduce((sum, order) => sum + Number(order.total || 0), 0);
        renderDefinitionList(container, [ [ "Pedidos hoje", todayOrders.length ], [ "Total registrado", moeda(total) ], [ "Unidade", cafeteriaId ] ]);
        container.appendChild(mensagem("O relatório é calculado a partir dos pedidos retornados pelo Supabase e do campo total; não inclui taxas ou custos ausentes no esquema exposto."));
    }
    async function renderUnitStatus(container) {
        const results = await Promise.allSettled([ api("cafeteriaAtual"), api("carregarStatusIntegracoes") ]);
        if (results[0].status === "fulfilled") {
            const cafe = results[0].value;
            renderDefinitionList(container, [ [ "Cafeteria", cafe.nome ], [ "Identificador", cafe.id ], [ "Ativa", cafe.ativa ? "Sim" : "Não" ] ]);
        } else container.appendChild(mensagem(results[0].reason.message || "Dados da cafeteria indisponíveis.", "erro"));
        container.appendChild(el("h3", "perfil-subtitulo", "Integrações"));
        const integrations = results[1].status === "fulfilled" ? results[1].value : [];
        const list = listContainer(container);
        replaceList(list, (integrations || []).map(integration => {
            const item = el("article", "perfil-registro");
            const visible = Object.entries(integration).filter(([key, value]) => key !== "id" && [ "string", "number", "boolean" ].includes(typeof value)).slice(0, 6);
            item.appendChild(el("p", "perfil-registro-detalhes", visible.map(([key, value]) => `${key}: ${value}`).join(" · ") || "Integração registrada"));
            return item;
        }), results[1].status === "rejected" ? results[1].reason.message || "Tabela de integrações indisponível." : "Nenhuma integração registrada.");
    }
    async function profilesList(container, filter) {
        const [profiles, cafeterias] = await Promise.all([ api("adminListarPerfis"), api("adminListarCafeterias") ]);
        const cafeNames = new Map((cafeterias || []).map(cafe => [ String(cafe.id), cafe.nome ]));
        const list = listContainer(container);
        const papelDoPerfil = profile => {
            const roles = [ profile.tipo_usuario, ...(profile.usuarios_cafeterias || []).map(item => item.funcao) ].map(value => String(value || "").trim().toLowerCase());
            if (roles.some(role => [ "desenvolvedor", "developer", "admin", "administrador" ].includes(role))) return "desenvolvedor";
            if (roles.some(role => [ "gestor", "manager" ].includes(role))) return "gestor";
            return "cliente";
        };
        const rows = (profiles || []).filter(profile => {
            if (filter === "gestor") return papelDoPerfil(profile) === "gestor";
            return true;
        }).map(profile => {
            const item = el("article", "perfil-registro");
            const role = papelDoPerfil(profile);
            const associationText = (profile.usuarios_cafeterias || []).map(association => `${association.funcao}${cafeNames.has(String(association.cafeteria_id)) ? ` · ${cafeNames.get(String(association.cafeteria_id))}` : ""}`).join(", ");
            item.append(el("h3", "perfil-registro-titulo", profile.nome_completo || "Perfil"), el("p", "perfil-registro-detalhes", `${texto(profile.email)} · ${texto(profile.telefone, "Sem telefone")} · Papel: ${role} · ${profile.ativo ? "Ativo" : "Inativo"}`), el("p", "perfil-registro-detalhes", `Vínculos: ${texto(associationText, "nenhum")}`));
            const actions = el("div", "perfil-registro-acoes");
            const selfTarget = String(profile.id) === String(current.profile.id);
            const edit = button("Editar", "perfil-acao perfil-acao-secundaria", () => {
                const form = el("form", "perfil-formulario perfil-formulario-edicao");
                const name = field("Nome completo", "nome_completo", "text", profile.nome_completo || "", true);
                const phone = field("Telefone", "telefone", "tel", profile.telefone || "", false);
                const email = field("E-mail (somente leitura)", "email", "email", profile.email || "", false);
                email.input.readOnly = true;
                const save = el("button", "perfil-acao", "Salvar dados");
                save.type = "submit";
                form.append(name.label, phone.label, email.label, save);
                form.addEventListener("submit", async event => {
                    event.preventDefault();
                    save.disabled = true;
                    try {
                        await api("adminEditarPerfil", profile.id, name.input.value.trim(), phone.input.value.trim());
                        await openModule(activeModuleId);
                    } catch (error) {
                        setFeedback(form, error.message || "Não foi possível editar o perfil.", "erro");
                        save.disabled = false;
                    }
                });
                item.appendChild(form);
                edit.disabled = true;
            });
            const roleForm = el("form", "perfil-formulario perfil-formulario-edicao");
            const roleLabel = el("label", "perfil-campo", "Papel da conta");
            const roleSelect = el("select", "perfil-select");
            [ [ "cliente", "Cliente" ], [ "gestor", "Gestor" ], [ "desenvolvedor", "Desenvolvedor" ] ].forEach(([value, label]) => {
                const option = el("option", "", label);
                option.value = value;
                option.selected = role === value;
                roleSelect.appendChild(option);
            });
            roleLabel.appendChild(roleSelect);
            const cafeLabel = el("label", "perfil-campo", "Cafeteria do gestor");
            const cafeSelect = el("select", "perfil-select");
            cafeSelect.required = true;
            const existingCafe = (profile.usuarios_cafeterias || []).find(association => [ "gestor", "manager" ].includes(String(association.funcao || "").toLowerCase()));
            (cafeterias || []).forEach(cafe => {
                const option = el("option", "", cafe.nome);
                option.value = cafe.id;
                option.selected = existingCafe && String(existingCafe.cafeteria_id) === String(cafe.id);
                cafeSelect.appendChild(option);
            });
            cafeLabel.appendChild(cafeSelect);
            const necessitaCafeteria = () => roleSelect.value === "gestor";
            const updateCafeVisibility = () => {
                cafeLabel.hidden = !necessitaCafeteria();
            };
            roleSelect.addEventListener("change", updateCafeVisibility);
            updateCafeVisibility();
            const saveRole = el("button", "perfil-acao", "Salvar papel");
            saveRole.type = "submit";
            saveRole.disabled = selfTarget || necessitaCafeteria() && !(cafeterias || []).length;
            roleForm.append(roleLabel, cafeLabel, saveRole);
            roleForm.addEventListener("submit", async event => {
                event.preventDefault();
                saveRole.disabled = true;
                try {
                    await api("adminDefinirPapelUsuario", profile.id, roleSelect.value, necessitaCafeteria() ? cafeSelect.value : null);
                    await openModule(activeModuleId);
                } catch (error) {
                    setFeedback(roleForm, error.message || "Não foi possível alterar o papel.", "erro");
                    saveRole.disabled = false;
                }
            });
            roleSelect.addEventListener("change", () => {
                saveRole.disabled = selfTarget || necessitaCafeteria() && !(cafeterias || []).length;
            });
            const accountAction = button(profile.ativo ? "Excluir (desativar)" : "Reativar", profile.ativo ? "perfil-acao perfil-acao-perigosa" : "perfil-acao perfil-acao-secundaria", async () => {
                if (selfTarget && profile.ativo) return;
                if (profile.ativo && !window.confirm(`Desativar a conta de ${profile.nome_completo || profile.email}? O perfil ativo será bloqueado nas próximas verificações do site, mas uma sessão Auth já aberta não é revogada por esta ação. A identidade e o histórico serão preservados. Exclusão permanente exige uma função Auth Admin no servidor.`)) return;
                accountAction.disabled = true;
                try {
                    await api("adminDefinirAtivoUsuario", profile.id, !profile.ativo);
                    await openModule(activeModuleId);
                } catch (error) {
                    setFeedback(item, error.message || "Não foi possível alterar o estado da conta.", "erro");
                    accountAction.disabled = false;
                }
            });
            accountAction.disabled = selfTarget && Boolean(profile.ativo);
            actions.append(edit, accountAction);
            item.append(actions, roleForm);
            return item;
        });
        replaceList(list, rows, "Nenhum perfil corresponde ao filtro.");
        container.appendChild(mensagem("Edição, papéis e desativação são validados no servidor. A exclusão é reversível para preservar pedidos e auditoria; o e-mail de autenticação só pode ser alterado pela API Auth Admin no servidor."));
    }
    async function renderPermissions(container) {
        const profiles = await api("adminListarPerfis");
        const list = listContainer(container);
        replaceList(list, (profiles || []).map(profile => {
            const item = el("article", "perfil-registro");
            const associations = profile.usuarios_cafeterias || [];
            const roles = associations.map(association => `${association.funcao} · ${association.cafeteria_id}`).join(", ");
            item.append(el("h3", "perfil-registro-titulo", profile.nome_completo || profile.email || "Perfil"), el("p", "perfil-registro-detalhes", roles || "Nenhuma associação de cafeteria"));
            return item;
        }), "Nenhuma associação retornada.");
        container.appendChild(mensagem("As associações são somente leitura nesta interface; não há função segura de escrita de papéis/permissões no repositório."));
    }
    async function renderUnitSettings(container) {
        const cafe = await api("cafeteriaAtual");
        const entries = Object.entries(cafe || {}).filter(([key, value]) => key !== "id" && [ "string", "number", "boolean" ].includes(typeof value)).slice(0, 20).map(([key, value]) => [ key, value ]);
        renderDefinitionList(container, [ [ "Identificador", cafe.id ], ...entries ]);
        container.appendChild(mensagem("Os dados de configuração são exibidos em modo de consulta. O repositório não define formulário nem RPC para editar o registro da cafeteria."));
    }
    async function renderLogs(container) {
        const logs = await api("carregarLogs");
        const list = listContainer(container);
        replaceList(list, (logs || []).map(log => {
            const row = el("article", "perfil-registro");
            const details = Object.entries(log).filter(([key, value]) => key !== "id" && [ "string", "number", "boolean" ].includes(typeof value)).slice(0, 7).map(([key, value]) => `${key}: ${value}`).join(" · ");
            row.appendChild(el("p", "perfil-registro-detalhes", details || "Registro de auditoria"));
            return row;
        }), "Nenhum log foi retornado.");
    }
    async function renderMusicAdmin(container) {
        const playlists = await api("carregarPlaylistsComMusicas");
        const playlistForm = el("form", "perfil-formulario");
        playlistForm.appendChild(el("h3", "perfil-subtitulo", "Nova playlist"));
        const playlistName = field("Nome", "nome", "text", "", true);
        const playlistDescription = field("Descrição", "descricao", "text", "", false);
        const createPlaylist = el("button", "perfil-acao", "Criar playlist");
        createPlaylist.type = "submit";
        playlistForm.append(playlistName.label, playlistDescription.label, createPlaylist);
        playlistForm.addEventListener("submit", async event => {
            event.preventDefault();
            createPlaylist.disabled = true;
            try {
                await api("cadastrarPlaylist", {
                    nome: playlistName.input.value.trim(),
                    descricao: playlistDescription.input.value.trim()
                });
                await openModule("musicas-admin");
            } catch (error) {
                setFeedback(playlistForm, error.message || "Não foi possível criar a playlist.", "erro");
                createPlaylist.disabled = false;
            }
        });
        container.appendChild(playlistForm);
        const musicForm = el("form", "perfil-formulario");
        musicForm.appendChild(el("h3", "perfil-subtitulo", "Adicionar música"));
        const playlistLabel = el("label", "perfil-campo", "Playlist");
        const playlistSelect = el("select", "perfil-select");
        playlistSelect.name = "playlist_id";
        playlistSelect.required = true;
        (playlists || []).forEach(playlist => {
            const option = el("option", "", playlist.nome);
            option.value = playlist.id;
            playlistSelect.appendChild(option);
        });
        playlistLabel.appendChild(playlistSelect);
        const title = field("Título", "titulo", "text", "", true);
        const artist = field("Artista", "artista", "text", "", true);
        const audioUrl = field("URL do áudio (opcional se enviar MP3)", "url_audio", "url", "", false);
        const audioFileLabel = el("label", "perfil-campo", "Arquivo MP3 (opcional se informar URL)");
        const audioFile = el("input", "perfil-input");
        audioFile.type = "file";
        audioFile.accept = ".mp3,audio/mpeg,audio/mp3";
        audioFileLabel.appendChild(audioFile);
        const imageUrl = field("URL da capa (opcional)", "imagem_url", "url", "", false);
        const createTrack = el("button", "perfil-acao", "Adicionar música");
        createTrack.type = "submit";
        createTrack.disabled = !(playlists || []).length;
        musicForm.append(playlistLabel, title.label, artist.label, audioUrl.label, audioFileLabel, imageUrl.label, createTrack);
        if (!(playlists || []).length) musicForm.appendChild(mensagem("Crie uma playlist antes de cadastrar músicas."));
        musicForm.addEventListener("submit", async event => {
            event.preventDefault();
            createTrack.disabled = true;
            try {
                const uploadedUrl = audioFile.files && audioFile.files[0] ? await api("uploadMusica", audioFile.files[0]) : "";
                const finalUrl = uploadedUrl || audioUrl.input.value.trim();
                if (!finalUrl) throw new Error("Informe uma URL de áudio ou selecione um arquivo MP3.");
                await api("cadastrarMusica", {
                    playlist_id: playlistSelect.value,
                    titulo: title.input.value.trim(),
                    artista: artist.input.value.trim(),
                    url_audio: finalUrl,
                    imagem_url: imageUrl.input.value.trim() || null
                });
                await openModule("musicas-admin");
            } catch (error) {
                setFeedback(musicForm, error.message || "Não foi possível cadastrar a música.", "erro");
                createTrack.disabled = false;
            }
        });
        container.appendChild(musicForm);
        (playlists || []).forEach(playlist => {
            container.appendChild(el("h3", "perfil-subtitulo", playlist.nome));
            const list = listContainer(container);
            const tracks = playlist.musicas || [];
            replaceList(list, tracks.map(track => {
                const row = el("article", "perfil-registro");
                row.append(el("h4", "perfil-registro-titulo", track.titulo), el("p", "perfil-registro-detalhes", `${texto(track.artista)} · ${track.ativa === false ? "Inativa" : "Ativa"}`));
                const actions = el("div", "perfil-registro-acoes");
                const edit = button("Editar", "perfil-acao perfil-acao-secundaria", () => {
                    const form = el("form", "perfil-formulario perfil-formulario-edicao");
                    const newTitle = field("Título", "titulo", "text", track.titulo, true);
                    const newArtist = field("Artista", "artista", "text", track.artista, true);
                    const newAudio = field("URL do áudio", "url_audio", "url", track.url_audio, true);
                    const save = el("button", "perfil-acao", "Salvar alterações");
                    save.type = "submit";
                    form.append(newTitle.label, newArtist.label, newAudio.label, save);
                    form.addEventListener("submit", async event => {
                        event.preventDefault();
                        save.disabled = true;
                        try {
                            await api("atualizarMusica", track.id, {
                                titulo: newTitle.input.value.trim(),
                                artista: newArtist.input.value.trim(),
                                url_audio: newAudio.input.value.trim()
                            });
                            await openModule("musicas-admin");
                        } catch (error) {
                            setFeedback(form, error.message || "Não foi possível atualizar a música.", "erro");
                            save.disabled = false;
                        }
                    });
                    row.appendChild(form);
                    edit.disabled = true;
                });
                const remove = button("Excluir", "perfil-acao perfil-acao-perigosa", async () => {
                    if (!window.confirm(`Excluir a música “${track.titulo}”?`)) return;
                    remove.disabled = true;
                    try {
                        await api("apagarMusica", track.id);
                        await openModule("musicas-admin");
                    } catch (error) {
                        setFeedback(row, error.message || "Não foi possível excluir a música.", "erro");
                        remove.disabled = false;
                    }
                });
                actions.append(edit, remove);
                row.appendChild(actions);
                return row;
            }), "Esta playlist ainda não tem músicas.");
        });
    }
    const BUILDERS = {
        "dados-pessoais": renderPersonalData,
        seguranca: renderSecurity,
        preferencias: renderPreferences,
        enderecos: renderAddresses,
        "meus-pedidos": container => renderCustomerOrders(container, false),
        historico: container => renderCustomerOrders(container, true),
        notificacoes: renderNotifications,
        favoritos: renderFavorites,
        carrinho: renderCart,
        cardapio: renderMenu,
        "pedidos-unidade": renderManagerOrders,
        produtos: renderProducts,
        categorias: renderCategories,
        "categorias-admin": renderCategories,
        estoque: renderStock,
        relatorios: renderReports,
        "status-unidade": renderUnitStatus,
        usuarios: container => profilesList(container, ""),
        gestores: container => profilesList(container, "gestor"),
        permissoes: renderPermissions,
        configuracoes: renderUnitSettings,
        logs: renderLogs,
        "musicas-admin": renderMusicAdmin
    };
    const ADMIN_MODULES = new Set([ "usuarios", "gestores", "categorias-admin", "permissoes", "configuracoes", "logs", "musicas-admin" ]);
    const MANAGER_MODULES = new Set([ "pedidos-unidade", "produtos", "categorias", "estoque", "relatorios", "status-unidade" ]);
    async function openModule(moduleId) {
        if (ADMIN_MODULES.has(moduleId) && current.role !== "admin") return;
        if (MANAGER_MODULES.has(moduleId) && ![ "gestor", "admin" ].includes(current.role)) return;
        activeModuleId = moduleId;
        const panel = openWorkspace(moduleId);
        if (!panel) return;
        const builder = BUILDERS[moduleId];
        if (!builder) {
            panel.replaceChildren(mensagem("Este recurso não possui integração de dados neste projeto."));
            return;
        }
        try {
            await builder(panel);
        } catch (error) {
            panel.replaceChildren(mensagem(error.message || "Não foi possível carregar este recurso.", "erro"));
        }
    }
    function metric(label, value, note) {
        const cards = [ ...document.querySelectorAll(".cartao-metrica") ];
        const card = cards.find(item => $(".metrica-rotulo", item)?.textContent === label);
        if (!card) return;
        $(".metrica-valor", card).textContent = value;
        $(".metrica-nota", card).textContent = note;
    }
    async function loadCustomerMetrics() {
        const [ordersResult] = await Promise.allSettled([ fetchCustomerOrders() ]);
        metric("Pedidos", ordersResult.status === "fulfilled" ? String((ordersResult.value || []).length) : "—", ordersResult.status === "fulfilled" ? "Pedidos vinculados à sessão" : "Não foi possível consultar pedidos");
        metric("Favoritos", String(favoriteIds().length), "Salvos neste navegador para sua conta");
        const cartCount = cartItems().reduce((sum, item) => sum + Number(item.quantidade || 0), 0);
        metric("Itens no carrinho", String(cartCount), "Unidades guardadas para sua conta");
        metric("Fidelidade", "—", "Programa de pontos não configurado no banco");
    }
    async function loadManagerMetrics() {
        const results = await Promise.allSettled([ api("carregarProdutosGestor"), api("carregarPedidosDaCafeteria"), api("carregarEstoqueAbaixoMinimo"), api("carregarVendasDoDia") ]);
        const products = results[0].status === "fulfilled" ? results[0].value : [];
        const orders = results[1].status === "fulfilled" ? results[1].value : [];
        const stock = results[2].status === "fulfilled" ? results[2].value : [];
        const sales = results[3].status === "fulfilled" ? results[3].value : [];
        metric("Produtos", results[0].status === "fulfilled" ? String(products.length) : "—", "Produtos retornados pela unidade");
        metric("Pedidos", results[1].status === "fulfilled" ? String(orders.length) : "—", "Pedidos da cafeteria associada");
        metric("Estoque", results[2].status === "fulfilled" ? String(stock.length) : "—", "Registros de estoque retornados");
        const today = (new Date).toDateString();
        const daily = sales.filter(order => new Date(order.criado_em || order.created_at || 0).toDateString() === today);
        metric("Vendas", results[3].status === "fulfilled" ? moeda(daily.reduce((sum, order) => sum + Number(order.total || 0), 0)) : "—", "Total de pedidos criados hoje");
    }
    async function loadAdminMetrics() {
        const results = await Promise.allSettled([ api("carregarProdutosGestor"), api("adminListarPerfis"), api("carregarPedidosDaCafeteria") ]);
        const products = results[0].status === "fulfilled" ? results[0].value : [];
        const profiles = results[1].status === "fulfilled" ? results[1].value : [];
        const orders = results[2].status === "fulfilled" ? results[2].value : [];
        const managers = profiles.filter(profile => String(profile.tipo_usuario || "").toLowerCase() === "gestor" || (profile.usuarios_cafeterias || []).some(association => [ "gestor", "manager" ].includes(String(association.funcao || "").toLowerCase())));
        metric("Produtos", results[0].status === "fulfilled" ? String(products.length) : "—", "Catálogo da unidade");
        metric("Gestores", results[1].status === "fulfilled" ? String(managers.length) : "—", "Contas vinculadas como gestor");
        metric("Pedidos", results[2].status === "fulfilled" ? String(orders.length) : "—", "Pedidos retornados para a unidade");
        metric("Clientes", results[1].status === "fulfilled" ? String(profiles.filter(profile => profile.tipo_usuario === "cliente").length) : "—", "Perfis classificados como cliente");
    }
    function installHandlers() {
        const host = $("#role-sections");
        if (!host || host.dataset.handlersInstalled) return;
        host.dataset.handlersInstalled = "true";
        host.addEventListener("click", event => {
            const card = event.target.closest("[data-module-id]");
            if (card) openModule(card.dataset.moduleId);
        });
    }
    function handleProfile(event) {
        const detail = event.detail || {};
        const profile = detail.profile;
        if (!profile || !detail.session) return;
        current = {
            profile: profile,
            role: detail.role || profile.tipo_usuario,
            session: detail.session,
            associations: detail.associations || []
        };
        ensureWorkspace();
        applySavedPreferences(detail.session);
        const reducers = {
            cliente: loadCustomerMetrics,
            gestor: loadManagerMetrics,
            admin: loadAdminMetrics
        };
        const loader = reducers[current.role];
        if (loader) loader().catch(error => console.error("Métricas do perfil:", error));
    }
    function handleProfileError(event) {
        const sessao = typeof window.appSessao === "function" ? window.appSessao() : null;
        const mensagem = event.detail && event.detail.message || "Não foi possível carregar os dados da conta.";
        const contaDesativada = /desativad[oa]/i.test(mensagem);
        const status = $("#profile-state");
        if (status) status.textContent = contaDesativada ? "CONTA DESATIVADA" : sessao && sessao.user ? "SESSÃO ATIVA — PERFIL INDISPONÍVEL" : "PERFIL INDISPONÍVEL";
        const copy = $("#role-empty-copy");
        if (copy) copy.textContent = mensagem;
        const title = $("#role-empty-title");
        if (title) title.textContent = contaDesativada ? "Conta desativada" : "Perfil indisponível";
        const empty = $("#role-empty");
        if (empty) empty.hidden = false;
    }
    function applySavedPreferences(session = window.appSessao && window.appSessao()) {
        if (!session || !session.user) return;
        try {
            const preferences = JSON.parse(localStorage.getItem(`kaffee_perfil_preferencias_${session.user.id}`) || "{}");
            document.body.classList.toggle("perfil-reduzir-efeitos", Boolean(preferences.reduzir_efeitos));
        } catch (_) {}
    }
    document.addEventListener("DOMContentLoaded", installHandlers, {
        once: true
    });
    window.addEventListener("perfil-autenticado", handleProfile);
    window.addEventListener("perfil-erro", handleProfileError);
    applySavedPreferences();
})();
