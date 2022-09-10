import { useEffect } from 'react'
const CWI = require('@cwi/core')

const MessageHandler = () => {
  useEffect(() => {
    /*
      {
        type: 'CWI',
        call: 'ninja.getPaymail',
        params: {},
        id: 'fooisabar'
      }
    */
    window.addEventListener('message', async e => {
      if (e.data.type !== 'CWI' || !e.isTrusted) return
      const call = e.data.call
      let func
      if (call === 'listFunctions') {
        const funcs = []
        const objs = []
        Object.keys(CWI).forEach(x => {
          if (typeof CWI[x] === 'function') {
            funcs.push(x)
          } else {
            objs.push(x)
          }
        })
        objs.forEach(x => {
          Object.keys(CWI[x]).forEach(y => {
            funcs.push(`${x}.${y}`)
          })
        })
        e.source.postMessage({
          type: 'CWI', result: funcs, id: e.data.id
        }, e.origin)
        return
      } else if (call.indexOf('.') !== -1) {
        func = CWI[call.split('.')[0]][call.split('.')[1]]
      } else {
        func = CWI[call]
      }
      const result = await func({
        ...e.data.params,
        originator: e.origin
      })
      e.source.postMessage({
        type: 'CWI', result, id: e.data.id
      }, e.origin)
    })
  }, [])

  return null
}

export default MessageHandler
