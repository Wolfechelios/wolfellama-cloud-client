# Local Native Bridge Packet

This is the practical local build packet for the native Repo Runner bridge.

The GitHub connector may block direct patches that contain local desktop process wiring, so this packet defines what to add locally on the Mac.

## Files To Add Locally

- electron/main.ts
- electron/preload.ts
- electron/repoInspector.ts
- electron/repoProcessManager.ts
- electron/repoEnvWriter.ts
- tsconfig.electron.json

## Files To Update Locally

- package.json
- src/components/repoRunner/RepoRunnerPanel.tsx

## Main App Behavior Needed

The desktop bridge should expose a safe repoRunner object to the renderer.

The renderer should never get unrestricted system access.

The desktop side should own:

- project folder creation
- repo import
- project file inspection
- dependency setup
- project launch state
- project stop state
- project restart state
- env file writing
- preview opening

## Renderer Behavior Needed

RepoRunnerPanel should:

- use browser fallback when the bridge is not available
- use the bridge when available
- update project status after every action
- append raw logs
- append plain-English log explanations
- keep the project library saved
- keep Repo Runner as the first workspace

## Safe Boundaries

- Project actions stay inside the selected project folder.
- No global file edits.
- No hidden destructive actions.
- Project process tracking is by project ID.
- Environment writing is limited to the selected project.
- Logs are visible to the user.

## Desktop Completion Test

The native bridge is complete when a user can:

1. Paste a GitHub repo URL.
2. Import it as a local project.
3. Detect project setup from real files.
4. Fill environment fields.
5. Save environment fields.
6. Prepare the project.
7. Launch the project.
8. Open the preview.
9. Stop the project.
10. Restart the project.
11. Send logs to AI for explanation.

## Priority

Do not build new visual features until this bridge is working.

Repo Runner is the sellable product center.
