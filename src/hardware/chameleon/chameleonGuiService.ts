import type { ChameleonGuiSettings, ChameleonLaunchResult } from './types';

const defaultMacPath = '/Applications/Chameleon Ultra GUI.app';

export const defaultChameleonGuiSettings: ChameleonGuiSettings = {
  appPath: defaultMacPath,
  launchCommand: 'open -a "Chameleon Ultra GUI"',
  diagnosticText: '',
  notes: '',
};

export function buildLaunchPreview(settings: ChameleonGuiSettings) {
  const path = settings.appPath.trim();

  if (path) {
    return `open "${path}"`;
  }

  return settings.launchCommand;
}

export async function openChameleonGui(settings: ChameleonGuiSettings): Promise<ChameleonLaunchResult> {
  const electronBridge = window.wolfellama?.chameleon;

  if (electronBridge?.openGui) {
    return electronBridge.openGui(settings);
  }

  return {
    ok: false,
    message:
      'Desktop launcher bridge is not wired yet. Use the previewed command manually until Electron IPC is added.',
  };
}

declare global {
  interface Window {
    wolfellama?: {
      chameleon?: {
        openGui(settings: ChameleonGuiSettings): Promise<ChameleonLaunchResult>;
      };
    };
  }
}
