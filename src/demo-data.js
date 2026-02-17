export function getDemoFiles() {
    return [
        {
            kind: 'directory',
            name: 'Project Docs',
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
    ];
}

export function readFile(fileWrapper) {
    return Promise.resolve(fileWrapper.content);
}

export function saveFile(fileWrapper, content) {
    console.log('Demo Save:', fileWrapper.name, content);
    fileWrapper.content = content; // Update memory mock
    return Promise.resolve();
}
