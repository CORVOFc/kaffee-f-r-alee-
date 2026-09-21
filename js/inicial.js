/* ============================================================
   INICIAL.JS - Controle dos carrosséis HERO e navegação
   Não faz consulta ao Supabase. Essa responsabilidade fica no Produtos.js.
   ============================================================ */

function iniciarCarrosseisHero() {
    const secoesHero = document.querySelectorAll('.hero');

    secoesHero.forEach((secao, indiceSecao) => {
        const slides = Array.from(secao.querySelectorAll('.hero-slide'));
        const pontos = Array.from(secao.querySelectorAll('.dot'));

        if (slides.length === 0) return;

        let slideAtual = 0;
        let intervalo;

        function exibirSlide(indice) {
            slideAtual = (indice + slides.length) % slides.length;

            slides.forEach((slide, indice) => {
                slide.classList.toggle('active', indice === slideAtual);
            });

            pontos.forEach((ponto, indice) => {
                ponto.classList.toggle('active', indice === slideAtual);
            });
        }

        function iniciarRotacao() {
            window.clearInterval(intervalo);
            intervalo = window.setInterval(() => {
                exibirSlide(slideAtual + 1);
            }, 5000);
        }

        pontos.forEach((ponto, indice) => {
            ponto.addEventListener('click', () => {
                exibirSlide(indice);
                iniciarRotacao();
            });
        });

        // Permite pausar o banner enquanto o mouse está sobre ele.
        secao.addEventListener('mouseenter', () => {
            window.clearInterval(intervalo);
        });

        secao.addEventListener('mouseleave', () => {
            iniciarRotacao();
        });

        exibirSlide(0);
        iniciarRotacao();

        console.log(`Hero ${indiceSecao + 1} inicializado com ${slides.length} slide(s).`);
    });
}

function configurarNavegacaoSuave() {
    document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', evento => {
            const destino = link.getAttribute('href');

            if (destino && destino.startsWith('#')) {
                evento.preventDefault();
                document.querySelector(destino)?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    iniciarCarrosseisHero();
    configurarNavegacaoSuave();
});

window.iniciarCarrosseisHero = iniciarCarrosseisHero;
