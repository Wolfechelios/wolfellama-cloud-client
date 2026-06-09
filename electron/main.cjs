const { app, BrowserWindow, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');

const isDev = Boolean(process.env.ELECTRON_DEV_SERVER_URL);

function getRendererEntry() {
  if (isDev) {
    return process.env.ELECTRON_DEV_SERVER_URL;
  }

  return path.join(__dirname, '..', 'dist', 'index.html');
}

function showStartupFailure(error) {
  const message = error && error.stack ? error.stack : String(error);
  dialog.showErrorBox(
    'WolfeLlama startup failed',
    `The desktop app could not start.\n\n${message}`
  );
}

function createMainWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 960,
    minHeight: 640,
    show: false,
    backgroundColor: '#0b1020',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  const rendererEntry = getRendererEntry();

  if (isDev) {
    mainWindow.loadURL(rendererEntry).catch(showStartupFailure);
    mainWindow.webContents.openDevTools({ mode: 'detach' });
    return;
  }

  if (!fs.existsSync(rendererEntry)) {
    showStartupFailure(
      new Error(`Missing packaged renderer: ${rendererEntry}\n\nRun npm run build before packaging, then rebuild the Windows installer.`)
    );
    return;
  }

  mainWindow.loadFile(rendererEntry).catch(showStartupFailure);
}

const gotLock = app.requestSingleInstanceLock();

if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    const windows = BrowserWindow.getAllWindows();
    if (windows.length > 0) {
      const mainWindow = windows[0];
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(createMainWindow).catch(showStartupFailure);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
