(function() {
    try {
        var salvo = localStorage.getItem("kaffe_tema_invertido");
        var temaClaro = salvo === "true";
        document.documentElement.classList.toggle("tema-invertido", temaClaro);
    } catch (e) {}
})();
