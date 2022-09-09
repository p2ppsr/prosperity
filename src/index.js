import React from 'react'
import ReactDOM from 'react-dom'
import { UserInterface } from '@cwi/react'
const CWI = require('@cwi/core')

// const ENV = window.location.host.contains('localhost')
//   ? 'dev'
//   : window.location.host.contains('staging')
//     ? 'staging'
//     : 'prod'
const ENV = 'staging'
const isPackaged = false

;(async () => {
  window.CWI = CWI
  await CWI.initialize({
    stateSnapshot: localStorage.stateSnapshot,
    secretServerURL: ENV === 'dev'
      ? isPackaged
        ? 'https://staging-secretserver.babbage.systems'
        : 'http://localhost:3101'
      : ENV === 'staging'
        ? 'https://staging-secretserver.babbage.systems'
        : 'https://secretserver.babbage.systems',
    dojoURL: ENV === 'dev'
      ? isPackaged
        ? 'https://staging-dojo.babbage.systems'
        : 'http://localhost:3102'
      : ENV === 'staging'
        ? 'https://staging-dojo.babbage.systems'
        : 'https://dojo.babbage.systems',
    bridgeportResolvers: ENV === 'dev'
      ? ['http://localhost:3103']
      : ENV === 'staging'
        ? ['https://staging-bridgeport.babbage.systems']
        : undefined,
    privilegedKeyTimeout: 0
  })
  ReactDOM.render(
    <UserInterface
      saveLocalSnapshot={async () => {
        localStorage.stateSnapshot = await CWI.createSnapshot()
      }}
      removeLocalSnapshot={() => delete localStorage.stateSnapshot}
      appName='Prosperity Desktop'
      appVersion='0.1.0'
      isPackaged={isPackaged}
      env={ENV}
    />,
    document.getElementById('root')
  )
})()
