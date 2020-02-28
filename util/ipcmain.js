const fs = require('fs')
const util = require('util')

class IPCMain {
  constructor (electron, userInfo, settings, cmd) {
    this.ipc = electron.ipcMain
    this.dialog = electron.dialog
    this.settings = settings
    this.setup = this.settings.setup
    this.cmd = cmd
    this.userInfo = userInfo
    this.directory = ''
    this.steam = false
    this._init()
  }

  _init () {
    this.ipc.on('get-users', async (event) => {
      console.log('Get users')
      event.returnValue = this.userInfo.getUsers()
    })

    this.ipc.on('get-settings', async (event) => {
      console.log('Get Settings')
      event.returnValue = this.settings.get()
    })

    this.ipc.on('open-folder-dialog-steam', async (event) => {
      this.directory = await this.dialog.showOpenDialogSync({ title: 'Please Select Siege Install Directory', properties: ['openDirectory'] })
      console.log(this.directory)
      this.steam = true
      if (this.directory) {
        event.returnValue = this.directory
      } else {
        event.returnValue = null
      }
    })

    this.ipc.on('open-folder-dialog', async (event) => {
      this.directory = await this.dialog.showOpenDialogSync({ title: 'Please Select Siege Install Directory', properties: ['openDirectory'] })
      console.log(this.directory)
      if (this.directory) {
        event.returnValue = this.directory
      } else {
        event.returnValue = null
      }
    })

    this.ipc.on('save', async (event) => {
      const saved = await this.settings.set({ setup: 1, installDirectory: this.directory, steam: this.steam })
      if (saved === 0) {
        console.log('Saved Install Directory')
        event.returnValue = 'Saved Install Directory'
        return
      }
      console.log('Failed to save Install Directory')
      event.returnValue = 'Failed to save Install Directory'
    })

    this.ipc.on('copy-uplay-default-setup', async (event) => {
      try {
        const fsCopyFile = util.promisify(fs.copyFile).bind(fs)
        await fsCopyFile('./data/defaultargs/udefaultargs.dll', `${this.directory}\\defaultargs.dll`)
        event.returnValue = 0
      } catch (e) {
        console.error(e)
        event.returnValue = 1
      }
    })

    this.ipc.on('copy-uplay-default', async (event) => {
      try {
        const fsCopyFile = util.promisify(fs.copyFile).bind(fs)
        await fsCopyFile('./data/defaultargs/udefaultargs.dll', `${this.directory}\\defaultargs.dll`)
        console.log()
        event.returnValue = 'Installed Uplay Defaultargs.dll'
      } catch (e) {
        console.error(e)
        event.returnValue = e
      }
    })

    this.ipc.on('finish-setup', async (event) => {
      const saved = await this.settings.set({ setup: 1, installDirectory: this.directory, steam: this.steam })
      if (saved === 0) {
        console.log('Saved Install Directory')
        event.returnValue = 0
        return
      }
      console.log('Failed to save Install Directory')
      event.returnValue = 1
    })

    this.ipc.on('switch-uplay', async (event, id) => {
      const currentEmail = await this.userInfo.getCurrentlyLoggedIn()
      const email = await this.userInfo.checkEmail(id)
      console.log(id + email)
      if (!currentEmail) {
        console.log('gay')
        event.returnValue = [2, null]
        return
      }
      if (!email) {
        console.log('yay')
        event.returnValue = [1, currentEmail]
        return
      }
      event.returnValue = [0, currentEmail]
    })

    this.ipc.on('save-uplay', async (event, id, email) => {
      const result = await this.userInfo.saveUserSettingsYaml(id, email)
      if (result === 0) {
        if (id && email) {
          console.log(`Linked ${email} to Account id ${id}`)
          event.returnValue = `Linked ${email} to Account id ${id}`
          return
        }
        console.log(`Updated Account id ${id}`)
        event.returnValue = `Updated Account id ${id}`
      }
      if (result === 2) {
        event.returnValue = 'Could not create user directory'
      } else {
        event.returnValue = 'Could not copy data'
      }
    })
  }
}

module.exports = IPCMain
