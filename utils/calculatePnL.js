module.exports = function calculatePnL({price, position, product}) {

    let vpp = product?.valuePerPoint

    let buy = position?.netPrice || position?.prevPrice

    return (price - buy) * vpp * (position.netPos || position.prevPos)    
}