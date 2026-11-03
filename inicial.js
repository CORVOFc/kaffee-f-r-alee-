function iniciarCarrosseisHero() {
    const secoesHero = document.querySelectorAll(".hero");
    secoesHero.forEach((secao, indiceSecao) => {
        const slides = Array.from(secao.querySelectorAll(".hero-slide"));
        const pontos = Array.from(secao.querySelectorAll(".dot"));
        if (slides.length === 0) return;
        let slideAtual = 0;
        let intervalo;
        function exibirSlide(indice) {
            slideAtual = (indice + slides.length) % slides.length;
            slides.forEach((slide, indice) => {
                slide.classList.toggle("active", indice === slideAtual);
            });
            pontos.forEach((ponto, indice) => {
                ponto.classList.toggle("active", indice === slideAtual);
            });
        }
        function iniciarRotacao() {
            window.clearInterval(intervalo);
            intervalo = window.setInterval(() => {
                exibirSlide(slideAtual + 1);
            }, 5e3);
        }
        pontos.forEach((ponto, indice) => {
            ponto.addEventListener("click", () => {
                exibirSlide(indice);
                iniciarRotacao();
            });
        });
        secao.addEventListener("mouseenter", () => {
            window.clearInterval(intervalo);
        });
        secao.addEventListener("mouseleave", () => {
            iniciarRotacao();
        });
        exibirSlide(0);
        iniciarRotacao();
        console.log(`Hero ${indiceSecao + 1} inicializado com ${slides.length} slide(s).`);
    });
}

function configurarNavegacaoSuave() {
    document.querySelectorAll("nav a").forEach(link => {
        link.addEventListener("click", evento => {
            const destino = link.getAttribute("href");
            if (destino && destino.startsWith("#")) {
                evento.preventDefault();
                document.querySelector(destino)?.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }
        });
    });
}

window.scrollCarousel = function(containerId, direction) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const card = container.querySelector(".product-card");
    const cardWidth = card ? card.offsetWidth + 24 : 300;
    container.scrollBy({
        left: direction * cardWidth * 2,
        behavior: "smooth"
    });
};

function configurarControlesCarrossel() {
    document.querySelectorAll("[data-carousel-target]").forEach(botao => {
        botao.addEventListener("click", () => {
            const direcao = Number(botao.dataset.carouselDirection);
            window.scrollCarousel(botao.dataset.carouselTarget, direcao);
        });
    });
}

document.addEventListener("DOMContentLoaded", () => {
    iniciarCarrosseisHero();
    configurarNavegacaoSuave();
    configurarControlesCarrossel();
});

window.iniciarCarrosseisHero = iniciarCarrosseisHero;
