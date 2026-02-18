import * as DB from './db.js';

/**
 * Opens a directory picker and stores the handle.
 * @returns {Promise<FileSystemDirectoryHandle|null>}
 */
export async function openDirectory() {
    if (!window.showDirectoryPicker) {
        alert('File System Access API is not supported in this browser.');
        return null;
    }
    try {
        const dirHandle = await window.showDirectoryPicker();
        await DB.set('root_dir', dirHandle);
        return dirHandle;
    } catch (err) {
        if (err.name === 'AbortError') {
            return null; // User cancelled
        }
        throw err;
    }
}

/**
 * Retrieves the stored directory handle from the previous session.
 * @returns {Promise<FileSystemDirectoryHandle|undefined>}
 */
export async function restoreDirectory() {
    return await DB.get('root_dir');
}

/**
 * Verifies if the user has granted permission to read/write.
 * @param {FileSystemHandle} fileHandle 
 * @param {boolean} readWrite 
 * @returns {Promise<boolean>}
 */
export async function verifyPermission(fileHandle, readWrite) {
    const options = {};
    if (readWrite) {
        options.mode = 'readwrite';
    }
    if ((await fileHandle.queryPermission(options)) === 'granted') {
        return true;
    }
    if ((await fileHandle.requestPermission(options)) === 'granted') {
        return true;
    }
    return false;
}

/**
 * Reads a directory and returns its entries (non-recursive).
 * @param {FileSystemDirectoryHandle} dirHandle 
 * @returns {Promise<Array<{kind: 'file'|'directory', name: string, handle: FileSystemHandle, children?: Array}>>}
 */
export async function readDirectory(dirHandle) {
    const entries = [];
    for await (const entry of dirHandle.values()) {
        if (entry.kind === 'file') {
            if (entry.name.endsWith('.txt') || entry.name.endsWith('.md')) {
                entries.push({
                    kind: 'file',
                    name: entry.name,
                    handle: entry
                });
            }
        } else if (entry.kind === 'directory') {
            // Recursive: Read children immediately
            const children = await readDirectory(entry);
            entries.push({
                kind: 'directory',
                name: entry.name,
                handle: entry,
                children: children
            });
        }
    }
    return entries;
}

export async function readFile(fileHandle) {
    const file = await fileHandle.getFile();
    const text = await file.text();
    return text;
}

export async function saveFile(fileHandle, content) {
    const writable = await fileHandle.createWritable();
    await writable.write(content);
    await writable.close();
}
