export class Toast {
    /**
     * Show a toast message.
     * @param {string} message - The message to display.
     * @param {'info'|'success'|'error'} type - The type of toast.
     * @param {number} duration - Duration in ms.
     */
    static show(message, type = 'info', duration = 3000) {
        const container = document.getElementById('toast-container') || this.createContainer();

        const toast = document.createElement('dialog');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;

        container.appendChild(toast);
        toast.show();

        // Trigger reflow for animation
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        setTimeout(() => {
            toast.classList.remove('show');
            toast.addEventListener('transitionend', () => {
                toast.close();
                toast.remove();
                if (container.children.length === 0) {
                    container.remove();
                }
            });
        }, duration);
    }

    static createContainer() {
        const container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
        return container;
    }
}
