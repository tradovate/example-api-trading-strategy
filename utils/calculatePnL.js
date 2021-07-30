module.exports = function calculatePnL({price, position, product}) {

    if(!product || (position.netPos === 0 && position.prevPos === 0)) 
    return 0

    let vpp = product?.valuePerPoint
    if(!vpp) return 0

    let buy = position?.netPrice || position?.prevPrice
    if(!buy) return 0

    return (price - buy) * vpp * (position.netPos || position.prevPos)    
}