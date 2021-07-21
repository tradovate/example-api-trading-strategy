const { RobotMode } = require("./robotMode")

const onUserSync = (prevState, {data, props}) => {

    const { contract } = props
    const { positions, products } = data
    
    let product = products.find(p => contract.name.startsWith(p.name))
    const position = positions.find(pos => pos.contractId === contract.id)

    return {
        ...prevState,
        mode: 
            position && position.netPos > 0 ? RobotMode.Long 
        :   position && position.netPos < 0 ? RobotMode.Short 
        :   /*else*/                          RobotMode.Watch,
        product,
        position,
    }
}

module.exports = { onUserSync }