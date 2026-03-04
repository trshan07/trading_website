// frontend/tailwind.config.js
export const content = [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
];
export const theme = {
    extend: {
        colors: {
            navy: {
                50: '#E6E9F0',
                100: '#CCD3E1',
                200: '#99A7C3',
                300: '#667BA5',
                400: '#334F87',
                500: '#002366', // Primary navy
                600: '#001F5C',
                700: '#001A4D',
                800: '#00143D',
                900: '#000F2E',
            },
            gold: {
                50: '#FDF8E6',
                100: '#FBF1CC',
                200: '#F7E399',
                300: '#F3D566',
                400: '#EFC733',
                500: '#EBB900', // Primary gold
                600: '#D4A700',
                700: '#B88F00',
                800: '#9C7700',
                900: '#7F5F00',
            },
        },
        fontFamily: {
            'raleway': ['Raleway', 'sans-serif'],
        },
        animation: {
            'float': 'float 3s ease-in-out infinite',
            'pulse-slow': 'pulse 3s ease-in-out infinite',
            'slide-up': 'slideUp 0.5s ease-out',
            'slide-down': 'slideDown 0.5s ease-out',
        },
        keyframes: {
            float: {
                '0%, 100%': { transform: 'translateY(0)' },
                '50%': { transform: 'translateY(-10px)' },
            },
            slideUp: {
                '0%': { transform: 'translateY(100px)', opacity: '0' },
                '100%': { transform: 'translateY(0)', opacity: '1' },
            },
            slideDown: {
                '0%': { transform: 'translateY(-100px)', opacity: '0' },
                '100%': { transform: 'translateY(0)', opacity: '1' },
            },
        },
    },
};
export const plugins = [];