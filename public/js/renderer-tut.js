const electron = require('electron')
const ipc = electron.ipcRenderer
const pages = document.getElementsByClassName('tutorial-container')
const nextButtons = document.getElementsByClassName('next')
const backButtons = document.getElementsByClassName('back')
const finished = document.getElementsByClassName('finish')
const disabled1 = document.getElementsByClassName('disabled')[0]
const disabled = document.getElementsByClassName('disabled')[1]
const numPages = pages.length
let page = 1
let patched = 0
window.addEventListener('load', () => {
  for (let i = 0; i < nextButtons.length; i++) {
    nextButtons[i].addEventListener('click', nextPage)
  }
  for (let i = 0; i < backButtons.length; i++) {
    backButtons[i].addEventListener('click', previousPage)
  }
  for (let i = 0; i < finished.length; i++) {
    finished[i].addEventListener('click', finishSetup)
  }
  document.getElementById('folder-open').addEventListener('click', openFileBrowser)
  document.getElementById('folder-open-uplay').addEventListener('click', openFileBrowserUplay)
  document.getElementById('uplay-only').addEventListener('click', pageUplay)
  document.getElementById('back-uplay-1').addEventListener('click', backUplay1)
  document.getElementById('back-uplay-2').addEventListener('click', backUplay2)
  document.getElementById('next-uplay').addEventListener('click', nextUplay)
})

function nextPage () {
  if (page < numPages) {
    if (page === 3 && patched === 0) {
      const status = ipc.sendSync('copy-uplay-default-setup')
      if (status === 0) {
        patched = 1
        document.getElementById(page).classList.remove('show')
        page++
        document.getElementById(page).classList.add('show')
      } else {
        document.getElementById('directory').innerHTML = 'Failed to copy Uplay file. Please check permissions'
      }
    } else {
      document.getElementById(page).classList.remove('show')
      page++
      document.getElementById(page).classList.add('show')
      console.log(page)
    }
  }
}

function previousPage () {
  if (page > 1) {
    document.getElementById(page).classList.remove('show')
    page--
    document.getElementById(page).classList.add('show')
  }
}

function pageUplay () {
  document.getElementById(page).classList.remove('show')
  document.getElementById('uplay-only-div').classList.add('show')
}

function backUplay1 () {
  document.getElementById('uplay-only-div').classList.remove('show')
  document.getElementById(page).classList.add('show')
}

function backUplay2 () {
  document.getElementById('uplay-finished').classList.remove('show')
  document.getElementById('uplay-only-div').classList.add('show')
}

function nextUplay () {
  document.getElementById('uplay-only-div').classList.remove('show')
  document.getElementById('uplay-finished').classList.add('show')
}

function openFileBrowser () {
  const path = ipc.sendSync('open-folder-dialog-steam')
  if (path) {
    document.getElementById('directory').innerHTML = `Selected Path: ${path}`
    disabled1.classList.remove('disabled')
    document.getElementById('folder-open').classList.remove('pulsate-bck')
  } else {
    if (!disabled1.classList.contains('disabled')) { disabled1.classList.add('disabled') }
    if (!document.getElementById('folder-open').classList.contains('pulsate-bck')) { document.getElementById('folder-open').classList.add('pulsate-bck') }
    document.getElementById('directory').innerHTML = 'Please Select a Path'
  }
}

function openFileBrowserUplay () {
  const path = ipc.sendSync('open-folder-dialog')
  if (path) {
    document.getElementById('directory-uplay').innerHTML = `Selected Path: ${path}`
    disabled.classList.remove('disabled')
    document.getElementById('folder-open-uplay').classList.remove('pulsate-bck')
  } else {
    if (!disabled.classList.contains('disabled')) { disabled.classList.add('disabled') }
    if (!document.getElementById('folder-open-uplay').classList.contains('pulsate-bck')) { document.getElementById('folder-open-uplay').classList.add('pulsate-bck') }
    document.getElementById('directory-uplay').innerHTML = 'Please Select a Path'
  }
}

function finishSetup () {
  const status = ipc.sendSync('finish-setup')
  if (status === 0) {
    window.close(1)
  }
}
