module.exports = function drawToConsole(items, clear = true) {
    if(clear) console.clear()
    console.log(`[AutoTrade]`)
    Object.entries(items).forEach(([k, v]) => {
        console.log(`\t${k}: ${v}`)
    })
}