const { default: axios } = require("axios")


module.exports = async function placeOCO({
    action,
    symbol,
    orderQty,
    orderType,
    price,
    other,
}) {
    const URL = process.env.HTTP_URL + '/order/placeOCO'

    const config = {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${process.env.ACCESS_TOKEN}`
        }
    }

    const oco = {
        accountSpec: process.env.SPEC,
        accountId: process.env.ID,
        action,
        symbol,
        orderQty,
        orderType,
        price,
        isAutomated: true, 
        other
    }

    let result = await axios.post(URL, oco, config)
    
    return result.data
}