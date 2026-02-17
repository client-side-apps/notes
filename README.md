# Notes App

A simple client-side text editor for local files.
Features:
- Recursive directory browsing
- `.txt` and `.md` file editing
- Modern, dark-mode compatible UI
- Local File System Access (Chrome/Edge) or Demo Mode

## Browser Support

**Google Chrome** or **Microsoft Edge** are required to load a local folder (using the File System Access API).

## How to Run

Because this application uses ES Modules (`<script type="module">`), it must be served via a local web server. Opening `index.html` directly in the browser will result in CORS errors.

### Option 1: Python (Pre-installed on macOS/Linux)

Run this command in the project directory:

```bash
python3 -m http.server
```

Then open http://localhost:8000 in your browser.

### Option 2: Node.js (npx)

If you have Node.js installed, you can use `serve`:

```bash
npx serve .
```

Then open the URL shown in the terminal (usually http://localhost:3000).

