// pdfDureeEpargne.js

export async function generatePDF(pdfMake, logoBase64, logoRenardBase64Gris) {
    if (!pdfMake) {
        alert('pdfMake n\'est pas disponible');
        console.error("pdfMake n'est pas chargé");
        return;
    }

    await waitForChart('savingsChart');
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
            { text: 'Calcul Durée Epargne', style: 'title' },
            { text: 'Paramètres', style: 'subtitle' },
            getInputTable(),
            { text: 'Résultats', style: 'subtitle' },
            getSavingsDurationResult(),
            { text: 'Évolution du capital', style: 'subtitle' },
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

    const fileName = 'CalculVersementMensuel.pdf';
    pdfMake.createPdf(docDefinition).download(fileName);

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

    function getTargetAmountInputValue() {
        let targetAmountElement = document.getElementById("targetAmountValue");
        let targetAmountTexte = targetAmountElement.textContent;
        return nettoyerEtConvertirEspace(targetAmountTexte);
    }

    function getInitialAmountInputValue() {
        let initialAmountElement = document.getElementById("initialAmountValue");
        let initialAmountTexte = initialAmountElement.textContent;
        return nettoyerEtConvertirEspace(initialAmountTexte);
    }

    function getMonthlyContributionInputValue() {
        let monthlyContributionElement = document.getElementById("monthlyContributionValue");
        let monthlyContributionTexte = monthlyContributionElement.textContent;
        return nettoyerEtConvertirEspace(monthlyContributionTexte);
    }

    function getAnnualInterestRateInputValue() {
        let annualInterestRateElement = document.getElementById("annualInterestRate");
        return annualInterestRateElement.value;
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

    function getIndexationRateInputValue() {
        let indexationRateElement = document.getElementById("indexationRate");
        return indexationRateElement.value;
    }

    function formatPercentage(value) {
        return value + " %";
    }

    function nettoyerEtConvertirEspace(texte) {
        texte = texte.replace(/\u202F/g, "\u0020").replace(/\u00A0/g, "\u0020");
        return texte;
    }

    

    function getInputTable() {
        return {
            table: {
                body: [
                    [{ text: "Montant objectif :", alignment: 'left' }, { text: getTargetAmountInputValue(), alignment: 'right' }],
                    [{ text: "Montant initial :", alignment: 'left' }, { text: getInitialAmountInputValue(), alignment: 'right' }],
                    [{ text: "Versement mensuel initial :", alignment: 'left' }, { text: getMonthlyContributionInputValue(), alignment: 'right' }],
                    [{ text: "Taux d'intérêt annuel :", alignment: 'left' }, { text: formatPercentage(getAnnualInterestRateInputValue()), alignment: 'right' }],
                    [{ text: "Frais d'entrée initial :", alignment: 'left' }, { text: formatPercentage(getInitialEntryFeesInputValue()), alignment: 'right' }],
                    [{ text: "Frais d'entrée mensuel :", alignment: 'left' }, { text: formatPercentage(getMonthlyEntryFeesInputValue()), alignment: 'right' }],
                    [{ text: "Frais de gestion annuels :", alignment: 'left' }, { text: formatPercentage(getManagementFeesInputValue()), alignment: 'right' }],
                    [{ text: "Taux d'indexation annuel :", alignment: 'left' }, { text: formatPercentage(getIndexationRateInputValue()), alignment: 'right' }]
                ],
                widths: ['50%', '50%']
            },
            layout: 'noBorders',
            fontSize: 12,
            margin: [0, 0, 0, 10]
        };
    }

    function getSavingsDurationResult() {
        const dureeEpargne = getDureeEpargneValue();
        const finalAmount = getFinalAmountValue();
        const totalContributions = getTotalContributionsValue();
        const lastMonthlyContribution = getLastMonthlyContributionValue();
        const interestEarnedNet = getInterestEarnedNetValue();
        const totalInitialEntryFees = getTotalInitialEntryFeesValue();
        const totalMonthlyEntryFees = getTotalMonthlyEntryFeesValue();
        const totalManagementFees = getTotalManagementFeesValue();

        return {
            table: {
                body: [
                    [{ text: 'Durée de l\'épargne :', alignment: 'left' }, { text: dureeEpargne, alignment: 'right' }],
                    [{ text: 'Montant final :', alignment: 'left' }, { text: finalAmount, alignment: 'right' }],
                    [{ text: 'Total des versements :', alignment: 'left' }, { text: totalContributions, alignment: 'right' }],
                    [{ text: 'Dernier versement mensuel :', alignment: 'left' }, { text: lastMonthlyContribution, alignment: 'right' }],
                    [{ text: 'Intérêts gagnés net :', alignment: 'left' }, { text: interestEarnedNet, alignment: 'right' }],
                    [{ text: 'Total des frais d\'entrée initiaux :', alignment: 'left' }, { text: totalInitialEntryFees, alignment: 'right' }],
                    [{ text: 'Total des frais d\'entrée mensuels :', alignment: 'left' }, { text: totalMonthlyEntryFees, alignment: 'right' }],
                    [{ text: 'Total des frais de gestion :', alignment: 'left' }, { text: totalManagementFees, alignment: 'right' }]
                ],
                widths: ['50%', '50%']
            },
            layout: 'noBorders',
            fontSize: 12,
            margin: [0, 0, 0, 10]
        };
    }

    function getDureeEpargneValue() {
        let dureeEpargneElement = document.getElementById("DureeEpargne");
        return dureeEpargneElement.textContent;
    }

    function getFinalAmountValue() {
        let finalAmountElement = document.getElementById("finalAmount");
        let finalAmountTexte = finalAmountElement.textContent;

        finalAmountTexte = nettoyerEtConvertirEspace(finalAmountTexte);

        return finalAmountTexte;
    }

    function getTotalContributionsValue() {
        let totalContributionsElement = document.getElementById("totalContributions");
        let totalContributionsTexte = totalContributionsElement.textContent;

        totalContributionsTexte = nettoyerEtConvertirEspace(totalContributionsTexte);

        return totalContributionsTexte;
    }

    function getLastMonthlyContributionValue() {
        let lastMonthlyContributionElement = document.getElementById("lastMonthlyContribution");
        let lastMonthlyContributionTexte = lastMonthlyContributionElement.textContent;

        lastMonthlyContributionTexte = nettoyerEtConvertirEspace(lastMonthlyContributionTexte);

        return lastMonthlyContributionTexte;
    }

    function getInterestEarnedNetValue() {
        let interestEarnedNetElement = document.getElementById("interestEarnedNet");
        let interestEarnedNetTexte = interestEarnedNetElement.textContent;

        interestEarnedNetTexte = nettoyerEtConvertirEspace(interestEarnedNetTexte);

        return interestEarnedNetTexte;
    }

    function getTotalInitialEntryFeesValue() {
        let totalInitialEntryFeesElement = document.getElementById("totalInitialEntryFees");
        let totalInitialEntryFeesTexte = totalInitialEntryFeesElement.textContent;

        totalInitialEntryFeesTexte = nettoyerEtConvertirEspace(totalInitialEntryFeesTexte);

        return totalInitialEntryFeesTexte;
    }

    function getTotalMonthlyEntryFeesValue() {
        let totalMonthlyEntryFeesElement = document.getElementById("totalMonthlyEntryFees");
        let totalMonthlyEntryFeesTexte = totalMonthlyEntryFeesElement.textContent;

        totalMonthlyEntryFeesTexte = nettoyerEtConvertirEspace(totalMonthlyEntryFeesTexte);

        return totalMonthlyEntryFeesTexte;
    }

    function getTotalManagementFeesValue() {
        let totalManagementFeesElement = document.getElementById("totalManagementFees");
        let totalManagementFeesTexte = totalManagementFeesElement.textContent;

        totalManagementFeesTexte = nettoyerEtConvertirEspace(totalManagementFeesTexte);

        return totalManagementFeesTexte;
    }

    function getChartWithBorder(canvasId) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            return {};
        }
        const remToPx = 16;
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