const axios = require('axios')
const crypto = require('crypto')

/**
 * Asynchronously requests an access token from the Tradovate API. Uses given environment variables to construct
 * the request. If this function errs, be sure that you've configured your environment variables in `index.js`.
 * @returns AccessTokenResponse
 */
module.exports = async function requestAccessToken() {
    console.log(`[Tradobot]: Running Operation /auth/accessTokenRequest...`)
    const URL = process.env.HTTP_URL + '/auth/accessTokenRequest'

    //create a unique identifier for this robot, this will be the same every time the application boots
    //unless you change your username or run the bot from a different device. Were we creating a web app
    //for this, I'd opt for the reliable device-uuid package to gather this info.
    const deviceId = 
        crypto.createHash('sha256')     //creates an instance of hasher
            .update(process.platform)   //adds the platform to the hash ('windows', 'android', ...)
            .update(process.arch)       //adds the cpu architecture to the hash ('x64', ...)
            .update(process.env.USER)   //adds your tradovate username to the hash
            .digest('hex')              //creates a hash 'digest' - the result of the algo as a hex string

    console.log(`[TRADOBOT]: Device <${deviceId}> detected.`)

    //our authentication data...
    const data = {
        name: process.env.USER,
        password: process.env.PASS,
        appId: 'Tradobot',
        appVersion: '1.0',
        deviceId,
        cid: 8,
        sec: 'f03741b6-f634-48d6-9308-c8fb871150c2'
    }

    const config = {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    }

    //Here's where we kick off the auth request
    let result //this will hold the possible result

    //we try to get the result of our request using the configuration we've defined.
    try {
        result = await axios.post(URL, data, config)
    } catch(err) {
        console.error(`[Tradobot]: Couldn't acquire access token --\n${JSON.stringify(err, null, 2)}`)
    }

    console.log(result.data)

    //Set our access token so that it is globally available in the context of our robot.
    //process.env is unique to this node process and is cleared afterward, so we don't have to
    //worry about this data hanging out on our machine.
    process.env.ACCESS_TOKEN = result.data.accessToken
    process.env.MD_ACCESS_TOKEN = result.data.mdAccessToken

    return result.data
} 