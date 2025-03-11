// modules/theme.js

export function toggleTheme() {
    document.body.classList.toggle('light-theme');
    document.body.classList.toggle('dark-theme');
    // calculateSavings(); // Recalcul pour mettre à jour les couleurs des graphiques
}