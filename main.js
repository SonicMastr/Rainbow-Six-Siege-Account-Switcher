const electron = require('electron')
const storage = require('electron-json-storage')
const { app, BrowserWindow } = electron
const userInfo = new (require('./js/userInfo'))()

let mainWindow

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 560,
    title: 'Siege Account Switcher'
  })

  mainWindow.loadFile('main.html')
}

app.on('ready', () => {
  storage.get('settings', (e, d) => {
    if (e) throw e

    if (!Object.keys(d).length) {
      storage.set('settings', { setup: 0, installLocation: '' }, (e) => {
        if (e) throw e

        storage.get('settings', (e, d) => {
          if (e) throw e

          console.log(d)
        })
      })
    } else {
      console.log('deleting entry')
      storage.clear((e) => {
        if (e) throw e
      })
    }
  })
  userInfo.getInfo()
  createWindow()
})
