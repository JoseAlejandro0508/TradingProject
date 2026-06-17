/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-main': 'var(--bg-main)',
        'bg-surface': 'var(--bg-surface)',
        'bg-card': 'var(--bg-card)',
        'text-main': 'var(--text-main)',
        'text-muted': 'var(--text-muted)',
        'accent': 'var(--accent)',
        'accent-green': 'var(--accent-green)',
        'accent-red': 'var(--accent-red)',
        'border-custom': 'var(--border)',
        'input-bg': 'var(--input-bg)',
        'btn-disabled-bg': 'var(--btn-disabled-bg)',
        'btn-disabled-text': 'var(--btn-disabled-text)',
        'sms-btn-idle': 'var(--sms-btn-idle)',
        'binance-gold': '#F3BA2F',
        'binance-gold-light': '#E3a008',
      },
      fontFamily: {
        'heading': ['"Plus Jakarta Sans"', 'sans-serif'],
        'body': ['Inter', 'sans-serif'],
      },
      spacing: {
        'spacing-xs': '4px',
        'spacing-sm': '8px',
        'spacing-md': '16px',
        'spacing-lg': '24px',
        'spacing-xl': '32px',
        'spacing-2xl': '48px',
      },
      borderRadius: {
        'radius-sm': '8px',
        'radius-md': '12px',
        'radius-lg': '16px',
        'radius-xl': '20px',
        'radius-full': '50px',
      },
      boxShadow: {
        'shadow-glow': '0 0 20px rgba(41, 98, 255, 0.15), inset 0 0 15px rgba(41, 98, 255, 0.2)',
        'shadow-card': '0 8px 20px rgba(0,0,0,0.2)',
        'shadow-card-light': '0 8px 20px rgba(0,0,0,0.05)',
        'shadow-btn': '0 4px 14px rgba(41, 98, 255, 0.25)',
        'shadow-dropdown': '0 10px 25px rgba(0,0,0,0.3)',
        'shadow-modal': '0 24px 50px rgba(0, 0, 0, 0.6)',
        'shadow-modal-light': '0 24px 50px rgba(0, 0, 0, 0.1)',
      },
      backdropBlur: {
        'glass': '20px',
      },
      transitionTimingFunction: {
        'theme-switch': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        'market-move': {
          '0%': { height: '30%', transform: 'translateY(0)' },
          '50%': { height: '65%', transform: 'translateY(-5px)' },
          '100%': { height: '45%', transform: 'translateY(3px)' },
        },
        'scroll-partners': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(calc(-200px * 9))' },
        },
        'glint': {
          '0%': { left: '-150%' },
          '15%': { left: '150%' },
          '100%': { left: '150%' },
        },
      },
      animation: {
        'market-move': 'marketMove 2.5s infinite ease-in-out alternate',
        'scroll-partners': 'scrollPartners 28s linear infinite',
      },
    },
  },
  plugins: [],
}
