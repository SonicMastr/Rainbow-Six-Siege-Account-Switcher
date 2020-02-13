const electron = require('electron')
const ipc = electron.ipcRenderer
const dropdown = document.getElementById('myDropdown')
const avatarDiv = document.getElementById('avatar-img')
const name = document.getElementById('userName')
const level = document.getElementById('userLevel')
const userinfo = document.getElementById('user-info')
window.addEventListener('load', () => {
  loadUsers()
  document.getElementById('uplay-button').addEventListener('click', toggleDropdown)
})

function toggleDropdown () {
  dropdown.classList.toggle('show')
}

function loadUsers () {
  const users = ipc.sendSync('get-users')
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
  userinfo.classList.remove('fade-in-bottom')
  void userinfo.offsetWidth
  const avatar = event.target.getAttribute('avatar')
  const userLevel = event.target.getAttribute('userLevel')
  const userName = event.target.innerHTML
  avatarDiv.src = avatar
  level.innerHTML = 'Level ' + userLevel
  name.innerHTML = userName
  userinfo.classList.add('fade-in-bottom')
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
