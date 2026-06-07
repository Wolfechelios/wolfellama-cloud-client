# Chameleon GUI Integration

The Chameleon Ultra companion interface can be integrated into WolfeLlama Cloud Client in three ways. The correct path depends on what the existing Chameleon GUI is built with and whether it exposes a web UI, desktop app, CLI, or local API.

## Preferred Integration Strategy

Do not merge the Chameleon GUI directly into the cloud chat codebase first.

Use a companion-app pattern:

```text
WolfeLlama Cloud Client
  -> Hardware tab
  -> Launch / attach Chameleon GUI
  -> Read selected status/log output
  -> User can send selected text to chat
```

This keeps WolfeLlama clean and prevents the hardware interface from contaminating the cloud-model provider layer.

## Option 1 — Launch External GUI

Best first step.

WolfeLlama adds a Hardware panel with a button:

```text
Open Chameleon GUI
```

Electron launches the official GUI as an external process.

Pros:

- Fastest to implement
- Lowest risk
- Keeps the original GUI intact
- Easier to update when the Chameleon GUI changes

Cons:

- UI is separate from WolfeLlama
- Limited data sharing unless the GUI has logs, CLI, or API access

Implementation shape:

```text
React button
  -> Electron IPC
  -> main process spawn/open command
  -> Chameleon GUI opens
```

## Option 2 — Embed Web GUI

Use this if the Chameleon GUI is a local web app or can be served from localhost.

WolfeLlama can show it in a protected panel or separate window:

```text
Hardware tab
  -> Embedded Chameleon frame/window
  -> Local URL such as http://127.0.0.1:PORT
```

Pros:

- Feels integrated
- Still keeps the Chameleon GUI mostly independent
- Good if the GUI is already web-based

Cons:

- Requires careful window permissions
- Should not expose broad Node/Electron access to embedded content

Security settings:

```text
nodeIntegration: false
contextIsolation: true
sandbox: true
```

## Option 3 — Native WolfeLlama Panel

Use this after the external GUI behavior is understood.

Rebuild only the most useful Chameleon controls inside WolfeLlama:

- Device status
- Connect / disconnect
- Firmware/version
- Battery
- Diagnostic output
- Local logs
- Send selected output to chat

Pros:

- Best final user experience
- Looks like one app
- Easier to connect with chat

Cons:

- Requires knowing the Chameleon protocol/API
- Higher maintenance
- More hardware-specific code

## Recommended Build Order

1. Add Hardware tab.
2. Add Chameleon GUI launcher.
3. Add path setting for the external GUI app.
4. Add local diagnostic/log import.
5. Add "Send selected output to chat."
6. Add USB serial bridge.
7. Add native WolfeLlama controls.
8. Add embedded web view only if the GUI is web-based.

## Electron Launcher Interface

```ts
export interface ExternalGuiLaunchRequest {
  appPath: string;
  args?: string[];
}

export interface ExternalGuiLaunchResult {
  ok: boolean;
  pid?: number;
  error?: string;
}
```

## React Panel Concept

```tsx
export function ChameleonGuiPanel() {
  return (
    <section>
      <h2>Chameleon Ultra</h2>
      <p>Launch the companion GUI or connect the device bridge.</p>
      <button>Open Chameleon GUI</button>
      <button>Import Diagnostic Log</button>
      <button>Send Output to Chat</button>
    </section>
  );
}
```

## Privacy Rule

The Chameleon GUI and device output should stay local by default.

Only send selected output into cloud chat when the user explicitly chooses to do so.

## Final Recommendation

Start with external GUI launch.

Then build a native WolfeLlama Chameleon panel after the exact Chameleon interface is confirmed.
