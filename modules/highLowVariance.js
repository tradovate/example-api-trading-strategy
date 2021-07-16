module.exports = function highLowVariance(period) {
    function nextHLV(prevState, data) {

        const pts       = data.slice(data.length - period)
        const highest   = pts.reduce((a, b) => Math.max(a, b.high), 0)
        const lowest    = pts.reduce((a, b) => Math.min(a, b.low), Infinity)        

        nextHLV.state = {
            variance: highest - lowest
        }
        return nextHLV
    }

    nextHLV.init = () => {
        nextHLV.state = { variance: 0 }
    }

    nextHLV.init()

    return nextHLV
}