export function initTabs() {
  function switchTab(tab, btn) {
    document
      .querySelectorAll(".tab")
      .forEach((t) => t.classList.remove("active"));
    if (btn) btn.classList.add("active");

    document
      .querySelectorAll(".form-section")
      .forEach((section) => section.classList.remove("active"));

    document
      .getElementById(tab === "login" ? "loginForm" : "registerForm")
      .classList.add("active");
  }

  document.querySelectorAll(".tabs .tab").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const tab = btn.getAttribute("data-tab") || "login";
      switchTab(tab, e.currentTarget);
    });
  });
}

document.querySelectorAll(".switch-form").forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const target = e.target.dataset.target;

    document.querySelectorAll(".form-section").forEach((section) => {
      section.classList.remove("active");
    });

    if (target === "login") {
      document.getElementById("loginForm").classList.add("active");
    } else {
      document.getElementById("registerForm").classList.add("active");
    }
  });
});
