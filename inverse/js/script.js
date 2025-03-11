// script.js
import { calculateInitial } from './modules/calculCapitalInitial.js';
import { generatePDF } from './modules/pdfCapitalInitial.js';
import { toggleTheme } from './modules/theme.js';

function updateRangeValue(inputId, valueId, suffix = '') {
    const input = document.getElementById(inputId);
    const value = document.getElementById(valueId);
    if (input && value) {
        let formattedValue;
        if (inputId === 'years') {
            const years = parseInt(input.value);
            value.textContent = `${years} ans`;
            return; // Ne pas appliquer le formatage par défaut pour les années
        } else {
            const floatValue = parseFloat(input.value);
            // Formater avec 1 décimale si c'est un slider de pourcentage
            if (inputId === 'annualInterestRate' || inputId === 'initialEntryFees' || inputId === 'monthlyEntryFees' || inputId === 'managementFees') {
                formattedValue = floatValue.toFixed(2);
            } else {
                formattedValue = floatValue.toLocaleString('fr-FR');
            }
        }
        value.textContent = formattedValue + suffix;
    }
}


function initializeSliders() {
    const sliders = document.querySelectorAll('input[type="range"]');

    sliders.forEach(slider => {
        const initialValue = slider.value;
        const minValue = slider.min;

        slider.value = minValue;
        updateRangeValue(slider.id, slider.id + 'Value', slider.id === 'annualInterestRate' || slider.id === 'initialEntryFees' || slider.id === 'monthlyEntryFees' || slider.id === 'managementFees' || slider.id === 'indexationRate' ? ' %' : ' €');
        calculateInitial();

        slider.classList.add('animated-range');

        setTimeout(() => {
            slider.value = initialValue;
            updateRangeValue(slider.id, slider.id + 'Value', slider.id === 'annualInterestRate' || slider.id === 'initialEntryFees' || slider.id === 'monthlyEntryFees' || slider.id === 'managementFees' || slider.id === 'indexationRate' ? ' %' : ' €');
            calculateInitial();

            slider.addEventListener('transitionend', () => {
                slider.classList.remove('animated-range');
            }, { once: true });
        }, 1000); // Augmente le délai à 1000ms
    });
}


// Mise à jour des valeurs affichées et recalcul lors du changement des curseurs
document.querySelectorAll('input[type="range"]').forEach(input => {
    input.addEventListener('input', () => {
        updateRangeValue(input.id, input.id + 'Value', input.id === 'annualInterestRate' || input.id === 'initialEntryFees' || input.id === 'monthlyEntryFees' || input.id === 'managementFees' || input.id === 'indexationRate' ? ' %' : ' €');
        calculateInitial();
    });
});

// Ajout de l'événement au bouton de changement de thème
document.getElementById('themeToggle').addEventListener('click', toggleTheme);

// Calcul initial
document.addEventListener('DOMContentLoaded', function() {
    initializeSliders(); // Démarre l'initialisation des sliders
    // calculateInitial(); Supprimé car déjà appelé dans initializeSliders
});

  //pdfMake
  const script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/pdfmake.min.js';
  document.head.appendChild(script);

  const script2 = document.createElement('script');
  script2.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/vfs_fonts.min.js';
  document.head.appendChild(script2);

  // Attendre que pdfMake soit chargé
  script2.onload = () => {
      window.pdfMake = window.pdfMake;
  
  };
  fetch('../images/logoBase64')
      .then(response => response.text())
      .then(data => {
          window.logoBase64 = data;
      })
      .catch(error => console.error('Error loading logo:', error));

  // Chargement de l'image de fond
  fetch('../images/logorenard.base64Gris.base64') // Chemin vers ton fichier base64
      .then(response => response.text())
      .then(data => {
          window.logoRenardBase64Gris = data;
      })
      .catch(error => console.error('Error loading background image:', error));

      // Gestion du téléchargement PDF
async function generatePDFWrapper() {
    try {
        const initialEntryFeesRate = parseFloat(document.getElementById('initialEntryFees').value) / 100;
        const monthlyEntryFeesRate = parseFloat(document.getElementById('monthlyEntryFees').value) / 100;
        const annualManagementFeesRate = parseFloat(document.getElementById('managementFees').value) / 100;

        let totalInitialEntryFees = parseFloat(document.getElementById('initialCapital').value) * initialEntryFeesRate;
        let totalMonthlyEntryFees = 0;
        let totalManagementFees = 0;
        let monthlyContribution = parseFloat(document.getElementById('monthlyContribution').value);
        
        const years = parseInt(document.getElementById('years').value);
        const months = years * 12;

        let balance = parseFloat(document.getElementById('initialCapital').value) * (1 - initialEntryFeesRate);
        const monthlyManagementFeesRate = Math.pow(1 + (-annualManagementFeesRate), 1 / 12) - 1;
        for (let i = 1; i <= months; i++) {
            
             // Les frais de gestion sont prélevés au début de chaque mois
             const managementFees = balance * (-monthlyManagementFeesRate);
             totalManagementFees += managementFees;
             balance -= managementFees;

            totalMonthlyEntryFees += monthlyContribution * monthlyEntryFeesRate;
        }

        const totalFees = totalInitialEntryFees + totalMonthlyEntryFees + totalManagementFees;
        await generatePDF(window.pdfMake, window.logoBase64, window.logoRenardBase64Gris,totalFees);
    } catch (error) {
        console.error('Erreur lors de la génération du PDF', error);
    }
}
document.getElementById('download-pdf').addEventListener('click', generatePDFWrapper);