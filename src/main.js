const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipc = electron.ipcMain;
const dialog = electron.dialog;
const globalShortcut = electron.globalShortcut;
const path = require('path');
const url = require('url');
var mainWindow = null;

if (require('electron-squirrel-startup')) {
  app.quit();
}

app.on('ready', function() {
  createAppWindow();
  addAppEventListeners();
  registerKeyboardShortcuts();
});

function createAppWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: 'app/icons/Icon.png',
    webPreferences: {
        nodeIntegration: true
    }
  });

  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }));

    // Open the DevTools.
      mainWindow.webContents.openDevTools();

    mainWindow.on('closed', () => {
      mainWindow = null
    });
}

function addAppEventListeners() {
  app.on('window-all-closed', function() {
    quit();
  });
  ipc.on('graph-recognized-tree', function(event){
    mainWindow.webContents.send('graph-recognized', 'Tree')
  });
  ipc.on('graph-recognized-DAG', function(event){
    mainWindow.webContents.send('graph-recognized', 'DAG')
  });
  ipc.on('createGraphBtnClicked', function(event){
    mainWindow.webContents.send('createGraph')
    event.sender.send('graph-create-button-clicked', 'Main process created graph')
  });
  ipc.on('removeGraphBtnClicked', function(event){
    mainWindow.webContents.send('removeGraph')
    event.sender.send('graph-remove-button-clicked', 'Main process removed graph')
  });
  ipc.on('exportGraphBtnClicked', function(event){
    mainWindow.webContents.send('exportGraph')
    event.sender.send('graph-export-button-clicked', 'Main process exported graph to JSON')
  });
}

function registerKeyboardShortcuts() {
  //globalShortcut.register()
}

function quit() {
  app.quit();
}
