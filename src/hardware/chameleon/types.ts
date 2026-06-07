export interface ChameleonGuiSettings {
  appPath: string;
  launchCommand: string;
  diagnosticText: string;
  notes: string;
}

export interface ChameleonLaunchResult {
  ok: boolean;
  message: string;
}

export interface ChameleonGuiBridge {
  openGui(settings: ChameleonGuiSettings): Promise<ChameleonLaunchResult>;
}
