import React, { useCallback, useState } from 'react'
import Draggable from 'react-draggable'
import {
  TextField, Button, Card, DialogTitle, Typography
} from '@mui/material'
import style from './style'
import { makeStyles } from '@mui/styles'
const useStyles = makeStyles(style, {
  name: 'Homescreen'
})

const getWindowID = () => Buffer.from(require('crypto').randomBytes(8)).toString('base64')

const Window = React.memo(({
  classes,
  id,
  title,
  url,
  onFocus,
  focused,
  onMinimize,
  minimized,
  onClose
}) => {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [oldPosition, setOldPosition] = useState({})
  const [maximized, setMaximized] = useState(true)
  return (
    <Draggable
      handle={`.${classes.window_title_text}`}
      defaultPosition={{ x: 20, y: 20 }}
      position={position}
      onDrag={x => {
        setPosition(x)
        console.log(x)
      }}
      disabled={maximized}
    >
      <Card
        className={
        minimized
          ? classes.hidden_window
          : focused
            ? maximized
              ? classes.maximized_focused_window
              : classes.focused_window
            : maximized
              ? classes.maximized_window
              : classes.window
      }
        elevation={24}
        onClick={() => onFocus(id)}
      >
        <div className={classes.window_inner}>
          <div
            className={classes.window_title_bar}
          >
            <Typography className={classes.window_title_text}>
              {title}
            </Typography>
            <div className={classes.button_wrap}>
              <Button
                onClick={e => {
                  e.stopPropagation()
                  onMinimize(id)
                }}
              >
                ▁
              </Button>
              <Button
                onClick={e => {
                  e.stopPropagation()
                  if (!maximized) {
                    setOldPosition(position)
                    setPosition({ x: 0, y: 0 })
                    setMaximized(true)
                  } else {
                    setPosition(oldPosition)
                    setMaximized(false)
                  }
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
          </div>
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
  )
})

const Homescreen = ({
  babbageAuthenticated,
  babbageFocused,
  setBabbageFocused
}) => {
  const [windows, setWindows] = useState([])
  const [newWindowURL, setNewWindowURL] = useState(
    'https://projectbabbage.com'
  )
  const classes = useStyles()
  const [focusedWindow, setFocusedWindow] = useState(null)

  const addWindow = useCallback(url => {
    const id = getWindowID()
    setWindows(windows => {
      const newWindows = windows.concat({
        title: new URL(url).host,
        URL: url,
        id,
        minimized: false
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

  const minimizeWindow = useCallback(id => {
    setWindows(windows => {
      const newWindows = [...windows]
      for (const wind of newWindows) {
        if (wind.id === id) {
          wind.minimized = true
          if (id === focusedWindow) {
            // TODO: Track focus history, return to previously-focused window
            setFocusedWindow(null)
          }
        }
      }
      return newWindows
    })
  }, [focusedWindow])

  const onTaskbarWindowClicked = useCallback(id => {
    setWindows(windows => {
      const newWindows = [...windows]
      for (const wind of newWindows) {
        if (wind.id === id) {
          if (wind.minimized) { // If minimized, restore and focus
            wind.minimized = false
            setFocusedWindow(wind.id)
          } else if (wind.id === focusedWindow) { // If focused, minimize
            wind.minimized = true
            // TODO: Track focus history, return to previously-focused window
            setFocusedWindow(null)
          } else { // Otherwise, focus
            setFocusedWindow(wind.id)
          }
        }
      }
      return newWindows
    })
  }, [focusedWindow])

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
            onMinimize={minimizeWindow}
            minimized={w.minimized}
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
        {babbageAuthenticated
          ? (
            <>
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
            </>
            )
          : (
            <>
              <Typography
                color='white'
                variant='h2'
                align='center'
                paragraph
              >
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
            </>
            )}
      </center>
      <div className={classes.taskbar}>
        <Button
          onClick={() => setBabbageFocused(true)}
          color='primary'
          variant='contained'
          size='large'
          style={{
            textTransform: 'capitalize'
          }}
        >
          BabbageOS
        </Button>
        {windows.map((w, i) => (
          <div
            onClick={() => onTaskbarWindowClicked(w.id)}
            key={i}
            className={
              w.id === focusedWindow
                ? classes.focused_taskbar_window
                : classes.taskbar_window
            }
          >
            {w.title}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Homescreen
