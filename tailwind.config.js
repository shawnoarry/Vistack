/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{vue,js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    ink: '#191919',
                    muted: '#9999A1',
                    line: '#BFB5AF',
                    accent: '#CD4631',
                    surface: '#F4F4F6'
                },
                night: {
                    accent: '#FF6B47',
                    panel: '#1F1F22',
                    surface: '#161618',
                    muted: '#A0A0A8'
                },
                dark: {
                    bg: '#121212',
                    card: '#1e1e1e',
                    input: '#252525',
                    border: '#444',
                    text: '#e0e0e0',
                    muted: '#888'
                }
            },
            fontFamily: {
                sans: ['Roboto', 'sans-serif']
            },
            animation: {
                'bounce-slow': 'bounce 2s infinite',
            }
        },
    },
    plugins: [],
}
