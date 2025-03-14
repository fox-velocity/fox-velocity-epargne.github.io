// Dans scriptmultiactif.js

import { updateEvolutionChart, updateInvestmentChart, updateSavingsChart } from './modules/charts.js';
import { calculateInvestmentData } from './modules/data.js';
import { updateStockInfo, updateResultsDisplay, updateSecuredGainsTable, showLoadingIndicator, setElementVisibility } from './modules/dom.js';
import { generateExcelFile } from './modules/excel.js';
import { generatePDF } from './modules/pdf.js';
import { initializeTheme, toggleTheme } from './modules/theme.js';
import { formatNumberInput, formatNumber } from './modules/utils.js';
import { currencySymbols, exchangeToCurrency } from './modules/constants.js';

let selectedSymbol = "";
let currencySymbol = "";
let excelData = null;
let excelCappedDatesAndAmounts = null;
let pdfMake = null;
let logoBase64 = null;
let logoRenardBase64Gris = null; // Ajout de la variable pour l'image de fond
let searchTimeout = null; // Ajouter un timer pour la recherche

// Initialisation au chargement de la page
window.onload = function () {
    const today = new Date();
    const threeYearsAgo = new Date();
    threeYearsAgo.setFullYear(today.getFullYear() - 3);
    const endDate = new Date(today.getFullYear(), today.getMonth(), 0);

    document.getElementById('endDate').value = endDate.toISOString().split('T')[0];
    document.getElementById('startDate').value = threeYearsAgo.toISOString().split('T')[0];
    initializeTheme();

    // Masquer initialement les éléments
    setElementVisibility('results', false);
    setElementVisibility('resultsWithCapping', false);
    setElementVisibility('savingsChartContainer', false);
    setElementVisibility('evolutionChartContainer', false);
    setElementVisibility('investmentChartContainer', false);
    setElementVisibility('resultsTauxFix', false);
    setElementVisibility('BoutonTelechargement', false);

    //pdfMake
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/pdfmake.min.js';
    document.head.appendChild(script);

    const script2 = document.createElement('script');
    script2.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/vfs_fonts.min.js';
    document.head.appendChild(script2);

    // Attendre que pdfMake soit chargé
    script2.onload = () => {
        pdfMake = window.pdfMake;
        console.log("pdfMake is ready :", pdfMake)
    };
    fetch('./logoBase64')
        .then(response => response.text())
        .then(data => {
            logoBase64 = data;
        })
        .catch(error => console.error('Error loading logo:', error));

    // Chargement de l'image de fond
    fetch('./logorenard.base64Gris.base64') // Chemin vers ton fichier base64
        .then(response => response.text())
        .then(data => {
            logoRenardBase64Gris = data;
        })
        .catch(error => console.error('Error loading background image:', error));
};

// Gestion des changements de date
document.getElementById('startDate').addEventListener('change', function () {
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const startDate = new Date(startDateInput.value);
    const endDate = new Date(endDateInput.value);
    if (endDate <= startDate) {
        endDateInput.value = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 1).toISOString().split('T')[0];
    }
});

document.getElementById('endDate').addEventListener('change', function () {
    const endDateInput = document.getElementById('endDate');
    const startDateInput = document.getElementById('startDate');
    const endDate = new Date(endDateInput.value);
    const startDate = new Date(startDateInput.value);
    if (startDate >= endDate) {
        startDateInput.value = new Date(endDate.getFullYear(), endDate.getMonth() - 1, 1).toISOString().split('T')[0];
    }
});

// Recherche de symboles
document.getElementById('searchInput').addEventListener('input', function () {
  const query = this.value.trim();
  clearTimeout(searchTimeout);
  if (query.length < 3) {
    setElementVisibility('suggestions', false);
    return;
  }
  searchTimeout = setTimeout(async () => {
    if (!query) {
      setElementVisibility('suggestions', false);
      return;
    }
    const suggestionsContainer = document.getElementById('suggestions');
    suggestionsContainer.innerHTML = "Chargement...";
    setElementVisibility('suggestions', true);
    try {
      // URL de recherche Yahoo Finance adaptée pour les ISIN
      const url = `/api/yahooFinanceISIN?q=${encodeURIComponent(query)}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const yahooData = await response.json();
      const results = yahooData.quotes;

      displaySuggestions(results);

    } catch (error) {
      console.error("Erreur lors de la recherche : ", error);
      suggestionsContainer.innerHTML = "Erreur lors de la recherche.";
    }
  }, 300);
});

// Sélection d'un symbole
function selectSymbol(symbol, name, exchange, type, sector, industry) {
    selectedSymbol = symbol;
    document.getElementById('searchInput').value = name;
    setElementVisibility('suggestions', false);
    setElementVisibility('ModeEmploie', false);

    let currency = exchangeToCurrency[exchange] || 'N/A';
    currencySymbol = currencySymbols[currency] || currency;

     // Si currencySymbol est toujours 'N/A' après la tentative initiale, essayez d'utiliser exchDisp
     if (currencySymbol === 'N/A') {
      currency = exchangeToCurrency[exchange] || 'N/A';
      currencySymbol = currencySymbols[currency] || exchange; // Utilisez exchDisp comme fallback
    }

    // Information sur la devise
    const exchDisp =  exchange;

    // Stock les valeurs dans le log
    console.log("selectSymbol: Informations sur l'action:", {
        symbol: symbol,
        name: name,
        exchange: exchange,
        type: type,
        sector: sector,
        industry: industry,
        currencySymbol: currencySymbol,
        exchDisp: exchDisp
    });

    updateStockInfo(name, symbol, exchDisp, currencySymbol, type, industry);
    fetchData()

}
window.selectSymbol = selectSymbol; // Rend selectSymbol accessible globalement

// Récupération des données
async function fetchData() {
    if (!selectedSymbol) {
      alert("Veuillez rechercher et sélectionner une valeur avant de continuer.");
      return;
    }
    showLoadingIndicator(true);
    const startDateInput = new Date(document.getElementById('startDate').value);
    const endDateInput = new Date(document.getElementById('endDate').value);
    const startDate = startDateInput.getTime() / 1000;
    const endDate = endDateInput.getTime() / 1000;
    // Récupérer la valeur numérique (sans espace) des champs de saisie
    const initialInvestment = parseFloat(document.getElementById('initialInvestment').value.replace(/\s/g, '')) || 0;
    const monthlyInvestment = parseFloat(document.getElementById('monthlyInvestment').value.replace(/\s/g, '')) || 0;
    // Récupérer le pourcentage d'écrêtage depuis le select
    const cappingPercentage = parseFloat(document.getElementById('cappingPercentage').value) || 0.05;
    const minCappingAmount = parseFloat(document.getElementById('minCappingAmount').value) || 100;
    // Récupérer le taux d'intérêt annuel
    const annualInterestRate = parseFloat(document.getElementById('interestRate').value) || 0.02;
    const monthlyInterestRate = Math.pow(1 + (annualInterestRate), 1 / 12) - 1;
    try {
      // MODIFICATION IMPORTANTE : Utilisation de l'API Vercel
      const symbol = selectedSymbol; // Stock le selectedSymbol dans une variable
      const period1 = startDate;
      const period2 = endDate;
      const interval = "1mo";
  
      // Utilise une nouvelle route d'API Vercel (ex: /api/yahooChartData)
      const url = `/api/yahooChartData?symbol=${symbol}&period1=${period1}&period2=${period2}&interval=${interval}`;
  
      const response = await fetch(url);
  
      if (!response.ok) {
        throw new Error(`Yahoo Finance API error: ${response.status} ${response.statusText}`);
      }
      const yahooData = await response.json();
      console.log('API Response:', yahooData);
      if (!yahooData.chart || !yahooData.chart.result) {
        alert('Aucune donnée disponible pour cet indice.');
        return;
      }
      const result = yahooData.chart.result[0];
      const timestamps = result.timestamp;
      const prices = result.indicators.quote[0].close;
      const { chartData, cappedDatesAndAmountsWithInterest, results } = calculateInvestmentData(timestamps, prices, initialInvestment, monthlyInvestment, cappingPercentage, minCappingAmount, monthlyInterestRate, annualInterestRate);
      updateResultsDisplay(results, currencySymbol);
      updateSecuredGainsTable(cappedDatesAndAmountsWithInterest, currencySymbol)
      updateEvolutionChart(chartData.labels, chartData.prices);
      updateInvestmentChart(chartData.labels, chartData.investments, chartData.portfolio, chartData.portfolioValueEcreteAvecGain);
  
      let cumulativeSavingsFix3 = 0;
      let savingsDataFix3 = [];
      let totalInvestmentsFix3 = 0;
  
      for (let i = 0; i < chartData.labels.length; i++) {
        totalInvestmentsFix3 += chartData.investments[i];
        if (i === 0) {
          cumulativeSavingsFix3 = chartData.investments[i];
          savingsDataFix3.push(0);
        } else {
          cumulativeSavingsFix3 = cumulativeSavingsFix3 * (1 + monthlyInterestRate) + (chartData.investments[i] - chartData.investments[i - 1]);
          savingsDataFix3.push(cumulativeSavingsFix3 - chartData.investments[i]);
        }
      }
      const finalAmountFix3 = cumulativeSavingsFix3;
      const totalInterestFix3 = totalInvestmentsFix3;
      const lastInvestment = chartData.investments[chartData.investments.length - 1]
      const lastGainTauxFixe = cumulativeSavingsFix3 - lastInvestment;
  
      updateSavingsChart(chartData.labels, chartData.investments, chartData.portfolio, monthlyInterestRate, cumulativeSavingsFix3, lastInvestment, savingsDataFix3);
  
      // Mettre à jour l'affichage du taux d'intérêt
      const interestRateValue = document.getElementById('interestRate').value;
      document.getElementById('totalInterest').textContent = (parseFloat(interestRateValue) * 100).toFixed(2).replace('.', ',') + ' ' + '%';
  
      document.getElementById('last-cumulative-savings').textContent = formatNumber(finalAmountFix3.toFixed(2).replace('.', ',')) + ' ' + currencySymbol;
      document.getElementById('last-investment').textContent = formatNumber(lastInvestment.toFixed(2).replace('.', ',')) + ' ' + currencySymbol;
      document.getElementById('gain-taux-fixe').textContent = formatNumber(lastGainTauxFixe.toFixed(2).replace('.', ',')) + ' ' + currencySymbol;
  
      // Afficher les sections de résultat et les boutons de téléchargement ici
      setElementVisibility('resultsWithCapping', true);
      setElementVisibility('evolutionChartContainer', true);
      setElementVisibility('investmentChartContainer', true);
      setElementVisibility('results', true);
      setElementVisibility('savingsChartContainer', true);
      setElementVisibility('resultsTauxFix', true);
      setElementVisibility('BoutonTelechargement', document.getElementById('resultsTauxFix').style.display !== 'none');
  
      // Stocker les données pour le fichier excel
      excelData = chartData;
      excelCappedDatesAndAmounts = cappedDatesAndAmountsWithInterest;
    } catch (error) {
      console.error('Erreur lors de la récupération des données :', error);
      alert('Erreur lors de la récupération des données. Veuillez réessayer.');
    } finally {
      showLoadingIndicator(false);
    }
  }

/**
 * Affiche les suggestions de recherche.
 * @param {Array} results - Un tableau d'objets représentant les résultats de la recherche.
 *                          Chaque objet doit avoir au moins un 'symbol' et un 'shortname' ou 'longname'.
 */
function displaySuggestions(results) {
    const suggestionsContainer = document.getElementById('suggestions');
    suggestionsContainer.innerHTML = '';
    setElementVisibility('suggestions', true);

    if (!results || results.length === 0) {
        suggestionsContainer.innerHTML = "Aucun résultat trouvé.";
        return;
    }

    const ul = document.createElement('ul');
    results.forEach(result => {
        const li = document.createElement('li');
        li.style.cursor = 'pointer';
        li.onclick = function () {
            selectSymbol(result.symbol, result.longname || result.shortname, result.exchDisp, result.typeDisp, result.sector, result.industry);
        };

        // Affiche le nom de la société et le symbole (ou l'ISIN)
        li.innerHTML = `<strong>${result.longname || result.shortname}</strong> (${result.symbol})`;
        ul.appendChild(li);
    });

    suggestionsContainer.appendChild(ul);
}

// Gestion du téléchargement Excel
function downloadExcel() {
    if (excelData && excelCappedDatesAndAmounts) {
        generateExcelFile(excelData, excelCappedDatesAndAmounts, currencySymbol);
    } else {
        alert("Aucune donnée à exporter, veuillez faire une simulation.");
    }
}

// Gestion du changement de thème
document.querySelector('.theme-toggle').addEventListener('click', toggleTheme);

// Gestion du formatage des inputs
document.getElementById('initialInvestment').addEventListener('input', function () {
    formatNumberInput(this);
});
document.getElementById('monthlyInvestment').addEventListener('input', function () {
    formatNumberInput(this);
});

// Gestion du téléchargement PDF
async function generatePDFWrapper() {
        try {
            await generatePDF(pdfMake, logoBase64, logoRenardBase64Gris); // <-- Ajout de l'image de fond en paramètre
        } catch (error) {
            console.error('Erreur lors de la génération du PDF', error);
        }
    }
    document.getElementById('download-pdf').addEventListener('click', generatePDFWrapper);

    // Rendre generatePDFWrapper accessible globalement
    window.generatePDFWrapper = generatePDFWrapper;

    // Gestion du bouton écrétage
    document.querySelector('.toggle-button').addEventListener('click', function () {
        var section = document.getElementById("advancedSection");
        section.style.display = section.style.display === "none" ? "block" : "none";
        fetchData(); // recalcul des données
    });

// Exporter les fonctions nécessaires pour les tests
export {
    selectSymbol,
    fetchData,
    downloadExcel,
    toggleTheme
};
window.fetchData = fetchData;
window.toggleTheme = toggleTheme; //  ajout pour rendre la fonction accesible globalement
// Gestionnaire d'événement pour le bouton de téléchargement Excel
const downloadButton = document.getElementById('download-button');
downloadButton.addEventListener('click', downloadExcel);