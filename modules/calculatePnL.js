module.exports = function calculatePnL({price, position, product}) {

    if(position.netPos === 0 && position.prevPos === 0) return 0

    let vpp = product.valuePerPoint

    let buy = position.netPrice || position.prevPrice || 0

    return pl = (price - buy) * vpp * (position.netPos || position.prevPos)    
}