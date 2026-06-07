import { spawn } from 'node:child_process';

export interface ChameleonGuiLaunchPayload {
  appPath?: string;
  launchCommand?: string;
}

export interface ChameleonGuiLaunchResponse {
  ok: boolean;
  message: string;
  pid?: number;
}

export function launchChameleonGui(payload: ChameleonGuiLaunchPayload): ChameleonGuiLaunchResponse {
  const platform = process.platform;
  const appPath = payload.appPath?.trim();

  if (platform === 'darwin') {
    const args = appPath ? [appPath] : ['-a', 'Chameleon Ultra GUI'];
    const child = spawn('open', args, {
      detached: true,
      stdio: 'ignore',
    });

    child.unref();

    return {
      ok: true,
      message: appPath ? `Opening ${appPath}` : 'Opening Chameleon Ultra GUI by app name.',
      pid: child.pid,
    };
  }

  if (!appPath) {
    return {
      ok: false,
      message: 'Set the Chameleon GUI executable path for this operating system first.',
    };
  }

  const child = spawn(appPath, [], {
    detached: true,
    stdio: 'ignore',
  });

  child.unref();

  return {
    ok: true,
    message: `Opening ${appPath}`,
    pid: child.pid,
  };
}
