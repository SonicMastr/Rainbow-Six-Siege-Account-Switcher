class Settings {
  constructor (storage) {
    this.setup = ''
    this.installDirectory = ''
    this.storage = storage
  }

  get () {
    return {
      setup: this.setup,
      installDirectory: this.installDirectory
    }
  }

  set (settings) {
    return new Promise((resolve, reject) => {
      this.storage.set('settings', settings, (e) => {
        if (e) reject(e)

        console.log('Updated Settings')
        this.setup = settings.setup
        this.installDirectory = settings.installDirectory
        resolve(0)
      })
    })
  }

  _loadSettings () {
    return new Promise((resolve, reject) => {
      this.storage.get('settings', (e, d) => {
        if (e) reject(e)

        if (!Object.keys(d).length) {
          this.storage.set('settings', { setup: 0, installDirectory: '' }, (e) => {
            if (e) reject(e)

            console.log('Updated Settings')
          })
        }
        this.storage.get('settings', (e, d) => {
          if (e) reject(e)

          this.setup = d.setup
          this.installDirectory = d.installDirectory
          console.log(this.setup)
          console.log(this.installDirectory)
          resolve(0)
        })
      })
    })
  }
}

module.exports = Settings
