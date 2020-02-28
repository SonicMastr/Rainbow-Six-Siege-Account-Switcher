const appData = process.env.APPDATA
const https = require('https')
const fs = require('fs')
const util = require('util')
const path = require('path')
const YAML = require('yaml')
const uplaySettingsFile = path.join(appData, '../Local/Ubisoft Game Launcher/settings.yml')
const userDataFile = path.join(appData, '../Local/Ubisoft Game Launcher/users.dat')

class UserInfo {
  constructor (storage) {
    this.userIds = null
    this.userObjects = []
    this.storage = storage
  }

  getUsers () {
    return this.userObjects
  }

  async getInfo () {
    if (!Object.keys(this.userObjects).length) {
      await this._loadInfo(true)
    }
    return new Promise((resolve) => resolve({ userIds: this.userIds, userObjects: this.userObjects }))
  }

  async _loadInfo (update) {
    const data = await new Promise((resolve, reject) => {
      this.storage.get('users', (e, d) => {
        if (e) reject(e)

        resolve(d)
      })
    })

    if (!Object.keys(data).length || update) {
      await this._update()
      await this._saveUsers()
    } else {
      this.userIds = data.userIds
      this.userObjects = data.userObjects
      console.log(data.userIds)
      console.log(data.userObjects)
      return new Promise(resolve => { resolve(0) })
    }
  }

  _clearInfo () {
    this.storage.clear('users')
  }

  async checkEmail (a) {
    let userEmail = ''
    const index = this.getUsers().findIndex(user => user.userID === a)
    if (index >= 0) {
      userEmail = await this.getUsers()[index].userEmail
      console.log(this.getUsers()[index])
      if (!userEmail) {
        userEmail = ''
      }
    }
    return new Promise((resolve) => resolve(userEmail))
  }

  async getUserByID (a) {
    let user = ''
    const index = this.getUsers().findIndex(user => user.userID === a)
    if (index >= 0) {
      user = await this.getUsers()[index]
      console.log(this.getUsers()[index])
    }
    return new Promise((resolve) => resolve(user))
  }

  async getCurrentlyLoggedIn () {
    let currentEmail = ''
    const fsRead = util.promisify(fs.readFile).bind(fs)
    const yamlData = await fsRead(uplaySettingsFile, 'utf8')
    const currentSettings = YAML.parse(yamlData)
    // console.log(currentSettings)
    if (currentSettings.user.username) {
      currentEmail = currentSettings.user.username
      console.log(currentEmail)
      return new Promise((resolve) => resolve(currentEmail))
    }
    return new Promise((resolve) => resolve(currentEmail))
  }

  async saveUserSettingsYaml (id, email) {
    if (!fs.existsSync(`./data/users/${id}`)) {
      fs.mkdirSync(`./data/users/${id}`)
      if (!fs.existsSync(`./data/users/${id}`)) return 2
    }
    const user = await this.getUserByID(id)
    if (!user.userEmail) {
      this.userObjects.find(user => user.userID === id).userEmail = email
      this._saveUsers()
      console.log(this.userObjects)
    }
    try {
      const fsCopyFile = util.promisify(fs.copyFile).bind(fs)
      await fsCopyFile(uplaySettingsFile, `./data/users/${id}/settings.yml`)
      return 0
    } catch (e) {
      console.error(e)
      return 1
    }
  }

  async _saveInfo (info) {
    return new Promise((resolve, reject) => {
      this.storage.set('settings', info, (e) => {
        if (e) reject(e)

        console.log('Saved Users')
        resolve(0)
      })
    })
  }

  async _saveUsers () {
    return new Promise((resolve, reject) => {
      this.storage.set('users', { userIds: this.userIds, userObjects: this.userObjects }, (e) => {
        if (e) reject(e)

        console.log('Updated Users')
        resolve(0)
      })
    })
  }

  async _request (a) {
    let userEmail = await this.checkEmail(a)
    if (userEmail === null) {
      userEmail = ''
    }
    return new Promise((resolve, reject) => {
      https.get(`https://r6tab.com/api/player.php?p_id=${a}`, (resp) => {
        let data = ''
        resp.on('data', (chunk) => {
          data += chunk
        })
        resp.on('end', () => {
          const info = JSON.parse(data)
          resolve({
            userID: a,
            userName: info.p_name,
            userEmail: userEmail,
            userLevel: info.p_level,
            userAvatar: `https://ubisoft-avatars.akamaized.net/${a}/default_tall.png`
          })
        })
      }).on('error', (err) => {
        console.log('Error: ' + err.message)
        reject({
          error: 'Failed to get User Info',
          message: err.message
        })
      })
    })
  }

  async _update () {
    const yes = await this._updateInfo()
    console.log(yes)
    return 0
  }

  async _updateInfo () {
    this.userIds = fs.readFileSync(userDataFile, 'utf8').match(/(?<=\$).{36}/gm)
    for (let i = 0; i < this.userIds.length; i++) {
      const a = this.userIds[i]
      const userObject = await this._request(a)
      if (userObject.error) {
        this.userObjects[i] = null
        continue
      }
      this.userObjects[i] = userObject
    }
    return new Promise((resolve) => resolve(this.userObjects))
  }
}

module.exports = UserInfo
