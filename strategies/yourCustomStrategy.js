const { Strategy } = require('../strategies/strategy')

class YourCustomStrategy extends Strategy {
    
    // // // // // // // // // // // // // // // //
    // Constructor - Initialization              //
    // // // // // // // // // // // // // // // //

    /**
     * 
     * @param {this.params} params 
     */
    constructor(params) {
        super(params)	
    }		

    // // // // // // // // // // // // // // // //
    // The Buy/Sell Cycle                        //
    // // // // // // // // // // // // // // // //

    next(state, {event, data, props, api}) {
        super.next(state, {event, data, props, api})
    }

    // // // // // // // // // // // // // // // //
    // Parameter Definitions                     //
    // // // // // // // // // // // // // // // //

    //we use the params object to define how the configureRobot module parameterizes your strategy
    //currently supports 'string' 'float' and 'int' parsing options.
    static params = {
        ...super.params,
    }

}

module.exports = { YourCustomStrategy }