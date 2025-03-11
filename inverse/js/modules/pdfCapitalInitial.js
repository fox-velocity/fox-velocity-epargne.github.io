// pdfCapitalInitial.js

export async function generatePDF(pdfMake, logoBase64, logoRenardBase64Gris) {
    if (!pdfMake) {
        alert('pdfMake n\'est pas disponible');
        console.error("pdfMake n'est pas chargé");
        return;
    }

    await waitForChart('savingsChart'); // Attendre que le graphique soit prêt
   
    const docDefinition = {
        pageSize: 'A4',
        pageMargins: [15, 15, 15, 50],
        background: function (currentPage, pageSize) {
            return {
                image: logoRenardBase64Gris,
                width: pageSize.width * 0.9,
                height: pageSize.height * 0.9,
                absolutePosition: {
                    x: (pageSize.width - pageSize.width * 0.9) / 2,
                    y: (pageSize.height - pageSize.height * 0.9) / 2
                },
                opacity: 0.2,
            };
        },
        content: [
            { text: 'Simulateur Capital Initial', style: 'title' },
            { text: 'Valeurs de sélectionnés', style: 'subtitle', },
            getInputTable(), 
            { text: 'Résultats de la projection', style: 'subtitle', },
            getSavingsResults(),
            { text: 'Graphiques évolutions du portefeuilles', style: 'subtitle' },
            getChartWithBorder('savingsChart'),
            { text: 'Les performances passées des instruments financiers ne garantissent en aucun cas leurs performances futures. Il est important de noter que les résultats obtenus ne constituent pas un conseil en investissement et que tout investissement comporte des risques, y compris la perte partielle ou totale du capital. Il est fortement recommandé de consulter un professionnel, tel qu\'un conseiller en gestion de patrimoine (CGP), avant de prendre toute décision d\'investissement, afin d\'obtenir des conseils personnalisés en fonction de votre profil et de vos objectifs financiers.', style: 'paragraph' },
        ],
        styles: {
            title: {
                fontSize: 18,
                bold: true,
                alignment: 'center',
                margin: [0, 0, 0, 15]
            },
            subtitle: {
                fontSize: 14,
                bold: true,
                alignment: 'center',
                margin: [0, 10, 10, 5]
            },
            paragraph: {
                fontSize: 8,
                alignment: 'justify',
                margin: [10, 5, 10, 5]
            },
            chartContainer: {
                margin: [0, 0, 0, 5],
            }
        },
        footer: function (currentPage, pageCount) {
            return {
                table: {
                    widths: ['*', 'auto', '*'],
                    body: [
                        [
                            {
                                text: 'Fox Velocity',
                                alignment: 'center',
                                fontSize: 8,
                                margin: [0, 10, 0, 0]
                            },
                            {
                                image: logoBase64,
                                width: 25,
                                alignment: 'center',
                                margin: [0, 0, 0, 0]
                            },
                            {
                                text: `Page ${currentPage.toString()} sur ${pageCount}`,
                                alignment: 'center',
                                fontSize: 8,
                                margin: [0, 10, 0, 0]
                            }
                        ]
                    ]
                },
                layout: 'noBorders'
            };
        }
    };

    const fileName = 'Simulateur Capital Initial - FoxVelocity.pdf'; // Nom du fichier PDF
    pdfMake.createPdf(docDefinition).download(fileName);

    // Fonction d'attente pour le graphique
    function waitForChart(chartId) {
        return new Promise((resolve) => {
            function checkChartReady() {
                const isChartReady = document.getElementById(chartId) && document.getElementById(chartId).getContext('2d') && window[chartId.replace('Chart', '') + 'Chart'];
                if (isChartReady) {
                    setTimeout(resolve, 100)
                } else {
                    setTimeout(checkChartReady, 100);
                }
            }
            checkChartReady();
        });
    }

    // Fonctions pour récupérer les valeurs des inputs



function getMonthlyContributionInputValue() {
    let monthlyContributionElement = document.getElementById("monthlyContributionValue");
    let monthlyContributionTexte = monthlyContributionElement.textContent;
    return nettoyerEtConvertirEspace(monthlyContributionTexte);
}

function getAnnualInterestRateInputValue() {
    let annualInterestRateElement = document.getElementById("annualInterestRate");
    return annualInterestRateElement.value;
}

function getYearsInputValue() {
    let yearsElement = document.getElementById("years");
    return yearsElement.value;
}

function getInitialEntryFeesInputValue() {
    let initialEntryFeesElement = document.getElementById("initialEntryFees");
    return initialEntryFeesElement.value;
}

function getMonthlyEntryFeesInputValue() {
    let monthlyEntryFeesElement = document.getElementById("monthlyEntryFees");
    return monthlyEntryFeesElement.value;
}

function getManagementFeesInputValue() {
    let managementFeesElement = document.getElementById("managementFees");
    return managementFeesElement.value;
}


    // Fonctions pour formater les valeurs

   

    function formatPercentage(value) {
        return value + " %";
    }

    function formatAnnee(value){
      return value + " ans"
    }

    // Fonctions pour nettoyer et convertir les espaces
    function nettoyerEtConvertirEspace(texte) {
        // Remplacer les espaces insécables étroits et les espaces insécables par des espaces normaux
        texte = texte.replace(/\u202F/g, "\u0020").replace(/\u00A0/g, "\u0020");
        return texte;
    }

    // Fonctions pour récupérer les valeurs des résultats
    function getFinalAmountValue() {
        let montantFinalElement = document.getElementById("finalAmount");
        let montantFinalTexte = montantFinalElement.textContent;
       
        montantFinalTexte = nettoyerEtConvertirEspace(montantFinalTexte); // Nettoyer les espaces
       
        return montantFinalTexte;
    }

    function getTotalContributionsValue() {
        let totalContributionsElement = document.getElementById("totalContributions");
        let totalContributionsTexte = totalContributionsElement.textContent;
       
        totalContributionsTexte = nettoyerEtConvertirEspace(totalContributionsTexte); // Nettoyer les espaces
       
        return totalContributionsTexte;
    }

    function getInterestEarnedValue() {
        let interestEarnedElement = document.getElementById("interestEarned");
        let interestEarnedTexte = interestEarnedElement.textContent;
       
        interestEarnedTexte = nettoyerEtConvertirEspace(interestEarnedTexte); // Nettoyer les espaces
       
        return interestEarnedTexte;
    }

    function getTotalInitialEntryFeesValue() {
        let totalInitialEntryFeesElement = document.getElementById("totalInitialEntryFees");
        let totalInitialEntryFeesTexte = totalInitialEntryFeesElement.textContent;
       
        totalInitialEntryFeesTexte = nettoyerEtConvertirEspace(totalInitialEntryFeesTexte); // Nettoyer les espaces
       
        return totalInitialEntryFeesTexte;
    }

    function getTotalMonthlyEntryFeesValue() {
        let totalMonthlyEntryFeesElement = document.getElementById("totalMonthlyEntryFees");
        let totalMonthlyEntryFeesTexte = totalMonthlyEntryFeesElement.textContent;
       
        totalMonthlyEntryFeesTexte = nettoyerEtConvertirEspace(totalMonthlyEntryFeesTexte); // Nettoyer les espaces
       
        return totalMonthlyEntryFeesTexte;
    }

    function getTotalManagementFeesValue() {
        let totalManagementFeesElement = document.getElementById("totalManagementFees");
        let totalManagementFeesTexte = totalManagementFeesElement.textContent;
        
        totalManagementFeesTexte = nettoyerEtConvertirEspace(totalManagementFeesTexte); // Nettoyer les espaces
        
        return totalManagementFeesTexte;
    }

    

    function getTotalFeesValue() {
        let totalFeesElement = document.getElementById("totalFeesValue");
        let totalFeesTexte = totalFeesElement.textContent;
        
        totalFeesTexte = nettoyerEtConvertirEspace(totalFeesTexte);
        
        return totalFeesTexte;
    }
  
    // Fonction pour générer la table des inputs
    function getInputTable() {
       
        return {
            table: {
                body: [
                    
                    [{}, {}], // Ligne vide
                    [{ text: "Versement mensuel initial :", alignment: 'left' }, { text: getMonthlyContributionInputValue(), alignment: 'right' }],
                    [{ text: "Taux d'intérêt annuel :", alignment: 'left' }, { text: formatPercentage(getAnnualInterestRateInputValue()), alignment: 'right' }],
                    [{ text: "Durée :", alignment: 'left' }, { text: formatAnnee(getYearsInputValue()), alignment: 'right' }],
                    [{ text: "Frais d'entrée initial :", alignment: 'left' }, { text: formatPercentage(getInitialEntryFeesInputValue()), alignment: 'right' }],
                    [{ text: "Frais d'entrée mensuel :", alignment: 'left' }, { text: formatPercentage(getMonthlyEntryFeesInputValue()), alignment: 'right' }],
                    [{ text: "Frais de gestion annuels :", alignment: 'left' }, { text: formatPercentage(getManagementFeesInputValue()), alignment: 'right' }]
                   
                ],
                widths: ['50%', '50%']
            },
            layout: 'noBorders',
            fontSize: 12,
            margin: [0, 0, 0, 10]
        };
    }

    // recuperer le capital initial
    function getInitialCapitalValue() {
        let initialCapitalElement = document.getElementById("initialCapital");
        let initialCapitalTexte = initialCapitalElement.textContent;
    
        initialCapitalTexte = nettoyerEtConvertirEspace(initialCapitalTexte); // Nettoyer les espaces
    
        return initialCapitalTexte;
    }

    // Fonction pour générer la table des résultats
    function getSavingsResults() {
        const initialCapital = getInitialCapitalValue(); // Récupérer la valeur du capital initial
        const finalAmount = getFinalAmountValue();
        const totalContributions = getTotalContributionsValue();
        const interestEarned = getInterestEarnedValue();
        const totalInitialEntryFees = getTotalInitialEntryFeesValue();
        const totalMonthlyEntryFees = getTotalMonthlyEntryFeesValue();
        const totalManagementFees = getTotalManagementFeesValue();
        const totalFees = getTotalFeesValue(); 
   
        
        return {
            table: {
                body: [
                    [{ text: "Montant initial :", alignment: 'left' }, { text: initialCapital, alignment: 'right', bold: true  }],
                    [{ text: `Montant final :`, alignment: 'left' }, { text: finalAmount, alignment: 'right'}],
                    [{ text: `Intérêts gagnés :`, alignment: 'left' }, { text: interestEarned, alignment: 'right' }],
                    [{ text: `Total des versements :`, alignment: 'left' }, { text: totalContributions, alignment: 'right' }],
                    [{}, {}], // Ligne vide
                    [{ text: `Total des frais :`, alignment: 'left' }, { text: totalFees, alignment: 'right', bold: true }],
                    [{ text: `Total des frais d'entrée initial :`, alignment: 'left' }, { text: totalInitialEntryFees, alignment: 'right' }],
                    [{ text: `Total des frais d'entrée mensuels :`, alignment: 'left' }, { text: totalMonthlyEntryFees, alignment: 'right' }],
                    [{ text: `Total des frais de gestion :`, alignment: 'left' }, { text: totalManagementFees, alignment: 'right' }]
                    
            ],
            widths: ['50%', '50%']
        },
        layout: 'noBorders',
        fontSize: 12,
        margin: [0, 0, 0, 10]
    };
   }

    // Fonction pour capturer et ajouter un graphique avec bordure
    function getChartWithBorder(canvasId) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            return {};
        }
        const remToPx = 16; // Conversion simple rem to px
        return {
            table: {
                body: [[
                    {
                        image: canvas.toDataURL('image/png'),
                        width: 500,
                        alignment: 'center',
                    }
                ]],
                widths: ['*']
            },
            layout: {
                hLineWidth: function (i, node) {
                    return 1;
                },
                vLineWidth: function (i, node) {
                    return 1;
                },
                hLineColor: function (i, node) {
                    return 'black';
                },
                vLineColor: function (i, node) {
                    return 'black';
                },
                paddingLeft: function (i, node) { return 1 * remToPx; },
                paddingRight: function (i, node) { return 1 * remToPx; },
                paddingTop: function (i, node) { return 1 * remToPx; },
                paddingBottom: function (i, node) { return 1 * remToPx; },
            },
            style: 'chartContainer'
        };
    }
}