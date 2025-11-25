/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class', // Changed to 'class' for manual toggling
    theme: {
        extend: {},
    },
    plugins: [],
}