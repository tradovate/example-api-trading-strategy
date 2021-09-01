module.exports = function highLowVariance(period) {
    function nextHLV(prevState, data) {

        

        const pts       = data.slice(data.length - period)
        const highest   = pts.reduce((a, b) => Math.max(a, b.high), 0)
        const lowest    = pts.reduce((a, b) => Math.min(a, b.low), Infinity)        

        let next = {
            variance: highest - lowest
        }

        nextHLV.state = next

        return next
    }

    nextHLV.init = () => {
        nextHLV.state = { variance: 0 }
    }

    nextHLV.init()

    return nextHLV
}