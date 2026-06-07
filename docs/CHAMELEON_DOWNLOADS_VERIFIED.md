# Chameleon Ultra GUI Download Notes

Source checked: https://chameleon.run/#downloads

## Verified Facts

Chameleon Ultra GUI is described as an open-source, cross-platform companion app for Chameleon Ultra devices.

The project page describes the GUI as a fast modern companion app for mobile and desktop, with device management features.

The site lists these platform targets:

- Windows x64
- Windows portable
- macOS
- iOS
- Linux
- Linux Arch AUR
- Linux legacy
- Linux DEB
- Android Google Play
- Android APK

The GitHub repository identifies the app as a GUI for Chameleon Ultra / Chameleon Lite written in Flutter for cross-platform operation.

## Integration Decision

Because the official GUI is already a cross-platform Flutter app, WolfeLlama should not rebuild it first.

The first integration should be:

```text
Hardware tab -> Open Chameleon Ultra GUI
```

Then WolfeLlama can add:

- Path setting for the installed GUI
- Launch button
- Device notes
- Diagnostic log import
- Send selected diagnostic text to chat

## macOS Install Path

The downloads page points macOS users to the Apple App Store.

Expected installed app path:

```text
/Applications/Chameleon Ultra GUI.app
```

The exact path should be user-configurable because App Store naming can vary.

## WolfeLlama Hardware Tab Requirements

Add a Hardware tab with:

- Chameleon Ultra card
- Open official GUI button
- Set app path button
- Import diagnostic log button
- Send selected text to chat button
- Local notes field

## Electron Launch Plan

Electron main process should open the installed GUI.

For macOS, use:

```text
open -a "Chameleon Ultra GUI"
```

Or, if using a specific path:

```text
open "/Applications/Chameleon Ultra GUI.app"
```

For Windows, launch the installed EXE path or portable EXE path.

For Linux, launch the AppImage, binary, or desktop command chosen by the user.

## Best App Flow

1. User opens WolfeLlama.
2. User clicks Hardware.
3. User clicks Open Chameleon Ultra GUI.
4. Official GUI opens separately.
5. User copies or imports diagnostic/device text.
6. WolfeLlama can explain that output through the selected cloud model.

## Why Not Embed Immediately

This GUI is Flutter-based, not a simple local web interface.

Embedding it directly inside WolfeLlama would be harder than launching it as a companion app.

The correct path is:

1. Launch official GUI first.
2. Add log/import bridge second.
3. Add native WolfeLlama hardware controls later if the protocol/API is needed.
