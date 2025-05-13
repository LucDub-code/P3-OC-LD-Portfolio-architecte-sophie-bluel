// Gestion de la connexion

const form = document.querySelector(".login-form");
const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#password");
const loginError = document.querySelector(".login-error");

form.addEventListener("submit", (event) => {
  event.preventDefault();
  loginError.textContent = "";

  fetch("http://localhost:5678/api/users/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: emailInput.value,
      password: passwordInput.value,
    }),
  })
    .then((response) => {
      if (response.status === 404) throw new Error("Email introuvable");
      if (response.status === 401) throw new Error("Mot de passe incorrect");
      return response.json();
    })
    .then(({ token }) => {
      sessionStorage.setItem("token", token);
      window.location.href = "index.html";
    })
    .catch((error) => {
      loginError.textContent = error.message;
    });
});
