
const onProductFound = (prevState, {data}) => {

    const { entity } = data
    console.log('FROM PROD FOUND')
    console.log(entity)

    return {
        state: {
            ...prevState,
            product: entity,
        },
        effects: [{ event: 'crossover/draw' }]
    }
}

module.exports = { onProductFound }