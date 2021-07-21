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
    let store = deepCopy(model) || {}
    const queue = []
    let dispatching = false
    
    const state = () => store  
    
    //[k: string, data?: any]
    const dispatch = (event, data) => { 
        const action = [event, data]

        if(dispatching) {
            queue.push(action)
            return
        }
        dispatching = true
        let result = action
        
        if(mw && typeof mw === 'function') {
            result = mw(store, action)
        }
        if(reducer)
            store = reducer(store, result)

        while(queue.length > 0) {
            let a = queue.pop()
            result = mw(store, a)
            if(reducer)
                store = reducer(store, result)
        }      
        dispatching = false
    }    
    
    return { state, dispatch }
}

module.exports = { dispatcher, pipeMiddleware }
  