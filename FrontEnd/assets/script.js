// Gestion de la classe active pour la navigation
function setActiveNavLink() {
  const currentPage = window.location.pathname;
  const navLinks = document.querySelectorAll("nav a");

  navLinks.forEach((link) => {
    const currentFileName = currentPage.split("/").pop();
    const linkHref = link.getAttribute("href");

    link.classList.remove("active");

    if (linkHref === currentFileName) {
      link.classList.add("active");
    }
  });
}

document.addEventListener("DOMContentLoaded", setActiveNavLink);

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
const buttons = document.querySelectorAll(".filter-button");

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
    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        // Réinitialisation de la classe active sur tous les boutons
        buttons.forEach((btn) => btn.classList.remove("active"));
        // Ajouter la classe active au bouton cliqué
        button.classList.add("active");

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

// Mode administrateur
// Apparition de la bannière pour le mode édition et du bouton modifier
// Disparition des boutons de filtre

const banner = document.querySelector(".admin-banner");
const modifyButton = document.querySelector(".edition-mode");

document.addEventListener("DOMContentLoaded", () => {
  const token = sessionStorage.getItem("token");
  if (token) {
    showAdminBanner();
    showModifyButton();
    hideFilters();
  }
});

function showAdminBanner() {
  banner.style.display = "flex";
}

function showModifyButton() {
  modifyButton.style.display = "flex";
}

function hideFilters() {
  filters.style.display = "none";
}

// Apparition et fermeture de la fenêtre modale

const modal = document.querySelector(".modal");
const closeModalButton = document.querySelector(".close-modal");

function openModal() {
  modal.style.display = "flex";
  modal.setAttribute("aria-hidden", "false");
  modal.setAttribute("aria-modal", "true");
  modal.addEventListener("click", closeModal);
  closeModalButton.addEventListener("click", closeModal);
  displayModalGallery(works);
}

function closeModal(e) {
  if (e.target === e.currentTarget || e.target.closest(".close-modal")) {
    modal.style.display = "none";
    modal.setAttribute("aria-hidden", "true");
    modal.setAttribute("aria-modal", "false");
  }
}

document
  .querySelector(".edition-mode-link")
  .addEventListener("click", openModal);

// Affichage de la galerie dans la fenêtre modale

const modalGallery = document.querySelector(".modal-gallery");

function displayModalGallery(list) {
  modalGallery.innerHTML = "";
  list.forEach((work) => {
    // Création des conteneurs pour les   images et les icones corbeille
    const modalFigure = document.createElement("figure");
    modalFigure.classList.add("modal-figure");
    modalFigure.setAttribute("data-id", work.id);

    // Création et importation des images
    const modalImg = document.createElement("img");
    modalImg.src = work.imageUrl;
    modalImg.alt = work.title;

    // Création des icones corbeille
    const modalTrash = document.createElement("div");
    modalTrash.classList.add("modal-trash");
    const modalTrashImg = document.createElement("img");
    modalTrashImg.src = "./assets/icons/trash.svg";
    modalTrashImg.alt = "supprimer";

    // Ajout des éléments au conteneur
    modalGallery.appendChild(modalFigure);
    modalFigure.appendChild(modalImg);
    modalFigure.appendChild(modalTrash);
    modalTrash.appendChild(modalTrashImg);

    // Ajout d'un événement de clic sur l'icône corbeille
    modalTrash.addEventListener("click", () => deleteWork(work.id));
  });
}

// Fonction de suppression des travaux dans la fenêtre modale et dans la galerie principale

function deleteWork(id) {
  const token = sessionStorage.getItem("token");
  fetch(`http://localhost:5678/api/works/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    // Suppression de l'image de la galerie de la fenêtre modale
    .then(() => {
      const modalFigure = document.querySelector(
        `.modal-figure[data-id="${id}"]`
      );
      if (modalFigure) {
        modalFigure.remove();
      }
      // Mise à jour de la liste des travaux
      works = works.filter((work) => work.id !== id);
      // Rafraîchissement de la galerie de la fenêtre modale
      // Rafraîchissement de la galerie principale
      // Sans les travaux supprimés
      displayModalGallery(works);
      displayWorks(works);
    });
}

// Ouverture de la fenêtre modale d'ajout de travaux

const addPhotoButton = document.querySelector(".add-photo-button");
const modalGalleryContent = document.querySelector(".modal-gallery-content");
const modalAddWorkContent = document.querySelector(".modal-add-work-content");

function openAddWorkModal() {
  modalGalleryContent.style.display = "none";
  modalAddWorkContent.style.display = "flex";
}

addPhotoButton.addEventListener("click", openAddWorkModal);

// Prévisualisation de l'image choisie

const modalAddPhoto = document.querySelector(".modal-add-photo");
const fileInput = document.querySelector("#fileInput");

fileInput.addEventListener("change", () => {
  const file = fileInput.files[0]; // Récupération de la première image choisie
  const imageURL = URL.createObjectURL(file); // Création d'une URL pour l'image
  // Disparition des autres éléments
  modalAddPhoto.querySelector("img").style.display = "none";
  modalAddPhoto.querySelector("button").style.display = "none";
  modalAddPhoto.querySelector("span").style.display = "none";
  // Création de l'image choisie
  const modalPreviewImg = document.createElement("img");
  modalPreviewImg.src = imageURL;
  modalPreviewImg.alt = "Image choisie";
  modalPreviewImg.classList.add("modal-preview-img");
  modalAddPhoto.appendChild(modalPreviewImg);
});

// Retour à la fenêtre modale galerie

const backModalButton = document.querySelector(".back-modal");

backModalButton.addEventListener("click", () => {
  modalGalleryContent.style.display = "flex";
  modalAddWorkContent.style.display = "none";

  // Réinitialisation de l'interface d'ajout de photo
  const modalPreviewImg = modalAddPhoto.querySelector(".modal-preview-img");
  if (modalPreviewImg) {
    modalPreviewImg.remove();
  }

  // Réafficher les éléments initiaux
  modalAddPhoto.querySelector("img").style.display = "block";
  modalAddPhoto.querySelector("button").style.display = "block";
  modalAddPhoto.querySelector("span").style.display = "block";

  // Réinitialiser l'input file
  fileInput.value = "";
});
