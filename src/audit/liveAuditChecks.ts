import type { AuditCheck } from './auditTypes';

function exists(selector: string) {
  return Boolean(document.querySelector(selector));
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
        status: document.body.textContent?.includes('Repo Runner') ? 'pass' : 'warn',
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
        status: document.body.textContent?.includes('Builder Mode') ? 'pass' : 'warn',
        summary: 'Builder Mode label scan completed.',
        details: ['Builder Mode should support model selection and ZIP intake.'],
      }),
    },
    {
      id: 'desktop-repo-api',
      label: 'Desktop repo API',
      area: 'Desktop',
      description: 'Checks if the desktop repo API is present.',
      run: () => ({
        status: 'repoRunner' in window ? 'pass' : 'warn',
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
        status: 'projectFiles' in window ? 'pass' : 'warn',
        summary: 'Project file API check completed.',
        details: ['ZIP reading can work without this.', 'Saving files to disk needs this API.'],
      }),
    },
  ];
}
