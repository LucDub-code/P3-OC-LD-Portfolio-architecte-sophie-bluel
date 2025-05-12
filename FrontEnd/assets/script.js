// Récupération des données works de l'API

let works = [];

fetch("http://localhost:5678/api/works")
  .then((response) => {
    // Gestion des erreurs HTTP 400 à 500
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return response.json();
  })
  .then((data) => {
    works = data;
    displayWorks(works);
  })
  // Gestion des erreurs réseau
  .catch((error) => {
    console.log(`Erreur lors de la récupération des données: ${error.message}`);
  });

// Fonction d'affichage des travaux dans la galerie
// (utilisée dans l'appel initial et dans le filtre)

const gallery = document.querySelector(".gallery");

function displayWorks(list) {
  gallery.innerHTML = "";
  list.forEach((work) => {
    const figure = document.createElement("figure");
    const img = document.createElement("img");
    const figcaption = document.createElement("figcaption");

    img.src = work.imageUrl;
    img.alt = work.title;
    figcaption.textContent = work.title;

    figure.appendChild(img);
    figure.appendChild(figcaption);
    gallery.appendChild(figure);
  });
}

// Récupération des données categories via l'API
// Affichage des boutons
// Fonction de filtrage des travaux

const filters = document.querySelector(".filters");

fetch("http://localhost:5678/api/categories")
  .then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return response.json();
  })
  .then((data) => {
    const allButton = document.createElement("button");
    allButton.className = "filter-button";
    allButton.dataset.category = "all";
    allButton.textContent = "Tous";
    filters.appendChild(allButton);

    data.forEach((category) => {
      const button = document.createElement("button");
      button.className = "filter-button";
      button.dataset.category = category.id;
      button.textContent = category.name;
      filters.appendChild(button);
    });

    // Filtrage des travaux par catégorie grâce au boutons
    const buttons = document.querySelectorAll(".filter-button");
    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        const categoryId = button.dataset.category;
        let filteredWorks;
        if (categoryId === "all") {
          filteredWorks = works;
        } else {
          filteredWorks = works.filter((w) => w.categoryId == categoryId);
        }
        displayWorks(filteredWorks);
      });
    });
  })
  .catch((error) => {
    console.log(`Erreur lors de la récupération des données: ${error.message}`);
  });
