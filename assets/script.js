// ────────────────────────────────────────────────────────────────────────────────
//                  Récupération des données works de l'API
// ────────────────────────────────────────────────────────────────────────────────

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

// ────────────────────────────────────────────────────────────────────────────────
//                  Fonction d'affichage des travaux dans la galerie
// ────────────────────────────────────────────────────────────────────────────────

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

// ────────────────────────────────────────────────────────────────────────────────
//                  Récupération des données categories via l'API
//                            Affichage des boutons
//                        Fonction de filtrage des travaux
// ────────────────────────────────────────────────────────────────────────────────

const filters = document.querySelector(".filters");
let categories = [];

fetch("http://localhost:5678/api/categories")
  .then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return response.json();
  })
  .then((data) => {
    categories = data;

    // Création du bouton "Tous"
    const allButton = document.createElement("button");
    allButton.className = "filter-button";
    allButton.dataset.category = "all";
    allButton.textContent = "Tous";
    filters.appendChild(allButton);

    // Création des boutons de catégories
    categories.forEach((category) => {
      const button = document.createElement("button");
      button.className = "filter-button";
      button.dataset.category = category.id;
      button.textContent = category.name;
      filters.appendChild(button);
    });

    // Sélection des boutons après leur création
    const buttons = document.querySelectorAll(".filter-button");

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
    // Ajout des catégories dans l'input select de la fenêtre modale
    addCategoriesToSelect();
  })
  .catch((error) => {
    console.log(`Erreur lors de la récupération des données: ${error.message}`);
  });

// ────────────────────────────────────────────────────────────────────────────────
//                           Mode administrateur
//      Apparition de la bannière et du bouton modifier pour le mode édition
//                     Disparition des boutons de filtre
// ────────────────────────────────────────────────────────────────────────────────

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

// ────────────────────────────────────────────────────────────────────────────────
//                  Apparition et fermeture de la fenêtre modale
// ────────────────────────────────────────────────────────────────────────────────

const modal = document.querySelector(".modal");
const closeModalButton = document.querySelector(".close-modal");

function openModal() {
  modal.style.display = "flex";
  modal.setAttribute("aria-hidden", "false");
  modal.setAttribute("aria-modal", "true");
  modal.addEventListener("click", closeModal);
  closeModalButton.addEventListener("click", closeModal);

  // Réinitialiser l'affichage des fenêtres modales
  modalGalleryContent.style.display = "flex";
  modalAddWorkContent.style.display = "none";

  displayModalGallery(works);
}

function closeModal(event) {
  if (
    !event ||
    event.target === event.currentTarget ||
    event.target.closest(".close-modal")
  ) {
    modal.style.display = "none";
    modal.setAttribute("aria-hidden", "true");
    modal.setAttribute("aria-modal", "false");
    resetForm();
  }
}

document
  .querySelector(".edition-mode-link")
  .addEventListener("click", openModal);

// ────────────────────────────────────────────────────────────────────────────────
//                  Affichage de la galerie dans la fenêtre modale
// ────────────────────────────────────────────────────────────────────────────────

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

// ────────────────────────────────────────────────────────────────────────────────
//           Suppression des travaux dans la modale et dans la galerie
// ────────────────────────────────────────────────────────────────────────────────

const token = sessionStorage.getItem("token");

function deleteWork(id) {
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

// ────────────────────────────────────────────────────────────────────────────────
//              Ouverture de la fenêtre modale d'ajout de travaux
// ────────────────────────────────────────────────────────────────────────────────

const addPhotoButton = document.querySelector(".add-photo-button");
const modalGalleryContent = document.querySelector(".modal-gallery-content");
const modalAddWorkContent = document.querySelector(".modal-add-work-content");

function openAddWorkModal() {
  modalGalleryContent.style.display = "none";
  modalAddWorkContent.style.display = "flex";
}

addPhotoButton.addEventListener("click", openAddWorkModal);

// ────────────────────────────────────────────────────────────────────────────────
//                    Prévisualisation de l'image choisie
// ────────────────────────────────────────────────────────────────────────────────

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

// ────────────────────────────────────────────────────────────────────────────────
//                  Ajout des catégories dans l'input select
// ────────────────────────────────────────────────────────────────────────────────

const modalAddWorkFormSelect = document.querySelector("#category");

function addCategoriesToSelect() {
  // Ajout d'une option vide par défaut
  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "";
  modalAddWorkFormSelect.appendChild(defaultOption);

  // Ajout des catégories
  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category.id;
    option.textContent = category.name;
    modalAddWorkFormSelect.appendChild(option);
  });
}

// ────────────────────────────────────────────────────────────────────────────────
//                  Retour à la fenêtre modale galerie
// ────────────────────────────────────────────────────────────────────────────────

const backModalButton = document.querySelector(".back-modal");

backModalButton.addEventListener("click", () => {
  modalGalleryContent.style.display = "flex";
  modalAddWorkContent.style.display = "none";
  resetForm();
});

// ────────────────────────────────────────────────────────────────────────────────
//             Réinitialisation du formulaire d'ajout de travaux
// ────────────────────────────────────────────────────────────────────────────────

function resetForm() {
  // Réinitialisation de l'interface d'ajout de photo
  const modalPreviewImg = modalAddPhoto.querySelector(".modal-preview-img");

  if (modalPreviewImg) {
    modalPreviewImg.remove();
  }

  // Réafficher les éléments initiaux dans la fenêtre d'ajout de photo
  modalAddPhoto.querySelector("img").style.display = "block";
  modalAddPhoto.querySelector("button").style.display = "block";
  modalAddPhoto.querySelector("span").style.display = "block";

  // Réinitialiser du formulaire d'ajout de travaux
  fileInput.value = "";
  titleInput.value = "";
  categorySelect.value = "";
  addWorkButton.classList.remove("valid");
  formErrorMessage.textContent = "";
}

// ────────────────────────────────────────────────────────────────────────────────
//           Vérification de la validité des données du formulaire
// ────────────────────────────────────────────────────────────────────────────────

const titleInput = document.querySelector("#title");
const categorySelect = document.querySelector("#category");
const addWorkButton = document.querySelector(".add-work-button");

function isFormValid() {
  const hasImage = fileInput.files.length > 0;
  const hasTitle = titleInput.value.trim() !== "";
  const hasCategory = categorySelect.value !== "";
  return hasImage && hasTitle && hasCategory;
}

// ────────────────────────────────────────────────────────────────────────────────
//           Changement de la classe du bouton d'ajout de travaux
// ────────────────────────────────────────────────────────────────────────────────

function updateAddWorkButton() {
  if (isFormValid()) {
    addWorkButton.classList.add("valid");
  } else {
    addWorkButton.classList.remove("valid");
  }
}

// ────────────────────────────────────────────────────────────────────────────────
//               Vérification à chaque modification du formulaire
// ────────────────────────────────────────────────────────────────────────────────

fileInput.addEventListener("change", updateAddWorkButton);
titleInput.addEventListener("input", updateAddWorkButton);
categorySelect.addEventListener("change", updateAddWorkButton);

// ────────────────────────────────────────────────────────────────────────────────
//             Envoi des données du formulaire à l'API lors du submit
// ────────────────────────────────────────────────────────────────────────────────

const addWorkForm = document.querySelector(".add-work-form");
const formErrorMessage = document.querySelector(".form-error-message");

addWorkForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (isFormValid()) {
    formErrorMessage.textContent = "";

    const formData = new FormData();
    formData.append("image", fileInput.files[0]);
    formData.append("title", titleInput.value.trim());
    formData.append("category", categorySelect.value);

    fetch("http://localhost:5678/api/works", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })
    .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
      works.push(data); // Pour un affichage immédiat du nouveau travail
      displayWorks(works);
      displayModalGallery(works);
      closeModal();
    })
    .catch(error => {
      console.log(`Erreur lors de l'envoi du projet: ${error.message}`);
    });
  } else {
    formErrorMessage.textContent = "Veuillez remplir tous les champs";
  }
});
