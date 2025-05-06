const gallery = document.querySelector(".gallery");

fetch("http://localhost:5678/api/works")
  .then((response) => {
    // Gestion des erreurs HTTP 400 à 500
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return response.json();
  })
  .then((data) => {
    data.forEach((work) => {
      gallery.innerHTML += `
      <figure>
      <img src="${work.imageUrl}" alt="${work.title}">
      <figcaption>${work.title}</figcaption>
      </figure>
      `;
    });
  })
  // Gestion des erreurs réseau
  .catch((error) => {
    console.log(`Erreur lors de la récupération des données: ${error.message}`);
    gallery.innerHTML =
      "<p class='gallery-error'>Impossible de charger la galerie</p>";
  });
