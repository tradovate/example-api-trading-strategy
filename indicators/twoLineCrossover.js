const { calculateSma } = require("../utils/helpers")

module.exports = function twoLineCrossover(shortPeriod, longPeriod) {
    function nextTLC(prevState, data) {

        const shortSma = data.slice(data.length - shortPeriod).reduce((a, b) => a + b.close || b.price, 0)/shortPeriod
        const longSma = data.slice(data.length - longPeriod).reduce((a, b) => a + b.close || b.price, 0)/longPeriod
        const distance = shortSma - longSma

        nextTLC.state = {
            longSma,
            shortSma,
            distance,
            positiveCrossover: distance > 0 && prevState.distance < 0,
            negativeCrossover: distance < 0 && prevState.distance > 0
        }         
        return nextTLC       
    }

    nextTLC.init = () => {
        nextTLC.state = {
            shortSma: 0,
            longSma: 0,
            distance: 0,
            positiveCrossover: false,
            negativeCrossover: false,
        }
    }

    nextTLC.init()

    return nextTLC
}