/** @type {import("prettier").Config} */
const config = {
    plugins: [require.resolve('prettier-plugin-tailwindcss')],
    tabWidth: 4,
    bracketSpacing: true,
    semi: true,
    singleQuote: true,
    trailingComma: 'all',
};

module.exports = config;
