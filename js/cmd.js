const util = require('util')
const exec = util.promisify(require('child_process').exec)
const execFile = util.promisify(require('child_process').execFile)

class CMD {
  constructor () {
    this.uplayExe = 'upc.exe'
    this.DX11Exe = 'RainbowSix.exe'
    this.VulkanExe = 'RainbowSix_Vulkan.exe'
    this.path = ''
  }

  setPath (path) {
    this.path = path
  }

  getPath () {
    return this.path
  }

  closeUplay () {
    return this._close(this.uplayExe)
  }

  closeSiegeDX11 () {
    return this._close(this.DX11Exe)
  }

  closeSiegeVulkan () {
    return this._close(this.VulkanExe)
  }

  openSiegeDX11 () {
    return this._open(this.DX11Exe, this.path)
  }

  openSiegeVulkan () {
    return this._open(this.VulkanExe, this.path)
  }

  async _close (exe) {
    try {
      await exec(`taskkill /F /IM ${exe}`)
      return 0
    } catch (e) {
      return e.code
    }
  }

  async _open (exe, path) {
    try {
      await execFile(path + exe)
      return 0
    } catch (e) {
      console.log(e)
      return 1
    }
  }
}

module.exports = CMD
