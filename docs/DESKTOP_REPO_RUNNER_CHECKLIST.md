# Desktop Repo Runner Checklist

This checklist tracks the next native desktop work needed for WolfeLlama Repo Runner.

## Goal

Make WolfeLlama able to take a GitHub project link and guide a non-coder from project import to a running preview.

## Pass 1: Desktop Shell

- Add Electron main entry.
- Add preload bridge.
- Keep browser security on.
- Keep node access out of the React renderer.
- Load the Vite app inside the desktop window.

## Pass 2: Project Storage

- Use the existing WolfeLlamaProjects folder path helper.
- Create one folder per imported project.
- Save project metadata in the app library.
- Keep project status synced with the UI.

## Pass 3: Project Inspection

- Read top-level project files.
- Read package metadata when available.
- Detect app type.
- Detect package manager.
- Detect available scripts.
- Detect env example file.

## Pass 4: Dependency Setup

- Show the setup command before execution.
- Require the project folder to be known.
- Append output to the project log.
- Convert common errors into plain English.

## Pass 5: Project Launch

- Start the selected launch command inside the project folder.
- Track each project process by project ID.
- Allow more than one project to be active.
- Stop only the tracked process for that project.
- Restart by stopping the tracked process and launching it again.

## Pass 6: Preview

- Detect preview URL from known port.
- Open the preview in the user browser.
- Later add an embedded preview panel.

## Pass 7: Environment Editor

- Save env fields into app memory.
- Write the selected project env file from the desktop bridge.
- Never write outside the selected project folder.

## Pass 8: Error Help

- Send logs to Command Room.
- Ask the selected local or cloud model for a plain-English explanation.
- Suggest the next safe fix.

## Pass 9: Verification

- Confirm project folder exists.
- Confirm dependencies folder or environment exists.
- Confirm launch output includes a local URL when available.
- Confirm preview opens.

## Pass 10: Packaging

- Add Mac packaging.
- Add Windows packaging.
- Add first-run onboarding.
- Add a demo project flow.

## Rule

The app should never force a beginner to read raw terminal output first. Raw logs are available, but plain-English logs are the default.
