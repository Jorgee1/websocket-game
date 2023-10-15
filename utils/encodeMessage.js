/**
 * 
 * @param {string} message 
 * @param {object} object 
 */
export const encodeMessage = (message, object) => {
    let payload = ''
    try {
        payload = JSON.stringify(object)
    } catch (error) {
        console.error(error)
    }
    
    return `${message} ${payload}`
}