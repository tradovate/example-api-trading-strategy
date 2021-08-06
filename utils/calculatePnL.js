module.exports = function calculatePnL({price, position, product}) {

    if(!position || !product || !price) return 0

    let vpp = product?.valuePerPoint 

    let buy = position?.netPrice || position?.prevPrice

    return (price - buy) * vpp * (position.netPos || position.prevPos || 0)    
}