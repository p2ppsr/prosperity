import React, { useCallback, useState } from 'react'
import Draggable from 'react-draggable'
import {
  TextField, Button, Card, DialogTitle, Typography
} from '@material-ui/core'
import style from './style'
import { makeStyles } from '@material-ui/styles'
const useStyles = makeStyles(style, {
  name: 'Homescreen'
})

const getWindowID = () => Buffer.from(require('crypto').randomBytes(8)).toString('base64')

const Window = React.memo(({
  classes, id, title, url, onFocus, onClose, focused
}) => (
  <Draggable
    handle={`.${classes.window_title_bar}`}
    defaultPosition={{ x: 20, y: 20 }}
    bounds='parent'
  >
    <Card
      className={focused ? classes.focused_window : classes.window}
      elevation={24}
      onClick={() => onFocus(id)}
    >
      <div className={classes.window_inner}>
        <DialogTitle
          className={classes.window_title_bar}
        >
          {title}
          <div className={classes.button_wrap}>
            <Button
              onClick={e => {
                e.stopPropagation()
                onClose(id)
              }}
            >
              ▁
            </Button>
            <Button
              onClick={e => {
                e.stopPropagation()
                onClose(id)
              }}
            >
              🬀
            </Button>
            <Button
              color='secondary'
              onClick={e => {
                e.stopPropagation()
                onClose(id)
              }}
            >
              ✗
            </Button>
          </div>
        </DialogTitle>
        <iframe
          src={url}
          className={classes.frame}
          seamless
          allow='camera;microphone;fullscreen;geolocation'
          frameBorder={0}
        />
      </div>
    </Card>
  </Draggable>
))

const Homescreen = ({
  babbageAuthenticated,
  babbageFocused,
  setBabbageFocused
}) => {
  const [windows, setWindows] = useState([])
  const [newWindowURL, setNewWindowURL] = useState(
    'https://convo.babbage.systems'
  )
  const classes = useStyles()
  const [focusedWindow, setFocusedWindow] = useState(null)

  const addWindow = useCallback(url => {
    const id = getWindowID()
    setWindows(windows => {
      const newWindows = windows.concat({
        title: 'New Window',
        URL: url,
        id: id
      })
      return newWindows
    })
    setFocusedWindow(id)
  }, [])

  const closeWindow = useCallback(id => {
    setWindows(windows => {
      let newWindows = [...windows]
      newWindows = [...newWindows.filter(x => x.id !== id)]
      return newWindows
    })
  }, [])

  if (!babbageAuthenticated) {
    return (
      <center>
        <br />
        <br />
        <br />
        <Typography variant='h2' align='center' paragraph>
          Welcome to Prosperity Desktop
        </Typography>
        <br />
        <br />
        <Button
          onClick={() => setBabbageFocused(true)}
          color='primary'
          variant='contained'
          size='large'
        >
          Start
        </Button>
      </center>
    )
  }

  return (
    <div className={classes.homescreen_bg}>
      {windows.map((w, i) => {
        if (typeof w !== 'object') {
          return null
        }
        return (
          <Window
            key={w.id}
            id={w.id}
            onFocus={() => setFocusedWindow(w.id)}
            onClose={closeWindow}
            classes={classes}
            url={w.URL}
            title={w.title}
            focused={focusedWindow === w.id}
          />
        )
      })}
      <center>
        <br />
        <br />
        <br />
        <TextField
          onChange={e => setNewWindowURL(e.target.value)}
          defaultValue={newWindowURL}
        />
        <br />
        <br />
        <Button
          onClick={() => addWindow(newWindowURL)}
          color='primary'
          variant='contained'
          size='large'
        >
          Add Window
        </Button>
        <br />
        <br />
        <Button
          onClick={() => setBabbageFocused(true)}
          color='primary'
          variant='contained'
          size='large'
        >
          Babbage
        </Button>
      </center>
    </div>
  )
}

export default Homescreen
