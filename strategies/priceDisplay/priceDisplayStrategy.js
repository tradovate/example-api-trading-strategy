const { Strategy } = require("../strategy/strategy");

class PriceDisplayStrategy extends Strategy {

    constructor(props) {
        super(props)
    }

    init(props) {

    }

    next(prevState, [event, { data, props }]) {

    }

    static params = {
        ...super.params
    }
}

module.exports = { PriceDisplayStrategy }