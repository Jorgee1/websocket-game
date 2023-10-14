/**
 * 
 * @param {import('ws').RawData} messageRaw
 * @returns {{
 *  message: string
 *  payload: object
 * }}
*/
export const parseMessage = (messageRaw) => {
   const [message, ...splitPayload] = messageRaw.toString().split(' ')
   const payloadRaw = splitPayload.join(' ')
   let payload = {}
   try { payload = JSON.parse(payloadRaw) }
   catch (error){ console.error(error) }

   return {message, payload}
}