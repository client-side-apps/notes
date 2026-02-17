import * as FileSystem from './file-system.js';

let currentFileHandle = null;
let currentFileHandler = FileSystem; // Default to real file system
let unsavedChanges = false;

export function init() {
    const editor = document.getElementById('editor');
    editor.addEventListener('input', () => {
        if (!unsavedChanges) {
            setUnsavedChanges(true);
        }
    });
}

function setUnsavedChanges(value) {
    unsavedChanges = value;
    const indicator = document.getElementById('unsaved-indicator');
    const saveBtn = document.getElementById('save-btn');

    indicator.hidden = !value;
    saveBtn.disabled = !value;
}

export function setFileHandler(handler) {
    currentFileHandler = handler;
}

export function renderFileTree(files, container = document.getElementById('file-tree')) {
    container.innerHTML = '';
    const list = document.createElement('ul');
    list.className = 'file-list';

    // Sort: Folders first, then files. Alphabetical within groups.
    files.sort((a, b) => {
        if (a.kind === b.kind) {
            return a.name.localeCompare(b.name);
        }
        return a.kind === 'directory' ? -1 : 1;
    });

    files.forEach(file => {
        const li = document.createElement('li');

        if (file.kind === 'directory') {
            const folderDiv = document.createElement('div');
            folderDiv.className = 'folder-item';
            folderDiv.innerHTML = `<span class="icon">📁</span> ${file.name}`;
            li.appendChild(folderDiv);

            if (file.children && file.children.length > 0) {
                const childContainer = document.createElement('div');
                childContainer.className = 'folder-content';
                renderFileTree(file.children, childContainer); // Recursive render
                li.appendChild(childContainer);
            }
        } else {
            const fileDiv = document.createElement('div');
            fileDiv.className = 'file-item';
            fileDiv.innerHTML = `<span class="icon">📄</span> ${file.name}`;
            fileDiv.addEventListener('click', () => loadFile(file));
            li.appendChild(fileDiv);
        }

        list.appendChild(li);
    });

    container.appendChild(list);
}

async function loadFile(fileWrapper) {
    // Determine if we need to confirm discarding changes
    if (unsavedChanges) {
        if (!confirm('You have unsaved changes. Discard them?')) {
            return;
        }
    }

    try {
        const content = await currentFileHandler.readFile(fileWrapper.handle || fileWrapper);
        currentFileHandle = fileWrapper.handle || fileWrapper; // store handle

        const editorView = document.getElementById('editor-view');
        const welcomeMsg = document.getElementById('welcome-message');
        const filenameDisplay = document.getElementById('current-filename');
        const fileStatus = document.getElementById('file-status');
        const saveBtn = document.getElementById('save-btn');
        const editor = document.getElementById('editor');

        editor.value = content;
        // Display filename without extension
        filenameDisplay.textContent = fileWrapper.name.replace(/\.[^/.]+$/, "");

        editorView.hidden = false;
        welcomeMsg.hidden = true;
        fileStatus.hidden = false;
        saveBtn.hidden = false;

        setUnsavedChanges(false);

        // Highlight active file in tree
        document.querySelectorAll('.file-item').forEach(el => el.classList.remove('selected'));
        // (Simple highlighting logic, could be improved with unique IDs)
        // event.target.classList.add('selected'); 

    } catch (err) {
        console.error('Failed to load file', err);
        alert('Error reading file: ' + err.message);
    }
}

export async function saveCurrentFile() {
    if (!currentFileHandle) return;

    const editor = document.getElementById('editor');
    const content = editor.value;

    try {
        await currentFileHandler.saveFile(currentFileHandle, content);
        setUnsavedChanges(false);
    } catch (err) {
        throw err;
    }
}
