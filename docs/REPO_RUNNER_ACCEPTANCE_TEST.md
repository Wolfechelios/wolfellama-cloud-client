# Repo Runner Acceptance Test

Use this checklist to decide whether WolfeLlama is ready to sell as a GitHub repo runner.

## Test A: First Impression

- User opens the app.
- Repo Runner is visible in the sidebar.
- User understands that the first action is pasting a GitHub repo URL.
- User does not need to open a terminal first.

Pass condition: a non-coder can identify where to begin in under 10 seconds.

## Test B: Add Project

- User pastes a GitHub repo URL.
- User clicks Add Repo.
- Project appears in the project library.
- Project has a readable name.
- Project status changes.

Pass condition: the repo is saved as a project.

## Test C: Detection

- App identifies likely app type.
- App identifies likely package manager.
- App shows setup command.
- App shows launch command.
- App shows preview URL when known.

Pass condition: user knows what type of project they are handling without reading docs.

## Test D: Environment Fields

- User can add env key/value fields.
- User can edit env values.
- User can save env fields into project memory.
- Desktop bridge later writes those fields to the selected project file.

Pass condition: required env values are not hidden from the user.

## Test E: Project Actions

- User sees Install, Run, Stop, Restart.
- In browser mode, the app explains that desktop mode is needed for local execution.
- In desktop mode, actions update logs and status.

Pass condition: the app never silently fails.

## Test F: Plain-English Logs

- Raw output appears in logs.
- Plain-English explanation appears under the raw log.
- User can send logs to Command Room.
- AI explains the likely fix.

Pass condition: user can understand what broke.

## Test G: Multi-Project Library

- User can add more than one repo.
- User can switch between saved projects.
- Each project keeps its own env fields, logs, and status.

Pass condition: projects do not overwrite each other.

## Test H: Sellable Demo

Demo flow:

1. Paste a GitHub URL.
2. Add repo.
3. Detect app type.
4. Show setup command.
5. Show launch command.
6. Add env fields.
7. Show plain-English logs.
8. Send logs to AI.
9. Save project in library.

Pass condition: a buyer can understand the product without knowing code.
