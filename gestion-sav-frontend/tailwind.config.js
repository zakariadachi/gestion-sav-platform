/**
 * tailwind.config.js — Tailwind CSS v4
 *
 * En Tailwind v4, la configuration du thème se fait exclusivement
 * via @theme { } dans src/index.css.
 *
 * Ce fichier ne sert qu'à déclarer les chemins de contenu
 * pour que Tailwind sache quels fichiers scanner.
 */
/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        './index.html',
        './src/**/*.{js,ts,jsx,tsx}',
    ],
};