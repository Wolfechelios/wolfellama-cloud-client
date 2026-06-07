# Chameleon Ultra Integration Plan

This document describes how to add a Chameleon Ultra-style external hardware device into WolfeLlama Cloud Client without turning the app into a repo tool, test runner, or sandbox launcher.

The integration should be treated as an optional hardware companion module.

## Goal

Add a local hardware panel that lets the user connect, inspect device status, view logs, and ask the active cloud model to explain device output.

The cloud chat client remains the center of the app. The device module is an input/output bridge, not a replacement for the cloud model provider system.

## Safe Product Scope

Allowed app features:

- Detect device connection over USB serial or Bluetooth bridge
- Show connection status
- Show firmware/version information when available
- Read non-sensitive device logs
- Display device mode/state
- Send basic diagnostic commands exposed by the official interface
- Save local notes about the device
- Let the user ask the AI to explain device status or error output
- Keep all device logs local unless the user explicitly sends selected text into chat

Do not build features for unauthorized access, credential theft, bypassing physical access systems, or cloning third-party cards/devices.

## Architecture

Add a separate hardware layer:

```text
src/hardware/
  chameleon/
    types.ts
    chameleonService.ts
    serialTransport.ts
    bleTransport.ts
    parser.ts
```

Add a UI panel:

```text
src/components/hardware/ChameleonPanel.tsx
```

Add an app navigation item:

```text
Hardware
```

This keeps the hardware module separate from:

- Cloud provider adapters
- Chat storage
- Agent profiles
- Local memory

## Connection Options

### Option 1 — USB Serial

Preferred for desktop reliability.

Required package later:

```bash
npm install serialport
```

Electron main process should own serial access. The renderer should call it through IPC.

### Option 2 — Bluetooth / BLE

Useful if the device exposes a supported BLE service.

Desktop BLE support can vary by OS. Keep BLE as a second-pass feature.

### Option 3 — Local Bridge Process

Use an external CLI or Python bridge if the official tool already exists.

Pattern:

```text
WolfeLlama UI -> Electron IPC -> Local bridge command -> Device -> Parsed response -> WolfeLlama UI
```

This is often the easiest route when a hardware device already has a stable CLI.

## Type Interface

```ts
export interface ChameleonDeviceInfo {
  id: string;
  name: string;
  transport: 'usb-serial' | 'ble' | 'bridge';
  firmwareVersion?: string;
  batteryPercent?: number;
  connected: boolean;
}

export interface ChameleonCommandResult {
  ok: boolean;
  command: string;
  output: string;
  error?: string;
  createdAt: string;
}

export interface ChameleonService {
  listDevices(): Promise<ChameleonDeviceInfo[]>;
  connect(deviceId: string): Promise<ChameleonDeviceInfo>;
  disconnect(deviceId: string): Promise<void>;
  getStatus(deviceId: string): Promise<ChameleonCommandResult>;
  runDiagnostic(deviceId: string): Promise<ChameleonCommandResult>;
}
```

## UI Behavior

The hardware panel should include:

- Connection status
- Device list
- Connect / disconnect button
- Firmware/version field
- Battery field if available
- Diagnostic output box
- Copy output button
- Send selected output to chat button

## AI Integration

The AI should not directly control the hardware by default.

Recommended flow:

1. User connects device.
2. User runs a diagnostic.
3. App shows raw output.
4. User clicks "Explain in chat."
5. App inserts the diagnostic output into the chat composer.
6. User chooses to send it to the cloud model.

This keeps the user in control and prevents accidental device actions.

## Implementation Steps

1. Add `src/hardware/chameleon/types.ts`.
2. Add placeholder `chameleonService.ts`.
3. Add `ChameleonPanel.tsx`.
4. Add a Hardware section to the app sidebar.
5. Add Electron IPC only after the basic UI exists.
6. Add USB serial transport.
7. Add bridge process support.
8. Add BLE support only if needed.

## Local Privacy Rule

Device data should stay local by default.

Only send device output to a cloud model when the user explicitly chooses to place that output into a chat message.
