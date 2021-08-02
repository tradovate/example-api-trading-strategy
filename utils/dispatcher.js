const deepCopy = o => {
    let r
    if(o === null) return null
    else if(Array.isArray(o) || typeof o === 'string') {
        r = o.slice()
    }
    else if(typeof o === 'object') {
        r = {}
        Object.keys(o).forEach(k => r[k] = deepCopy(o[k]))
    }
    else { r = o }
    return r
}

const pipeMiddleware = (...fns) => (model, action) => {
    let result = action
    fns.forEach(fn => {
        result = fn(model, result)
    })
    return result
}


/**
 * @template T
 * @typedef {[k: string, data: T]} Action
 */

/**
 * @template T
 * @typedef {{ id: string, state: () => T, dispatch: (action: string, data: unknown) => void}} Store
 */
  
/**
 * @template T
 * @template A
 * @template B
 * @param {{
 *  id: string
 *  model: T
 *  reducer: (model: T, action: Action<A>) => T
 *  mw: (model: T, action: Action<A>) => Action<B>
 * }} param0 
 * @returns {Store<T>}
 */
const dispatcher = ({model = null, reducer = null, mw = null}) => {
    let store = { state: deepCopy(model) || {}, effects: [] } 
    const queue = []
    let dispatching = false
    
    const state = () => store.state
    const effects = () => store.effects  
    
    //[event: string, data?: any]
    const dispatch = (event, data) => { 
        const action = [event, data]
        
        // console.log('[dispatch.state() value]: ' +JSON.stringify(state(), null, 2))
        // console.log('[raw dispatcher store value]: ' +JSON.stringify(store, null, 2))
        // console.log('[FROM DISPATCHER -- EVT]: ' + event)
        // console.log('[FROM DISPATCHER - DATA]: ' + JSON.stringify(data, null, 2))

        if(dispatching) {
            queue.push(action)
            return
        }
        dispatching = true
        let result = action
        
        if(mw && typeof mw === 'function') {
            result = mw(store.state, action)
        }
        if(reducer) {
            store = reducer(store.state, result)
        }

        while(queue.length > 0) {
            let a = queue.pop()
            result = mw(store.state, a)
            if(reducer)
                store = reducer(store.state, result)
        }      
        dispatching = false
    }    
    
    return { state, effects, dispatch }
}

module.exports = { dispatcher, pipeMiddleware }
  