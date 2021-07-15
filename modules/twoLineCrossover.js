const { calculateSma } = require("../utils/helpers")

module.exports = function twoLineCrossover(shortPeriod, longPeriod) {
    function tickTlc(prevState, data) {

        const shortSma = calculateSma(shortPeriod, data)
        const longSma = calculateSma(longPeriod, data)
        const distance = shortSma - longSma

        return {
            longSma,
            shortSma,
            distance,
            positiveCrossover: distance > 0 && prevState.distance < 0,
            negativeCrossover: distance < 0 && prevState.distance > 0
        }                
    }

    tickTlc.init = () => ({
        shortSma: 0,
        longSma: 0,
        distance: 0,
        positiveCrossover: false,
        negativeCrossover: false,
    })

    return tickTlc
}