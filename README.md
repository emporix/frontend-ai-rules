# frontend-ai-rules

Organization-wide coding standards, architectural guidelines, and tech-stack preferences for Emporix frontend applications.

By linking this repository to your project, AI agents (**Cursor**, **GitHub Copilot**, and **Claude Code**) align code generation with our engineering standards.

## Contents

```
frontend-ai-rules/
├── README.md
├── package.json
├── scripts/sync-rules.js           # Cross-platform sync script
├── cursor/
│   ├── cursorrules.template          # → project .cursorrules
│   └── rules/*.mdc                   # → project .cursor/rules/
├── copilot/
│   ├── copilot-instructions.md       # → .github/copilot-instructions.md
│   └── instructions/*.instructions.md # → .github/instructions/
└── claude/
    ├── CLAUDE.md.template            # → .claude/CLAUDE.md
    └── rules/*.md                    # → .claude/rules/
```

Every Cursor rule has a matching Copilot and Claude Code file:

| Cursor | Copilot | Claude Code | Scope |
|--------|---------|-------------|-------|
| `00-core.mdc` | `00-core.instructions.md` | `00-core.md` | Always |
| `ui-components.mdc` | `ui-components.instructions.md` | `ui-components.md` | Components / pages |
| `testing.mdc` | `testing.instructions.md` | `testing.md` | Test files |
| `api-data.mdc` | `api-data.instructions.md` | `api-data.md` | API / service layer |
| `performance.mdc` | `performance.instructions.md` | `performance.md` | Component performance |
| `git-workflow.mdc` | `git-workflow.instructions.md` | `git-workflow.md` | Git / commits |
| `emporix-component-library.mdc` | `emporix-component-library.instructions.md` | `emporix-component-library.md` | TSX files |
| `i18n.mdc` | `i18n.instructions.md` | `i18n.md` | Translations |
| `primereact.mdc` | `primereact.instructions.md` | `primereact.md` | PrimeReact (optional) |
| `module-federation.mdc` | `module-federation.instructions.md` | `module-federation.md` | Federation (optional) |

## Technology Stack Covered

| Area | Convention |
|------|------------|
| Framework | React 18, TypeScript (strict), Vite |
| Styling | SCSS Modules, no inline styles |
| Testing | Vitest, Testing Library, colocated tests |
| UI | PrimeReact (optional), `@emporix/component-library` |
| i18n | react-i18next |
| API layer | REST services in `src/api/` or `src/services/` (optional) |
| Micro-frontends | Module Federation patterns (optional) |

---

## How to Add These Rules to Your Project (Approach 1 — recommended)

Link this repository to any frontend polyrepo or monorepo sub-project using `devDependencies`. Rules sync automatically on install.

### Step 1: Add the repository as a dependency

Open your project's `package.json` and add this repository to `devDependencies`:

```json
"devDependencies": {
  "frontend-ai-rules": "git+https://github.com/emporix/frontend-ai-rules.git#master"
}
```

> **Tip:** Replace `#master` with a specific tag or commit SHA (e.g. `#v1.0.0`) to lock the rule version for stability.

### Step 2: Automate the sync script

Add a `postinstall` hook so rules are copied from `node_modules` to your project root whenever a developer runs install:

```json
"scripts": {
  "postinstall": "node node_modules/frontend-ai-rules/scripts/sync-rules.js"
}
```

This script is cross-platform (Mac, Linux, Windows) and syncs:

| Source (in package) | Destination (in your project) |
|---------------------|-------------------------------|
| `cursor/cursorrules.template` | `.cursorrules` |
| `cursor/rules/*` | `.cursor/rules/` |
| `copilot/copilot-instructions.md` | `.github/copilot-instructions.md` |
| `copilot/instructions/*` | `.github/instructions/` |
| `claude/CLAUDE.md.template` | `.claude/CLAUDE.md` |
| `claude/rules/*` | `.claude/rules/` |

You can also run sync manually:

```bash
npx sync-frontend-ai-rules
# or
node node_modules/frontend-ai-rules/scripts/sync-rules.js
```

### Step 3: Run installation

```bash
npm install
# or
pnpm install
# or
yarn install
```

After install you should see `✅ Global AI rules synced` in the output.

---

## How to Add Project-Specific Rules

Synced index files (`.cursorrules`, `.github/copilot-instructions.md`, `.claude/CLAUDE.md`) and generic rule files **are overwritten** whenever `npm install` runs.

Do **not** edit synced generic rule filenames for project customization — those changes will be lost on the next install.

For project-specific instructions (unique APIs, domain models, feature conventions):

1. Create additional rule files with **unique names** in `.cursor/rules/` (e.g. `execution-template.mdc`, `project-custom.mdc`).
2. For Copilot, add matching files under `.github/instructions/` (e.g. `execution-template.instructions.md`).
3. For Claude Code, add matching files under `.claude/rules/` (e.g. `execution-template.md`).
4. Register project-specific rules in a **local-only** index snippet or team docs — the synced index template includes a "Project-Specific Rules" table you maintain outside the package (e.g. in a `project-ai-rules.md` committed separately, or documented in your team wiki).

Cursor combines the global `.cursorrules` index with local `.cursor/rules/*.mdc` files automatically.

---

## How to Add These Rules Manually (Approach 2)

Use this when you cannot add a git `devDependencies` entry (e.g. offline mirrors, custom tooling).

### Cursor

```bash
cp -r path/to/frontend-ai-rules/cursor/rules/* .cursor/rules/
cp path/to/frontend-ai-rules/cursor/cursorrules.template .cursorrules
```

### GitHub Copilot

```bash
mkdir -p .github/instructions
cp path/to/frontend-ai-rules/copilot/copilot-instructions.md .github/copilot-instructions.md
cp -r path/to/frontend-ai-rules/copilot/instructions/* .github/instructions/
```

### Claude Code

```bash
mkdir -p .claude/rules
cp path/to/frontend-ai-rules/claude/CLAUDE.md.template .claude/CLAUDE.md
cp -r path/to/frontend-ai-rules/claude/rules/* .claude/rules/
```

Run `/memory` in Claude Code to verify loaded rules.

---

## Keep Indexes in Sync

When customizing manually, `.cursorrules`, `.github/copilot-instructions.md`, and `.claude/CLAUDE.md` should contain the same index content. Only the rule file paths differ per agent.

---

## Updating Rules

When generic rules change in this repo:

1. Bump the git ref in your `devDependencies` (or run `npm install` on `#master`).
2. The `postinstall` script re-syncs all agent files.
3. Reconcile any project-specific rules that extend the generic set.

---

## Reference Implementation

[cop-module](https://github.com/emporix/cop-module) extends these generic rules with domain-specific files such as `execution-template.mdc`, `process-diagram.mdc`, and project-specific federation provider hierarchy.
