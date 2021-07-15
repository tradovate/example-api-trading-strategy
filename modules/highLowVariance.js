module.exports = function highLowVariance(period) {
    function tickHlv({ variance:_ }, data) {

        const pts       = data.slice(data.length - period)
        const highest   = pts.reduce((a, b) => Math.max(a, b.high), 0)
        const lowest    = pts.reduce((a, b) => Math.min(a, b.low), Infinity)        

        return {
            variance: highest - lowest
        }
    }

    tickHlv.init = () => ({
        variance: 0
    })

    return tickHlv
}