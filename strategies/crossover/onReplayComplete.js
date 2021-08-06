const onReplayComplete = (prevState,{data, props}) => {
    console.log('[CALLED ONREPLAYCOMPLETE HANDLER]')
    return {
        state: prevState,
        effects: [
            { 
                event: 'replay/drawStats',
                data: {
                    data, props
                }
            }
        ]
    }
}

module.exports = { onReplayComplete }