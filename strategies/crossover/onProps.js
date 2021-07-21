const { RobotMode } = require("./robotMode")

const onProps = (prevState, {data, props}) => {
    const { eventType, entityType, entity } = data
    
    if(entityType === EntityType.Position && eventType === 'Updated') {
        const { netPos } = entity
        return {
            ...prevState,
            mode: 
                netPos > 0  ? RobotMode.Long
            :   netPos < 0  ? RobotMode.Short
            :   /*else*/      RobotMode.Watch,
            position: entity
        }
    }

    if(entityType === EntityType.Product && contract.name.startsWith(entity.name)) {
        return {
            ...prevState,
            product: entity
        }
    }

    return prevState
}

module.exports = { onProps }