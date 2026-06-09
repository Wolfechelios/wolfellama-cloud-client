import { unzipSync, strFromU8 } from 'fflate';

export interface ZipProjectFile {
  path: string;
  size: number;
  isText: boolean;
  content?: string;
}

export interface ZipIgnoredFolder {
  folder: string;
  count: number;
}

export interface ZipProjectContext {
  name: string;
  size: number;
  rootPath: string;
  framework: string;
  packageManager: string;
  fileCount: number;
  textFileCount: number;
  ignoredCount: number;
  ignoredFolders: ZipIgnoredFolder[];
  files: ZipProjectFile[];
  summary: string;
}

const TEXT_EXTENSIONS = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.json', '.css', '.html', '.md', '.txt', '.env', '.example', '.yml', '.yaml', '.toml', '.py', '.rb', '.go', '.rs', '.java', '.kt', '.swift', '.php', '.sh', '.sql', '.xml', '.svg', '.vue', '.svelte',
]);

const IGNORE_SEGMENTS = new Set([
  'node_modules', '.expo', '.git', 'dist', 'build', 'coverage', '.next', '.nuxt', '.turbo', '.cache', '.parcel-cache', 'ios/build', 'android/build', '__pycache__', '.gradle', '.idea', '.vscode',
]);

const ROOT_MARKERS = new Set([
  'package.json', 'app.json', 'app.config.js', 'app.config.ts', 'expo-router', 'vite.config.ts', 'vite.config.js', 'next.config.js', 'next.config.ts', 'tsconfig.json', 'requirements.txt', 'pyproject.toml', 'Cargo.toml', 'go.mod',
]);

const PRIORITY_FILES = new Set([
  'package.json', 'app.json', 'app.config.js', 'app.config.ts', 'babel.config.js', 'metro.config.js', 'eas.json', 'tsconfig.json', 'README.md', 'readme.md', '.env.example', 'vite.config.ts', 'vite.config.js', 'next.config.js', 'next.config.ts', 'index.html', 'App.tsx', 'App.ts', 'App.jsx', 'App.js', 'src/App.tsx', 'src/App.jsx', 'src/main.tsx', 'src/main.jsx',
]);

const PRIORITY_DIRS = ['app/', 'src/', 'components/', 'screens/', 'navigation/', 'hooks/', 'lib/', 'utils/', 'constants/', 'assets/'];

function normalize(path: string) {
  return path.replace(/^\.\//, '').replace(/\/+/g, '/');
}

function extensionOf(path: string) {
  const clean = path.toLowerCase();
  const dotIndex = clean.lastIndexOf('.');
  if (dotIndex === -1) return '';
  return clean.slice(dotIndex);
}

function segmentIgnored(path: string) {
  const segments = path.split('/');
  for (const segment of segments) {
    if (IGNORE_SEGMENTS.has(segment)) return segment;
  }
  if (path.includes('/ios/build/')) return 'ios/build';
  if (path.includes('/android/build/')) return 'android/build';
  return undefined;
}

function relativeToRoot(path: string, rootPath: string) {
  if (!rootPath) return path;
  return path.startsWith(`${rootPath}/`) ? path.slice(rootPath.length + 1) : path;
}

function basename(path: string) {
  return path.split('/').pop() ?? path;
}

function looksText(path: string) {
  const name = basename(path);
  if (PRIORITY_FILES.has(path) || PRIORITY_FILES.has(name)) return true;
  return TEXT_EXTENSIONS.has(extensionOf(path));
}

function detectRoot(paths: string[]) {
  const scores = new Map<string, number>();

  for (const path of paths) {
    const parts = path.split('/');
    const name = parts.at(-1) ?? path;
    if (!ROOT_MARKERS.has(name)) continue;

    const root = parts.length > 1 ? parts.slice(0, -1).join('/') : '';
    scores.set(root, (scores.get(root) ?? 0) + 10);
  }

  for (const path of paths) {
    const parts = path.split('/');
    const root = parts.length > 1 ? parts[0] : '';
    const relative = parts.length > 1 ? parts.slice(1).join('/') : path;
    if (PRIORITY_DIRS.some((dir) => relative.startsWith(dir))) {
      scores.set(root, (scores.get(root) ?? 0) + 2);
    }
  }

  return [...scores.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0]?.[0] ?? '';
}

function detectPackageManager(files: ZipProjectFile[]) {
  const names = new Set(files.map((file) => basename(file.path)));
  if (names.has('pnpm-lock.yaml')) return 'pnpm';
  if (names.has('yarn.lock')) return 'yarn';
  if (names.has('package-lock.json')) return 'npm';
  if (names.has('bun.lockb')) return 'bun';
  return names.has('package.json') ? 'npm' : 'unknown';
}

function detectFramework(files: ZipProjectFile[]) {
  const paths = files.map((file) => file.path);
  const packageJson = files.find((file) => basename(file.path) === 'package.json' && file.content)?.content ?? '';

  if (packageJson.includes('expo') || paths.some((path) => ['app.json', 'app.config.js', 'app.config.ts'].includes(basename(path)))) return 'Expo / React Native';
  if (packageJson.includes('next') || paths.some((path) => basename(path).startsWith('next.config'))) return 'Next.js';
  if (packageJson.includes('vite') || paths.some((path) => basename(path).startsWith('vite.config'))) return 'Vite';
  if (packageJson.includes('react-native')) return 'React Native';
  if (packageJson.includes('react')) return 'React';
  return 'unknown';
}

function rankFile(file: ZipProjectFile) {
  const path = file.path;
  const name = basename(path);
  if (PRIORITY_FILES.has(path) || PRIORITY_FILES.has(name)) return 0;
  if (PRIORITY_DIRS.some((dir) => path.startsWith(dir))) return 1;
  if (path.includes('/src/') || path.includes('/app/') || path.includes('/components/') || path.includes('/screens/')) return 2;
  if (path.endsWith('.md')) return 5;
  return 8;
}

function ignoredFolderList(counts: Map<string, number>) {
  return [...counts.entries()]
    .map(([folder, count]) => ({ folder, count }))
    .sort((a, b) => b.count - a.count || a.folder.localeCompare(b.folder));
}

export async function readZipProject(file: File): Promise<ZipProjectContext> {
  const buffer = new Uint8Array(await file.arrayBuffer());
  const entries = unzipSync(buffer);
  const rawPaths = Object.keys(entries).map(normalize).filter((path) => !path.endsWith('/'));
  const rootPath = detectRoot(rawPaths);
  const files: ZipProjectFile[] = [];
  const ignored = new Map<string, number>();

  for (const [rawPath, data] of Object.entries(entries)) {
    const fullPath = normalize(rawPath);
    if (fullPath.endsWith('/')) continue;

    const relativePath = relativeToRoot(fullPath, rootPath);
    const ignoredFolder = segmentIgnored(relativePath) ?? segmentIgnored(fullPath);
    if (ignoredFolder) {
      ignored.set(ignoredFolder, (ignored.get(ignoredFolder) ?? 0) + 1);
      continue;
    }

    const isText = looksText(relativePath);
    const entry: ZipProjectFile = { path: relativePath, size: data.length, isText };

    if (isText && data.length <= 80_000) {
      try {
        entry.content = strFromU8(data);
      } catch {
        entry.content = undefined;
      }
    }

    files.push(entry);
  }

  const sorted = files.sort((a, b) => rankFile(a) - rankFile(b) || a.path.localeCompare(b.path));
  const selected = sorted.filter((item) => item.isText && item.content).slice(0, 14);
  const framework = detectFramework(sorted);
  const packageManager = detectPackageManager(sorted);
  const ignoredFolders = ignoredFolderList(ignored);

  const projectOverview = [
    `Project ZIP: ${file.name}`,
    `Detected root: ${rootPath || '(zip root)'}`,
    `Detected framework: ${framework}`,
    `Detected package manager: ${packageManager}`,
    `Included files after filtering: ${files.length}`,
    `Ignored generated/dependency files: ${[...ignored.values()].reduce((sum, count) => sum + count, 0)}`,
    `Ignored folders: ${ignoredFolders.map((item) => `${item.folder} (${item.count})`).join(', ') || 'none'}`,
    `Priority files: ${selected.map((item) => item.path).join(', ') || 'none detected'}`,
  ].join('\n');

  const selectedText = selected
    .map((item) => `FILE: ${item.path}\n${item.content?.slice(0, 3000) ?? ''}`)
    .join('\n\n---\n\n');

  return {
    name: file.name,
    size: file.size,
    rootPath,
    framework,
    packageManager,
    fileCount: files.length,
    textFileCount: files.filter((item) => item.isText).length,
    ignoredCount: [...ignored.values()].reduce((sum, count) => sum + count, 0),
    ignoredFolders,
    files: sorted.slice(0, 250),
    summary: `${projectOverview}\n\n${selectedText}`,
  };
}
