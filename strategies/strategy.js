const { pressEnterToContinue } = require("../modules/enterToContinue")
const { MarketDataSocket } = require("../websocket/MarketDataSocket")
const { TradovateSocket } = require("../websocket/TradovateSocket")

class Strategy {
    constructor(props) {
        const socket = new TradovateSocket()
        const mdSocket = new MarketDataSocket()

        this.initialized = false
        this.props = props

    	Promise.all([							
            socket.connect(process.env.WS_URL), 
            mdSocket.connect(process.env.MD_URL)
        ])
        .then(() => socket.synchronize())		
        .then(res => {							
            this.initialized = true				
            this.props.userData = res			
        })
    }

    /** 
     * Used to update the `this.props.userData` field. Once this has completed, your userData should be synchronized.
     * However, try not to call this too often. Multiple times per second can give you a Too Many Requests error.
     */
    async updateUserData() {
        this.props.userData = await socket.synchronize()
    }

    async run() {
        console.log('Override me in yourCustomStrategy.js!')
        await pressEnterToContinue()
    }

    //all strategies have contract available in their params
    static params = {
        contract: 'object'
    }
}

module.exports = { Strategy }