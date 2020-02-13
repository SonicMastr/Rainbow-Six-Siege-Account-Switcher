const electron = require('electron')
const { app, BrowserWindow } = electron
const storage = require('electron-json-storage')
const userInfo = new (require('./util/userInfo'))(storage)
const settings = new (require('./util/settings'))(storage)
const cmd = new (require('./util/cmd'))()
// Initiallize IPCMain
new (require('./util/ipcmain'))(electron, userInfo, settings)

let mainWindow
let loadWindow

function createMainWindow () {
  mainWindow = new BrowserWindow({
    minWidth: 1000,
    minHeight: 560,
    width: 1000,
    height: 560,
    title: 'Siege Account Switcher',
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true
    }
  })

  mainWindow.loadFile('./public/main.html')

  mainWindow.on('close', () => {
    app.quit()
  })
}

function createLoadingWindow () {
  loadWindow = new BrowserWindow({
    width: 400,
    height: 400,
    frame: false,
    title: 'Siege Account Switcher',
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: true,
      devTools: false
    }
  })

  loadWindow.loadFile('./public/load.html')
}

function updateStatus (update) {
  loadWindow.webContents.send('update', update)
}

async function _init () {
  console.log(await cmd.closeUplay())
  console.log(await cmd.closeSiegeDX11())
  console.log(await cmd.closeSiegeVulkan())
  updateStatus('Loading User Info')
  console.log(await userInfo._loadInfo())
  wait(2000)
  updateStatus('Loading Settings')
  console.log(await settings._loadSettings())
  if (settings.installDirectory) { cmd.setPath(settings.installDirectory + '\\') }
  wait(2000)
  console.log(settings.get(settings))
  updateStatus(`Install Path: ${cmd.getPath()}`)
  console.log(cmd.getPath())
  wait(2000)
  // await settings.set({ setup: 0, installDirectory: "C:\\Program Files (x86)\\Steam\\steamapps\\common\\Tom Clancy's Rainbow Six Siege" })
  console.log(process.versions.electron)
  // console.log(settings.get(settings))
}

app.on('ready', async () => {
  createLoadingWindow()
  await _init()
  loadWindow.hide()
  createMainWindow()
})

// Debugging
function wait (ms) {
  const d = new Date()
  let d2 = null
  do { d2 = new Date() }
  while (d2 - d < ms)
}
