module.exports = function drawToConsole(items) {
    console.clear()
    console.log(`[Tradobot]`)
    Object.entries(items).forEach(([k, v]) => {
        console.log(`\t${k}: ${v}`)
    })
}