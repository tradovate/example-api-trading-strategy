
/**
 * The DataBuffer tracks and transforms incoming tick data based on the `transformer` provided. If no transformer
 * is provided, keeps raw data.
 * @param {*} param0 
 */
function DataBuffer(transformer = null) {
    const buffer = []

    this.push = tick => {
        let results
        if(transformer && typeof transformer === 'function') {
            results = transformer(tick)
        } else {
            results = tick
        }
        
        results.forEach(result => {

            if(this.last() 
            && this.last().timestamp.getTime() === result.timestamp.getTime()) {
                buffer.pop()            
            }

            buffer.push(result)
        })
    }

    this.getData = (i = -1) => i > -1 ? buffer[i] : buffer

    this.forEach = buffer.forEach.bind(buffer)

    this.map = buffer.map.bind(buffer)

    this.reduce = buffer.reduce.bind(buffer)

    this.slice = buffer.slice.bind(buffer)

    this.indexOf = buffer.indexOf.bind(buffer)

    this.every = buffer.every.bind(buffer)

    this. filter = buffer.filter.bind(buffer)

    this.some = buffer.some.bind(buffer)

    this.last = () => buffer[buffer.length - 1]
}

Object.defineProperty(DataBuffer, 'length', {
    get() {
        return this.getData().length
    }
})

/**
 * Transforms the incoming tick stream into usable bar data.
 * @param {*} bar 
 * @returns {Array<{timestamp: Date, open: number, high: number, low: number, close: number, upVolume: number, downVolume: number, upTicks: number, downTicks: number, bidVolume: number, offerVolume: number}>} 
 */
const BarsTransformer = (response) => {
    const {bars} = response
    let results = []
    if(bars) {
        bars.forEach(bar => {
            let result = { ...bar, timestamp: new Date(bar.timestamp), price: bar.close }
            results.push(result)
        })
    }
    return results
}

/**
 * Transforms the incoming tick stream into usable tick data.
 * @param {*} response 
 * @param {*} fields 
 * @returns {Array<{subscriptionId:number, id: number, contractTickSize: number, timestamp: Date, price: number, volume: number, bidPrice: number, bidSize: number, askPrice: number, askSize: number}>}
 */
const TicksTransformer = response => {
    const {id: subId, bp, bt, ts, tks} = response
    let result = []
    tks.forEach(({t, p, s, b, a, bs, as: asks, id}) => {
        result.push({
            subscriptionId: subId,
            id,
            contractTickSize: ts,
            timestamp: new Date(bt + t),
            price: bp + p,
            volume: s,
            bidPrice: bs && (bp + b),
            bidSize: bs,
            askPrice: asks && (bp + a),
            askSize: asks
        })
    })
    return result
}

module.exports = { DataBuffer, BarsTransformer, TicksTransformer }