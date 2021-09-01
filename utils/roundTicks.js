
const roundTicks = (coeff, divisor, contract, variance) => {
    return +(Math.round((coeff*variance/divisor)/contract.providerTickSize) / (1/contract.providerTickSize))
}

module.exports = { roundTicks }