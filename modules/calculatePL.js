
const startCalculatePL = (contract, socket, mdSocket) => {
    
    socket.onSync(({positions, products}) => {

        let pos = positions.find(p => p.contractId === contract.id)

        let item = products.find(p => p.name === symbol.slice(0, 3))
            item ||= products.find(p => p.name === symbol.slice(0, 2))
            item ||= products.find(p => p.name === symbol.slice(0, 4))    

        let vpp = item.valuePerPoint    
    
        await mdSocket.subscribeQuote(symbol, ({Trade}) => {

            let buy = pos.netPrice ? pos.netPrice : pos.prevPrice
            const { price } = Trade            

            let pl = (price - buy) * vpp * pos.netPos 
            console.log(`[Tradobot]: Open P&L for ${symbol}:\t\t$${pl.toFixed(2)}`)
            
        })        
    })
}

module.exports = { startCalculatePL }