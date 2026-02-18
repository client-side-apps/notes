/**
 * @typedef {Object} AppState
 * @property {FileSystemHandle|null} currentFileHandle - Handle of the currently open file
 * @property {boolean} unsavedChanges - Whether the current file has unsaved changes
 * @property {string} rootDirectoryName - Name of the open directory
 */

class Store {
    constructor() {
        /** @type {AppState} */
        this.state = {
            currentFileHandle: null,
            unsavedChanges: false,
            rootDirectoryName: null,
        };
        this.listeners = new Set();
    }

    /**
     * Update the state and notify listeners.
     * @param {Partial<AppState>} newState 
     */
    setState(newState) {
        this.state = { ...this.state, ...newState };
        this.notify();
    }

    /**
     * Get the current state.
     * @returns {AppState}
     */
    getState() {
        return this.state;
    }

    /**
     * Subscribe to state changes.
     * @param {Function} listener 
     * @returns {Function} Unsubscribe function
     */
    subscribe(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    notify() {
        this.listeners.forEach(listener => listener(this.state));
    }
}

export const store = new Store();
