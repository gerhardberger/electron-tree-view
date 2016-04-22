'use strict'

const electron = require('electron')

electron.app.on('ready', () => {
  var win = new electron.BrowserWindow({ width: 800, height: 600 })

  win.on('closed', () => { win = null })
  win.loadURL(`file://${__dirname}/index.html`)

  // win.webContents.openDevTools({ detach: true })
})
