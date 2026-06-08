# Repo Runner Implementation Status

Repo Runner is the front-door product direction for WolfeLlama.

## Buyer Promise

Paste a GitHub URL. WolfeLlama helps turn the repo into a runnable app without forcing the user to understand terminal commands.

## Feature Checklist

| Feature | Current Status | Notes |
|---|---:|---|
| Paste GitHub URL | UI complete | Repo Runner accepts a URL and creates a saved project. |
| Clone/download repo | Bridge contract defined | Needs Electron/Node native bridge implementation. |
| Detect app type | Logic added | Detects Vite, React, Next, Electron, Node, Python, static, unknown from manifest hints. |
| Detect package manager | Logic added | Detects npm, pnpm, yarn, bun, pip, unknown from lock files/manifests. |
| Show simple Run button | UI complete | Button is visible and records the selected run command. |
| Auto-install dependencies | UI command prepared | Native bridge still needed to execute install command. |
| Auto-detect start command | Logic added | Detects dev/start/preview/serve/electron/desktop scripts. |
| Open app preview/browser | Preview URL model added | Needs browser/webview integration after process launch. |
| Show terminal logs in plain English | UI + logic added | Log lines map to simple explanations. |
| Use AI to explain/fix errors | UI connected to chat | Sends logs to Command Room for AI explanation. |
| Save projects in library | Complete | localStorage project library added. |
| Run multiple projects | Data model supports it | Native process manager needed for actual parallel processes. |
| Stop/restart projects | UI complete | Native process manager needed for actual process control. |
| Edit required .env fields | UI complete | Native bridge needed to write .env file to project folder. |

## Added Files

- `src/repoRunner/repoRunnerTypes.ts`
- `src/repoRunner/repoDetection.ts`
- `src/repoRunner/repoLibrary.ts`
- `src/components/repoRunner/RepoRunnerPanel.tsx`

## Updated Files

- `src/App.tsx`
- `src/styles.css`

## Native Bridge Needed Next

The browser UI cannot directly clone repos, install dependencies, or start local processes. These require the Electron/Node layer.

Required native functions:

```ts
cloneRepo(repoUrl: string, targetName?: string): Promise<{ localPath: string; name: string }>;
inspectRepo(localPath: string): Promise<Partial<RepoProject>>;
installDependencies(projectId: string): Promise<{ logs: string[] }>;
startProject(projectId: string, command: string): Promise<{ previewUrl?: string; logs: string[] }>;
stopProject(projectId: string): Promise<{ logs: string[] }>;
restartProject(projectId: string, command: string): Promise<{ previewUrl?: string; logs: string[] }>;
saveEnv(projectId: string, fields: EnvField[]): Promise<{ logs: string[] }>;
```

## Next Pass Order

1. Add Electron IPC contract for repo runner.
2. Add preload bridge methods.
3. Add main-process git clone function.
4. Add project folder storage path.
5. Add inspectRepo implementation reading package.json and lock files.
6. Add dependency install runner.
7. Add process manager for start/stop/restart.
8. Add preview URL detection.
9. Add .env writer.
10. Add build/lint verification.

## Rule

Repo Runner must stay simple for non-coders:

- Paste repo.
- Detect setup.
- Install.
- Run.
- Preview.
- Explain errors.
- Save project.
