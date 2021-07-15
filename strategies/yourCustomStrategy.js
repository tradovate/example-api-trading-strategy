const { Strategy } = require('../strategies/strategy')

class YourCustomStrategy extends Strategy {
    
    // // // // // // // // // // // // // // // //
    // Constructor - Initialization              //
    // // // // // // // // // // // // // // // //

    constructor(params) {
        super(params)	
        //you can place initialization logic here.
        const { socket, mdSocket } = this   //We can access initialized websockets here.
    }		

    // // // // // // // // // // // // // // // //
    // The Buy/Sell Cycle                        //
    // // // // // // // // // // // // // // // //

    tick(prevState, data) {
        super.tick(prevState, data)
        const { buffer } = this             //our data buffer.
        const { userData } = this.props     //our props are available here
        
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