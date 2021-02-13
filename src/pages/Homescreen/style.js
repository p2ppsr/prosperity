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
    color: 'white !important',
    cursor: 'arrow !important',
    userSelect: 'none',
    '& > h2': {
      display: 'grid',
      gridTemplateColumns: '1fr auto'
    }
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
  window_inner: {
    display: 'grid',
    gridTemplateRows: 'auto 1fr',
    height: '100%'
  },
  frame: {
    width: '100%',
    height: '100%'
  }
})
