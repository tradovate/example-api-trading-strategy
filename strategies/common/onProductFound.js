
const onProductFound = (type, prevState, {data}) => {
    if(!data) {
        return { state: { ...prevState }, effects: [] }
    }
    else {
        const { entity } = data

        return {
            state: {
                ...prevState,
                product: entity,
            },
            effects: [{ event: `${type}/draw` }]
        }
    }
}

module.exports = { onProductFound }