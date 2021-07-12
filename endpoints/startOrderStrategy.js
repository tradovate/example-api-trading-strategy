const fs = require('fs')
const { default: axios } = require('axios')
const contractSuggest = require('./contractSuggest')

/**
 * Build a bracket strategy to send to the Tradovate API.
 * ```js
 *  const bracket1 = {
 *      qty: 1,
 *      profitTarget: -30,
 *      stopLoss: 5.5,
 *      trailingStop: false
 *  }
 *
 *  const bracket2 = {
 *    qty: 1,
 *    profitTarget: 40.75,
 *    stopLoss: -5.5,
 *    trailingStop: false
 *  }
 *
 *  const params = {
 *      entryVersion: {
 *          orderQty: 1,
 *          orderType: "Stop",
 *          stopPrice: 4174.50,
 *      },
 *      brackets: [bracket1, bracket2]
 *  }
 * 
 *  const response = await startOrderStrategy(params)
 * ```
 * @param {'Buy' | 'Sell'} action
 * @param {string} symbol
 * @param {{entryVersion: {orderQty: number, orderType: string, stopPrice?: number, limitPrice?: number}, brackets: [{qty: number, profitTarget: number, stopLoss:number, trailingStop: boolean}]}} params 
 */
module.exports = async function startOrderStrategy(action, symbol, params) {
    const URL = process.env.HTTP_URL + '/orderStrategy/startOrderStrategy'
    const config = {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${process.env.ACCESS_TOKEN}`
        }
    }

    let body = {
        accountId: parseInt(process.env.ID, 10),
        accountSpec: process.env.SPEC,
        symbol,
        action,
        orderStrategyTypeId: 2,
        params,
    }

    let result
    try {
        result = await axios.post(URL, body, config)
    } catch (err) {
        await fs.writeFile('./dump.json', JSON.stringify(err, null, 2), {}, () => {}) 
        throw err
    }

    return result.data
} 