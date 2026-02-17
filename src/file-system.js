export async function openDirectory() {
    if (!window.showDirectoryPicker) {
        alert('File System Access API is not supported in this browser.');
        return null;
    }
    try {
        const dirHandle = await window.showDirectoryPicker();
        return dirHandle;
    } catch (err) {
        if (err.name === 'AbortError') {
            return null; // User cancelled
        }
        throw err;
    }
}

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
            // Recursive read
            const children = await readDirectory(entry);
            if (children.length > 0) { // Only add directories that have relevant content
                entries.push({
                    kind: 'directory',
                    name: entry.name,
                    handle: entry,
                    children: children
                });
            }
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
