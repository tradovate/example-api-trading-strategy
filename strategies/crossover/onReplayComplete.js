const { TdEvent } = require("../strategy/tdEvent")

const onReplayComplete = (prevState,{data, props}) => {
    return {
        state: prevState,
        effects: [
            { 
                event: TdEvent.ReplayDrawStats,
                data: {
                    data, props
                }
            }
        ]
    }
}

module.exports = { onReplayComplete }