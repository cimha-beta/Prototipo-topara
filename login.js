(() => {
  const nav = performance.getEntriesByType("navigation")[0];
  if (nav && nav.type === "reload") {
    window.location.replace("index.html");
    return;
  }

  const form = document.getElementById("signup-form");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    window.location.href = "inicio.html";
  });
})();
