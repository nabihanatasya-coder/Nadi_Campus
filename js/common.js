/*    NADICAMPUS - COMMON JAVASCRIPT */

// Display current year in footer
const yearElement = document.getElementById("currentYear");

if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
}