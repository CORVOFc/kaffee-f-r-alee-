"use strict";

let tracks = [];

let carregandoTracks = true;

let erroCarregamentoTracks = false;

let currentIndex = 0;

let selectedIndex = -1;

let isPlaying = false;

let isPlayerOpen = false;

let isShuffle = false;

let isLoop = false;

async function carregarTracks() {
    let tentativas = 0;
    while (!window.supabaseClient && tentativas < 60) {
        await new Promise(r => setTimeout(r, 50));
        tentativas++;
    }
    if (!window.supabaseClient) {
        console.error("Supabase não disponível");
        erroCarregamentoTracks = true;
        carregandoTracks = false;
        return;
    }
    try {
        const playlists = await window.carregarPlaylistsComMusicas();
        const lista = [];
        playlists.forEach(pl => {
            (pl.musicas || []).forEach(m => {
                lista.push({
                    title: m.titulo,
                    artist: m.artista || "Desconhecido",
                    album: pl.nome,
                    year: 2024,
                    src: m.url_audio,
                    image: m.imagem_url || pl.imagem_url || "img/fotoFundoMusica.jpeg",
                    mood: [],
                    coffee: "",
                    id: m.id,
                    playlist_id: m.playlist_id
                });
            });
        });
        tracks = lista;
        if (tracks.length) {
            currentIndex = (currentIndex % tracks.length + tracks.length) % tracks.length;
        }
    } catch (erro) {
        console.error("Erro ao carregar músicas:", erro);
        tracks = [];
        erroCarregamentoTracks = true;
    } finally {
        carregandoTracks = false;
    }
}

function normalizarPesquisa(valor) {
    return String(valor || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR").trim();
}

function aplicarBuscaDaURL() {
    const params = new URLSearchParams(window.location.search);
    const termo = params.get("busca");
    if (!termo) return;
    const campo = document.getElementById("campo-busca-musica");
    if (!campo) return;
    campo.value = termo;
    const busca = normalizarPesquisa(termo);
    const indice = tracks.findIndex(t => normalizarPesquisa(t.title).includes(busca));
    if (indice !== -1) {
        searchBox.value = tracks[indice].title;
        updateCarousel(indice);
        openPlayer(indice, false);
    } else {
        renderSuggestions(termo);
    }
}

const carousel = document.getElementById("carrossel-musicas");

const staticFrame = document.getElementById("moldura-fixa");

const frameTitle = document.getElementById("titulo-moldura-fixa");

const frameArtist = document.getElementById("artista-moldura-fixa");

const playerContainer = document.getElementById("painel-player");

const playerVinyl = document.getElementById("vinil-player");

const playerVinylImage = playerVinyl.querySelector("img");

const playerFrameTitle = document.getElementById("titulo-moldura-player");

const playerFrameArtist = document.getElementById("artista-moldura-player");

const trackTitleEl = document.getElementById("titulo-faixa");

const trackArtistEl = document.getElementById("artista-faixa");

const trackTimeEl = document.getElementById("tempo-faixa");

const progressContainer = document.getElementById("progresso-musica");

const progressBar = document.getElementById("barra-progresso");

const playBtn = document.getElementById("reproduzir");

const prevBtn = document.getElementById("anterior");

const nextBtn = document.getElementById("proxima");

const playlistList = document.getElementById("lista-faixas");

const backButton = document.getElementById("botao-voltar-player");

const audio = document.getElementById("audio-musica");

const searchBox = document.getElementById("campo-busca-musica");

const suggestionsList = document.getElementById("sugestoes-lista");

const arrowLeft = document.getElementById("seta-esquerda");

const arrowRight = document.getElementById("seta-direita");

const btnShuffle = document.getElementById("btn-shuffle");

const btnLoop = document.getElementById("btn-loop");

const volumeSlider = document.getElementById("volume-slider");

if (localStorage.getItem("playerVolume")) {
    audio.volume = parseFloat(localStorage.getItem("playerVolume"));
    volumeSlider.value = audio.volume;
}

if (localStorage.getItem("playerShuffle") === "true") isShuffle = true;

if (localStorage.getItem("playerLoop") === "true") isLoop = true;

if (localStorage.getItem("lastTrackIndex")) currentIndex = parseInt(localStorage.getItem("lastTrackIndex")) || 0;

function setControlIcon(button, name) {
    const icon = button.querySelector("img");
    if (icon) icon.src = `assets/icons/${name}.svg`;
}

function salvarLocalStorage() {
    localStorage.setItem("playerVolume", audio.volume);
    localStorage.setItem("playerShuffle", isShuffle);
    localStorage.setItem("playerLoop", isLoop);
    localStorage.setItem("lastTrackIndex", currentIndex);
}

function resetProgress() {
    progressBar.value = 0;
    trackTimeEl.textContent = "0:00 / 0:00";
}

function atualizarAnimacaoDoVinil() {
    playerVinyl.classList.toggle("reproduzindo", isPlaying);
}

function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

function atualizarProgresso() {
    if (!Number.isFinite(audio.duration) || audio.duration <= 0) {
        resetProgress();
        return;
    }
    const percentual = Math.min(100, Math.max(0, audio.currentTime / audio.duration * 100));
    progressBar.value = percentual;
    trackTimeEl.textContent = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
}

function atualizarBotoesEstado() {
    btnShuffle.classList.toggle("ativo", isShuffle);
    btnLoop.classList.toggle("ativo", isLoop);
}

function buscarMusicas(termo) {
    const normalizedTerm = normalizarPesquisa(termo);
    if (!normalizedTerm) return tracks;
    const palavras = normalizedTerm.split(/\s+/);
    return tracks.filter(track => {
        const searchable = normalizarPesquisa([ track.title, track.artist, track.album, track.year, track.coffee, ...(track.mood || []) ].join(" "));
        return palavras.every(palavra => searchable.includes(palavra));
    });
}

function renderPlaylist(filter = "") {
    playlistList.replaceChildren();
    const resultados = buscarMusicas(filter);
    let contador = 0;
    resultados.forEach(track => {
        const i = tracks.indexOf(track);
        contador++;
        const li = document.createElement("li");
        li.tabIndex = 0;
        li.setAttribute("role", "button");
        li.setAttribute("aria-label", `Reproduzir música: ${track.title} - ${track.artist}`);
        li.classList.toggle("faixa-atual", i === currentIndex);
        const miniatura = document.createElement("img");
        miniatura.src = track.image;
        miniatura.alt = "";
        miniatura.className = "miniatura-faixa";
        const numero = document.createElement("span");
        numero.textContent = String(i + 1);
        const titulo = document.createElement("span");
        titulo.textContent = track.title;
        li.replaceChildren(miniatura, numero, titulo);
        if (i === currentIndex && isPlaying) {
            const eq = document.createElement("div");
            eq.className = "equalizador";
            for (let barra = 0; barra < 3; barra += 1) {
                eq.appendChild(document.createElement("span"));
            }
            li.appendChild(eq);
        } else {
            const dots = document.createElement("span");
            dots.className = "indicador-opcoes";
            dots.textContent = "•••••";
            li.appendChild(dots);
        }
        const selecionarFaixa = () => openPlayer(i, true);
        li.addEventListener("click", selecionarFaixa);
        li.addEventListener("keydown", evento => {
            if (evento.key === "Enter" || evento.key === " ") {
                evento.preventDefault();
                selecionarFaixa();
            }
        });
        playlistList.appendChild(li);
    });
    if (contador === 0) {
        const vazio = document.createElement("li");
        vazio.className = "lista-vazia";
        vazio.textContent = "Nenhuma música encontrada.";
        playlistList.appendChild(vazio);
    }
}

function renderSuggestions(filter = "") {
    suggestionsList.replaceChildren();
    const normalizedFilter = normalizarPesquisa(filter);
    if (!normalizedFilter) {
        suggestionsList.hidden = true;
        return;
    }
    const resultados = buscarMusicas(filter);
    if (resultados.length === 0) {
        const vazio = document.createElement("li");
        vazio.className = "sugestao-vazia";
        vazio.textContent = carregandoTracks ? "Carregando músicas cadastradas…" : erroCarregamentoTracks ? "Não foi possível consultar as músicas cadastradas." : "Nenhuma música encontrada.";
        suggestionsList.appendChild(vazio);
        suggestionsList.hidden = false;
        return;
    }
    resultados.slice(0, 5).forEach(track => {
        const li = document.createElement("li");
        const button = document.createElement("button");
        button.type = "button";
        button.className = "sugestao-musica";
        button.textContent = `${track.title} — ${track.artist}`;
        button.addEventListener("click", () => {
            const index = tracks.indexOf(track);
            if (index < 0) return;
            searchBox.value = track.title;
            suggestionsList.hidden = true;
            audio.pause();
            isPlaying = false;
            setControlIcon(playBtn, "play");
            document.querySelectorAll(".disco-musical")[currentIndex]?.classList.remove("reproduzindo");
            atualizarAnimacaoDoVinil();
            isPlayerOpen = false;
            updateCarousel(index);
            openPlayer(index, false);
        });
        li.appendChild(button);
        suggestionsList.appendChild(li);
    });
    suggestionsList.hidden = false;
}

searchBox.addEventListener("input", () => {
    renderPlaylist(searchBox.value);
    renderSuggestions(searchBox.value);
});

searchBox.addEventListener("blur", () => {
    setTimeout(() => {
        if (!suggestionsList.contains(document.activeElement)) suggestionsList.hidden = true;
    }, 200);
});

function createDiscs() {
    tracks.forEach((track, i) => {
        const disc = document.createElement("div");
        disc.className = "disco-musical";
        disc.tabIndex = 0;
        disc.setAttribute("role", "button");
        disc.setAttribute("aria-label", `Selecionar música: ${track.title} - ${track.artist}`);
        const capa = document.createElement("img");
        capa.className = "disco-capa";
        capa.src = track.image;
        capa.alt = "";
        disc.appendChild(capa);
        function selecionarDisco() {
            if (i === currentIndex) {
                if (selectedIndex === i) {
                    openPlayer(i, true);
                } else {
                    selectedIndex = i;
                    staticFrame.classList.add("selecionado");
                    disc.classList.add("selecionado");
                }
            } else {
                if (isPlayerOpen) closePlayer();
                updateCarousel(i);
                selectedIndex = i;
                staticFrame.classList.add("selecionado");
            }
        }
        disc.addEventListener("click", selecionarDisco);
        disc.addEventListener("keydown", evento => {
            if (evento.key === "Enter" || evento.key === " ") {
                evento.preventDefault();
                selecionarDisco();
            }
        });
        carousel.appendChild(disc);
    });
    updateCarousel(currentIndex);
}

function updateCarousel(index) {
    currentIndex = index;
    selectedIndex = -1;
    const discs = document.querySelectorAll(".disco-musical");
    staticFrame.classList.remove("selecionado");
    const classesDePosicao = [ "posicao-centro", "posicao-esquerda", "posicao-direita", "posicao-longe-esquerda", "posicao-longe-direita" ];
    discs.forEach((disc, i) => {
        const rel = i - currentIndex;
        disc.classList.remove(...classesDePosicao);
        if (rel === 0) {
            disc.classList.add("posicao-centro", "selecionado");
            frameTitle.textContent = tracks[i].title;
            frameArtist.textContent = tracks[i].artist;
            if (isPlayerOpen) openPlayer(i, isPlaying);
        } else if (rel < 0 && Math.abs(rel) === 1) {
            disc.classList.add("posicao-esquerda");
            disc.classList.remove("selecionado");
        } else if (rel > 0 && Math.abs(rel) === 1) {
            disc.classList.add("posicao-direita");
            disc.classList.remove("selecionado");
        } else if (rel < 0) {
            disc.classList.add("posicao-longe-esquerda");
            disc.classList.remove("selecionado");
        } else {
            disc.classList.add("posicao-longe-direita");
            disc.classList.remove("selecionado");
        }
    });
}

function openPlayer(index, play = false) {
    currentIndex = index;
    isPlayerOpen = true;
    const track = tracks[index];
    playerContainer.classList.add("visivel");
    playerVinylImage.src = track.image;
    playerVinylImage.alt = "";
    playerFrameTitle.textContent = track.title;
    playerFrameArtist.textContent = track.artist;
    trackTitleEl.textContent = track.title;
    trackArtistEl.textContent = track.artist;
    resetProgress();
    audio.onloadedmetadata = () => {
        const total = formatTime(audio.duration);
        trackTimeEl.textContent = `0:00 / ${total}`;
    };
    audio.src = track.src;
    audio.load();
    audio.volume = parseFloat(volumeSlider.value);
    salvarLocalStorage();
    renderPlaylist(searchBox.value);
    if (play) {
        audio.play().catch(() => {
            isPlaying = false;
            setControlIcon(playBtn, "play");
            document.querySelectorAll(".disco-musical")[currentIndex]?.classList.remove("reproduzindo");
            atualizarAnimacaoDoVinil();
            renderPlaylist(searchBox.value);
        });
        isPlaying = true;
        setControlIcon(playBtn, "pause");
        document.querySelectorAll(".disco-musical")[currentIndex].classList.add("reproduzindo");
        atualizarAnimacaoDoVinil();
    } else {
        isPlaying = false;
        setControlIcon(playBtn, "play");
        atualizarAnimacaoDoVinil();
    }
}

audio.addEventListener("loadedmetadata", atualizarProgresso);

audio.addEventListener("timeupdate", atualizarProgresso);

progressContainer.addEventListener("click", evento => {
    if (!Number.isFinite(audio.duration) || audio.duration <= 0) return;
    const area = progressContainer.getBoundingClientRect();
    const percentual = Math.min(1, Math.max(0, (evento.clientX - area.left) / area.width));
    audio.currentTime = percentual * audio.duration;
    atualizarProgresso();
});

function closePlayer() {
    isPlayerOpen = false;
    playerContainer.classList.remove("visivel");
    audio.pause();
    isPlaying = false;
    document.querySelectorAll(".disco-musical")[currentIndex]?.classList.remove("reproduzindo");
    atualizarAnimacaoDoVinil();
    renderPlaylist(searchBox.value);
}

backButton.addEventListener("click", closePlayer);

playBtn.addEventListener("click", () => {
    if (audio.paused) {
        audio.play().catch(() => {
            isPlaying = false;
            setControlIcon(playBtn, "play");
            document.querySelectorAll(".disco-musical")[currentIndex]?.classList.remove("reproduzindo");
            atualizarAnimacaoDoVinil();
            renderPlaylist(searchBox.value);
        });
        isPlaying = true;
        setControlIcon(playBtn, "pause");
        document.querySelectorAll(".disco-musical")[currentIndex].classList.add("reproduzindo");
        atualizarAnimacaoDoVinil();
        renderPlaylist(searchBox.value);
    } else {
        audio.pause();
        isPlaying = false;
        setControlIcon(playBtn, "play");
        document.querySelectorAll(".disco-musical")[currentIndex].classList.remove("reproduzindo");
        atualizarAnimacaoDoVinil();
        renderPlaylist(searchBox.value);
    }
});

nextBtn.addEventListener("click", () => {
    if (isShuffle) {
        let randomIndex;
        do {
            randomIndex = Math.floor(Math.random() * tracks.length);
        } while (randomIndex === currentIndex);
        openPlayer(randomIndex, true);
    } else {
        openPlayer((currentIndex + 1) % tracks.length, true);
    }
});

prevBtn.addEventListener("click", () => {
    openPlayer((currentIndex - 1 + tracks.length) % tracks.length, true);
});

btnShuffle.addEventListener("click", () => {
    isShuffle = !isShuffle;
    atualizarBotoesEstado();
    salvarLocalStorage();
});

btnLoop.addEventListener("click", () => {
    isLoop = !isLoop;
    atualizarBotoesEstado();
    salvarLocalStorage();
});

audio.addEventListener("ended", () => {
    if (isLoop) {
        audio.currentTime = 0;
        audio.play();
    } else {
        nextBtn.click();
    }
});

volumeSlider.addEventListener("input", e => {
    audio.volume = parseFloat(e.target.value);
    salvarLocalStorage();
});

document.addEventListener("keydown", e => {
    if (e.target instanceof Element && e.target.closest("input, button, a, select, textarea, [contenteditable='true']")) return;
    switch (e.key) {
      case " ":
        e.preventDefault();
        playBtn.click();
        break;

      case "ArrowRight":
        nextBtn.click();
        break;

      case "ArrowLeft":
        prevBtn.click();
        break;

      case "s":
        btnShuffle.click();
        break;

      case "l":
        btnLoop.click();
        break;

      case "m":
        volumeSlider.value = audio.volume === 0 ? .5 : 0;
        audio.volume = parseFloat(volumeSlider.value);
        salvarLocalStorage();
        break;
    }
});

arrowLeft.addEventListener("click", () => {
    const prevIndex = (currentIndex - 1 + tracks.length) % tracks.length;
    updateCarousel(prevIndex);
});

arrowRight.addEventListener("click", () => {
    const nextIndex = (currentIndex + 1) % tracks.length;
    updateCarousel(nextIndex);
});

window.addEventListener("app:ready", async evento => {
    if (!evento.detail) return;
    await carregarTracks();
    atualizarBotoesEstado();
    if (!tracks.length) {
        renderPlaylist();
        renderSuggestions(searchBox.value);
        console.warn("Nenhuma música encontrada no banco.");
        return;
    }
    createDiscs();
    renderPlaylist();
    if (new URLSearchParams(window.location.search).has("busca")) aplicarBuscaDaURL(); else renderSuggestions(searchBox.value);
    salvarLocalStorage();
});
