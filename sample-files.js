// FileBrowserModel.sampleFiles and the matching native table and sidebar renders.
const sampleFiles = [
  {
    "path": "/workspace",
    "kind": "folder",
    "folderRender": 0
  },
  {
    "path": "/workspace/website",
    "kind": "folder",
    "rowRender": 3,
    "folderRender": 1
  },
  {
    "path": "/workspace/design-assets",
    "kind": "folder",
    "modified": "Yesterday, 16:18",
    "rowRender": 0,
    "folderRender": 2
  },
  {
    "path": "/workspace/notes",
    "kind": "folder",
    "modified": "Monday, 09:30",
    "rowRender": 2,
    "folderRender": 3
  },
  {
    "path": "/workspace/experiments",
    "kind": "folder",
    "modified": "Monday, 09:30",
    "rowRender": 1,
    "folderRender": 4
  },
  {
    "path": "/workspace/website/assets",
    "kind": "folder",
    "rowRender": 4,
    "folderRender": 5
  },
  {
    "path": "/workspace/website/docs",
    "kind": "folder",
    "modified": "Yesterday, 16:18",
    "rowRender": 5,
    "folderRender": 6
  },
  {
    "path": "/workspace/website/public",
    "kind": "folder",
    "modified": "Yesterday, 11:24",
    "rowRender": 6,
    "folderRender": 7
  },
  {
    "path": "/workspace/website/src",
    "kind": "folder",
    "rowRender": 7,
    "folderRender": 8
  },
  {
    "path": "/workspace/website/README.md",
    "kind": "markdown",
    "text": "# A little space to build.\n\nA website for ideas worth sharing.\nBuilt with React and TypeScript.\n\n## Getting started\n\nnpm install\nnpm run dev\n\n## Project structure\n\nsrc/      Application source\npublic/   Static files\nassets/   Images and fonts\n\nMake something good.",
    "bytes": 2418,
    "rowRender": 12
  },
  {
    "path": "/workspace/website/package.json",
    "kind": "json",
    "text": "{\n  \"name\": \"website\",\n  \"version\": \"1.0.0\",\n  \"private\": true,\n  \"scripts\": {\n    \"dev\": \"vite\",\n    \"build\": \"tsc && vite build\"\n  }\n}",
    "bytes": 1240,
    "rowRender": 11
  },
  {
    "path": "/workspace/website/package-lock.json",
    "kind": "json",
    "modified": "Yesterday, 14:06",
    "bytes": 184230,
    "rowRender": 10
  },
  {
    "path": "/workspace/website/tsconfig.json",
    "kind": "json",
    "modified": "Monday, 09:30",
    "bytes": 632,
    "rowRender": 13
  },
  {
    "path": "/workspace/website/vite.config.ts",
    "kind": "code",
    "modified": "Monday, 09:30",
    "text": "import { defineConfig } from 'vite';\nimport react from '@vitejs/plugin-react';\n\nexport default defineConfig({\n  plugins: [react()],\n});",
    "bytes": 286,
    "rowRender": 14
  },
  {
    "path": "/workspace/website/.gitignore",
    "kind": "text",
    "text": "node_modules\ndist\n.env\n.DS_Store",
    "bytes": 184,
    "rowRender": 9
  },
  {
    "path": "/workspace/website/.env.example",
    "kind": "text",
    "text": "PUBLIC_SITE_NAME=My website",
    "bytes": 64,
    "rowRender": 8
  },
  {
    "path": "/workspace/website/src/components",
    "kind": "folder",
    "rowRender": 22,
    "folderRender": 9
  },
  {
    "path": "/workspace/website/src/styles",
    "kind": "folder",
    "rowRender": 23,
    "folderRender": 10
  },
  {
    "path": "/workspace/website/src/App.tsx",
    "kind": "code",
    "text": "export default function App() {\n  return (\n    <main>\n      <h1>A little space to build.</h1>\n      <p>Make something good.</p>\n    </main>\n  );\n}",
    "bytes": 4832,
    "rowRender": 24
  },
  {
    "path": "/workspace/website/src/main.tsx",
    "kind": "code",
    "bytes": 380,
    "rowRender": 25
  },
  {
    "path": "/workspace/website/src/components/Header.tsx",
    "kind": "code",
    "bytes": 1860,
    "rowRender": 27
  },
  {
    "path": "/workspace/website/src/components/Button.tsx",
    "kind": "code",
    "bytes": 920,
    "rowRender": 26
  },
  {
    "path": "/workspace/website/src/styles/global.css",
    "kind": "code",
    "bytes": 3420,
    "rowRender": 28
  },
  {
    "path": "/workspace/website/assets/landscape.png",
    "kind": "image",
    "bytes": 842300,
    "rowRender": 18
  },
  {
    "path": "/workspace/website/assets/wordmark.svg",
    "kind": "image",
    "bytes": 4200,
    "rowRender": 19
  },
  {
    "path": "/workspace/website/docs/getting-started.md",
    "kind": "markdown",
    "text": "# Getting started\n\nWelcome to your workspace.\n\nKeep your source in src/ and your\nstatic files in public/.",
    "bytes": 1840,
    "rowRender": 20
  },
  {
    "path": "/workspace/website/public/favicon.svg",
    "kind": "image",
    "bytes": 1032,
    "rowRender": 21
  },
  {
    "path": "/workspace/design-assets/Brand guide.md",
    "kind": "markdown",
    "modified": "Yesterday, 16:18",
    "bytes": 3210,
    "rowRender": 15
  },
  {
    "path": "/workspace/notes/Ideas.md",
    "kind": "markdown",
    "text": "# Ideas\n\nA simpler homepage.\nA space for things in progress.\nA few thoughtful details.",
    "bytes": 840,
    "rowRender": 16
  },
  {
    "path": "/workspace/notes/todo.txt",
    "kind": "text",
    "text": "Polish the navigation\nChoose a typeface\nShip the first version",
    "bytes": 128,
    "rowRender": 17
  }
];
