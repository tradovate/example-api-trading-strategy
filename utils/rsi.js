module.exports = function relativeStrengthIndex(period) {
    function nextRsi(prevState, data) {
        
        const pts = data.slice(data.length - period)

        const changes   = pts.map((x, i, arr) => i === 0 ? 0 : x.close - arr[i-1].close)
        const ups       = changes.filter(x => x > 0).reduce((a, b) => a + b, 0)
        const downs     = changes.filter(x => x < 0).reduce((a, b) => a + b, 0)

        const upAvg     = ups/period
        const downAvg   = Math.abs(downs)/period

        const rs        = upAvg / downAvg

        const rsi       = 100 - 100 / (1 + rs)

        const next = {
            rsi,
            overbought: rsi > 70,
            oversold:  rsi < 30,
        }

        nextRsi.state = next

        return next
    }

    nextRsi.init = () => {
        nextRsi.state = {
            rsi: 0,
        }
    }

    nextRsi.init()

    return nextRsi
}