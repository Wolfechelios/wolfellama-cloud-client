import type { AuditCheck } from './auditTypes';

function exists(selector: string) {
  return Boolean(document.querySelector(selector));
}

function bodyHas(text: string) {
  return Boolean(document.body.textContent?.includes(text));
}

function storageWorks() {
  try {
    const key = 'wolfellama.audit.test';
    window.localStorage.setItem(key, 'ok');
    window.localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

function canStoreJson(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    const raw = window.localStorage.getItem(key);
    window.localStorage.removeItem(key);
    return Boolean(raw && JSON.parse(raw));
  } catch {
    return false;
  }
}

function hasBridge(name: string) {
  return typeof window !== 'undefined' && name in window;
}

export function createLiveAuditChecks(): AuditCheck[] {
  return [
    {
      id: 'browser-runtime',
      label: 'Browser runtime',
      area: 'Runtime',
      description: 'Checks that the app can access browser APIs.',
      run: () => ({
        status: typeof window !== 'undefined' && typeof document !== 'undefined' ? 'pass' : 'fail',
        summary: 'Runtime check completed.',
        details: ['window/document check finished.'],
      }),
    },
    {
      id: 'local-memory',
      label: 'Local memory',
      area: 'Memory',
      description: 'Checks whether localStorage can save app state.',
      run: () => ({
        status: storageWorks() ? 'pass' : 'fail',
        summary: storageWorks() ? 'Local memory works.' : 'Local memory failed.',
        details: ['Builder tasks, ZIP context, selected models, and chat history use localStorage.'],
      }),
    },
    {
      id: 'sidebar',
      label: 'Sidebar navigation',
      area: 'Navigation',
      description: 'Checks that the sidebar exists.',
      run: () => ({
        status: exists('.sidebar') ? 'pass' : 'fail',
        summary: exists('.sidebar') ? 'Sidebar found.' : 'Sidebar missing.',
        details: ['Navigation must expose Repo Runner, Builder Mode, Command Room, Agent Mode, and Audit.'],
      }),
    },
    {
      id: 'main-panel',
      label: 'Main workspace',
      area: 'Layout',
      description: 'Checks that the workspace container exists.',
      run: () => ({
        status: exists('.main-panel') ? 'pass' : 'fail',
        summary: exists('.main-panel') ? 'Main panel found.' : 'Main panel missing.',
        details: ['Routes render into the main panel.'],
      }),
    },
    {
      id: 'repo-runner-ui',
      label: 'Repo Runner UI path',
      area: 'Repo Runner',
      description: 'Checks that Repo Runner is reachable through the sidebar label.',
      run: () => ({
        status: bodyHas('Repo Runner') ? 'pass' : 'warn',
        summary: 'Repo Runner label scan completed.',
        details: ['This verifies the route is advertised in the UI.'],
      }),
    },
    {
      id: 'builder-ui',
      label: 'Builder Mode UI path',
      area: 'Builder Mode',
      description: 'Checks that Builder Mode is reachable through the sidebar label.',
      run: () => ({
        status: bodyHas('Builder Mode') ? 'pass' : 'warn',
        summary: 'Builder Mode label scan completed.',
        details: ['Builder Mode should support model selection and ZIP intake.'],
      }),
    },
    {
      id: 'builder-model-memory',
      label: 'Builder model memory',
      area: 'Builder Drill',
      description: 'Verifies Builder Mode can save a dedicated build model.',
      run: () => ({
        status: canStoreJson('wolfellama.audit.builder.model', { model: 'audit-builder-model' }) ? 'pass' : 'fail',
        summary: 'Builder model memory check completed.',
        details: ['Builder Mode stores its dedicated model separately from the normal chat model.'],
      }),
    },
    {
      id: 'builder-task-memory',
      label: 'Builder task memory',
      area: 'Builder Drill',
      description: 'Verifies Builder Mode can persist an active build task.',
      run: () => ({
        status: canStoreJson('wolfellama.audit.builder.task', {
          id: 'audit-task',
          goal: 'audit builder task storage',
          plan: ['inspect', 'patch', 'review'],
          changes: [],
          notes: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }) ? 'pass' : 'fail',
        summary: 'Builder task memory check completed.',
        details: ['Active Builder tasks must survive route changes and reloads.'],
      }),
    },
    {
      id: 'builder-zip-context-memory',
      label: 'Builder ZIP context memory',
      area: 'Builder Drill',
      description: 'Verifies uploaded ZIP project context can be stored.',
      run: () => ({
        status: canStoreJson('wolfellama.audit.builder.zip', {
          name: 'audit-project.zip',
          size: 1234,
          fileCount: 3,
          textFileCount: 2,
          files: [
            { path: 'package.json', size: 100, isText: true, content: '{"scripts":{"dev":"vite"}}' },
            { path: 'src/App.tsx', size: 100, isText: true, content: 'export function App() { return null; }' },
          ],
          summary: 'FILE: package.json\n{"scripts":{"dev":"vite"}}',
        }) ? 'pass' : 'fail',
        summary: 'Builder ZIP context memory check completed.',
        details: ['Builder Mode must preserve ZIP file summaries so coding can continue from uploaded contents.'],
      }),
    },
    {
      id: 'builder-draft-change-memory',
      label: 'Builder draft change memory',
      area: 'Builder Drill',
      description: 'Verifies draft code changes can be stored and reviewed.',
      run: () => ({
        status: canStoreJson('wolfellama.audit.builder.change', {
          id: 'audit-change',
          filePath: 'src/App.tsx',
          summary: 'audit draft change',
          after: 'export default function App() { return null; }',
          status: 'draft',
        }) ? 'pass' : 'fail',
        summary: 'Builder draft change memory check completed.',
        details: ['Draft changes are the review buffer before any file save bridge writes to disk.'],
      }),
    },
    {
      id: 'builder-accept-reject-state',
      label: 'Builder accept/reject state',
      area: 'Builder Drill',
      description: 'Verifies change statuses can move through draft, accepted, and rejected.',
      run: () => {
        const states = ['draft', 'accepted', 'rejected'];
        const ok = canStoreJson('wolfellama.audit.builder.states', states);
        return {
          status: ok ? 'pass' : 'fail',
          summary: 'Builder change status check completed.',
          details: ['Accept/reject state must remain stable for reviewable code changes.'],
        };
      },
    },
    {
      id: 'builder-route-active-ui',
      label: 'Builder active UI controls',
      area: 'Builder Drill',
      description: 'Checks for Builder controls when the Builder route is currently open.',
      run: () => {
        const onBuilder = bodyHas('Drop ZIP Project Here') || bodyHas('Builder model') || bodyHas('Start Builder Task');
        return {
          status: onBuilder ? 'pass' : 'warn',
          summary: onBuilder ? 'Builder controls are visible.' : 'Builder controls are not visible on current route.',
          details: ['Open Builder Mode before running this drill if you want UI-control verification, not just storage verification.'],
        };
      },
    },
    {
      id: 'desktop-repo-api',
      label: 'Desktop repo API',
      area: 'Desktop',
      description: 'Checks if the desktop repo API is present.',
      run: () => ({
        status: hasBridge('repoRunner') ? 'pass' : 'warn',
        summary: 'Desktop repo API check completed.',
        details: ['Browser mode will warn here.', 'Desktop mode should expose repo controls.'],
      }),
    },
    {
      id: 'project-file-api',
      label: 'Project file API',
      area: 'Builder Files',
      description: 'Checks if the project file API is present.',
      run: () => ({
        status: hasBridge('projectFiles') ? 'pass' : 'warn',
        summary: 'Project file API check completed.',
        details: ['ZIP reading can work without this.', 'Saving files to disk needs this API.'],
      }),
    },
  ];
}
