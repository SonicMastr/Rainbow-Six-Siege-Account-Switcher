const electron = require('electron')
const ipc = electron.ipcRenderer
const dropdown = document.getElementById('myDropdown')
const avatarDiv = document.getElementById('avatar-img')
const name = document.getElementById('userName')
const level = document.getElementById('userLevel')
const userinfo = document.getElementById('user-info')
const userSwitch = document.getElementById('switch-button')
const status = document.getElementById('status')
const promptScreen = document.getElementById('prompt-screen')
const promptContinue = document.getElementById('continue')
const promptWrong = document.getElementById('wrong')
const mainDiv = document.getElementById('main-div')
let email = ''

window.addEventListener('load', () => {
  loadUsers()
  document.getElementById('uplay-button').addEventListener('click', toggleDropdown)
  document.getElementById('steam-button').addEventListener('click', setSteam)
  userSwitch.addEventListener('click', switchAccountsUplay)
  promptContinue.addEventListener('click', continueButton)
})

function toggleDropdown () {
  dropdown.classList.toggle('show')
}

function loadUsers () {
  const settings = ipc.sendSync('get-settings')
  const users = ipc.sendSync('get-users')
  if (settings.steam) {
    document.getElementById('steam-button').classList.remove('disabled')
  }
  for (let i = 0; i < users.length; i++) {
    const entry = document.createElement('a')
    entry.setAttribute('href', '#')
    entry.setAttribute('userID', users[i].userID)
    entry.setAttribute('userLevel', users[i].userLevel)
    entry.setAttribute('avatar', users[i].userAvatar)
    entry.classList.add('user')
    entry.innerHTML = users[i].userName
    dropdown.appendChild(entry)
  }
}

function openFileBrowser () {
  ipc.send('open-folder-dialog')
  console.log('ran')
}

function renderUserInfo (event) {
  const avatar = event.target.getAttribute('avatar')
  const userLevel = event.target.getAttribute('userLevel')
  const userName = event.target.innerHTML
  if (userName === name.innerHTML) {
    return
  }
  userinfo.classList.remove('fade-in-bottom')
  void userinfo.offsetWidth
  avatarDiv.src = avatar
  level.innerHTML = 'Level ' + userLevel
  name.innerHTML = userName
  name.setAttribute('userID', event.target.getAttribute('userID'))
  userSwitch.innerHTML = 'Switch'
  userSwitch.classList.remove('hide')
  userinfo.classList.add('fade-in-bottom')
}

async function switchAccountsUplay () {
  promptScreen.classList.remove('fade-out-bottom')
  mainDiv.classList.remove('blur-out')
  promptScreen.classList.remove('hide')
  mainDiv.classList.add('blur-in')
  const id = name.getAttribute('userID')
  const result = await ipc.sendSync('switch-uplay', id)
  if (result[0] === 2) {
    promptContinue.classList.remove('hide')
    promptContinue.classList.add('login')
    status.innerHTML = 'You are currently not logged in to Uplay.<br><br>Please log in to your account and set to remember for this to work properly.<br><br>Once done, click Continue.'
  } else if (result[0] === 1) {
    promptContinue.classList.remove('hide')
    promptWrong.classList.remove('hide')
    promptContinue.classList.add('assign')
    email = result[1]
    status.innerHTML = `Please make sure the selected account is associated with this email:<br><br>${result[1]}<br><br>Once confirmed, click Continue.<br>(You only have to do this once)`
  } else {

  }
}

function continueButton () {
  promptContinue.classList.add('hide')
  promptWrong.classList.add('hide')
  if (promptContinue.classList.contains('login')) {
    promptContinue.classList.remove('login')
    switchAccountsUplay()
  } else if (promptContinue.classList.contains('assign')) {
    promptContinue.classList.remove('assign')
    status.innerHTML = ipc.sendSync('save-uplay', name.getAttribute('userID'), email)
    console.log(email)
    promptContinue.classList.remove('hide')
    promptContinue.classList.add('fin')
    promptContinue.innerHTML = 'Finish'
  } else if (promptContinue.classList.contains('fin')) {
    promptContinue.classList.remove('fin')
    mainDiv.classList.remove('blur-in')
    mainDiv.classList.add('blur-out')
    promptScreen.classList.add('fade-out-bottom')
    setTimeout(() => {
      promptScreen.classList.add('hide')
    }, 500)
  }
}

function setSteam () {

}

window.onclick = function (event) {
  if (event.target.matches('.user')) {
    renderUserInfo(event)
  } else if (!event.target.matches('.dropbtn')) {
    var dropdowns = document.getElementsByClassName('dropdown-content')
    var i
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i]
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show')
      }
    }
  }
}
