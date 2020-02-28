const appData = process.env.APPDATA
const https = require('https')
const fs = require('fs')
const util = require('util')
const path = require('path')
const YAML = require('yaml')
const uplaySettingsFile = path.join(appData, '../Local/Ubisoft Game Launcher/settings.yml')
const userDataFile = path.join(appData, '../Local/Ubisoft Game Launcher/users.dat')

class Patcher {
  constructor (id, email) {
    this.id = id
    this.email = email
  }
}
