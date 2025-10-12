// postcss.config.js
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {}, // ✅ use new plugin (NOT "tailwindcss")
    autoprefixer: {},
  },
};