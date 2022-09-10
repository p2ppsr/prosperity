import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom'
import { UserInterface } from '@cwi/react'
const CWI = require('@cwi/core')
import MessageHandler from './components/MessageHandler.js'
import Homescreen from './pages/Homescreen/index.js'
import { Dialog } from '@material-ui/core'
import { ThemeProvider, createMuiTheme } from '@material-ui/core/styles'
const theme = createMuiTheme();


// const ENV = window.location.host.contains('localhost')
//   ? 'dev'
//   : window.location.host.contains('staging')
//     ? 'staging'
//     : 'prod'
const ENV = 'staging'
const isPackaged = false

const App = props => {
  const [babbageFocused, setBabbageFocused] = useState(false)
  const [babbageAuthenticated, setBabbageAuthenticated] = useState(false)

  useEffect(() => {
    (async () => {
      await window.CWI.waitForAuthentication()
      setBabbageAuthenticated(true)
    })()
  }, [])
  
  return (
    <div>
      <ThemeProvider theme={theme}>
      <MessageHandler />
      <Homescreen
        babbageAuthenticated={babbageAuthenticated}
        babbageFocused={babbageFocused}
        setBabbageFocused={setBabbageFocused}
      />
      <Dialog
        open={babbageFocused}
        onClose={() => setBabbageFocused(false)}
        keepMounted
        fullWidth
        maxWidth="lg"
      >
        <UserInterface
          isFocused={() => babbageFocused}
          onFocusRequested={() => setBabbageFocused(true)}
          onFocusRelinquished={() => setBabbageFocused(false)}
          {...props}
        />
        </Dialog>
      </ThemeProvider>
    </div>
  )
}

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

  // TEMP — remove when Authrite is fixed
  try {
    if (await window.CWI.isAuthenticated()) {
      await window.CWI.getNinja().getAvatar()
    }
  } catch (e) {}

  ReactDOM.render(
    <App
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
