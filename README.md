# Gemini Sidebar

A Chrome extension that adds a floating or split-screen Gemini sidebar to any webpage — toggle it instantly with a keyboard shortcut.

## Features

- **Float mode** — draggable sidebar that hovers over any page
- **Split mode** — sidebar docks to the right, page content resizes automatically
- **Collapse / expand** — click "Gemini ▾" to minimize to a thin header bar
- **Resize** — drag the left edge to adjust sidebar width
- **Reload button** — refresh Gemini without leaving the page
- **Keyboard shortcut** — `⌘+Shift+G` (Mac) / `Ctrl+Shift+G` (Windows/Linux)
- **Persistent state** — position, width, and mode are saved across page navigations

## Installation

### From Chrome Web Store
*(Coming soon)*

### Manual (Developer Mode)
1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions`
3. Enable **Developer mode** (top right)
4. Click **Load unpacked** and select this folder

## Usage

1. Visit any webpage
2. The Gemini sidebar appears automatically on the right
3. Use `⌘+Shift+G` or click the extension icon to toggle
4. Click **Gemini ▾** in the header to collapse/expand

## Permissions

| Permission | Purpose |
|-----------|---------|
| `declarativeNetRequest` | Allow Gemini to load inside the sidebar iframe |
| `storage` | Save sidebar preferences locally |
| `scripting` / `tabs` | Toggle sidebar via keyboard shortcut and popup |

All data stays on your device. Nothing is collected or transmitted externally.

## Privacy

See [Privacy Policy](https://gemini-sidebar.netlify.app) *(coming soon)*

## License

MIT — see [LICENSE](LICENSE)
