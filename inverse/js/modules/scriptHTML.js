
let savingsChart = null; // Variable pour stocker l'instance du graphique d'épargne (initialement nulle)
let breakdownChart = null; // Variable pour stocker l'instance du graphique de répartition (initialement nulle)

function updateRangeValue(inputId, valueId, suffix = '') {
    // Fonction pour mettre à jour la valeur affichée d'un slider (range input)
    const input = document.getElementById(inputId); // Récupère l'élément input de type range
    const value = document.getElementById(valueId); // Récupère l'élément où afficher la valeur
    if (input && value) { // Vérifie que les éléments existent
        if (inputId === 'years') { // Si l'input est celui des années
            const years = parseInt(input.value); // Récupère la valeur (nombre d'années)
            const months = years * 12; // Calcule le nombre de mois
            value.textContent = `${years} ans (${months} mois)`; // Affiche la valeur formatée (ex: "8 ans (96 mois)")
        } else { // Si l'input n'est pas celui des années
            value.textContent = parseFloat(input.value).toLocaleString('fr-FR') + suffix; // Affiche la valeur formatée (avec suffixe et localisation fr-FR)
        }
    }
}

function calculateInitialCapital() {
    // Fonction principale pour calculer le capital initial nécessaire
    const monthlyContribution = parseFloat(document.getElementById('monthlyContribution').value); // Récupère l'épargne mensuelle
    const targetAmount = parseFloat(document.getElementById('targetAmount').value); // Récupère le capital final visé
    const annualInterestRate = parseFloat(document.getElementById('annualInterestRate').value) / 100; // Récupère le taux d'intérêt annuel (converti en décimal)
    const years = parseInt(document.getElementById('years').value); // Récupère la durée en années
    const initialEntryFeesRate = parseFloat(document.getElementById('initialEntryFees').value) / 100; // Récupère les frais d'entrée initiaux (convertis en décimal)
    const monthlyEntryFeesRate = parseFloat(document.getElementById('monthlyEntryFees').value) / 100; // Récupère les frais d'entrée mensuels (convertis en décimal)
    const annualManagementFeesRate = parseFloat(document.getElementById('managementFees').value) / 100; // Récupère les frais de gestion annuels (convertis en décimal)

    const monthlyInterestRate = Math.pow(1 + annualInterestRate, 1 / 12) - 1; // Calcule le taux d'intérêt mensuel
    const monthlyManagementFeesRate = Math.pow(1 + (-annualManagementFeesRate), 1 / 12) - 1; // Calcule le taux de frais de gestion mensuels
    const months = years * 12; // Calcule le nombre de mois

    // Calcul du capital initial nécessaire (par dichotomie)
    let initialCapital = 0; // Initialise le capital initial
    let low = 0; // Initialise la borne inférieure de la recherche
    let high = targetAmount; // Initialise la borne supérieure de la recherche

    while (high - low > 0.01) { // Tant que la précision n'est pas suffisante
        initialCapital = (low + high) / 2; // Calcule le milieu de l'intervalle
        let balance = initialCapital * (1 - initialEntryFeesRate); // Calcule le solde initial après frais d'entrée

        for (let i = 1; i <= months; i++) { // Boucle sur chaque mois
            balance -= balance * (-monthlyManagementFeesRate); // Déduit les frais de gestion mensuels
            balance *= (1 + monthlyInterestRate); // Ajoute les intérêts mensuels
            balance += monthlyContribution * (1 - monthlyEntryFeesRate); // Ajoute l'épargne mensuelle (après frais)
        }

        if (balance > targetAmount) { // Si le solde final est supérieur à l'objectif
            high = initialCapital; // Réduit la borne supérieure
        } else { // Si le solde final est inférieur à l'objectif
            low = initialCapital; // Augmente la borne inférieure
        }
    }


    console.log('initialCapital : ', initialCapital)
    
    // Simulation avec le capital initial calculé
    let balance = initialCapital * (1 - initialEntryFeesRate); // Calcule le solde après frais d'entrée initiaux
    const contributionsData = [initialCapital]; // Initialise les données des contributions avec le capital initial
    const interestData = [0]; // Initialise les données des intérêts
    let totalContributions = initialCapital; // Initialise le total des contributions
    let totalInterest = 0; // Initialise le total des intérêts
    let totalInitialEntryFees = initialCapital * initialEntryFeesRate; // Calcule les frais d'entrée initiaux
    let totalMonthlyEntryFees = 0; // Initialise le total des frais d'entrée mensuels
    let totalManagementFees = 0; // Initialise le total des frais de gestion

    for (let i = 1; i <= months; i++) { // Boucle sur chaque mois
        const managementFees = balance * (-monthlyManagementFeesRate); // Calcule les frais de gestion mensuels
        totalManagementFees += managementFees; // Ajoute les frais au total
        balance -= managementFees; // Déduit les frais du solde

        const interestEarned = balance * monthlyInterestRate; // Calcule les intérêts mensuels
        totalInterest += interestEarned; // Ajoute les intérêts au total
        balance += interestEarned; // Ajoute les intérêts au solde

        const contributionAfterFees = monthlyContribution * (1 - monthlyEntryFeesRate); // Calcule la contribution après frais
        totalMonthlyEntryFees += monthlyContribution * monthlyEntryFeesRate; // Ajoute les frais d'entrée mensuels au total
        totalContributions += monthlyContribution; // Ajoute la contribution au total
        balance += contributionAfterFees; // Ajoute la contribution au solde

        if (i % 12 === 0) { // Tous les 12 mois (à la fin de chaque année)
            contributionsData.push(Math.round(totalContributions * 100) / 100); // Ajoute le total des contributions arrondi aux données
            interestData.push(Math.round((totalInterest - totalManagementFees) * 100) / 100); // Ajoute le total des intérêts (moins les frais) arrondi aux données
        }
    }

    const finalBalance = Math.round(balance * 100) / 100; // Calcule le solde final arrondi
    const interestEarned = finalBalance - totalContributions + totalInitialEntryFees + totalMonthlyEntryFees + totalManagementFees; // Calcule les intérêts gagnés

    // Affiche les résultats formatés
    document.getElementById('initialCapital').textContent = initialCapital.toLocaleString('fr-FR', {
        style: 'currency',
        currency: 'EUR'
    });
    document.getElementById('finalAmount').textContent = finalBalance.toLocaleString('fr-FR', {
        style: 'currency',
        currency: 'EUR'
    });
    document.getElementById('totalContributions').textContent = totalContributions.toLocaleString('fr-FR', {
        style: 'currency',
        currency: 'EUR'
    });
    document.getElementById('interestEarned').textContent = interestEarned.toLocaleString('fr-FR', {
        style: 'currency',
        currency: 'EUR'
    });
    document.getElementById('totalInitialEntryFees').textContent = totalInitialEntryFees.toLocaleString('fr-FR', {
        style: 'currency',
        currency: 'EUR'
    });
    document.getElementById('totalMonthlyEntryFees').textContent = totalMonthlyEntryFees.toLocaleString('fr-FR', {
        style: 'currency',
        currency: 'EUR'
    });
    document.getElementById('totalManagementFees').textContent = totalManagementFees.toLocaleString('fr-FR', {
        style: 'currency',
        currency: 'EUR'
    });

    updateCharts(contributionsData, interestData, years, totalContributions, interestEarned, totalInitialEntryFees, totalMonthlyEntryFees, totalManagementFees); // Met à jour les graphiques
}

function updateCharts(contributionsData, interestData, years, totalContributions, interestEarned, totalInitialEntryFees, totalMonthlyEntryFees, totalManagementFees) {
    // Fonction pour mettre à jour les graphiques (épargne et répartition)
    const ctx1 = document.getElementById('savingsChart'); // Récupère le contexte du canvas pour le graphique d'épargne
    const ctx2 = document.getElementById('breakdownChart'); // Récupère le contexte du canvas pour le graphique de répartition

    if (savingsChart) { // Si le graphique d'épargne existe
        savingsChart.destroy(); // Détruit le graphique existant
    }
    if (breakdownChart) { // Si le graphique de répartition existe
        breakdownChart.destroy(); // Détruit le graphique existant
    }

    const labels = Array.from({
        length: years + 1
    }, (_, i) => `${i} an${i > 1 ? 's' : ''} (${i * 12} mois)`); // Crée les labels pour l'axe des abscisses (années et mois)

    // Calcul des données cumulées
    const cumulativeData = contributionsData.map((contrib, index) => contrib + interestData[index]); // Calcule les données cumulées (contributions + intérêts)

    const isDarkTheme = document.body.classList.contains('dark-theme'); // Vérifie si le thème sombre est activé
    const textColor = isDarkTheme ? '#ffffff' : '#1a1a1a'; // Définit la couleur du texte en fonction du thème
    const gridColor = isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'; // Définit la couleur de la grille en fonction du thème

    savingsChart = new Chart(ctx1, { // Crée le graphique d'épargne
        type: 'line', // Type de graphique : ligne
        data: { // Données du graphique
            labels: labels, // Labels de l'axe des abscisses
            datasets: [{ // Ensembles de données
                    label: 'Cumul des versements', // Libellé de l'ensemble de données
                    data: contributionsData, // Données de l'ensemble de données
                    borderColor: '#ffa500', // Couleur de la ligne
                    backgroundColor: 'rgba(255, 165, 0, 0.1)', // Couleur de fond
                    fill: true // Remplissage de la zone sous la ligne
                },
                {
                    label: 'Cumul total (versements + intérêts)', // Libellé de l'ensemble de données
                    data: cumulativeData, // Données de l'ensemble de données
                    borderColor: '#4caf50', // Couleur de la ligne
                    backgroundColor: 'rgba(76, 175, 80, 0.1)', // Couleur de fond
                    fill: true // Remplissage de la zone sous la ligne
                }
            ]
        },
        options: { // Options du graphique
            responsive: true, // Adapté à la taille de l'écran
            scales: { // Échelles des axes
                x: { // Axe des abscisses
                    title: { // Titre de l'axe
                        display: true, // Affichage du titre
                        text: 'Durée', // Texte du titre
                        color: textColor // Couleur du texte
                    },
                    ticks: { // Graduations de l'axe
                        color: textColor // Couleur du texte
                    },
                    grid: { // Grille de l'axe
                        color: gridColor // Couleur de la grille
                    }
                },
                y: { // Axe des ordonnées
                    title: { // Titre de l'axe
                        display: true, // Affichage du titre
                        text: 'Montant (€)', // Texte du titre
                        color: textColor // Couleur du texte
                    },
                    ticks: { // Graduations de l'axe
                        color: textColor, // Couleur du texte
                        callback: function (value) { // Fonction de formatage des graduations
                            return value.toLocaleString('fr-FR', {
                                style: 'currency',
                                currency: 'EUR'
                            }); // Formatage en euros
                        }
                    },
                    grid: { // Grille de l'axe
                        color: gridColor // Couleur de la grille
                    }
                }
            },
            plugins: { // Plugins du graphique
                legend: { // Légende
                    labels: { // Libellés de la légende
                        color: textColor // Couleur du texte
                    }
                },
                tooltip: { // Infobulle
                    callbacks: { // Fonctions de rappel
                        label: function (context) { // Fonction de formatage du libellé
                            let label = context.dataset.label || ''; // Récupère le libellé de l'ensemble de données
                            if (label) { // Si un libellé existe
                                label += ': '; // Ajoute un séparateur
                            }
                            if (context.parsed.y !== null) { // Si la valeur est numérique
                                label += new Intl.NumberFormat('fr-FR', {
                                    style: 'currency',
                                    currency: 'EUR'
                                }).format(context.parsed.y); // Formate la valeur en euros
                            }
                            return label; // Retourne le libellé formaté
                        }
                    }
                }
            }
        }
    });

    breakdownChart = new Chart(ctx2, { // Crée le graphique de répartition
        type: 'pie', // Type de graphique : camembert
        data: { // Données du graphique
            labels: ['Versements', 'Intérêts gagnés', 'Frais d\'entrée initial', 'Frais d\'entrée mensuels', 'Frais de gestion'], // Libellés des sections du camembert
            datasets: [{ // Ensemble de données
                data: [totalContributions, interestEarned, totalInitialEntryFees, totalMonthlyEntryFees, totalManagementFees], // Valeurs des sections du camembert
                backgroundColor: ['#ffa500', '#4caf50', '#ff6347', '#3498db', '#9b59b6'] // Couleurs des sections du camembert
            }]
        },
        options: { // Options du graphique
            responsive: true, // Adapté à la taille de l'écran
            plugins: { // Plugins du graphique
                legend: { // Légende
                    labels: { // Libellés de la légende
                        color: textColor // Couleur du texte
                    }
                },
                tooltip: { // Infobulle
                    callbacks: { // Fonctions de rappel
                        label: function (context) { // Fonction de formatage du libellé
                            const label = context.label || ''; // Récupère le libellé de la section
                            const value = context.parsed || 0; // Récupère la valeur de la section
                            const total = context.dataset.data.reduce((a, b) => a + b); // Calcule le total des valeurs
                            const percentage = ((value / total) * 100).toFixed(1); // Calcule le pourcentage de la section
                            return `${label}: ${value.toLocaleString('fr-FR', {
                                style: 'currency',
                                currency: 'EUR'
                            })} (${percentage}%)`; // Retourne le libellé formaté (avec valeur et pourcentage)
                        }
                    }
                }
            }
        }
    });
}

// Mise à jour des valeurs affichées et recalcul lors du changement des curseurs
document.querySelectorAll('input[type="range"]').forEach(input => { // Pour chaque input de type range
    input.addEventListener('input', () => { // Ajoute un écouteur d'événement sur l'événement "input"
        updateRangeValue(input.id, input.id + 'Value', input.id === 'annualInterestRate' || input.id === 'initialEntryFees' || input.id === 'monthlyEntryFees' || input.id === 'managementFees' ? ' %' : ' €'); // Met à jour la valeur affichée du slider
        calculateInitialCapital(); // Recalcule le capital initial
    });
});

// Fonction pour changer de thème
function toggleTheme() {
    document.body.classList.toggle('light-theme'); // Bascule la classe "light-theme" sur le body
    document.body.classList.toggle('dark-theme'); // Bascule la classe "dark-theme" sur le body
    calculateInitialCapital(); // Recalcule le capital initial (pour mettre à jour les couleurs des graphiques)
}

// Ajout de l'événement au bouton de changement de thème
document.getElementById('themeToggle').addEventListener('click', toggleTheme); // Ajoute un écouteur d'événement sur le bouton de thème

// Calcul initial
document.addEventListener('DOMContentLoaded', function () { // Lorsque le DOM est chargé
    calculateInitialCapital(); // Calcule le capital initial
});
