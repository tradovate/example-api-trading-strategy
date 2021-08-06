
const onProductFound = (prevState, {data}) => {

    const { entity } = data

    return {
        state: {
            ...prevState,
            product: entity,
        },
        effects: [{ event: 'crossover/draw' }]
    }
}

module.exports = { onProductFound }