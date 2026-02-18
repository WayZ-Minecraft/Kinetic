export { roundNumber, toVector };

/**
 * Round a number to 6 decimals
 * @param {*} numb The number to round
 * @returns The rounded number
 */
function roundNumber(numb) {
    return Number(numb).toFixed(6);
}

/**
 * Convert an array of strings to an array of floats
 * @param {*} args The array of strings to convert
 * @returns 
 */
function toVector(args) { 
    return args.map(v => parseFloat(v));
}