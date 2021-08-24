const exponentialMovingAverage = require('./ema')

module.exports = function relativeStrengthIndex(period) {
    function nextRsi(prevState, data) {

        // console.log('data in rsi: '+JSON.stringify(data, null, 2))
        const pts = data.slice(data.length - period)

        const changes = pts.map((x, i, arr) => i === 0 ? 0 : x.close - arr[i-1].close)
        const ups = changes.filter(x => x > 0).reduce((a, b) => a + b, 0)
        const downs = changes.filter(x => x < 0).reduce((a, b) => a + b, 0)

        const upAvg = ups/period
        const downAvg = Math.abs(downs)/period

        // console.log('ups: '+JSON.stringify(ups))
        // console.log('downs: '+JSON.stringify(downs))

        const rs = upAvg / downAvg

        const rsi = 100 - 100 / (1 + rs)
        nextRsi.state.periodData.push(rsi)
        if(nextRsi.state.periodData.length > period) {
            nextRsi.state.periodData.shift()
        }

        // console.log('rsi: '+rsi)

        nextRsi.state = {
            rsi,
            overbought: rsi > 70,
            oversold:  rsi < 30,
            periodData: prevState.periodData
        }

        nextRsi.state.periodData.push(rsi)
        if(nextRsi.state.periodData.length > period) {
            nextRsi.state.periodData.shift()
        }

        return nextRsi
    }

    nextRsi.init = () => {
        nextRsi.state = {
            rsi: 0,
            periodData: []
        }
    }

    nextRsi.init()

    return nextRsi
}