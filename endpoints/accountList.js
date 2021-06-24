const axios = require('axios')

module.exports = async function accountList() {
    const URL = process.env.HTTP_URL + '/account/list'

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
        return err
    }

    return result.data
} 