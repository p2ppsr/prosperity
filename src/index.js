import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom'
import { UserInterface } from '@cwi/react'
import MessageHandler from './components/MessageHandler.js'
import Homescreen from './pages/Homescreen/index.js'
import { Dialog } from '@mui/material'
import { ThemeProvider, StyledEngineProvider, createTheme } from '@mui/material/styles'
import { DojoExpressClient } from 'ninja-base'
const CWI = require('@cwi/core')
const theme = createTheme()

const ENV = window.location.host.indexOf('localhost') !== -1
  ? 'dev'
  : window.location.host.indexOf('staging') !== -1
    ? 'staging'
    : 'prod'
const isPackaged = ENV !== 'dev'

const configureCloudDojo = (dojoChain) => {
  const serviceUrl = `https://${dojoChain === 'test' ? 'staging-' : ''}dojo.babbage.systems`
  const dojo = new DojoExpressClient(dojoChain, serviceUrl)
  const dojoSyncConfig = dojoChain === 'test' ? [] : []
  return { dojo, dojoSyncConfig }
}

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
  )
}

(async () => {
  // Set up Dojo
  const dojoChain = ENV === 'dev' || ENV === 'staging'
    ? 'test'
    : 'main'

  const { dojo, dojoSyncConfig } = configureCloudDojo(dojoChain)

  window.CWI = CWI
  await CWI.initialize({
    stateSnapshot: window.localStorage.stateSnapshot,
    dojo,
    dojoSyncConfig,
    secretServerURL: ENV === 'dev'
      ? isPackaged
        ? 'https://staging-secretserver.babbage.systems'
        : 'http://localhost:3101'
      : ENV === 'staging'
        ? 'https://staging-secretserver.babbage.systems'
        : 'https://secretserver.babbage.systems',
    confederacyHost: ENV === 'dev'
      ? 'http://localhost:3103'
      : ENV === 'staging'
        ? 'https://staging-confederacy.babbage.systems'
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
