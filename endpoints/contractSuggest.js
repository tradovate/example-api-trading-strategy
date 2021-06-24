const axios = require('axios')

module.exports = async function contractSuggest(name) {
    const URL = process.env.HTTP_URL + `/contract/suggest?t=${name}&l=10`
    
    const config = {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${process.env.ACCESS_TOKEN}`
        }
    }

    let result

    try {
        result = await axios.get(URL, config)
    } catch (err) {
        console.error(err)
    }

    return result.data
}