# Native Repo Runner Bridge

The Repo Runner UI is mounted, but real repo execution requires a native desktop layer.

## Why

Plain React cannot access the local file system, clone repos, install dependencies, start local app processes, stop processes, or write environment files.

The app needs an Electron main and preload bridge.

## Native Bridge Files Added

- electron/repoRunnerPaths.ts
- electron/repoRunnerTypes.ts

## Native Bridge Still Needed

- electron/main.ts
- electron/preload.ts
- electron/repoInspector.ts
- electron/repoProcessManager.ts
- electron/repoEnvWriter.ts

## Required Bridge Methods

- clone repo into WolfeLlamaProjects
- inspect local repo files
- install dependencies inside the project folder
- start the selected project command
- stop the tracked project process
- restart the tracked project process
- write the selected project's environment file
- open the project preview URL

## Full Feature Mapping

| Feature | UI Status | Native Needed |
|---|---:|---:|
| Paste GitHub URL | Done | No |
| Clone/download repo | Flow ready | Yes |
| Detect app type | Browser hint logic done | Better with native file inspection |
| Detect package manager | Browser hint logic done | Better with native file inspection |
| Simple Run button | Done | Yes |
| Auto-install dependencies | Command shown | Yes |
| Auto-detect start command | Browser hint logic done | Better with native package file read |
| Open preview/browser | Preview URL modeled | Yes |
| Terminal logs in plain English | Done | Yes for real logs |
| AI explain/fix errors | Done | No |
| Save projects in library | Done | No |
| Run multiple projects | Data model ready | Yes |
| Stop/restart projects | UI ready | Yes |
| Edit required env fields | UI ready | Yes |

## Safety Rules

- No destructive file deletion.
- Commands run only inside the selected project folder.
- Stop and restart only affect tracked child processes.
- Environment writing only writes the selected project's environment file.
- The UI must show logs and status after every native action.
