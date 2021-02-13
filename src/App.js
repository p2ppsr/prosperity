import React from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import { CWIComponents, CWIRoutes } from '@cwi/react'
import Homescreen from './pages/Homescreen'
import MessageHandler from './components/MessageHandler'

const App = () => {
  return (
    <Router>
      <MessageHandler />
      <CWIComponents
        appName='Prosperity'
        mainPage='/homescreen'
        planariaToken='eyJhbGciOiJFUzI1NksiLCJ0eXAiOiJKV1QifQ.eyJzdWIiOiIxRlA4UUNNazRjWnFLYVBzcXRHZjZqZUtYeVdNVm11OUdHIiwiaXNzdWVyIjoiZ2VuZXJpYy1iaXRhdXRoIn0.SDBGcmd1czFuaTZ3TGl3WHN6djF4NEhuQ2RmVCtXL3dPKzd0bVFnWTg1Mzhiak92RTlVdy9ZdjRHWnFHYTh4WThTcjFTZnRDZ3FKbHVjbzVwcUt1dXM0PQ'
        secretServerURL='https://cranky-bell-2cb9ac.netlify.app/'
        dojoURL='https://musing-davinci-12f9ff.netlify.app/'
      />
      <Switch>
        <Route component={Homescreen} path='/homescreen' />
        <CWIRoutes />
      </Switch>
    </Router>
  )
}

export default App
