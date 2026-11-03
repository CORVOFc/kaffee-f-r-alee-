(function() {
    "use strict";
    const sparkCanvas = document.querySelector("#efeito-clique");
    const sparkContext = sparkCanvas?.getContext("2d");
    const sparks = [];
    const sparkConfig = {
        color: "#94300f",
        size: 13,
        radius: 40,
        count: 9,
        duration: 500
    };
    function ajustarCanvasSpark() {
        if (!sparkCanvas || !sparkContext) return;
        const escala = Math.min(window.devicePixelRatio || 1, 2);
        sparkCanvas.width = window.innerWidth * escala;
        sparkCanvas.height = window.innerHeight * escala;
        sparkContext.setTransform(escala, 0, 0, escala, 0, 0);
    }
    function criarSparks(evento) {
        if (!sparkCanvas || !sparkContext) return;
        if (evento.pointerType === "mouse" && evento.button !== 0) return;
        const agora = performance.now();
        for (let i = 0; i < sparkConfig.count; i += 1) {
            sparks.push({
                x: evento.clientX,
                y: evento.clientY,
                angulo: Math.PI * 2 * i / sparkConfig.count,
                inicio: agora
            });
        }
    }
    function animarSparks(tempo) {
        if (!sparkCanvas || !sparkContext) return;
        sparkContext.clearRect(0, 0, window.innerWidth, window.innerHeight);
        for (let i = sparks.length - 1; i >= 0; i -= 1) {
            const spark = sparks[i];
            const progresso = (tempo - spark.inicio) / sparkConfig.duration;
            if (progresso >= 1) {
                sparks.splice(i, 1);
                continue;
            }
            const suave = progresso * (2 - progresso);
            const distancia = suave * sparkConfig.radius;
            const comprimento = sparkConfig.size * (1 - suave);
            const x1 = spark.x + distancia * Math.cos(spark.angulo);
            const y1 = spark.y + distancia * Math.sin(spark.angulo);
            const x2 = spark.x + (distancia + comprimento) * Math.cos(spark.angulo);
            const y2 = spark.y + (distancia + comprimento) * Math.sin(spark.angulo);
            sparkContext.strokeStyle = sparkConfig.color;
            sparkContext.lineWidth = 2;
            sparkContext.lineCap = "round";
            sparkContext.beginPath();
            sparkContext.moveTo(x1, y1);
            sparkContext.lineTo(x2, y2);
            sparkContext.stroke();
        }
        window.requestAnimationFrame(animarSparks);
    }
    if (sparkCanvas && sparkContext) {
        ajustarCanvasSpark();
        window.addEventListener("resize", ajustarCanvasSpark);
        document.addEventListener("pointerdown", criarSparks);
        window.requestAnimationFrame(animarSparks);
    }
    const silkCanvas = document.querySelector("#fundo-seda");
    const silkGL = silkCanvas?.getContext("webgl", {
        alpha: false,
        antialias: false
    });
    const temaInicialClaro = document.documentElement.classList.contains("tema-invertido");
    const silkConfig = {
        speed: 12,
        scale: 1,
        color: temaInicialClaro ? "#e8d5b7" : "#631f08",
        noiseIntensity: 1.5,
        rotation: 0,
        patternMin: temaInicialClaro ? .78 : .2
    };
    const silkVertexShader = `\n  attribute vec2 position;\n  varying vec2 vUv;\n  void main() {\n    vUv = position * 0.5 + 0.5;\n    gl_Position = vec4(position, 0.0, 1.0);\n  }`;
    const silkFragmentShader = `\n  precision mediump float;\n  varying vec2 vUv;\n  uniform float uTime;\n  uniform vec3 uColor;\n  uniform float uSpeed;\n  uniform float uScale;\n  uniform float uRotation;\n  uniform float uNoiseIntensity;\n  uniform float uPatternMin;\n  const float e = 2.71828182845904523536;\n  float noise(vec2 texCoord) {\n    vec2 r = e * sin(e * texCoord);\n    return fract(r.x * r.y * (1.0 + texCoord.x));\n  }\n  vec2 rotateUvs(vec2 uv, float angle) {\n    float c = cos(angle);\n    float s = sin(angle);\n    return mat2(c, -s, s, c) * uv;\n  }\n  void main() {\n    float rnd = noise(gl_FragCoord.xy);\n    vec2 uv = rotateUvs(vUv * uScale, uRotation);\n    vec2 tex = uv * uScale;\n    float tOffset = uSpeed * uTime;\n    tex.y += 0.03 * sin(8.0 * tex.x - tOffset);\n    float rawOsc = sin(5.0 * (tex.x + tex.y +\n      cos(3.0 * tex.x + 5.0 * tex.y) + 0.02 * tOffset) +\n      sin(20.0 * (tex.x + tex.y - 0.1 * tOffset)));\n    float pattern = uPatternMin + (1.0 - uPatternMin) * (0.5 + 0.5 * rawOsc);\n    vec4 col = vec4(uColor, 1.0) * vec4(pattern) - rnd / 15.0 * uNoiseIntensity;\n    gl_FragColor = vec4(col.rgb, 1.0);\n  }`;
    function criarShaderSilk(tipo, codigo) {
        const shader = silkGL.createShader(tipo);
        silkGL.shaderSource(shader, codigo);
        silkGL.compileShader(shader);
        return shader;
    }
    function iniciarSilk() {
        if (!silkCanvas || !silkGL) return null;
        const programa = silkGL.createProgram();
        silkGL.attachShader(programa, criarShaderSilk(silkGL.VERTEX_SHADER, silkVertexShader));
        silkGL.attachShader(programa, criarShaderSilk(silkGL.FRAGMENT_SHADER, silkFragmentShader));
        silkGL.linkProgram(programa);
        silkGL.useProgram(programa);
        const buffer = silkGL.createBuffer();
        silkGL.bindBuffer(silkGL.ARRAY_BUFFER, buffer);
        silkGL.bufferData(silkGL.ARRAY_BUFFER, new Float32Array([ -1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1 ]), silkGL.STATIC_DRAW);
        const posicao = silkGL.getAttribLocation(programa, "position");
        silkGL.enableVertexAttribArray(posicao);
        silkGL.vertexAttribPointer(posicao, 2, silkGL.FLOAT, false, 0, 0);
        return {
            programa: programa,
            tempo: silkGL.getUniformLocation(programa, "uTime"),
            velocidade: silkGL.getUniformLocation(programa, "uSpeed"),
            escala: silkGL.getUniformLocation(programa, "uScale"),
            cor: silkGL.getUniformLocation(programa, "uColor"),
            "ruído": silkGL.getUniformLocation(programa, "uNoiseIntensity"),
            "rotação": silkGL.getUniformLocation(programa, "uRotation"),
            patternMin: silkGL.getUniformLocation(programa, "uPatternMin")
        };
    }
    const silkPrograma = iniciarSilk();
    function ajustarCanvasSilk() {
        if (!silkCanvas || !silkGL) return;
        const escala = Math.min(window.devicePixelRatio || 1, 2);
        silkCanvas.width = window.innerWidth * escala;
        silkCanvas.height = window.innerHeight * escala;
        silkGL.viewport(0, 0, silkCanvas.width, silkCanvas.height);
    }
    function animarSilk(tempo) {
        if (!silkPrograma || !silkGL) return;
        const r = parseInt(silkConfig.color.slice(1, 3), 16) / 255;
        const g = parseInt(silkConfig.color.slice(3, 5), 16) / 255;
        const b = parseInt(silkConfig.color.slice(5, 7), 16) / 255;
        silkGL.useProgram(silkPrograma.programa);
        silkGL.uniform1f(silkPrograma.tempo, tempo * 1e-4);
        silkGL.uniform1f(silkPrograma.velocidade, silkConfig.speed);
        silkGL.uniform1f(silkPrograma.escala, silkConfig.scale);
        silkGL.uniform1f(silkPrograma.ruído, silkConfig.noiseIntensity);
        silkGL.uniform1f(silkPrograma.rotação, silkConfig.rotation);
        silkGL.uniform1f(silkPrograma.patternMin, silkConfig.patternMin);
        silkGL.uniform3f(silkPrograma.cor, r, g, b);
        silkGL.drawArrays(silkGL.TRIANGLES, 0, 6);
        window.requestAnimationFrame(animarSilk);
    }
    if (silkCanvas && silkGL && silkPrograma) {
        ajustarCanvasSilk();
        window.addEventListener("resize", ajustarCanvasSilk);
        window.requestAnimationFrame(animarSilk);
    } else if (silkCanvas) {
        console.warn("WebGL indisponível — usando fallback CSS.");
        silkCanvas.classList.add("fallback-sem-webgl");
        function ajustarCanvasFallback() {
            silkCanvas.width = window.innerWidth;
            silkCanvas.height = window.innerHeight;
        }
        ajustarCanvasFallback();
        window.addEventListener("resize", ajustarCanvasFallback);
    }
    const app = document.querySelector("#aplicacao");
    if (!app) return;
    const homeHTML = app.cloneNode(true);
    const chaveExtras = "kaffe_jornais_extras";
    const chaveSenha = "kaffe_senha_simples";
    const chaveFavoritos = "kaffe_favoritos";
    const chaveTema = "kaffe_tema_invertido";
    const chaveLogado = "kaffe_logado";
    const senhaPadrao = "cafe123";
    const categorias = [ "Notícias", "Economia", "Tecnologia", "Esportes", "Ciência & Cultura" ];
    const estado = {
        categoria: "Todos",
        busca: "",
        logado: localStorage.getItem(chaveLogado) === "true",
        feedback: "",
        favoritosOnly: false,
        editando: null
    };
    function selecionar(seletor, area = document) {
        return area.querySelector(seletor);
    }
    function urlValida(url) {
        try {
            const u = new URL(url);
            return u.protocol === "http:" || u.protocol === "https:";
        } catch {
            return false;
        }
    }
    function avisar(texto) {
        const el = selecionar("#mensagem-acessivel");
        if (el) el.textContent = texto;
    }
    function criarCardJornal(jornal) {
        const card = document.createElement("a");
        card.className = "card-jornal";
        card.dataset.nome = jornal.nome;
        card.dataset.categoria = jornal.categoria;
        card.dataset.site = jornal.site;
        card.dataset.rss = jornal.rss;
        card.href = `#/jornal/${encodeURIComponent(jornal.nome)}`;
        const logo = document.createElement("span");
        logo.className = "logo-jornal";
        logo.textContent = jornal.logo || jornal.nome.slice(0, 2).toUpperCase();
        const conteudo = document.createElement("span");
        conteudo.className = "conteudo-card";
        const etiqueta = document.createElement("span");
        etiqueta.className = "etiqueta";
        etiqueta.textContent = jornal.categoria;
        const titulo = document.createElement("strong");
        titulo.textContent = jornal.nome;
        const link = document.createElement("span");
        link.className = "link-card";
        link.textContent = "Ver manchetes";
        conteudo.append(etiqueta, titulo, link);
        card.append(logo, conteudo);
        return card;
    }
    function renderizarGrupos() {
        const container = selecionar("#grupos-jornais");
        if (!container) return;
        container.replaceChildren();
        const lista = Array.isArray(window.jornaisDisponiveis) ? window.jornaisDisponiveis : [];
        categorias.forEach(cat => {
            const jornais = lista.filter(j => j.categoria === cat);
            if (!jornais.length) return;
            const secao = document.createElement("section");
            secao.className = "grupo-jornal";
            secao.dataset.grupo = cat;
            const tituloGrupo = document.createElement("div");
            tituloGrupo.className = "titulo-grupo";
            const info = document.createElement("div");
            const sobre = document.createElement("span");
            sobre.className = "sobretitulo";
            sobre.textContent = cat;
            const h3 = document.createElement("h3");
            h3.textContent = `${cat} — atualizado`;
            info.append(sobre, h3);
            const contagem = document.createElement("span");
            contagem.className = "quantidade";
            const contagemNum = document.createElement("span");
            contagemNum.dataset.contagem = "";
            contagemNum.textContent = String(jornais.length);
            contagem.append(contagemNum, document.createTextNode(" jornais"));
            tituloGrupo.append(info, contagem);
            const grade = document.createElement("div");
            grade.className = "grade-jornais";
            jornais.forEach(j => grade.appendChild(criarCardJornal(j)));
            secao.append(tituloGrupo, grade);
            container.appendChild(secao);
        });
    }
    function extrairJornais() {
        return [ ...document.querySelectorAll(".card-jornal") ].map(card => ({
            nome: card.dataset.nome,
            categoria: card.dataset.categoria,
            site: card.dataset.site,
            rss: card.dataset.rss
        }));
    }
    function lerExtras() {
        try {
            const e = JSON.parse(localStorage.getItem(chaveExtras));
            return Array.isArray(e) ? e : [];
        } catch {
            return [];
        }
    }
    function salvarExtras(extras) {
        localStorage.setItem(chaveExtras, JSON.stringify(extras));
    }
    let resolverModal = null;
    function abrirModal(titulo, texto, textoConfirmar = "Confirmar") {
        const fundo = selecionar("#modal-fundo");
        selecionar("#modal-titulo").textContent = titulo;
        selecionar("#modal-texto").textContent = texto;
        selecionar("[data-modal-confirmar]").textContent = textoConfirmar;
        fundo.classList.add("visivel");
        return new Promise(resolve => {
            resolverModal = resolve;
        });
    }
    document.addEventListener("click", evento => {
        if (evento.target.closest("[data-modal-cancelar]")) {
            selecionar("#modal-fundo").classList.remove("visivel");
            resolverModal?.(false);
            resolverModal = null;
        }
        if (evento.target.closest("[data-modal-confirmar]")) {
            selecionar("#modal-fundo").classList.remove("visivel");
            resolverModal?.(true);
            resolverModal = null;
        }
    });
    function lerFavoritos() {
        try {
            const dados = JSON.parse(localStorage.getItem(chaveFavoritos));
            if (!Array.isArray(dados)) return [];
            return [ ...new Set(dados.map(item => typeof item === "string" ? item : item?.nome).filter(Boolean).map(nome => String(nome).trim())) ];
        } catch {
            return [];
        }
    }
    function normalizarNomeJornal(nome) {
        return String(nome || "").trim().toLocaleLowerCase("pt-BR");
    }
    function salvarFavoritos(favoritos) {
        localStorage.setItem(chaveFavoritos, JSON.stringify(favoritos));
    }
    function alternarFavorito(nome) {
        const favoritos = lerFavoritos();
        const norm = normalizarNomeJornal(nome);
        const indice = favoritos.findIndex(f => normalizarNomeJornal(f) === norm);
        if (indice === -1) favoritos.push(String(nome).trim()); else favoritos.splice(indice, 1);
        salvarFavoritos(favoritos);
        atualizarFiltro();
        avisar(indice === -1 ? `${nome} foi salvo nos favoritos.` : `${nome} saiu dos favoritos.`);
    }
    function adicionarBotoesFavoritos() {
        const favoritos = lerFavoritos();
        document.querySelectorAll(".card-jornal").forEach(card => {
            const nome = card.dataset.nome?.trim();
            if (!nome) return;
            let botao = card.querySelector("[data-favorito]");
            if (!botao) {
                botao = document.createElement("div");
                botao.className = "plusButton";
                botao.tabIndex = 0;
                botao.setAttribute("role", "button");
                botao.dataset.favorito = nome;
                const svgNs = "http://www.w3.org/2000/svg";
                const icone = document.createElementNS(svgNs, "svg");
                icone.setAttribute("class", "plusIcon");
                icone.setAttribute("viewBox", "0 0 30 30");
                icone.setAttribute("aria-hidden", "true");
                const caminho = document.createElementNS(svgNs, "path");
                caminho.setAttribute("d", "M13.75 23.75V16.25H6.25V13.75H13.75V6.25H16.25V13.75H23.75V16.25H16.25V23.75H13.75Z");
                icone.appendChild(caminho);
                botao.replaceChildren(icone);
                card.appendChild(botao);
            }
            const ativo = favoritos.some(f => normalizarNomeJornal(f) === normalizarNomeJornal(nome));
            botao.classList.toggle("ativo", ativo);
            botao.setAttribute("aria-pressed", String(ativo));
            botao.setAttribute("aria-label", `${ativo ? "Remover dos" : "Adicionar aos"} favoritos: ${nome}`);
        });
        atualizarContadorFavoritos();
    }
    function atualizarContadorFavoritos() {
        const botaoFav = document.querySelector("[data-favoritos]");
        if (!botaoFav) return;
        const total = lerFavoritos().length;
        let contador = botaoFav.querySelector(".contador-favoritos");
        if (!contador) {
            contador = document.createElement("span");
            contador.className = "contador-favoritos";
            botaoFav.appendChild(contador);
        }
        contador.textContent = total;
        contador.hidden = total === 0;
    }
    function atualizarFiltro() {
        const termo = estado.busca.trim().toLocaleLowerCase("pt-BR");
        const cartoes = [ ...document.querySelectorAll(".card-jornal") ];
        const nomesDisponiveis = new Set(cartoes.map(c => normalizarNomeJornal(c.dataset.nome)));
        const favoritosOriginais = lerFavoritos();
        const favoritos = favoritosOriginais.filter(n => nomesDisponiveis.has(normalizarNomeJornal(n)));
        const favoritosNorm = new Set(favoritos.map(normalizarNomeJornal));
        let total = 0;
        if (favoritos.length !== favoritosOriginais.length) salvarFavoritos(favoritos);
        cartoes.forEach(card => {
            const texto = `${card.dataset.nome} ${card.dataset.categoria}`.toLocaleLowerCase("pt-BR");
            const catOk = estado.categoria === "Todos" || card.dataset.categoria === estado.categoria;
            const buscaOk = !termo || texto.includes(termo);
            const favOk = !estado.favoritosOnly || favoritosNorm.has(normalizarNomeJornal(card.dataset.nome));
            const visivel = catOk && buscaOk && favOk;
            card.hidden = !visivel;
            if (visivel) total += 1;
        });
        document.querySelectorAll(".grupo-jornal").forEach(grupo => {
            const visiveis = [ ...grupo.querySelectorAll(".card-jornal") ].filter(c => !c.hidden);
            grupo.hidden = visiveis.length === 0;
            const contador = selecionar("[data-contagem]", grupo);
            if (contador) contador.textContent = visiveis.length;
        });
        const resultado = selecionar("#resultado-busca");
        if (resultado) {
            let contexto = "";
            if (estado.favoritosOnly && estado.categoria !== "Todos") {
                contexto = ` (favoritos de ${estado.categoria})`;
            } else if (estado.favoritosOnly) {
                contexto = " (favoritos)";
            } else if (estado.categoria !== "Todos") {
                contexto = ` (${estado.categoria})`;
            }
            const palavra = total === 1 ? "jornal encontrado" : "jornais encontrados";
            const quantidade = document.createElement("strong");
            quantidade.textContent = String(total);
            resultado.replaceChildren(quantidade, document.createTextNode(` ${palavra}${contexto}.`));
        }
        document.querySelectorAll("button[data-categoria]").forEach(botao => {
            const ativo = botao.dataset.categoria === estado.categoria;
            botao.classList.toggle("ativo", ativo);
            botao.setAttribute("aria-pressed", String(ativo));
        });
        const vazio = selecionar("#estado-vazio");
        if (vazio) vazio.hidden = total > 0;
        const botaoFav = selecionar("[data-favoritos]");
        if (botaoFav) {
            botaoFav.classList.toggle("ativo", estado.favoritosOnly);
            botaoFav.setAttribute("aria-pressed", String(estado.favoritosOnly));
        }
        adicionarBotoesFavoritos();
    }
    function aplicarCategoria(categoria) {
        estado.categoria = categoria === "Todos" || categorias.includes(categoria) ? categoria : "Todos";
        estado.busca = "";
        if (window.location.hash && window.location.hash !== "#/") {
            window.location.hash = "#/";
            return;
        }
        const busca = selecionar("#campo-busca-jornais");
        if (busca) busca.value = "";
        atualizarFiltro();
        selecionar("#lista-jornais")?.scrollIntoView({
            behavior: "smooth"
        });
    }
    function mostrarHome() {
        app.replaceChildren(...homeHTML.childNodes);
        renderizarGrupos();
        const busca = selecionar("#campo-busca-jornais");
        if (busca) busca.value = estado.busca;
        atualizarFiltro();
    }
    function mostrarHomeComFade() {
        mostrarHome();
        const area = selecionar("#aplicacao");
        area?.classList.remove("fade-in");
        window.requestAnimationFrame(() => area?.classList.add("fade-in"));
        adicionarBotoesFavoritos();
    }
    function mostrarModelo(id) {
        const modelo = selecionar(id);
        app.replaceChildren(modelo.content.cloneNode(true));
    }
    function atualizarRota() {
        const rota = window.location.hash || "#/";
        estado.feedback = "";
        avisar("");
        try {
            if (rota === "#/") mostrarHomeComFade(); else if (rota === "#/admin") mostrarAdminComEdicao(); else if (rota.startsWith("#/jornal/")) mostrarJornalComFade(decodeURIComponent(rota.replace("#/jornal/", ""))); else window.location.hash = "#/";
        } catch {
            window.location.hash = "#/";
        }
        window.scrollTo(0, 0);
    }
    function mostrarJornal(nome) {
        const todos = [ ...window.jornaisDisponiveis || [], ...lerExtras() ];
        const jornal = todos.find(item => item.nome === nome);
        if (!jornal) {
            window.location.hash = "#/";
            return;
        }
        mostrarModelo("#modelo-jornal");
        selecionar("#jornal-categoria").textContent = jornal.categoria;
        selecionar("#jornal-nome").textContent = jornal.nome;
        selecionar("#jornal-site").href = jornal.site;
        carregarFeed(jornal);
    }
    function mostrarJornalComFade(nome) {
        mostrarJornal(nome);
        const area = selecionar("#aplicacao");
        area?.classList.remove("fade-in");
        window.requestAnimationFrame(() => area?.classList.add("fade-in"));
    }
    async function carregarFeed(jornal) {
        const feed = selecionar("#lista-manchetes");
        try {
            const url = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(jornal.rss)}`;
            const resposta = await fetch(url);
            if (!resposta.ok) throw new Error("Feed indisponível");
            const dados = await resposta.json();
            const itens = Array.isArray(dados.items) ? dados.items.slice(0, 10) : [];
            if (!itens.length) throw new Error("Feed vazio");
            const noticias = itens.map((item, indice) => {
                const artigo = document.createElement("article");
                artigo.className = "noticia";
                const numero = document.createElement("span");
                numero.className = "numero-noticia";
                numero.textContent = String(indice + 1).padStart(2, "0");
                const conteudo = document.createElement("div");
                const data = document.createElement("p");
                data.className = "data-noticia";
                data.textContent = item.pubDate || "";
                const titulo = document.createElement("h2");
                const link = document.createElement("a");
                const destino = urlValida(item.link || "") ? item.link : jornal.site;
                if (urlValida(destino || "")) link.href = destino;
                link.target = "_blank";
                link.rel = "noopener";
                link.textContent = item.title || "Sem título";
                titulo.appendChild(link);
                conteudo.append(data, titulo);
                artigo.append(numero, conteudo);
                return artigo;
            });
            feed.replaceChildren(...noticias);
            feed.setAttribute("aria-busy", "false");
        } catch {
            const erroFeed = document.createElement("div");
            erroFeed.className = "erro";
            const tituloErro = document.createElement("h2");
            tituloErro.textContent = "Não foi possível carregar as manchetes agora.";
            const explicacaoErro = document.createElement("p");
            explicacaoErro.textContent = "Você pode visitar o site oficial do jornal diretamente.";
            const linkOficial = document.createElement("a");
            linkOficial.className = "botao-principal";
            if (urlValida(jornal.site || "")) linkOficial.href = jornal.site;
            linkOficial.target = "_blank";
            linkOficial.rel = "noopener";
            linkOficial.textContent = "Abrir site oficial";
            erroFeed.append(tituloErro, explicacaoErro, linkOficial);
            feed.replaceChildren(erroFeed);
            feed.setAttribute("aria-busy", "false");
        }
    }
    function feedbackElemento() {
        if (!estado.feedback) return null;
        const elemento = document.createElement("p");
        elemento.className = "feedback";
        elemento.setAttribute("role", "status");
        elemento.textContent = estado.feedback;
        return elemento;
    }
    function criarCampo(texto, controle) {
        const label = document.createElement("label");
        label.append(document.createTextNode(texto), controle);
        return label;
    }
    function mostrarAdmin() {
        if (!window.appPode || !window.appPode("desenvolvedor")) {
            window.location.hash = "#/";
            return;
        }
        mostrarModelo("#modelo-admin");
        const area = selecionar("#admin-conteudo");
        const feedback = feedbackElemento();
        if (!estado.logado) {
            const formulario = document.createElement("form");
            formulario.className = "formulario formulario-login";
            formulario.dataset.form = "login";
            const titulo = document.createElement("h2");
            titulo.textContent = "Entrar no painel";
            const descricao = document.createElement("p");
            descricao.textContent = "Use a senha da cafeteria para gerenciar os jornais.";
            const senha = document.createElement("input");
            senha.name = "senha";
            senha.type = "password";
            senha.autocomplete = "current-password";
            senha.required = true;
            const entrar = document.createElement("button");
            entrar.className = "botao-principal";
            entrar.type = "submit";
            entrar.textContent = "entrar";
            formulario.append(titulo, descricao, criarCampo("Senha", senha), entrar);
            area.replaceChildren(...[ feedback, formulario ].filter(Boolean));
            return;
        }
        const extras = lerExtras();
        const sessao = document.createElement("div");
        sessao.className = "sessao-ativa";
        sessao.append(document.createTextNode("Sessão ativa "));
        const sair = document.createElement("button");
        sair.type = "button";
        sair.dataset.sair = "";
        sair.textContent = "sair";
        sessao.appendChild(sair);
        const formulario = document.createElement("form");
        formulario.className = "formulario";
        formulario.dataset.form = "novo-jornal";
        const tituloFormulario = document.createElement("h2");
        tituloFormulario.textContent = "Adicionar jornal";
        const nome = document.createElement("input");
        nome.name = "nome";
        nome.required = true;
        nome.placeholder = "Ex.: Gazeta do Café";
        const categoria = document.createElement("select");
        categoria.name = "categoria";
        categorias.forEach(item => {
            const opcao = document.createElement("option");
            opcao.value = item;
            opcao.textContent = item;
            categoria.appendChild(opcao);
        });
        const site = document.createElement("input");
        site.name = "site";
        site.type = "url";
        site.required = true;
        site.placeholder = "https://exemplo.com.br";
        const rss = document.createElement("input");
        rss.name = "rss";
        rss.type = "url";
        rss.required = true;
        rss.placeholder = "https://exemplo.com.br/feed/";
        const cadastrar = document.createElement("button");
        cadastrar.className = "botao-principal";
        cadastrar.type = "submit";
        cadastrar.textContent = "cadastrar jornal";
        formulario.append(tituloFormulario, criarCampo("Nome do jornal", nome), criarCampo("Categoria", categoria), criarCampo("Site oficial", site), criarCampo("Feed RSS", rss), cadastrar);
        const lista = document.createElement("section");
        lista.className = "lista-admin";
        const tituloLista = document.createElement("h2");
        tituloLista.textContent = `Jornais adicionados (${extras.length})`;
        lista.appendChild(tituloLista);
        if (!extras.length) {
            const vazio = document.createElement("p");
            vazio.textContent = "Nenhum jornal novo.";
            lista.appendChild(vazio);
        }
        extras.forEach(jornal => {
            const linha = document.createElement("p");
            const nomeJornal = document.createElement("strong");
            nomeJornal.textContent = jornal.nome;
            const categoriaJornal = document.createElement("span");
            categoriaJornal.textContent = jornal.categoria;
            const editar = document.createElement("button");
            editar.type = "button";
            editar.className = "botao-editar";
            editar.dataset.editar = jornal.nome;
            editar.textContent = "editar";
            const apagar = document.createElement("button");
            apagar.type = "button";
            apagar.className = "botao-apagar";
            apagar.dataset.apagar = jornal.nome;
            apagar.textContent = "apagar";
            linha.append(nomeJornal, categoriaJornal, editar, apagar);
            lista.appendChild(linha);
        });
        area.replaceChildren(...[ feedback, sessao, formulario, lista ].filter(Boolean));
    }
    function adicionarCamposExtras(formulario, jornal = {}) {
        if (!formulario || formulario.querySelector('[name="logo"]')) return;
        const rss = formulario.querySelector('[name="rss"]')?.closest("label");
        const campos = document.createElement("div");
        campos.className = "campos-extras";
        const logo = document.createElement("input");
        logo.name = "logo";
        logo.maxLength = 5;
        logo.placeholder = "Ex.: KFA";
        logo.value = jornal.logo || "";
        const descricao = document.createElement("textarea");
        descricao.name = "descricao";
        descricao.rows = 2;
        descricao.placeholder = "Ex.: Notícias para a sua pausa.";
        descricao.value = jornal.descricao || "";
        campos.append(criarCampo("Sigla ou logo", logo), criarCampo("Descrição curta", descricao));
        rss?.after(campos);
    }
    function mostrarAdminComEdicao() {
        mostrarAdmin();
        const formulario = selecionar('[data-form="novo-jornal"]');
        if (!formulario) return;
        const jornal = lerExtras().find(item => item.nome === estado.editando) || {};
        if (estado.editando) {
            const nomeInput = formulario.querySelector('[name="nome"]');
            const catSelect = formulario.querySelector('[name="categoria"]');
            const siteInput = formulario.querySelector('[name="site"]');
            const rssInput = formulario.querySelector('[name="rss"]');
            if (nomeInput) nomeInput.value = jornal.nome || "";
            if (catSelect) catSelect.value = jornal.categoria || categorias[0];
            if (siteInput) siteInput.value = jornal.site || "";
            if (rssInput) rssInput.value = jornal.rss || "";
        }
        adicionarCamposExtras(formulario, jornal);
        const tituloForm = selecionar("h2", formulario);
        const botaoSubmit = selecionar('button[type="submit"]', formulario);
        if (estado.editando) {
            tituloForm.textContent = "Editar jornal";
            botaoSubmit.textContent = "salvar alterações";
            if (!formulario.querySelector("[data-cancelar-edicao]")) {
                const cancelar = document.createElement("button");
                cancelar.type = "button";
                cancelar.dataset.cancelarEdicao = "";
                cancelar.className = "botao-limpar";
                cancelar.textContent = "cancelar edição";
                botaoSubmit.after(cancelar);
            }
        } else {
            tituloForm.textContent = "Adicionar jornal";
            botaoSubmit.textContent = "cadastrar jornal";
        }
    }
    function editarJornal(nome) {
        estado.editando = nome;
        mostrarAdminComEdicao();
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }
    function fazerLogin(evento) {
        evento.preventDefault();
        const senha = new FormData(evento.target).get("senha");
        const senhaCerta = localStorage.getItem(chaveSenha) || senhaPadrao;
        if (senha !== senhaCerta) {
            estado.feedback = "Senha incorreta. Tente novamente.";
            mostrarAdminComEdicao();
            return;
        }
        estado.logado = true;
        localStorage.setItem(chaveLogado, "true");
        estado.feedback = "Login realizado.";
        mostrarAdminComEdicao();
    }
    function cadastrarOuEditarJornal(evento) {
        evento.preventDefault();
        const dados = Object.fromEntries(new FormData(evento.target));
        if (!dados.nome.trim() || !urlValida(dados.site) || !urlValida(dados.rss)) {
            estado.feedback = "Preencha o nome e os endereços válidos do jornal.";
            mostrarAdminComEdicao();
            return;
        }
        const jornal = {
            nome: dados.nome.trim(),
            categoria: dados.categoria,
            site: dados.site,
            rss: dados.rss,
            logo: dados.logo?.trim() || "",
            descricao: dados.descricao?.trim() || "",
            criadoEm: Date.now()
        };
        const extras = lerExtras();
        const indice = extras.findIndex(item => item.nome === estado.editando);
        if (indice === -1) extras.push(jornal); else extras[indice] = {
            ...extras[indice],
            ...jornal
        };
        salvarExtras(extras);
        estado.editando = null;
        estado.feedback = indice === -1 ? "Jornal cadastrado com sucesso." : "Jornal atualizado com sucesso.";
        mostrarAdminComEdicao();
    }
    async function apagarJornal(nome) {
        const confirmou = await abrirModal("Apagar jornal", `Tem certeza que deseja apagar "${nome}"? Esta ação não pode ser desfeita.`, "Apagar");
        if (!confirmou) return;
        const extras = lerExtras().filter(j => j.nome !== nome);
        salvarExtras(extras);
        estado.feedback = "Jornal apagado com sucesso.";
        mostrarAdminComEdicao();
    }
    document.addEventListener("click", evento => {
        const categoria = evento.target.closest("button[data-categoria]");
        if (categoria) {
            aplicarCategoria(categoria.dataset.categoria);
            return;
        }
        if (evento.target.closest("[data-limpar]")) {
            estado.categoria = "Todos";
            estado.busca = "";
            mostrarHomeComFade();
            selecionar("#campo-busca-jornais")?.focus();
            return;
        }
        if (evento.target.closest("[data-limpar-filtros]")) {
            estado.categoria = "Todos";
            estado.busca = "";
            estado.favoritosOnly = false;
            const campoBusca = selecionar("#campo-busca-jornais");
            if (campoBusca) campoBusca.value = "";
            atualizarFiltro();
            avisar("Filtros limpos.");
            return;
        }
        const favorito = evento.target.closest("[data-favorito]");
        if (favorito) {
            evento.preventDefault();
            evento.stopPropagation();
            alternarFavorito(favorito.dataset.favorito);
            return;
        }
        if (evento.target.closest("[data-cancelar-edicao]")) {
            estado.editando = null;
            estado.feedback = "";
            mostrarAdminComEdicao();
            avisar("Edição cancelada.");
            return;
        }
        const editar = evento.target.closest("[data-editar]");
        if (editar) {
            evento.preventDefault();
            editarJornal(editar.dataset.editar);
            return;
        }
        const apagar = evento.target.closest("[data-apagar]");
        if (apagar) {
            apagarJornal(apagar.dataset.apagar);
            return;
        }
        if (evento.target.closest("[data-sair]")) {
            estado.logado = false;
            localStorage.removeItem(chaveLogado);
            estado.feedback = "";
            mostrarAdminComEdicao();
            return;
        }
        if (evento.target.closest("[data-favoritos]")) {
            estado.favoritosOnly = !estado.favoritosOnly;
            atualizarFiltro();
            selecionar("#lista-jornais")?.scrollIntoView({
                behavior: "smooth"
            });
            return;
        }
        if (evento.target.closest("#voltar-topo")) {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        }
    });
    document.addEventListener("input", evento => {
        if (evento.target.id !== "campo-busca-jornais") return;
        estado.busca = evento.target.value;
        atualizarFiltro();
    });
    document.addEventListener("submit", evento => {
        if (evento.target.dataset.form === "login") fazerLogin(evento);
        if (evento.target.dataset.form === "novo-jornal") cadastrarOuEditarJornal(evento);
    });
    document.addEventListener("keydown", evento => {
        if ((evento.key === "Enter" || evento.key === " ") && evento.target.classList?.contains("plusButton")) {
            evento.preventDefault();
            alternarFavorito(evento.target.dataset.favorito);
        }
    });
    window.addEventListener("hashchange", atualizarRota);
    window.addEventListener("scroll", () => {
        selecionar("#voltar-topo")?.classList.toggle("escondido", window.scrollY < 500);
    });
    const temaInput = document.querySelector("#seletor-tema");
    function lerPreferenciaTema() {
        return localStorage.getItem(chaveTema) === "true";
    }
    function aplicarTema(temaClaro, {persistir: persistir = false} = {}) {
        document.documentElement.classList.toggle("tema-invertido", temaClaro);
        if (typeof silkConfig !== "undefined") {
            silkConfig.color = temaClaro ? "#e8d5b7" : "#631f08";
            silkConfig.patternMin = temaClaro ? .78 : .2;
        }
        if (persistir) localStorage.setItem(chaveTema, String(temaClaro));
        if (temaInput) temaInput.checked = !temaClaro;
    }
    aplicarTema(lerPreferenciaTema());
    if (temaInput) {
        temaInput.checked = !lerPreferenciaTema();
        temaInput.addEventListener("change", () => {
            const modoEscuro = temaInput.checked;
            aplicarTema(!modoEscuro, {
                persistir: true
            });
            avisar(modoEscuro ? "Modo escuro ativado." : "Modo claro ativado.");
        });
    }
    atualizarRota();
})();

const botaoVoltarInicio = document.querySelector("[data-voltar-inicio]");

if (botaoVoltarInicio) {
    botaoVoltarInicio.addEventListener("click", () => {
        window.location.href = "index.html";
    });
}
