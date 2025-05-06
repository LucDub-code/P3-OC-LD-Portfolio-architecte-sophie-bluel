// Récupération des travaux via l’API et affichage dans la galerie

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

// Récupération des catégories via l’API et affichage des boutons de filtre

const filters = document.querySelector(".filters");

fetch("http://localhost:5678/api/categories")
  .then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return response.json();
  })
  .then((data) => {
    filters.innerHTML = `<button data-category="all">Tous</button>`;
    data.forEach((category) => {
      filters.innerHTML += `
      <button data-category="${category.id}">${category.name}</button>
      `;
    });
  })
  .catch((error) => {
    console.log(`Erreur lors de la récupération des données: ${error.message}`);
  });
