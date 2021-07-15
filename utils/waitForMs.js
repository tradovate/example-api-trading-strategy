const waitForMs = ms => {
    if(ms > 1000) console.log(`Waiting for ${ms/1000}s`)
    return new Promise(res => {
        setTimeout(() => res(), ms)
    })
}

module.exports = { waitForMs }