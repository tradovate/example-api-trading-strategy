module.exports = function highLowVariance(period) {
    function tickHlv({ variance:_ }, data) {

        const pts       = data.slice(data.length - period)
        const highest   = pts.reduce((a, b) => Math.max(a, b.high), 0)
        const lowest    = pts.reduce((a, b) => Math.min(a, b.low), Infinity)        

        tickHlv.state = {
            variance: highest - lowest
        }
        return tickHlv
    }

    tickHlv.init = () => {
        tickHlv.state = { variance: 0 }
    }

    tickHlv.init()

    return tickHlv
}