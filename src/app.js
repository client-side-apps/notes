import * as UI from './ui.js';
import * as FileSystem from './file-system.js';
import * as DemoData from './demo-data.js';
import { Toast } from './toast.js';

document.addEventListener('DOMContentLoaded', () => {
    UI.init();

    const openDirBtn = document.getElementById('open-dir-btn');
    const loadDemoBtn = document.getElementById('load-demo-btn');
    const saveBtn = document.getElementById('save-btn');
    const restoreBtn = document.getElementById('restore-btn');

    // Check for previous session
    FileSystem.restoreDirectory().then(handle => {
        if (handle) {
            restoreBtn.hidden = false;
        }
    });

    restoreBtn.addEventListener('click', async () => {
        try {
            const handle = await FileSystem.restoreDirectory();
            if (handle) {
                // Verify permission
                const hasPerm = await FileSystem.verifyPermission(handle, false);
                if (hasPerm) {
                    const files = await FileSystem.readDirectory(handle);
                    UI.renderFileTree(files);
                    Toast.show('Session restored', 'success');
                    restoreBtn.hidden = true;
                } else {
                    Toast.show('Permission denied', 'error');
                }
            }
        } catch (err) {
            console.error('Error restoring session:', err);
            Toast.show('Failed to restore session', 'error');
        }
    });

    openDirBtn.addEventListener('click', async () => {
        try {
            const dirHandle = await FileSystem.openDirectory();
            if (dirHandle) {
                const files = await FileSystem.readDirectory(dirHandle);
                UI.renderFileTree(files);
                Toast.show('Directory opened', 'success');
            }
        } catch (err) {
            console.error('Error opening directory:', err);
            Toast.show('Failed to open directory. Please try again.', 'error');
        }
    });

    loadDemoBtn.addEventListener('click', () => {
        const demoFiles = DemoData.getDemoFiles();
        UI.renderFileTree(demoFiles);
        UI.setFileHandler(DemoData); // switch to demo data handler
        Toast.show('Demo data loaded', 'info');
        loadDemoBtn.hidden = true;
    });

    saveBtn.addEventListener('click', async () => {
        try {
            await UI.saveCurrentFile();
        } catch (err) {
            console.error('Error saving file:', err);
            Toast.show('Failed to save file.', 'error');
        }
    });

    // Auto-resize logic or other init can go here
});
