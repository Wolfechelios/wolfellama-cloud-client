const { app, BrowserWindow, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const net = require('net');
const { spawn } = require('child_process');

const isDev = Boolean(process.env.ELECTRON_DEV_SERVER_URL);
const OLLAMA_HOST = '127.0.0.1';
const OLLAMA_PORT = Number(process.env.OLLAMA_PORT || 11434);
const OPEN_WEBUI_HOST = '127.0.0.1';
const OPEN_WEBUI_PORT = Number(process.env.OPEN_WEBUI_PORT || 8080);
let ollamaProcess = null;
let openWebUIProcess = null;

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

function isPortOpen(host, port, timeoutMs = 600) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let settled = false;

    function finish(value) {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve(value);
    }

    socket.setTimeout(timeoutMs);
    socket.once('connect', () => finish(true));
    socket.once('timeout', () => finish(false));
    socket.once('error', () => finish(false));
    socket.connect(port, host);
  });
}

async function waitForPort(host, port, attempts = 30, timeoutMs = 400, delayMs = 250) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    if (await isPortOpen(host, port, timeoutMs)) return true;
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
  return false;
}

function attachProcessLogs(label, processRef, onExit) {
  processRef.stdout?.on('data', (data) => console.log(`[${label}] ${String(data).trim()}`));
  processRef.stderr?.on('data', (data) => console.log(`[${label}] ${String(data).trim()}`));
  processRef.once('exit', (code, signal) => {
    console.log(`[WolfeLlama] ${label} process exited code=${code ?? 'none'} signal=${signal ?? 'none'}`);
    onExit();
  });
}

async function startOllamaIfNeeded() {
  if (process.env.WOLFELLAMA_SKIP_OLLAMA_START === '1') {
    console.log('[WolfeLlama] Ollama auto-start disabled by WOLFELLAMA_SKIP_OLLAMA_START=1');
    return;
  }

  const alreadyRunning = await isPortOpen(OLLAMA_HOST, OLLAMA_PORT);
  if (alreadyRunning) {
    console.log(`[WolfeLlama] Ollama already available at http://${OLLAMA_HOST}:${OLLAMA_PORT}`);
    return;
  }

  try {
    ollamaProcess = spawn('ollama', ['serve'], {
      detached: false,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: {
        ...process.env,
        OLLAMA_HOST: `${OLLAMA_HOST}:${OLLAMA_PORT}`
      }
    });

    attachProcessLogs('Ollama', ollamaProcess, () => {
      ollamaProcess = null;
    });

    if (await waitForPort(OLLAMA_HOST, OLLAMA_PORT)) {
      console.log(`[WolfeLlama] Ollama started at http://${OLLAMA_HOST}:${OLLAMA_PORT}`);
      return;
    }

    console.log(`[WolfeLlama] Ollama start requested, but port ${OLLAMA_PORT} did not open yet. The chat UI can retry with Check Local Model.`);
  } catch (error) {
    console.log(`[WolfeLlama] Could not auto-start Ollama: ${error && error.message ? error.message : String(error)}`);
  }
}

async function startOpenWebUIIfNeeded() {
  if (process.env.WOLFELLAMA_SKIP_OPEN_WEBUI_START === '1') {
    console.log('[WolfeLlama] OpenWebUI auto-start disabled by WOLFELLAMA_SKIP_OPEN_WEBUI_START=1');
    return;
  }

  const alreadyRunning = await isPortOpen(OPEN_WEBUI_HOST, OPEN_WEBUI_PORT);
  if (alreadyRunning) {
    console.log(`[WolfeLlama] OpenWebUI already available at http://${OPEN_WEBUI_HOST}:${OPEN_WEBUI_PORT}`);
    return;
  }

  const openWebUIDataDir = path.join(app.getPath('userData'), 'open-webui-data');
  fs.mkdirSync(openWebUIDataDir, { recursive: true });

  try {
    openWebUIProcess = spawn('open-webui', ['serve', '--host', OPEN_WEBUI_HOST, '--port', String(OPEN_WEBUI_PORT)], {
      detached: false,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: {
        ...process.env,
        DATA_DIR: openWebUIDataDir,
        OLLAMA_BASE_URL: `http://${OLLAMA_HOST}:${OLLAMA_PORT}`,
        WEBUI_AUTH: process.env.WEBUI_AUTH || 'False'
      }
    });

    attachProcessLogs('OpenWebUI', openWebUIProcess, () => {
      openWebUIProcess = null;
    });

    if (await waitForPort(OPEN_WEBUI_HOST, OPEN_WEBUI_PORT, 60, 500, 500)) {
      console.log(`[WolfeLlama] OpenWebUI started at http://${OPEN_WEBUI_HOST}:${OPEN_WEBUI_PORT}`);
      return;
    }

    console.log(`[WolfeLlama] OpenWebUI start requested, but port ${OPEN_WEBUI_PORT} did not open yet.`);
  } catch (error) {
    console.log(`[WolfeLlama] Could not auto-start OpenWebUI. Install it with: pipx install open-webui or pip install open-webui. Error: ${error && error.message ? error.message : String(error)}`);
  }
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

  app.whenReady()
    .then(async () => {
      await startOllamaIfNeeded();
      await startOpenWebUIIfNeeded();
      createMainWindow();
    })
    .catch(showStartupFailure);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
}

app.on('before-quit', () => {
  if (openWebUIProcess && !openWebUIProcess.killed) {
    openWebUIProcess.kill('SIGTERM');
  }

  if (ollamaProcess && !ollamaProcess.killed) {
    ollamaProcess.kill('SIGTERM');
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
