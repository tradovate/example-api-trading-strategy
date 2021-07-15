module.exports = function sma(period) {
    function tickSma(prevState, data) {
        tickSma.state = {
            value: data.slice(data.length - period).reduce((a, b) => a + b.price, 0)/period
        }
        return tickSma
    }

    tickSma.init = () => {
        tickSma.state = { value: 0 }
    }

    tickSma.init()

    return tickSma
}