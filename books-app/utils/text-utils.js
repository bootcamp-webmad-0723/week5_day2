const cleanText = text => text.trim()
const capitalizeText = text => text[0].toUpperCase() + text.slice(1).toLowerCase();

module.exports = {
    cleanText,
    capitalizeText
}