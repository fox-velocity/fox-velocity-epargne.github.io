// modules/calculCapitalInitial.js
let savingsChart = null;

document.addEventListener('DOMContentLoaded', function() {
    const annualInterestRateElement = document.getElementById('annualInterestRate');
    annualInterestRateElement.value = 2.5;
    annualInterestRateElement.dispatchEvent(new Event('input'));
    calculateInitial();
});


function calculateInitial() {
    // 1. Récupération des éléments du DOM
    const annualInterestRateElement = document.getElementById('annualInterestRate');
    const monthlyContributionElement = document.getElementById('monthlyContribution');
    const targetAmountElement = document.getElementById('targetAmount');
    const yearsElement = document.getElementById('years');
    const initialEntryFeesElement = document.getElementById('initialEntryFees');
    const monthlyEntryFeesElement = document.getElementById('monthlyEntryFees');
    const managementFeesElement = document.getElementById('managementFees');
    const indexationRateElement = document.getElementById('indexationRate');

    // 2. Conversion des valeurs des champs de saisie en nombres
    const monthlyContribution = parseFloat(monthlyContributionElement.value);
    const targetAmount = parseFloat(targetAmountElement.value);
    const annualInterestRate = parseFloat(annualInterestRateElement.value) / 100;
    const years = parseInt(yearsElement.value);
    const initialEntryFeesRate = parseFloat(initialEntryFeesElement.value) / 100;
    const monthlyEntryFeesRate = parseFloat(monthlyEntryFeesElement.value) / 100;
    const annualManagementFeesRate = parseFloat(managementFeesElement.value) / 100;
    const indexationRate = parseFloat(indexationRateElement.value) / 100;


    const monthlyInterestRate = Math.pow(1 + annualInterestRate, 1 / 12) - 1;
    const monthlyManagementFeesRate = Math.pow(1 + (-annualManagementFeesRate), 1 / 12) - 1;
    const months = years * 12;

    let initialCapital = 0;
    let low = 0;
    let high = targetAmount;

    while (high - low > 0.01) {
        initialCapital = (low + high) / 2;
        let balance = initialCapital * (1 - initialEntryFeesRate);
        let currentMonthlyContribution = monthlyContribution;

        for (let i = 1; i <= months; i++) {
            if (i % 12 === 1 && i > 1) {
                currentMonthlyContribution *= (1 + indexationRate);
            }
            balance -= balance * (-monthlyManagementFeesRate);
            balance *= (1 + monthlyInterestRate);
            balance += currentMonthlyContribution * (1 - monthlyEntryFeesRate);
        }

        if (balance > targetAmount) {
            high = initialCapital;
        } else {
            low = initialCapital;
        }
    }


    let balance = initialCapital * (1 - initialEntryFeesRate);
    const contributionsData = [initialCapital];
    const interestData = [0];
    const feesData = [initialCapital * initialEntryFeesRate]; // Initial value is the entry fee on initial capital
    let totalContributions = initialCapital;
    let totalInterest = 0;
    let totalInitialEntryFees = initialCapital * initialEntryFeesRate;
    let totalMonthlyEntryFees = 0;
    let totalManagementFees = 0;
    let cumulativeFees = initialCapital * initialEntryFeesRate;

    let yearlyTotalMonthlyEntryFees = 0;
    let yearlyTotalManagementFees = 0;
    let currentMonthlyContribution = monthlyContribution;

    for (let i = 1; i <= months; i++) {
        if (i % 12 === 1 && i > 1) {
            currentMonthlyContribution *= (1 + indexationRate);
        }

        const managementFees = balance * (-monthlyManagementFeesRate); // Calcul des frais de gestion
        totalManagementFees += managementFees;
        yearlyTotalManagementFees += managementFees;
        balance -= managementFees;

        const interestEarned = balance * monthlyInterestRate; // Calcul des intérêts
        totalInterest += interestEarned;
        balance += interestEarned;

        const contributionAfterFees = currentMonthlyContribution * (1 - monthlyEntryFeesRate);
        const monthlyEntryFees = currentMonthlyContribution * monthlyEntryFeesRate;
        totalMonthlyEntryFees += monthlyEntryFees;
        yearlyTotalMonthlyEntryFees += monthlyEntryFees;
        totalContributions += currentMonthlyContribution;
        balance += contributionAfterFees;

        if (i % 12 === 0) {
            contributionsData.push(Math.round(totalContributions * 100) / 100);
            interestData.push(Math.round((totalInterest - totalManagementFees) * 100) / 100);
            cumulativeFees += yearlyTotalMonthlyEntryFees + yearlyTotalManagementFees;
            feesData.push(Math.round(cumulativeFees * 100) / 100);
            yearlyTotalMonthlyEntryFees = 0;
            yearlyTotalManagementFees = 0;

        }
    }

    const finalBalance = Math.round(balance * 100) / 100;
    const totalFees = totalInitialEntryFees + totalMonthlyEntryFees + totalManagementFees;
    const interestEarnedNetFees = totalInterest - totalManagementFees;

    document.getElementById('initialCapital').textContent = Math.round(initialCapital).toLocaleString('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0
    });
    document.getElementById('finalAmount').textContent = Math.round(finalBalance).toLocaleString('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0
    });
    document.getElementById('totalContributions').textContent = Math.round(totalContributions).toLocaleString('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0
    });
    document.getElementById('interestEarned').textContent = Math.round(interestEarnedNetFees).toLocaleString('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0
    });
    document.getElementById('totalInitialEntryFees').textContent = Math.round(totalInitialEntryFees).toLocaleString('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0
    });
    document.getElementById('totalMonthlyEntryFees').textContent = Math.round(totalMonthlyEntryFees).toLocaleString('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0
    });
    document.getElementById('totalManagementFees').textContent = Math.round(totalManagementFees).toLocaleString('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0
    });
    document.getElementById('totalFeesValue').textContent = Math.round(totalFees).toLocaleString('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0
    });

    updateCharts(contributionsData, interestData, feesData, years);
}

function addInputListeners() {
    const sliders = document.querySelectorAll('input[type="range"]');
    sliders.forEach(slider => {
        slider.addEventListener('input', calculateInitial);
    });

    const indexationRateElement = document.getElementById('indexationRate');
    indexationRateElement.addEventListener('input', calculateInitial);
}


function updateCharts(contributionsData, interestData, feesData, years) {
    const ctx1 = document.getElementById('savingsChart');

    if (savingsChart) {
        savingsChart.destroy();
    }

    const labels = Array.from({
        length: years + 1
    }, (_, i) => `${i} an${i > 1 ? 's' : ''}`);

    const isDarkTheme = document.body.classList.contains('dark-theme');
    const textColor = isDarkTheme ? '#ffffff' : '#1a1a1a';
    const gridColor = isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

    const cumulativeData = contributionsData.map((contrib, index) => contrib + interestData[index]);

    savingsChart = new Chart(ctx1, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                    label: 'Cumul des versements',
                    data: contributionsData,
                    borderColor: '#ffa500',
                    backgroundColor: 'rgba(255, 165, 0, 0.1)',
                    fill: true
                },
                {
                    label: 'Cumul total (versements + intérêts)',
                    data: cumulativeData,
                    borderColor: '#4caf50',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    fill: true
                },
                {
                    label: 'Cumul des Frais', // Label de l'ensemble de données
                    data: feesData,
                    borderColor: '#FA8072',
                    backgroundColor: 'rgba(250, 128, 114, 0.2)',
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
                    ticks: {
                        color: textColor
                    },
                    grid: {
                        color: gridColor
                    }
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
                            return value.toLocaleString('fr-FR', {
                                style: 'currency',
                                currency: 'EUR'
                            });
                        }
                    },
                    grid: {
                        color: gridColor
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: textColor
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += new Intl.NumberFormat('fr-FR', {
                                    style: 'currency',
                                    currency: 'EUR'
                                }).format(context.parsed.y);
                            }
                            return label;
                        }
                    }
                }
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    addInputListeners();
    calculateInitial();
});



export {
    calculateInitial,
    updateCharts
};