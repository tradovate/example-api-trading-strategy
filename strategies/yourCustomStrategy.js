// yourCustomStrategy.js

const { pressEnterToContinue } 	= require("../modules/enterToContinue")
const { MarketDataSocket } 		= require("../websocket/MarketDataSocket")
const { TradovateSocket } 		= require("../websocket/TradovateSocket")
const { Strategy } 				= require('../strategies/strategy')
const { waitUntil } 			= require("../modules/waitUntil")

// // // // // // // // // // // // // // // //
// Instantiate WebSockets                    //
// // // // // // // // // // // // // // // //
const socket = new TradovateSocket()
const mdSocket = new MarketDataSocket()

class YourCustomStrategy extends Strategy {
    
    // // // // // // // // // // // // // // // //
    // Constructor - Initialization              //
    // // // // // // // // // // // // // // // //

    constructor(params) {
        super(params)
	
      	//we can't use 'await' in a constructor, but .then chaining does the trick.
    	Promise.all([							// Promise.all waits for
            socket.connect(process.env.WS_URL), // each promise in the given
            mdSocket.connect(process.env.MD_URL)// array to resolve
        ])
        .then(() => socket.synchronize())		// then we want to sync our user data
        .then(res => {							// using socket.synchronize(), a
            this.initialized = true				// provided function that requests
            this.props.userData = res			// user/syncrequest via the socket.
        }) 	// Reminder: we need to set this.initialized 
    }		// to true somewhere in the constructor.

    // // // // // // // // // // // // // // // //
    // The Buy/Sell Cycle                        //
    // // // // // // // // // // // // // // // //

    async run() {
      
        //You can access the parameters you've set for this strategy as 
        //this.props from within the run function
        const { yourCoolParameter, userData, contract } = this.props
        
        //clear the console, if you like. That's how the CrossoverStrategy draws to the terminal.
		console.clear()
      
        //built in control flow helper, provide it a function that returns a boolean.
        //this particular application is wholly unnecessary, as the main loop already
        //waits for your strategy to be initialized before calling Strategy.run().
        //Therefore, this waitUntil will simply proceed to the next operation.
        await waitUntil(() => this.initialized)

      	//this will be logged to the terminal.
        console.log('Override my behavior in the run() function.')

        //we can use `getChart` to request a realtime subscription to ticks or bars
        const dataSubscription = await mdSocket.getChart({
            symbol: contract.name,                  //contract is a built-in strategy param
            chartDescription: {                     //that gets assigned in configureRobot.
                underlyingType: 'MinuteBar',        //'Tick' will give tick stream
                elementSize: 1,                     //if the type is 'Tick', this must be 1
                elementSizeUnit: "UnderlyingUnits",
            },
            timeRange: {
                asManyAsElements: 10                //will look back as far as X elements. 
                                                    //will receive realtime data afterward   
            }
        }, async ({bars}) => {
            // decision making logic here, keep in mind we only want to call one function per
            // bar/tick/your timeframe, and we probably want to halt the loop when it comes
            // time to placing orders, so we don't place a bunch in succession and lock 
            // ourselves out of the API.
        })

        //control flow helper, internally uses waitUntil to find out whether the user pressed enter.
        await pressEnterToContinue('exit') //instead of 'continue' prints 'exit'
        //cleanup our subscription
        dataSubscription()

    }

    // // // // // // // // // // // // // // // //
    // Parameter Definitions                     //
    // // // // // // // // // // // // // // // //

    //we use the params object to define how the configureRobot module parameterizes your strategy
    //currently supports 'string' 'float' and 'int' parsing options.
    static params = {
        ...super.params,
        yourCoolParameter: 'float' 
    }

}

module.exports = { YourCustomStrategy }