function updateChart(years, months, initialAmount, initialEntryFeesRate, annualInterestRate, annualManagementFeesRate, monthlyEntryFeesRate, indexationRate, monthlyContribution, targetAmount, totalContributionsValue, totalInitialEntryFees, totalMonthlyEntryFees, totalManagementFees) {
    const ctx = document.getElementById('savingsChart');

    // Calcul du nombre total de mois
    const totalMonths = years * 12 + months;

    // Préparer les labels pour le graphique (en mois)
    const allLabels = Array.from({ length: totalMonths + 1 }, (_, i) => {
        const year = Math.floor(i / 12);
        const month = i % 12;
        return `${year} ans ${month} mois`;
    });

    // *** NOUVEAU : Définir le pas d'affichage des labels ***
    const step = 6; // Affiche un label tous les 6 mois.  Modifiez cette valeur.
    const labels = allLabels.filter((_, index) => index % step === 0 || index === allLabels.length - 1); // Affiche seulement les labels à chaque 'step' mois, et le dernier label.

    // Calcul de monthlyManagementFeesRate avant la boucle
    const monthlyManagementFeesRate = Math.pow(1 + (-annualManagementFeesRate), 1 / 12) - 1;

    // Calcul de monthlyInterestRate avant la boucle
    const monthlyInterestRate = Math.pow(1 + annualInterestRate, 1 / 12) - 1;


    // *** Correction du calcul du cumul des frais ***
    const feesData = [totalInitialEntryFees]; // Initialiser avec les frais d'entrée initiaux
    // Modifier la variable existante feesData au lieu de la redéclarer
    let cumulativeFees = totalInitialEntryFees;
    //Initialisation de balance pour la boucle de calcul des frais
    let balance = initialAmount * (1 - initialEntryFeesRate);

    //Initialisation de monthlyContributionIndexed pour la boucle de calcul des frais
    let monthlyContributionIndexed = monthlyContribution;


    for (let i = 1; i <= totalMonths; i++) {
        if (i % 12 === 1 && i > 1) {
            monthlyContributionIndexed *= (1 + indexationRate);
        }

        const managementFees = balance * (-monthlyManagementFeesRate);
        balance -= managementFees;
        const interestEarned = balance * monthlyInterestRate;
        balance += interestEarned;
        const contributionAfterFees = monthlyContributionIndexed * (1 - monthlyEntryFeesRate);
        balance += contributionAfterFees;

        const monthlyEntryFees = monthlyContributionIndexed * monthlyEntryFeesRate;
        cumulativeFees += Math.abs(managementFees) + monthlyEntryFees;

        // Ajouter une donnée à chaque mois
        feesData.push(cumulativeFees);
    }

    // Modification pour avoir plus de précision sur l'axe X
    let balanceData = [initialAmount * (1 - initialEntryFeesRate)];
    balance = initialAmount * (1 - initialEntryFeesRate);
    monthlyContributionIndexed = monthlyContribution;

    for (let i = 1; i <= totalMonths; i++) { // Boucle sur le nombre total de mois
        const year = Math.floor((i - 1) / 12); // Calcul de l'année
        const month = (i - 1) % 12 + 1; // Calcul du mois
        if (i % 12 === 1 && i > 1) {
            monthlyContributionIndexed *= (1 + indexationRate);
        }

        const managementFees = balance * (-monthlyManagementFeesRate);
        balance -= managementFees;
        const interestEarned = balance * monthlyInterestRate;
        balance += interestEarned;
        const contributionAfterFees = monthlyContributionIndexed * (1 - monthlyEntryFeesRate);
        balance += contributionAfterFees;

        // Ajouter une donnée à chaque mois
        balanceData.push(balance);
    }

    let cumulativeContributionData = [initialAmount];
    // Initialiser cumulativeContributions avant la boucle
    let cumulativeContributions = initialAmount;
    monthlyContributionIndexed = monthlyContribution;

    for (let i = 1; i <= totalMonths; i++) {
        if (i % 12 === 1 && i > 1) {
            monthlyContributionIndexed *= (1 + indexationRate);
        }

        const contribution = monthlyContributionIndexed * (1 - monthlyEntryFeesRate);
        cumulativeContributions += contribution;

        // Ajouter une donnée à chaque mois
        cumulativeContributionData.push(cumulativeContributions);
    }




  

   if (typeof targetAmount !== 'number') {
        
        // Si targetAmount n'est pas un nombre, essayez de le convertir
        targetAmount = parseFloat(targetAmount);
        if (isNaN(targetAmount)) {
       
        }
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
                data: Array(totalMonths + 1).fill(targetAmount), // Adaptez la longueur du tableau au nombre total de mois
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
                data: feesData,
                borderColor: '#FA8072', // Saumon (Light Coral)
                backgroundColor: 'rgba(250, 128, 114, 0.2)',//Saumon transparent
                fill: false //Retirer le remplissage
            }]
        },
        options: {
            responsive: true,
            scales: {
                 x: {
                    type: 'category', // Utiliser une échelle catégorielle
                    title: {
                        display: true,
                        text: 'Temps (Années et Mois)'
                    },
                   //labels: labels, // Fournir les labels à l'échelle (retiré car les labels sont déjà gérés dans data.labels)
                    ticks: {
                        autoSkip: false, // Ne pas sauter de labels
                        maxRotation: 50 // Limiter la rotation des labels
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
                    },
                    // Ajout des options min et max pour l'échelle de l'axe Y
                    min: 0, // Commence à 0
                    max: Math.max(...balanceData, ...cumulativeContributionData, ...feesData, targetAmount) * 1.1 // Maximum est 110% du maximum des données
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