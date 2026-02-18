export { roundNumber };

/**
 * Round a number to 6 decimals
 * @param {*} numb The number to round
 * @returns The rounded number
 */
function roundNumber(numb) { return Number(numb).toFixed(6); }