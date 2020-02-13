class IPCMain {
  constructor (electron, userInfo, settings) {
    this.ipc = electron.ipcMain
    this.dialog = electron.dialog
    this.settings = settings
    this.userInfo = userInfo
    this._init()
  }

  _init () {
    this.ipc.on('get-users', async (event) => {
      console.log('Get users')
      event.returnValue = this.userInfo.getUsers()
    })

    this.ipc.on('open-folder-dialog', async (event) => {
      const directory = await this.dialog.showOpenDialogSync({ title: 'Please Select Siege Install Directory', properties: ['openDirectory'] })
      console.log(directory)
      if (directory) {
        const saved = await this.settings.set({ setup: this.settings.setup, installDirectory: directory })
        if (saved === 0) {
          console.log('Saved Install Directory')
          event.returnValue = 'Saved Install Directory'
          return
        }
        console.log('Failed to save Install Directory')
        event.returnValue = 'Failed to save Install Directory'
        return
      }
      console.log('CLOSED')
      event.returnValue = 'CLOSED'
    })
  }
}

module.exports = IPCMain
