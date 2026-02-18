const createHandle = (file) => {
    file.handle = file;
    if (file.children) {
        file.children.forEach(createHandle);
    }
    return file;
};

export function getDemoFiles() {
    // Return top-level items
    return [
        {
            kind: 'directory',
            name: 'Project Docs',
            // Mock handle features for recursion
            children: [
                { kind: 'file', name: 'readme.txt', content: 'This is a demo readme file.' },
                { kind: 'file', name: 'plan.md', content: '# Project Plan\n\n1. Start\n2. Finish' }
            ]
        },
        {
            kind: 'file',
            name: 'notes.md',
            content: '# Daily Notes\n\n- Buy milk\n- Write code'
        },
        {
            kind: 'file',
            name: 'todo.txt',
            content: 'TODO list:\n[ ] Item 1\n[ ] Item 2'
        }
    ].map(createHandle);
}

export async function readDirectory(dirHandle) {
    if (dirHandle.children) {
        return dirHandle.children.map(child => ({
            ...child,
            handle: child // Self-reference for mock handles
        }));
    }
    return [];
}

export function readFile(fileWrapper) {
    return Promise.resolve(fileWrapper.content);
}

export function saveFile(fileWrapper, content) {
    console.log('Demo Save:', fileWrapper.name, content);
    fileWrapper.content = content; // Update memory mock
    return Promise.resolve();
}
