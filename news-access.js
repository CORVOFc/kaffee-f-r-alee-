(function() {
    "use strict";
    window.addEventListener("app:ready", function() {
        if (window.location.hash === "#/admin" && typeof window.atualizarRota === "function") window.atualizarRota();
    });
})();
