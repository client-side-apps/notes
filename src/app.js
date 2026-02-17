import * as UI from './ui.js';
import * as FileSystem from './file-system.js';
import * as DemoData from './demo-data.js';

document.addEventListener('DOMContentLoaded', () => {
    UI.init();

    const openDirBtn = document.getElementById('open-dir-btn');
    const loadDemoBtn = document.getElementById('load-demo-btn');
    const saveBtn = document.getElementById('save-btn');

    openDirBtn.addEventListener('click', async () => {
        try {
            const dirHandle = await FileSystem.openDirectory();
            if (dirHandle) {
                const files = await FileSystem.readDirectory(dirHandle);
                UI.renderFileTree(files);
            }
        } catch (err) {
            console.error('Error opening directory:', err);
            alert('Failed to open directory. Please try again.');
        }
    });

    loadDemoBtn.addEventListener('click', () => {
        const demoFiles = DemoData.getDemoFiles();
        UI.renderFileTree(demoFiles);
        UI.setFileHandler(DemoData); // switch to demo data handler
    });

    saveBtn.addEventListener('click', async () => {
        try {
            await UI.saveCurrentFile();
        } catch (err) {
            console.error('Error saving file:', err);
            alert('Failed to save file.');
        }
    });

    // Auto-resize logic or other init can go here
});
