/* ==========================================================
   FAVORITOS.JS
   Projeto: Kaffee Für Alle
   Autor Front-end: Filipe
   Objetivo: Controlar pesquisa, filtros, carrossel,
             modal e favoritos.
========================================================== */


/* ==========================================================
   ELEMENTOS DA PÁGINA
========================================================== */

const campoDePesquisa =
document.getElementById("campo-de-pesquisa-dos-produtos-favoritos");

const botaoLimparPesquisa =
document.getElementById("botao-de-limpar-a-pesquisa");

const listaHorizontalDeProdutos =
document.getElementById("lista-horizontal-de-produtos-favoritos");

const botoesDeFiltro =
document.querySelectorAll(".botao-de-filtro-por-categoria");

const botaoAnteriorDoCarrossel =
document.getElementById("botao-anterior-do-carrossel");

const botaoProximoDoCarrossel =
document.getElementById("botao-proximo-do-carrossel");

const modalDoProduto =
document.getElementById("modal-de-visualizacao-rapida-do-produto");

const botaoFecharModal =
document.getElementById("botao-de-fechar-o-modal");

const toastDeConfirmacao =
document.getElementById("toast-de-confirmacao-de-favorito");

const contadorDeFavoritos =
document.getElementById("contador-da-quantidade-de-produtos-favoritos");


/* ==========================================================
   DADOS TEMPORÁRIOS
   (BACK-END substituirá por fetch('/api/favoritos'))
========================================================== */

let produtosFavoritos = [

    {
        id:1,
        nome:"Café Especial",
        categoria:"cafes",
        preco:"R$ 12,90",
        descricao:"Grãos 100% arábica.",
        favorito:true
    },

    {
        id:2,
        nome:"Brownie Artesanal",
        categoria:"doces",
        preco:"R$ 9,90",
        descricao:"Chocolate belga.",
        favorito:false
    }

];


/* ==========================================================
   ATUALIZAR CONTADOR
========================================================== */

function atualizarContadorDeFavoritos(){

    const quantidade =
    document.querySelectorAll(
        ".botao-de-favoritar-ou-desfavoritar.ativo"
    ).length;

    contadorDeFavoritos.textContent =
    `${quantidade} produtos salvos`;

}


/* ==========================================================
   TOAST
========================================================== */

function mostrarToast(mensagem){

    toastDeConfirmacao.querySelector("span").textContent = mensagem;

    toastDeConfirmacao.hidden = false;

    setTimeout(()=>{

        toastDeConfirmacao.hidden = true;

    },2000);

}


/* ==========================================================
   FAVORITAR / DESFAVORITAR
========================================================== */

document
.querySelectorAll(".botao-de-favoritar-ou-desfavoritar")
.forEach(botao=>{

    botao.addEventListener("click",()=>{

        const card =
        botao.closest(".card-do-produto-favorito");

        const idProduto =
        card.dataset.idDoProduto;

        botao.classList.toggle("ativo");

        if(botao.classList.contains("ativo")){

            botao.textContent = "♥";

            mostrarToast("Produto adicionado aos favoritos");

        }else{

            botao.textContent = "♡";

            mostrarToast("Produto removido dos favoritos");

        }

        atualizarContadorDeFavoritos();

        console.log("Produto:",idProduto);

        /* BACK-END

        fetch(`/api/favoritos/${idProduto}`,{
            method:"POST"
        });

        */

    });

});


/* ==========================================================
   PESQUISA EM TEMPO REAL
========================================================== */

campoDePesquisa.addEventListener("input",()=>{

    const texto =
    campoDePesquisa.value.toLowerCase();

    document
    .querySelectorAll(".card-do-produto-favorito")
    .forEach(card=>{

        const nome =
        card.querySelector(".nome-do-produto-favorito")
        .textContent.toLowerCase();

        card.style.display =
        nome.includes(texto)
        ? "block"
        : "none";

    });

});


/* ==========================================================
   LIMPAR PESQUISA
========================================================== */

botaoLimparPesquisa.addEventListener("click",()=>{

    campoDePesquisa.value="";

    campoDePesquisa.dispatchEvent(new Event("input"));

});


/* ==========================================================
   FILTROS
========================================================== */

botoesDeFiltro.forEach(botao=>{

    botao.addEventListener("click",()=>{

        botoesDeFiltro.forEach(item=>{

            item.classList.remove("ativo");

        });

        botao.classList.add("ativo");

        const categoriaSelecionada =
        botao.textContent.toLowerCase();

        document
        .querySelectorAll(".card-do-produto-favorito")
        .forEach(card=>{

            const categoria =
            card.dataset.categoriaDoProduto;

            if(categoriaSelecionada==="todos"){

                card.style.display="block";

                return;

            }

            card.style.display =
            categoria===categoriaSelecionada
            ? "block"
            : "none";

        });

    });

});


/* ==========================================================
   CARROSSEL
========================================================== */

const distanciaDoScroll = 220;

botaoProximoDoCarrossel.addEventListener("click",()=>{

    listaHorizontalDeProdutos.scrollBy({

        left:distanciaDoScroll,
        behavior:"smooth"

    });

});

botaoAnteriorDoCarrossel.addEventListener("click",()=>{

    listaHorizontalDeProdutos.scrollBy({

        left:-distanciaDoScroll,
        behavior:"smooth"

    });

});


/* ==========================================================
   ARRASTAR COM MOUSE
========================================================== */

let estaArrastando = false;
let posicaoInicial = 0;
let scrollInicial = 0;

listaHorizontalDeProdutos.addEventListener("mousedown",(evento)=>{

    estaArrastando = true;

    posicaoInicial = evento.pageX;

    scrollInicial = listaHorizontalDeProdutos.scrollLeft;

});

window.addEventListener("mouseup",()=>{

    estaArrastando = false;

});

listaHorizontalDeProdutos.addEventListener("mousemove",(evento)=>{

    if(!estaArrastando) return;

    const distancia =
    evento.pageX - posicaoInicial;

    listaHorizontalDeProdutos.scrollLeft =
    scrollInicial - distancia;

});


/* ==========================================================
   MODAL
========================================================== */

const imagemModal =
document.getElementById("imagem-do-produto-no-modal");

const tituloModal =
document.getElementById("titulo-do-produto-no-modal");

const descricaoModal =
document.getElementById("descricao-do-produto-no-modal");

const precoModal =
document.getElementById("preco-do-produto-no-modal");

const categoriaModal =
document.getElementById("categoria-do-produto-no-modal");

document
.querySelectorAll(".botao-de-abrir-o-modal-do-produto")
.forEach(botao=>{

    botao.addEventListener("click",()=>{

        const card =
        botao.closest(".card-do-produto-favorito");

        imagemModal.src =
        card.querySelector("img").src;

        tituloModal.textContent =
        card.querySelector(".nome-do-produto-favorito").textContent;

        precoModal.textContent =
        card.querySelector(".preco-do-produto-favorito").textContent;

        categoriaModal.textContent =
        card.querySelector(".categoria-do-produto-favorito").textContent;

        descricaoModal.textContent =
        "Descrição enviada pelo banco de dados.";

        modalDoProduto.showModal();

    });

});

botaoFecharModal.addEventListener("click",()=>{

    modalDoProduto.close();

});


/* ==========================================================
   BOTÃO VOLTAR
========================================================== */

document
.getElementById("botao-de-voltar-para-a-pagina-index")
.addEventListener("click",()=>{

    window.location.href="index.html";

});


/* ==========================================================
   INDICADORES DO CARROSSEL
========================================================== */

const indicadores =
document.querySelectorAll(".indicador-do-carrossel");

listaHorizontalDeProdutos.addEventListener("scroll",()=>{

    const largura = 220;

    const pagina =
    Math.round(listaHorizontalDeProdutos.scrollLeft/largura);

    indicadores.forEach((item,index)=>{

        item.classList.toggle("ativo",index===pagina);

    });

});


/* ==========================================================
   INICIALIZAÇÃO
========================================================== */

window.addEventListener("load",()=>{

    atualizarContadorDeFavoritos();

});