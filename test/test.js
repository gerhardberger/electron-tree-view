const { app, BrowserWindow } = require('electron')

app.on('ready', () => {
  let win = new BrowserWindow({ 
    width: 800, 
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      contextIsolation: false
    } 
  
  })

  win.on('closed', () => { win = null })
  win.loadURL(`file://${__dirname}/index.html`)

  // win.webContents.openDevTools({ detach: true })
})
