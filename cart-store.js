(function() {
    "use strict";
    const CHAVE = "kaffee_fuer_alle_carrinhos";
    function lerMapa() {
        try {
            return JSON.parse(localStorage.getItem(CHAVE) || "{}");
        } catch (erro) {
            return {};
        }
    }
    function salvarMapa(mapa) {
        localStorage.setItem(CHAVE, JSON.stringify(mapa));
    }
    function chaveUsuario(usuarioId) {
        return usuarioId ? String(usuarioId) : "visitante";
    }
    function lerCarrinho(usuarioId) {
        const itens = lerMapa()[chaveUsuario(usuarioId)] || [];
        return itens.filter(item => {
            const preco = Number(item && item.preco);
            return item && Number.isFinite(preco) && preco > 0;
        });
    }
    function salvarCarrinho(usuarioId, itens) {
        const mapa = lerMapa();
        mapa[chaveUsuario(usuarioId)] = itens;
        salvarMapa(mapa);
    }
    function adicionarAoCarrinho(produto, usuarioId) {
        if (!produto || typeof produto !== "object") {
            console.error("Produto inválido:", produto);
            return [];
        }
        const preco = Number(produto.preco);
        if (!Number.isFinite(preco) || preco < 0) {
            console.error("Preço inválido:", produto.nome, produto.preco);
            return lerCarrinho(usuarioId);
        }
        const itens = lerCarrinho(usuarioId);
        const existente = itens.find(item => String(item.produto_id) === String(produto.id));
        if (existente) existente.quantidade += 1; else itens.push({
            produto_id: produto.id,
            nome: produto.nome,
            descricao: produto.descricao || "",
            preco: preco,
            imagem: produto.imagem_url || produto.imagem || "",
            tipo: produto.tipo || "regular",
            quantidade: 1,
            observacoes: ""
        });
        salvarCarrinho(usuarioId, itens);
        return itens;
    }
    window.carrinhoStore = {
        lerCarrinho: lerCarrinho,
        salvarCarrinho: salvarCarrinho,
        adicionarAoCarrinho: adicionarAoCarrinho
    };
})();
