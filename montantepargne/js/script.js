import { calculateRequiredMonthlyContribution } from './modules/calcul.js'; // Importez uniquement la fonction nécessaire
import { toggleTheme } from './modules/theme.js';
import { generatePDF } from './modules/pdfEpargneMensuel.js'; // Importez la fonction generatePDF

function updateRangeValue(inputId, valueId, suffix = '') {
    const input = document.getElementById(inputId);
    const value = document.getElementById(valueId);
    if (input && value) {
        let formattedValue;
        if (inputId === 'years') {
            const years = parseInt(input.value);
            value.textContent = `${years} ans`;
            return;
        } else {
            const floatValue = parseFloat(input.value);
            if (inputId === 'annualInterestRate' || inputId === 'initialEntryFees' || inputId === 'monthlyEntryFees' || inputId === 'managementFees' || inputId === 'indexationRate') {
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
    const sliderData = []; // Store initial values and IDs

    sliders.forEach(slider => {
        const initialValue = slider.value;
        const minValue = slider.min;
        sliderData.push({
            slider: slider,
            initialValue: initialValue,
            id: slider.id
        });

        slider.value = minValue;
        updateRangeValue(slider.id, slider.id + 'Value', slider.id === 'annualInterestRate' || slider.id === 'initialEntryFees' || slider.id === 'monthlyEntryFees' || slider.id === 'managementFees' || slider.id === 'indexationRate' ? ' %' : ' €');

        slider.classList.add('animated-range');
    });
    
    // Restore initial values after setting all to min
    setTimeout(() => {
        sliderData.forEach(item => {
            item.slider.value = item.initialValue;
            updateRangeValue(item.id, item.id + 'Value', item.id === 'annualInterestRate' || item.id === 'initialEntryFees' || item.id === 'monthlyEntryFees' || item.id === 'managementFees' || item.id === 'indexationRate' ? ' %' : ' €');
            item.slider.addEventListener('transitionend', () => {
                item.slider.classList.remove('animated-range');
            }, { once: true });
        });
                // Calculer les économies APRÈS avoir restauré toutes les valeurs
        calculateRequiredMonthlyContribution();
    }, 100);
}


document.querySelectorAll('input[type="range"]').forEach(input => {
    input.addEventListener('input', () => {
        updateRangeValue(input.id, input.id + 'Value', input.id === 'annualInterestRate' || input.id === 'initialEntryFees' || input.id === 'monthlyEntryFees' || input.id === 'managementFees' || input.id === 'indexationRate' ? ' %' : ' €');
        calculateRequiredMonthlyContribution(); // Appeler directement la fonction
    });
});

document.getElementById('themeToggle').addEventListener('click', toggleTheme);

document.addEventListener('DOMContentLoaded', function() {
    initializeSliders();
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
        await generatePDF(window.pdfMake, window.logoBase64, window.logoRenardBase64Gris);
    } catch (error) {
        console.error('Erreur lors de la génération du PDF', error);
    }
}
document.getElementById('download-pdf').addEventListener('click', generatePDFWrapper);