// modules/calcul.js

let savingsChart = null;
let feesChart = null;

let cumulatedInterestNetFees = 0; // Déclaration en dehors de la fonction
let totalFees = 0;





export function calculateSavings() {
    const initialAmount = parseFloat(document.getElementById('initialAmount').value);
    const initialMonthlyContribution = parseFloat(document.getElementById('monthlyContribution').value);
    const annualInterestRate = parseFloat(document.getElementById('annualInterestRate').value) / 100;
    const years = parseInt(document.getElementById('years').value);
    const initialEntryFeesRate = parseFloat(document.getElementById('initialEntryFees').value) / 100;
    const monthlyEntryFeesRate = parseFloat(document.getElementById('monthlyEntryFees').value) / 100;
    const annualManagementFeesRate = parseFloat(document.getElementById('managementFees').value) / 100;
    const indexationRate = parseFloat(document.getElementById('indexationRate').value) / 100;


    let balance = initialAmount * (1 - initialEntryFeesRate);
    const monthlyInterestRate = Math.pow(1 + annualInterestRate, 1 / 12) - 1;
    const monthlyManagementFeesRate = Math.pow(1 + (-annualManagementFeesRate), 1 / 12) - 1;
    const months = years * 12;
   

    const contributionsData = [initialAmount];
    const interestData = [0];
    let totalContributions = initialAmount;
    let totalInterest = 0;
    let totalInitialEntryFees = initialAmount * initialEntryFeesRate;
    let totalMonthlyEntryFees = 0;
    let totalManagementFees = 0;
    let monthlyContribution = initialMonthlyContribution;

    // Données pour le graphique des frais
    const feesData = [0]; // Initialisation des frais à 0
    let cumulativeFees = 0;

    for (let i = 1; i <= months; i++) {
        // Indexation du versement mensuel au début de chaque année
        if (i % 12 === 1 && i > 1) {
            monthlyContribution *= (1 + indexationRate);
        }

        // Les frais de gestion sont prélevés au début de chaque mois
        const managementFees = balance * (-monthlyManagementFeesRate);
        totalManagementFees += managementFees;
        balance -= managementFees;
       

        // Calcul des intérêts juste après la déduction des frais de gestion
        const interestEarned = balance * monthlyInterestRate;
        totalInterest += interestEarned;
        balance += interestEarned;

        const contributionAfterFees = monthlyContribution * (1 - monthlyEntryFeesRate);
        totalMonthlyEntryFees += monthlyContribution * monthlyEntryFeesRate;
        totalContributions += monthlyContribution;

        balance += contributionAfterFees;

        if (i % 12 === 0) {
            contributionsData.push(Math.round(totalContributions * 100) / 100);
            interestData.push(Math.round((totalInterest - totalManagementFees) * 100) / 100);

            // Accumuler les frais et les ajouter aux données (à la fin de chaque année)
            cumulativeFees = totalInitialEntryFees + totalMonthlyEntryFees + totalManagementFees;
            feesData.push(Math.round(cumulativeFees * 100) / 100);
        }

        // Calcul des intérêts cumulés nets de frais
        cumulatedInterestNetFees = totalInterest - totalManagementFees;
    }

    const finalBalance = Math.round(balance * 100) / 100;
    const totalFees = totalInitialEntryFees + totalMonthlyEntryFees + totalManagementFees;
    


    document.getElementById('finalAmount').textContent = Math.round(finalBalance).toLocaleString('fr-FR', {style: 'currency', currency: 'EUR', maximumFractionDigits: 0});
    document.getElementById('totalContributions').textContent = Math.round(totalContributions).toLocaleString('fr-FR', {style: 'currency', currency: 'EUR', maximumFractionDigits: 0});
    document.getElementById('interestEarned').textContent = Math.round(cumulatedInterestNetFees).toLocaleString('fr-FR', {style: 'currency', currency: 'EUR', maximumFractionDigits: 0});
    document.getElementById('totalInitialEntryFees').textContent = Math.round(totalInitialEntryFees).toLocaleString('fr-FR', {style: 'currency', currency: 'EUR', maximumFractionDigits: 0});
    document.getElementById('totalMonthlyEntryFees').textContent = Math.round(totalMonthlyEntryFees).toLocaleString('fr-FR', {style: 'currency', currency: 'EUR', maximumFractionDigits: 0});
    document.getElementById('totalManagementFees').textContent = Math.round(totalManagementFees).toLocaleString('fr-FR', {style: 'currency', currency: 'EUR', maximumFractionDigits: 0});
    document.getElementById('lastMonthlyContribution').textContent = Math.round(monthlyContribution).toLocaleString('fr-FR', {style: 'currency', currency: 'EUR', maximumFractionDigits: 0});
    document.getElementById('totalFeesValue').textContent = Math.round(totalFees).toLocaleString('fr-FR', {style: 'currency', currency: 'EUR', maximumFractionDigits: 0});
       
    updateCharts(contributionsData, interestData, years, totalContributions, cumulatedInterestNetFees, totalInitialEntryFees, totalMonthlyEntryFees, totalManagementFees, totalFees, feesData);
}

document.getElementById('interestEarned').textContent = cumulatedInterestNetFees.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });

function updateCharts(contributionsData, interestData, years, totalContributions, cumulatedInterestNetFees, totalInitialEntryFees, totalMonthlyEntryFees, totalManagementFees, totalFees, feesData) {
    const ctx1 = document.getElementById('savingsChart');
    const ctx4 = document.getElementById('feesChart');

    if (savingsChart) {
        savingsChart.destroy();
    }

    if (feesChart) {
        feesChart.destroy();
    }

    const labels = Array.from({ length: years + 1 }, (_, i) => `${i} an${i > 1 ? 's' : ''} `);

    const isDarkTheme = document.body.classList.contains('dark-theme');
    const textColor = isDarkTheme ? '#ffffff' : '#1a1a1a';
    const gridColor = isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

    // Recalculer le cumul en tenant compte de tous les frais et intérêts
    const initialAmount = parseFloat(document.getElementById('initialAmount').value);
    const initialEntryFeesRate = parseFloat(document.getElementById('initialEntryFees').value) / 100;
    const monthlyContribution = parseFloat(document.getElementById('monthlyContribution').value);
    const annualInterestRate = parseFloat(document.getElementById('annualInterestRate').value) / 100;
    const annualManagementFeesRate = parseFloat(document.getElementById('managementFees').value) / 100;
    const monthlyEntryFeesRate = parseFloat(document.getElementById('monthlyEntryFees').value) / 100;
    const indexationRate = parseFloat(document.getElementById('indexationRate').value) / 100;
    const months = years * 12;

    let balance = initialAmount * (1 - initialEntryFeesRate);
    const monthlyInterestRate = Math.pow(1 + annualInterestRate, 1 / 12) - 1;
    const monthlyManagementFeesRate = Math.pow(1 + (-annualManagementFeesRate), 1 / 12) - 1;
    let currentMonthlyContribution = monthlyContribution;

    let cumulativeData = [initialAmount];

    // Initialisation des frais cumulés avec les frais d'entrée initiaux
    let cumulativeFees = totalInitialEntryFees;
    const feesDataWithInitial = [cumulativeFees]; // Ajout des frais d'entrée initiaux dès l'année 0

    for (let year = 1; year <= years; year++) {
        for (let month = 1; month <= 12; month++) {
            // Indexation du versement mensuel au début de chaque année
            if (month === 1 && year > 1) {
                currentMonthlyContribution *= (1 + indexationRate);
            }

            // Les frais de gestion sont prélevés au début de chaque mois
            const managementFees = balance * (-monthlyManagementFeesRate);
            balance -= managementFees;
            cumulativeFees += managementFees; // Ajout des frais de gestion aux frais cumulés

            // Calcul des intérêts juste après la déduction des frais de gestion
            const interestEarned = balance * monthlyInterestRate;
            balance += interestEarned;

            const contributionAfterFees = currentMonthlyContribution * (1 - monthlyEntryFeesRate);
            balance += contributionAfterFees;

            // Ajout des frais d'entrée mensuels aux frais cumulés
            cumulativeFees += currentMonthlyContribution * monthlyEntryFeesRate;
        }
        cumulativeData.push(Math.round(balance * 100) / 100);
        feesDataWithInitial.push(Math.round(cumulativeFees * 100) / 100); // Mise à jour des frais cumulés pour l'année
    }

    savingsChart = new Chart(ctx1, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Cumul des versements',
                    data: contributionsData,
                    borderColor: '#ffa500',
                    backgroundColor: 'rgba(255, 165, 0, 0.1)',
                    fill: true
                },
                {
                    label: 'Montant final',
                    data: cumulativeData,
                    borderColor: '#4caf50',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    fill: true
                },
                {
                    label: 'Frais cumulés',
                    data: feesDataWithInitial, // Utilisation des frais cumulés avec frais d'entrée initiaux
                    borderColor: '#ff6347',
                    backgroundColor: 'rgba(255, 99, 71, 0.2)',
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Durée',
                        color: textColor
                    },
                    ticks: { color: textColor },
                    grid: { color: gridColor }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Montant (€)',
                        color: textColor
                    },
                    ticks: {
                        color: textColor,
                        callback: function (value) {
                            return value.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
                        }
                    },
                    grid: { color: gridColor }
                }
            },
            plugins: {
                legend: { labels: { color: textColor } },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(context.parsed.y);
                            }
                            return label;
                        }
                    }
                }
            }
        }
    });
}