// modules/calcul.js

let savingsChart = null;

export function calculateRequiredMonthlyContribution() {
    const initialAmount = parseFloat(document.getElementById('initialAmount').value);
    const targetAmount = parseFloat(document.getElementById('targetAmount').value);
    const annualInterestRate = parseFloat(document.getElementById('annualInterestRate').value) / 100;
    const years = parseInt(document.getElementById('years').value);
    const initialEntryFeesRate = parseFloat(document.getElementById('initialEntryFees').value) / 100;
    const monthlyEntryFeesRate = parseFloat(document.getElementById('monthlyEntryFees').value) / 100;
    const annualManagementFeesRate = parseFloat(document.getElementById('managementFees').value) / 100;
    const indexationRate = parseFloat(document.getElementById('indexationRate').value) / 100;
    const months = years * 12;

    // Méthode numérique pour trouver le versement mensuel
    let monthlyContribution = 0;
    let high = targetAmount * 2;  // Valeur maximale plausible
    let low = 0;

    for (let i = 0; i < 100; i++) {
        monthlyContribution = (high + low) / 2;
        let balance = initialAmount * (1 - initialEntryFeesRate);
        const monthlyInterestRate = Math.pow(1 + annualInterestRate, 1 / 12) - 1;
        const monthlyManagementFeesRate = Math.pow(1 + (-annualManagementFeesRate), 1 / 12) - 1;
        let monthlyContributionIndexed = monthlyContribution;

   

        for (let month = 1; month <= months; month++) {
            if (month % 12 === 1 && month > 1) {
                monthlyContributionIndexed *= (1 + indexationRate);
            }
            const managementFees = balance * (-monthlyManagementFeesRate);
            balance -= managementFees;
            const interestEarned = balance * monthlyInterestRate;
            balance += interestEarned;
            const contributionAfterFees = monthlyContributionIndexed * (1 - monthlyEntryFeesRate);
            balance += contributionAfterFees;
        }

        if (balance > targetAmount) {
            high = monthlyContribution;
        } else {
            low = monthlyContribution;
        }
    }

    // Simulation complète avec l'épargne mensuelle calculée
    let balance = initialAmount * (1 - initialEntryFeesRate);
    let totalContributions = initialAmount;
    let totalInterest = 0;
    let totalInitialEntryFees = initialAmount * initialEntryFeesRate;
    let totalMonthlyEntryFees = 0;
    let totalManagementFees = 0;
    let monthlyContributionIndexed = monthlyContribution;
    const monthlyInterestRate = Math.pow(1 + annualInterestRate, 1 / 12) - 1;
    const monthlyManagementFeesRate = Math.pow(1 + (-annualManagementFeesRate), 1 / 12) - 1;

    for (let i = 1; i <= months; i++) {
        if (i % 12 === 1 && i > 1) {
            monthlyContributionIndexed *= (1 + indexationRate);
        }
        const managementFees = balance * (-monthlyManagementFeesRate);
        totalManagementFees += managementFees;
        balance -= managementFees;

        const interestEarned = balance * monthlyInterestRate;
        totalInterest += interestEarned;
        balance += interestEarned;

        const contributionAfterFees = monthlyContributionIndexed * (1 - monthlyEntryFeesRate);
        totalMonthlyEntryFees += monthlyContributionIndexed * monthlyEntryFeesRate;
        totalContributions += monthlyContributionIndexed;
        balance += contributionAfterFees;
    }

    const finalBalance = Math.round(balance * 100) / 100;

    // Calcul du montant initial net de frais d'entrée
    const initialAmountNetOfFees = initialAmount * (1 - initialEntryFeesRate);

    // Calcul de l'épargne régulière nette de frais d'entrée
    let totalRegularSavingsNetOfFees = 0;
    monthlyContributionIndexed = monthlyContribution; // Assurer que la valeur indexée est correcte
    for (let i = 1; i <= months; i++) {
        if (i % 12 === 1 && i > 1) {
            monthlyContributionIndexed *= (1 + indexationRate);
        }
        totalRegularSavingsNetOfFees += monthlyContributionIndexed * (1 - monthlyEntryFeesRate);
    }

    // Calcul des intérêts gagnés nets
    const interestEarnedNet = finalBalance - (initialAmountNetOfFees + totalRegularSavingsNetOfFees);

    totalInterest = finalBalance - totalContributions + totalInitialEntryFees + totalMonthlyEntryFees + totalManagementFees - initialAmount * (1 - initialEntryFeesRate); // Calcul interestEarned pour ne pas casser ce qui existe déjà

// Affichage des résultats
const currencyFormatter = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0
});

const formattedMonthlyContribution = currencyFormatter.format(monthlyContribution);
document.getElementById('requiredMonthlyContribution').textContent = formattedMonthlyContribution;

const lastMonthlyContribution = monthlyContributionIndexed; // Le dernier versement mensuel est celui qui a été indexé pour la dernière année
const formattedLastMonthlyContribution = currencyFormatter.format(lastMonthlyContribution);
document.getElementById('lastMonthlyContribution').textContent = formattedLastMonthlyContribution;

const finalAmount = Math.round(balance * 100) / 100;
const formattedFinalAmount = currencyFormatter.format(finalAmount);
document.getElementById('finalAmount').textContent = formattedFinalAmount;

const formattedTotalContributions = currencyFormatter.format(totalContributions);
document.getElementById('totalContributions').textContent = formattedTotalContributions;

const formattedInterestEarnedNet = currencyFormatter.format(interestEarnedNet);
document.getElementById('interestEarnedNet').textContent = formattedInterestEarnedNet;

const formattedTotalInitialEntryFees = currencyFormatter.format(totalInitialEntryFees);
document.getElementById('totalInitialEntryFees').textContent = formattedTotalInitialEntryFees;

const formattedTotalMonthlyEntryFees = currencyFormatter.format(totalMonthlyEntryFees);
document.getElementById('totalMonthlyEntryFees').textContent = formattedTotalMonthlyEntryFees;

const formattedTotalManagementFees = currencyFormatter.format(totalManagementFees);
document.getElementById('totalManagementFees').textContent = formattedTotalManagementFees;

const totalFees = totalInitialEntryFees + totalMonthlyEntryFees + totalManagementFees;
document.getElementById('totalFeesValue').textContent = Math.round(totalFees).toLocaleString('fr-FR', {style: 'currency', currency: 'EUR', maximumFractionDigits: 0});

updateChart(years, initialAmount, initialEntryFeesRate, annualInterestRate, annualManagementFeesRate, monthlyEntryFeesRate, indexationRate, monthlyContribution, targetAmount, totalContributions, totalInitialEntryFees, totalMonthlyEntryFees, totalManagementFees);
}

function updateChart(years, initialAmount, initialEntryFeesRate, annualInterestRate, annualManagementFeesRate, monthlyEntryFeesRate, indexationRate, monthlyContribution, targetAmount, totalContributionsValue, totalInitialEntryFees, totalMonthlyEntryFees, totalManagementFees, totalFees) {
    const ctx = document.getElementById('savingsChart');

    // Préparer les données pour le graphique
    const labels = Array.from({ length: years + 1 }, (_, i) => `${i} ans`);

    // Calcul du cumul des versements
    let cumulativeContributions = initialAmount; // Initialiser avec le versement initial
    const cumulativeContributionData = [cumulativeContributions]; // Frais d'entrée initiaux à l'année 0

    let balance = initialAmount * (1 - initialEntryFeesRate);
    const monthlyInterestRate = Math.pow(1 + annualInterestRate, 1 / 12) - 1;
    const monthlyManagementFeesRate = Math.pow(1 + (-annualManagementFeesRate), 1 / 12) - 1;
    const months = years * 12;
    let monthlyContributionIndexed = monthlyContribution;

    for (let year = 1; year <= years; year++) {
        for (let month = 1; month <= 12; month++) {
            if (month % 12 === 1 && year > 1) {
                monthlyContributionIndexed *= (1 + indexationRate);
            }
            const managementFees = balance * (-monthlyManagementFeesRate);
            balance -= managementFees;
            const interestEarned = balance * monthlyInterestRate;
            balance += interestEarned;
            const contributionAfterFees = monthlyContributionIndexed * (1 - monthlyEntryFeesRate);
            balance += contributionAfterFees;
        }
        cumulativeContributions += 12 * monthlyContributionIndexed;
        cumulativeContributionData.push(cumulativeContributions); // Ajouter le cumul pour l'année

    }

    // Recalcul du cumul des frais annuels (plus précis)
    const feesData = [0]; // Initialisé à 0 pour l'année 0
    let cumulativeFees = 0;
    let balanceFees = initialAmount * (1 - initialEntryFeesRate);
    const monthlyInterestRateFees = Math.pow(1 + annualInterestRate, 1 / 12) - 1;
    const monthlyManagementFeesRateFees = Math.pow(1 + (-annualManagementFeesRate), 1 / 12) - 1;
    let monthlyContributionIndexedFees = monthlyContribution;
    cumulativeFees = totalInitialEntryFees; // Les frais initiaux sont ajoutés au début
    const feesDataWithInitial = [cumulativeFees];

    for (let year = 1; year <= years; year++) {
        let yearlyFees = 0;
        for (let month = 1; month <= 12; month++) {
            if (month % 12 === 1 && year > 1) {
                monthlyContributionIndexedFees *= (1 + indexationRate);
            }

            const managementFees = balanceFees * (-monthlyManagementFeesRateFees);
            balanceFees -= managementFees;
            yearlyFees += managementFees;

            const interestEarned = balanceFees * monthlyInterestRateFees;
            balanceFees += interestEarned;

            const contributionAfterFees = monthlyContributionIndexedFees * (1 - monthlyEntryFeesRate);
            balanceFees += contributionAfterFees;
            yearlyFees += monthlyContributionIndexedFees * monthlyEntryFeesRate;

        }
        cumulativeFees += yearlyFees
        feesDataWithInitial.push(cumulativeFees); // Ajout des frais cumulés pour cette année
    }

    let balanceData = [initialAmount * (1 - initialEntryFeesRate)]

    balance = initialAmount * (1 - initialEntryFeesRate);


    monthlyContributionIndexed = monthlyContribution;
    for (let year = 1; year <= years; year++) {
        for (let month = 1; month <= 12; month++) {
            if (month % 12 === 1 && year > 1) {
                monthlyContributionIndexed *= (1 + indexationRate);
            }
            const managementFees = balance * (-monthlyManagementFeesRate);
            balance -= managementFees;
            const interestEarned = balance * monthlyInterestRate;
            balance += interestEarned;
            const contributionAfterFees = monthlyContributionIndexed * (1 - monthlyEntryFeesRate);
            balance += contributionAfterFees;
        }
        balanceData.push(balance)
    }

    if (savingsChart) {
        savingsChart.destroy();
    }

    savingsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Évolution du capital',
                data: balanceData,
                borderColor: '#4caf50', // Vert
                backgroundColor: 'rgba(76, 175, 80, 0.2)', // Vert transparent
                fill: true // Ajouter un remplissage
            },
            {
                label: 'Montant objectif',
                data: Array(years + 1).fill(targetAmount),
                borderColor: '#ff6347',
                borderDash: [5, 5],
                fill: false
            },
            {
                label: 'Cumul des versements',
                data: cumulativeContributionData,
                borderColor: 'orange', // Orange
                backgroundColor: 'rgba(255, 165, 0, 0.2)', // Orange transparent
                fill: true // Ajouter un remplissage
            },
            {
                label: 'Cumul des frais',
                data: feesDataWithInitial,
                borderColor: '#FA8072', // Saumon (Light Coral)
                backgroundColor: 'rgba(250, 128, 114, 0.2)',//Saumon transparent
                fill: false //Retirer le remplissage
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Années'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Montant (€)'
                    },
                    ticks: {
                        callback: function (value) {
                            return value.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
                        }
                    }
                }
            },
            plugins: {
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