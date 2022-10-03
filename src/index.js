import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom'
import { UserInterface } from '@cwi/react'
const CWI = require('@cwi/core')
import MessageHandler from './components/MessageHandler.js'
import Homescreen from './pages/Homescreen/index.js'
import { Dialog } from '@mui/material'
import { ThemeProvider, StyledEngineProvider, createTheme } from '@mui/material/styles';
const theme = createTheme()

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
      <StyledEngineProvider injectFirst>
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
            maxWidth='lg'
            // style={{
            // TODO Make the dialog full 100vh height
            // (not calc(100vh - 64px))
            //   margin: '0px auto !important',
            //   maxHeight: '100vh !important'
            // }}
          >
          <UserInterface
            isFocused={() => babbageFocused}
            onFocusRequested={() => setBabbageFocused(true)}
            onFocusRelinquished={() => setBabbageFocused(false)}
            {...props}
              />
          </Dialog>
        </ThemeProvider>
      </StyledEngineProvider>
    </div>
  );
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
