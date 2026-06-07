import { useState } from 'react';
import {
  buildLaunchPreview,
  defaultChameleonGuiSettings,
  openChameleonGui,
} from '../../hardware/chameleon/chameleonGuiService';
import type { ChameleonGuiSettings } from '../../hardware/chameleon/types';

interface ChameleonGuiPanelProps {
  onSendToChat(text: string): void;
}

export function ChameleonGuiPanel({ onSendToChat }: ChameleonGuiPanelProps) {
  const [settings, setSettings] = useState<ChameleonGuiSettings>(defaultChameleonGuiSettings);
  const [status, setStatus] = useState('Ready to launch official Chameleon Ultra GUI.');

  function updateSetting<K extends keyof ChameleonGuiSettings>(key: K, value: ChameleonGuiSettings[K]) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  async function handleOpenGui() {
    const result = await openChameleonGui(settings);
    setStatus(result.message);
  }

  function handleSendDiagnosticToChat() {
    const diagnostic = settings.diagnosticText.trim();
    if (!diagnostic) {
      setStatus('Paste diagnostic or device output first.');
      return;
    }

    onSendToChat(
      `Explain this Chameleon Ultra diagnostic/device output. Keep it practical and tell me what to check next.\n\n${diagnostic}`,
    );
    setStatus('Diagnostic output placed into chat composer.');
  }

  return (
    <section className="hardware-panel">
      <div className="hardware-hero">
        <div>
          <p className="eyebrow">Hardware companion</p>
          <h3>Chameleon Ultra GUI</h3>
          <p>
            Launch the official Flutter GUI as a companion app, then bring selected diagnostic output back into WolfeLlama chat.
          </p>
        </div>
        <div className="hardware-badge">Companion GUI</div>
      </div>

      <div className="hardware-grid">
        <label>
          macOS app path
          <input
            value={settings.appPath}
            onChange={(event) => updateSetting('appPath', event.target.value)}
            placeholder="/Applications/Chameleon Ultra GUI.app"
          />
        </label>

        <label>
          Launch command preview
          <input value={buildLaunchPreview(settings)} readOnly />
        </label>
      </div>

      <div className="hardware-actions">
        <button type="button" className="connect-button" onClick={handleOpenGui}>
          Open Chameleon GUI
        </button>
        <button type="button" className="ghost-button" onClick={() => setStatus('Use App Store install, then set the app path if needed.')}>
          Install Notes
        </button>
      </div>

      <div className="hardware-status">{status}</div>

      <label>
        Diagnostic / device output
        <textarea
          className="diagnostic-box"
          value={settings.diagnosticText}
          onChange={(event) => updateSetting('diagnosticText', event.target.value)}
          placeholder="Paste Chameleon Ultra GUI output, logs, firmware details, or diagnostic text here..."
        />
      </label>

      <div className="hardware-actions">
        <button type="button" className="connect-button" onClick={handleSendDiagnosticToChat}>
          Send Output to Chat
        </button>
        <button type="button" className="ghost-button" onClick={() => updateSetting('diagnosticText', '')}>
          Clear Output
        </button>
      </div>

      <label>
        Local device notes
        <textarea
          value={settings.notes}
          onChange={(event) => updateSetting('notes', event.target.value)}
          placeholder="Private local notes about your Chameleon Ultra setup..."
        />
      </label>
    </section>
  );
}
