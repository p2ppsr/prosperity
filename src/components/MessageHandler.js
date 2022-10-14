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
      if (call.indexOf('.') !== -1) {
        func = CWI[call.split('.')[0]][call.split('.')[1]]
      } else {
        func = CWI[call]
      }
      try {
        const result = await func({
          ...e.data.params,
          originator: e.origin
        })
        e.source.postMessage({
          type: 'CWI', result, id: e.data.id
        }, e.origin)
      } catch (error) {
        e.source.postMessage({
          type: 'CWI',
          id: e.data.id,
          status: 'error',
          code: error.code || 'ERR_UNKNOWN',
          description: error.message
        }, e.origin)
      }
    })
  }, [])

  return null
}

export default MessageHandler
