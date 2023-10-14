/**
 * 
 * @param {number} ms 
 * @returns {Promise<void>}
 */
export const sleep = async ms => new Promise(resolve => setTimeout(resolve, ms))