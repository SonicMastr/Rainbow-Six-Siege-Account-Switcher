const appData = process.env.APPDATA
const https = require('https')
const fs = require('fs')
const path = require('path')

class UserInfo {
  constructor () {
    this.userIds = null
  }

  getInfo () {
    const userDataFile = path.join(appData, '../Local/Ubisoft Game Launcher/users.dat')
    this.userIds = fs.readFileSync(userDataFile, 'utf8').match(/(?<=\$).{36}/gm)
    this.userIds.forEach(a => {
      https.get(`https://r6tab.com/api/player.php?p_id=${a}`, (resp) => {
        let data = ''
        resp.on('data', (chunk) => {
          data += chunk
        })
        resp.on('end', () => {
          const info = JSON.parse(data)
          console.log(`User ID: ${a}`)
          console.log('Username: ' + info.p_name)
          console.log('Level: ' + info.p_level)
          console.log(`User Avatar: https://ubisoft-avatars.akamaized.net/${a}/default_tall.png`)
        })
      }).on('error', (err) => {
        console.log('Error: ' + err.message)
      })
    })
  }
}

module.exports = UserInfo
