const appData = process.env.APPDATA
const https = require('https')
const fs = require('fs')
const path = require('path')

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
      return new Promise((resolve, reject) => {
        this.storage.set('users', { userIds: this.userIds, userObjects: this.userObjects }, (e) => {
          if (e) reject(e)

          console.log('Updated Users')
          resolve(0)
        })
      })
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

  async _saveInfo (info) {
    return new Promise((resolve, reject) => {
      this.storage.set('settings', info, (e) => {
        if (e) reject(e)

        console.log('Saved Users')
        resolve(0)
      })
    })
  }

  _request (a) {
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
    const userDataFile = path.join(appData, '../Local/Ubisoft Game Launcher/users.dat')
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
