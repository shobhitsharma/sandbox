import { isLocalStorageAvailable } from './utils';

const EMPTY_FILE = {
  content: '',
  filename: 'untitled.js',
  editing: false
};

export const LS_KEY = 'SANDBOX_EDITOR';
export const DEFAULT_STATE = {
  editor: { theme: 'material' },
  dependencies: [],
  files: [ EMPTY_FILE ]
};

const resolveActiveFileIndex = function (files) {
  const hash = location.hash.replace(/^#/, '');

  if (hash !== '') {
    const found = files.findIndex(({ filename }) => filename === hash);

    if (found >= 0) {
      return found;
    }
  }
  return 0;
}

export default function createStorage() {
  const localStorageAvailable = isLocalStorageAvailable();
  const onChangeListeners = [];
  var state = DEFAULT_STATE;
  var activeFileIndex = resolveActiveFileIndex(state.files);

  const notify = () => onChangeListeners.forEach(c => c());
  const syncState = () => {
    if (localStorageAvailable) {
      localStorage.setItem(LS_KEY, JSON.stringify(state));
    }
  }
  
  const api = {
    setState(newState) {
      state = newState;
      activeFileIndex = resolveActiveFileIndex(state.files);
      syncState();
    },
    getCurrentIndex() {
      return activeFileIndex;
    },
    setCurrentIndex(idx) {
      activeFileIndex = idx;
      location.hash = state.files[idx].filename;
      notify();
    },
    isCurrentIndex(idx) {
      return activeFileIndex === idx;
    },
    getCurrentFile() {
      return this.getFiles()[activeFileIndex];
    },
    getFiles() {
      return state.files;
    },
    dump() {
      return state;
    },
    getDependencies() {
      return state.dependencies;
    },
    setDependencies(dependencies) {
      state.dependencies = dependencies;
      syncState();
      notify();
    },
    getEditorSettings() {
      return state.editor;
    },
    getFileAt(index) {
      return this.getFiles()[index];
    },
    makeSureOneFileAtLeast() {
      if (this.getFiles().length === 0) {
        state.files.push(EMPTY_FILE);
        this.setCurrentIndex(0);
        syncState();
      }
    },
    editFile(index, updates) {
      state.files[index] = {
        ...state.files[index],
        ...updates
      };
      syncState();
      notify();
      this.setCurrentIndex(activeFileIndex);
    },
    editCurrentFile(updates) {
      this.editFile(activeFileIndex, updates);
    },
    changeActiveFile(index) {
      this.setCurrentIndex(index);
      return this.getCurrentFile();
    },
    addNewFile() {
      state.files.push(EMPTY_FILE);
      syncState();
      return this.changeActiveFile(state.files.length - 1);
    },
    deleteFile(index) {
      if (index === activeFileIndex) {
        state.files.splice(index, 1);
        syncState();
        this.setCurrentIndex(0);
      } else {
        const currentFile = this.getCurrentFile();
        state.files.splice(index, 1);
        syncState();
        this.setCurrentIndex(this.getFiles().findIndex(file => file === currentFile) || 0);
      }
    },
    clear() {
      if (isLocalStorageAvailable) {
        localStorage.clear();
      }
      notify();
    },
    listen(callback) {
      onChangeListeners.push(callback);
    }
  }

  api.makeSureOneFileAtLeast();

  return api;
}