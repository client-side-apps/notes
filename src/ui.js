import * as FileSystem from './file-system.js';
import { store } from './store.js';
import { Toast } from './toast.js';

let currentFileHandler = FileSystem; // Default to real file system
let pendingFile = null;

/**
 * Initializes the UI event listeners and store subscriptions.
 */
export function init() {
    const editor = document.getElementById('editor');

    editor.addEventListener('input', () => {
        const { unsavedChanges } = store.getState();
        if (!unsavedChanges) {
            store.setState({ unsavedChanges: true });
        }
    });

    editor.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = editor.selectionStart;
            const end = editor.selectionEnd;

            // Insert 4 spaces
            editor.setRangeText('    ', start, end, 'end');

            // Fire input event to update state
            editor.dispatchEvent(new Event('input'));
        }
    });

    // Subscribe to state changes
    store.subscribe((state) => {
        const indicator = document.getElementById('unsaved-indicator');
        const saveBtn = document.getElementById('save-btn');
        const fileStatus = document.getElementById('file-status');
        const welcomeMsg = document.getElementById('welcome-message');
        const editorView = document.getElementById('editor-view');

        // Update Unsaved Indicator
        if (state.unsavedChanges) {
            indicator.hidden = false;
            saveBtn.disabled = false;
        } else {
            indicator.hidden = true;
            saveBtn.disabled = true;
        }

        // Update Editor Visibility
        if (state.currentFileHandle) {
            editorView.hidden = false;
            welcomeMsg.hidden = true;
            fileStatus.hidden = false;
            saveBtn.hidden = false;
            saveBtn.hidden = false;
        } else {
            editorView.hidden = true;
            welcomeMsg.hidden = false;
            fileStatus.hidden = true;
            saveBtn.hidden = true;
        }
    });

    // Dialog Listeners
    const dialog = document.getElementById('unsaved-dialog');
    const cancelBtn = document.getElementById('cancel-nav-btn');
    const discardBtn = document.getElementById('discard-changes-btn');

    cancelBtn.addEventListener('click', () => {
        pendingFile = null;
        dialog.close();
    });

    discardBtn.addEventListener('click', async () => {
        dialog.close();
        if (pendingFile) {
            await loadContent(pendingFile);
        }
        pendingFile = null;
    });
}

/**
 * Sets the file system handler (real or demo).
 * @param {Object} handler 
 */
export function setFileHandler(handler) {
    currentFileHandler = handler;
}

/**
 * Renders the file tree from a list of files.
 * @param {Array} files 
 * @param {HTMLElement} container 
 */
export function renderFileTree(files, container = document.getElementById('file-tree')) {
    if (container.id === 'file-tree') container.innerHTML = ''; // Clear root only

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

            const childContainer = document.createElement('div');
            childContainer.className = 'folder-content';
            childContainer.hidden = true; // Collapsed by default

            // Render children if present
            if (file.children && file.children.length > 0) {
                renderFileTree(file.children, childContainer);
            } else {
                childContainer.innerHTML = '<div class="empty-folder">Empty</div>';
            }

            folderDiv.addEventListener('click', (e) => {
                e.stopPropagation();
                // Toggle Expand/Collapse
                if (childContainer.hidden) {
                    folderDiv.classList.add('expanded');
                    childContainer.hidden = false;
                } else {
                    folderDiv.classList.remove('expanded');
                    childContainer.hidden = true;
                }
            });

            li.appendChild(folderDiv);
            li.appendChild(childContainer);
        } else {
            const fileDiv = document.createElement('div');
            fileDiv.className = 'file-item';
            fileDiv.innerHTML = `<span class="icon">📄</span> ${file.name}`;
            fileDiv.addEventListener('click', (e) => {
                e.stopPropagation();
                loadFile(file);
            });
            li.appendChild(fileDiv);
        }

        list.appendChild(li);
    });

    container.appendChild(list);
}

// Helper to actual load
async function loadContent(fileWrapper) {
    try {
        const content = await currentFileHandler.readFile(fileWrapper.handle || fileWrapper);

        const filenameDisplay = document.getElementById('current-filename');
        const editor = document.getElementById('editor');

        editor.value = content;
        // Display filename without extension
        filenameDisplay.textContent = fileWrapper.name.replace(/\.[^/.]+$/, "");

        // Trigger update for state
        editor.dispatchEvent(new Event('input', { bubbles: true }));
        // Reset unsaved changes immediately after content load
        store.setState({
            currentFileHandle: fileWrapper.handle || fileWrapper,
            unsavedChanges: false
        });

        // Highlight active file in tree
        document.querySelectorAll('.file-item').forEach(el => el.classList.remove('selected'));
        // (Simple highlighting logic, could be improved with unique IDs)
        // TODO: Add selection class to the clicked element if we had reference, but for now this clears old one.

    } catch (err) {
        console.error('Failed to load file', err);
        Toast.show('Error reading file: ' + err.message, 'error');
    }
}

async function loadFile(fileWrapper) {
    const { unsavedChanges } = store.getState();
    const dialog = document.getElementById('unsaved-dialog');

    if (unsavedChanges) {
        // Store pending file
        dialog.dataset.pendingFileIndex = JSON.stringify(fileWrapper); // Simple serialization for demo/file handles might fail if circular. 
        // Better: store in module-level var or just attach object to dialog (if handle is transferable/references work)
        // Since fileWrapper contains functions/handles, JSON.stringify might fail or lose data.
        // Let's use a module-level variable for pendingFile.
        pendingFile = fileWrapper;
        dialog.showModal();
    } else {
        await loadContent(fileWrapper);
    }
}

/**
 * Saves the currently open file content.
 * @throws {Error} If save fails
 */
export async function saveCurrentFile() {
    const { currentFileHandle } = store.getState();
    if (!currentFileHandle) return;

    const editor = document.getElementById('editor');
    const content = editor.value;

    try {
        await currentFileHandler.saveFile(currentFileHandle, content);
        store.setState({ unsavedChanges: false });
        Toast.show('File saved successfully', 'success');
    } catch (err) {
        throw err;
    }
}
