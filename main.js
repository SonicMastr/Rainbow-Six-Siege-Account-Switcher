const electron = require('electron')
const { app, BrowserWindow } = electron
const storage = require('electron-json-storage')
const userInfo = new (require('./js/userInfo'))(storage)
const settings = new (require('./js/settings'))(storage)
const cmd = new (require('./js/cmd'))()
const ipc = new (require('./js/ipcmain'))(electron, userInfo, settings)

let mainWindow

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 560,
    title: 'Siege Account Switcher',
    webPreferences: {
      nodeIntegration: true
    }
  })

  mainWindow.loadFile('main.html')
}

async function _init () {
  console.log(await cmd.closeUplay())
  console.log(await cmd.closeSiegeDX11())
  console.log(await cmd.closeSiegeVulkan())
  console.log(await userInfo._loadInfo())
  console.log(await settings._loadSettings())
  if (settings.installDirectory) { cmd.setPath(settings.installDirectory + '\\') }
  console.log(settings.get(settings))
  console.log(cmd.getPath())
  // await settings.set({ setup: 0, installDirectory: "C:\\Program Files (x86)\\Steam\\steamapps\\common\\Tom Clancy's Rainbow Six Siege" })
  console.log(process.versions.electron)
  // console.log(settings.get(settings))
}

app.on('ready', async () => {
  await _init()
  createWindow()
})
