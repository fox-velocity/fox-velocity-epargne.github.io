// modules/calcul.js OK vec nuage de point

let savingsChart = null;

export function calculateSavingsDuration() {
    const initialAmount = parseFloat(document.getElementById('initialAmount').value);
    const monthlyContribution = parseFloat(document.getElementById('monthlyContribution').value);
    const annualInterestRate = parseFloat(document.getElementById('annualInterestRate').value) / 100;
    const initialEntryFeesRate = parseFloat(document.getElementById('initialEntryFees').value) / 100;
    const monthlyEntryFeesRate = parseFloat(document.getElementById('monthlyEntryFees').value) / 100;
    const annualManagementFeesRate = parseFloat(document.getElementById('managementFees').value) / 100;
    const indexationRate = parseFloat(document.getElementById('indexationRate').value) / 100;

    // Récupération du montant cible depuis le HTML
    let targetAmount = parseFloat(document.getElementById('targetAmount').value);

    // Initialisation de la durée
    let years = 0;
    let months = 0;
    let balance = initialAmount * (1 - initialEntryFeesRate);
    const monthlyInterestRate = Math.pow(1 + annualInterestRate, 1 / 12) - 1;
    const monthlyManagementFeesRate = Math.pow(1 + (-annualManagementFeesRate), 1 / 12) - 1;
    let monthlyContributionIndexed = monthlyContribution;
    let totalContributions = initialAmount;

  
    // Boucle de simulation mensuelle
    while (balance < targetAmount && years < 100) {
        months++;
        totalContributions += monthlyContributionIndexed;
        if (months % 12 === 1 && months > 1) {
            years++;
            monthlyContributionIndexed *= (1 + indexationRate);
        }

        const managementFees = balance * (-monthlyManagementFeesRate);
        balance -= managementFees;

        const interestEarned = balance * monthlyInterestRate;
        balance += interestEarned;

        const contributionAfterFees = monthlyContributionIndexed * (1 - monthlyEntryFeesRate);
        balance += contributionAfterFees;

        if (years > 99) {
            break; // Arrêter après 100 ans
        }
    }

    //

    // Calcul de la durée en années et mois
    years = Math.floor(months / 12);
    months = months % 12;

    // Simulation complète avec l'épargne mensuelle calculée

    let totalInterest = balance - totalContributions;
    let totalInitialEntryFees = initialAmount * initialEntryFeesRate;

    let totalMonthlyEntryFees = 0;
    monthlyContributionIndexed = monthlyContribution;

    let currentMonths = 0;

    for (let year = 0; year < years; year++) {
        for (let month = 1; month <= 12; month++) {
            currentMonths++
            if (month === 1 && year > 0) {
                monthlyContributionIndexed *= (1 + indexationRate);
            }
            totalMonthlyEntryFees += monthlyContributionIndexed * monthlyEntryFeesRate;
        }
    }
    //Calcul des mois restants
    for (let month = 1; month <= months; month++) {
        currentMonths++
        if (currentMonths % 12 === 1 && currentMonths > 1) {
            monthlyContributionIndexed *= (1 + indexationRate);
        }
        totalMonthlyEntryFees += monthlyContributionIndexed * monthlyEntryFeesRate;
    }

    // Réinitialisation de variables pour le calcul des frais de gestion
    let balanceForFees = initialAmount * (1 - initialEntryFeesRate); // Solde initial après frais d'entrée initiaux
    let totalManagementFees = 0;
    monthlyContributionIndexed = monthlyContribution; // Réinitialiser la contribution indexée
    currentMonths = 0;

    // Boucle pour calculer les frais de gestion mois par mois
    for (let year = 0; year < years; year++) {
        for (let month = 1; month <= 12; month++) {
            currentMonths++;
            if (month === 1 && year > 0) {
                monthlyContributionIndexed *= (1 + indexationRate);
            }

            // Calcul des frais de gestion mensuels
            const managementFees = balanceForFees * (-monthlyManagementFeesRate);
            totalManagementFees -= managementFees;  // Accumuler les frais (ils sont négatifs)
            balanceForFees -= managementFees; // Appliquer les frais au solde

            // Calcul des intérêts mensuels
            const interestEarned = balanceForFees * monthlyInterestRate;
            balanceForFees += interestEarned;

            // Ajout de la contribution mensuelle (après frais d'entrée mensuels)
            const contributionAfterFees = monthlyContributionIndexed * (1 - monthlyEntryFeesRate);
            balanceForFees += contributionAfterFees;

        }
    }
    //Calcul des mois restants
    for (let month = 1; month <= months; month++) {
        currentMonths++;
        if (currentMonths % 12 === 1 && currentMonths > 1) {
            monthlyContributionIndexed *= (1 + indexationRate);
        }
        const managementFees = balanceForFees * (-monthlyManagementFeesRate);
        totalManagementFees -= managementFees;
        balanceForFees -= managementFees;
        const interestEarned = balanceForFees * monthlyInterestRate;
        balanceForFees += interestEarned;

        // Ajout de la contribution mensuelle (après frais d'entrée mensuels)
        const contributionAfterFees = monthlyContributionIndexed * (1 - monthlyEntryFeesRate);
        balanceForFees += contributionAfterFees;

    }

    const finalBalance = Math.round(balance * 100) / 100;

    //
    // Calcul du montant initial net de frais d'entrée
    const initialAmountNetOfFees = initialAmount * (1 - initialEntryFeesRate);

    // Calcul de l'épargne régulière nette de frais d'entrée
    let totalRegularSavingsNetOfFees = 0;
    monthlyContributionIndexed = monthlyContribution; // Réinitialiser la contribution indexée
    let totalMonths = years * 12 + months; // Calcul du nombre total de mois
    for (let i = 1; i <= totalMonths; i++) {
        if (i % 12 === 1 && i > 1) {
            monthlyContributionIndexed *= (1 + indexationRate);
        }
        totalRegularSavingsNetOfFees += monthlyContributionIndexed * (1 - monthlyEntryFeesRate);
    }

    const lastMonthlyContribution = monthlyContributionIndexed; // Stocke la dernière valeur

    // Calcul des intérêts gagnés nets OK
    const interestEarnedNet = finalBalance - (initialAmountNetOfFees + totalRegularSavingsNetOfFees);
   

    //Total des frais
    const totalFeesValue =  - totalManagementFees + totalMonthlyEntryFees +totalInitialEntryFees;
   

    // Affichage des résultats
    const durationText = `${years} ans et ${months} mois`;

   
    document.getElementById('DureeEpargne').textContent = durationText;

    const currencyFormatter = new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0
    });


    const formattedFinalAmount = currencyFormatter.format(finalBalance);
    document.getElementById('finalAmount').textContent = formattedFinalAmount;

    const formattedLastMonthlyContribution = currencyFormatter.format(lastMonthlyContribution);
    document.getElementById('lastMonthlyContribution').textContent = formattedLastMonthlyContribution;

    const formattedInterestEarnedNet = currencyFormatter.format(interestEarnedNet);
    document.getElementById('interestEarnedNet').textContent = formattedInterestEarnedNet;

    const formattedTotalContributions = currencyFormatter.format(totalContributions);
    document.getElementById('totalContributions').textContent = formattedTotalContributions;

    const formattedTotalInitialEntryFees = currencyFormatter.format(totalInitialEntryFees);
    document.getElementById('totalInitialEntryFees').textContent = formattedTotalInitialEntryFees;

    const formattedTotalMonthlyEntryFees = currencyFormatter.format(totalMonthlyEntryFees);
    document.getElementById('totalMonthlyEntryFees').textContent = formattedTotalMonthlyEntryFees;

    const formattedTotalManagementFees = currencyFormatter.format(Math.abs(totalManagementFees));
    document.getElementById('totalManagementFees').textContent = formattedTotalManagementFees;

    const formattedTotalFeesValue = currencyFormatter.format(Math.abs(totalFeesValue));
    document.getElementById('totalFeesValue').textContent = formattedTotalFeesValue;

    updateChart(years, months, initialAmount, initialEntryFeesRate, annualInterestRate, annualManagementFeesRate, monthlyEntryFeesRate, indexationRate, monthlyContribution, targetAmount, totalContributions, totalInitialEntryFees, totalMonthlyEntryFees, totalManagementFees);
}

function updateChart(years, months, initialAmount, initialEntryFeesRate, annualInterestRate, annualManagementFeesRate, monthlyEntryFeesRate, indexationRate, monthlyContribution, targetAmount, totalContributionsValue, totalInitialEntryFees, totalMonthlyEntryFees, totalManagementFees) {
    const ctx = document.getElementById('savingsChart');

    // 1. Préparation des données

    const totalMonths = years * 12 + months;
    const fractionOfYear = months / 12;
    const finalYearLabel = years + fractionOfYear;

    let cumulativeContributions = initialAmount;
    let balance = initialAmount * (1 - initialEntryFeesRate);
    const monthlyInterestRate = Math.pow(1 + annualInterestRate, 1 / 12) - 1;
    const monthlyManagementFeesRate = Math.pow(1 + (-annualManagementFeesRate), 1 / 12) - 1;
    let monthlyContributionIndexed = monthlyContribution;

    // Données pour l'évolution du capital
    const balanceData = [{ x: 0, y: initialAmount * (1 - initialEntryFeesRate) }];
    // Données pour le cumul des versements
    const cumulativeContributionData = [{ x: 0, y: initialAmount }];
    // Frais d'entrée initiaux à l'année 0
    let cumulativeFees = totalInitialEntryFees;
    const feesData = [{ x: 0, y: cumulativeFees }];

    for (let year = 1; year <= years; year++) {
        for (let month = 1; month <= 12; month++) {
            if (month % 12 === 1 && year > 1) {
                monthlyContributionIndexed *= (1 + indexationRate);
            }
            //Calcul de l'impact des frais de gestion et entry fees
            const managementFees = balance * (-monthlyManagementFeesRate);
            balance -= managementFees;
            const interestEarned = balance * monthlyInterestRate;
            balance += interestEarned;
            const contributionAfterFees = monthlyContributionIndexed * (1 - monthlyEntryFeesRate);
            balance += contributionAfterFees;
            //Ajout des frais dans le cumul des frais.
            cumulativeFees += (monthlyContributionIndexed * monthlyEntryFeesRate) + Math.abs(managementFees);
        }
        cumulativeContributions += 12 * monthlyContributionIndexed;
        balanceData.push({ x: year, y: balance });
        cumulativeContributionData.push({ x: year, y: cumulativeContributions });
        feesData.push({ x: year, y: cumulativeFees });

    }

    // Ajouter le point final (fraction d'année) pour toutes les données
    if (months > 0) {
        for (let month = 1; month <= months; month++) {
            if (month % 12 === 1 && years > 0) {
                monthlyContributionIndexed *= (1 + indexationRate);
            }
            const managementFees = balance * (-monthlyManagementFeesRate);
            balance -= managementFees;
            const interestEarned = balance * monthlyInterestRate;
            balance += interestEarned;
            const contributionAfterFees = monthlyContributionIndexed * (1 - monthlyEntryFeesRate);
            balance += contributionAfterFees;
            cumulativeFees += (monthlyContributionIndexed * monthlyEntryFeesRate) + Math.abs(managementFees);
        }
        cumulativeContributions += months * monthlyContributionIndexed;
        balanceData.push({ x: finalYearLabel, y: balance });
        cumulativeContributionData.push({ x: finalYearLabel, y: cumulativeContributions });
        feesData.push({ x: finalYearLabel, y: cumulativeFees });
    }

    // Préparation des données pour le montant objectif (ligne droite)
    const targetAmountData = [{ x: 0, y: targetAmount }, { x: finalYearLabel, y: targetAmount }];

    // 2. Configuration du graphique

    if (savingsChart) {
        savingsChart.destroy();
    }

    const legendFontSize = window.innerWidth < 768 ? 6 : 12;

    savingsChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Évolution du capital',
                data: balanceData,
                borderColor: '#4caf50',
                backgroundColor: 'rgba(76, 175, 80, 0.2)',
                showLine: true,
                fill: true,
                pointRadius: 5
            },
            {
                label: 'Montant objectif',
                data: targetAmountData,
                borderColor: 'rgba(255, 93, 75, 0.32)',
                borderDash: [5, 5],
                type: 'line', 
                showLine: true,
                pointRadius: 0, 
                fill: false
            },
            {
                label: 'Cumul des versements',
                data: cumulativeContributionData,
                borderColor: 'orange',
                backgroundColor: 'rgba(255, 165, 0, 0.2)',
                showLine: true,
                fill: true,
                pointRadius: 5
            },
            {
                label: 'Cumul des frais',
                data: feesData,
                borderColor: '#ff6347',
                    backgroundColor: 'rgba(255, 99, 71, 0.2)',
                showLine: true,
                fill: true,
                pointRadius: 5
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                    title: {
                        display: true,
                        text: 'Années'
                    },
                    ticks: {
                        stepSize: 1,
                        callback: function (value, index, values) {
                            if (Number.isInteger(value)) {
                                return value;
                            } else {
                                return value.toFixed(2) + ' ans';
                            }
                        }
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
                },
                legend: {
                    labels: {
                        font: {
                            size: legendFontSize
                        }
                    }
                }
            }
        }
    });
}