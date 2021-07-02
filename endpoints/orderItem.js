const { default: axios } = require("axios")

module.exports = async function orderItem(id) {
    const URL = process.env.HTTP_URL + `/order/item?id=${id}`
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
    } catch(err) {
        console.log(err)
    }

    return result.data
}