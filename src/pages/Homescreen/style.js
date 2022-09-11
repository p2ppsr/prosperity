export default theme => ({
  '@global html, body': {
    margin: '0px',
    padding: '0px',
    height: '100%',
    overflow: 'hidden'
  },
  homescreen_bg: {
    backgroundColor: 'darkgreen',
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
    position: 'absolute',
    padding: '0px',
    margin: '0px',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  },
  window_title_bar: {
    backgroundColor: 'lightblue',
    cursor: 'arrow !important',
    userSelect: 'none',
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    alignItems: 'center'
  },
  window_title_text: {
    fontWeight: 'bold',
    marginLeft: '0.5em'
  },
  window: {
    width: '60em',
    height: '40em',
    position: 'absolute',
    zIndex: 1
  },
  focused_window: {
    width: '60em',
    height: '40em',
    position: 'absolute',
    zIndex: 5
  },
  maximized_window: {
    width: '100vw',
    height: 'calc(100vh - 3em)',
    left: '0px',
    top: '0px',
    position: 'fixed',
    zIndex: 1
  },
  maximized_focused_window: {
    width: '100vw',
    height: 'calc(100vh - 3em)',
    left: '0px',
    top: '0px',
    position: 'fixed',
    zIndex: 5
  },
  hidden_window: {
    display: 'none'
  },
  window_inner: {
    display: 'grid',
    gridTemplateRows: 'auto 1fr',
    height: '100%'
  },
  frame: {
    width: '100%',
    height: '100%'
  },
  taskbar: {
    left: '0px',
    top: 'calc(100vh - 3em)',
    height: '3em',
    backgroundColor: 'yellow',
    display: 'flex',
    flexDirection: 'row',
    width: '100vw',
    alignItems: 'center',
    position: 'fixed',
    paddingLeft: '0.5em',
    zIndex: '10'
  },
  taskbar_window: {
    backgroundColor: 'grey',
    paddingLeft: '0.5em',
    paddingRight: '0.5em',
    marginLeft: '0.5em',
    marginRight: '0.5em',
    height: '2.2em',
    lineHeight: '2.2em',
    cursor: 'pointer !important',
    alignItems: 'center'
  },
  focused_taskbar_window: {
    backgroundColor: 'red',
    paddingLeft: '0.5em',
    paddingRight: '0.5em',
    marginLeft: '0.5em',
    marginRight: '0.5em',
    height: '2.2em',
    lineHeight: '2.2em',
    cursor: 'pointer !important',
    alignItems: 'center'
  }
})
