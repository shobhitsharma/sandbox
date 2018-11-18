const VENDOR_CDN = "https://unpkg.com"
const LOADED_FILES_CACHE = {};

const addJSFile = function (path, done) {
  if (LOADED_FILES_CACHE[path]) return done();

  const node = document.createElement('script');

  node.src = path;
  node.addEventListener('load', () => {
    LOADED_FILES_CACHE[path] = true;
    done();
  });
  document.body.appendChild(node);
}
const addCSSFile = function (path, done) {
  if (LOADED_FILES_CACHE[path]) return done();

  const node = document.createElement('link');

  node.setAttribute('rel', 'stylesheet');
  node.setAttribute('type', 'text/css');
  node.setAttribute('href', path);
  node.addEventListener('load', () => {
    LOADED_FILES_CACHE[path] = true;
    done();
  });
  document.body.appendChild(node);
}
const load = async function (dependencies, status = () => {}) {
  return new Promise(done => {
    (function load(index) {
      status(index);
      if (index === dependencies.length) {
        done();
        return;
      }

      const resource = dependencies[index];
      const extension = resource.split('.').pop().toLowerCase();
  
      if (extension === 'js') {
        addJSFile(resource, () => load(index + 1))
      } else if (extension === 'css') {
        addCSSFile(resource, () => load(index + 1));
      } else {
        load(index + 1)
      }
    })(0);
  });
}

export default function dependencies({ storage, changePage }) {
  return {
    name: 'dependencies',
    async didMount({ el }) {
      const progress = el('.value');
      const currentFile = el('.file');
      const dependencies = [
        `${VENDOR_CDN}/codemirror@5.41.0/lib/codemirror.js`,
        `${VENDOR_CDN}/codemirror@5.41.0/mode/javascript/javascript.js`,
        `${VENDOR_CDN}/codemirror@5.41.0/mode/xml/xml.js`,
        `${VENDOR_CDN}/codemirror@5.41.0/mode/jsx/jsx.js`,
        `${VENDOR_CDN}/codemirror@5.41.0/addon/selection/mark-selection.js`,
        `${VENDOR_CDN}/split.js@1.5.9/dist/split.js`,
        `${VENDOR_CDN}/babel-standalone@6.26.0/babel.min.js`,
        `${VENDOR_CDN}/babel-polyfill@6.26.0/dist/polyfill.min.js`,
        `${VENDOR_CDN}/codemirror@5.41.0/lib/codemirror.css`,
        `${VENDOR_CDN}/codemirror@5.41.0/theme/${ storage.getEditorSettings().theme }.css`,
        ...storage.getDependencies()
      ];

      await load(dependencies, index => {
        progress.css('width', (100 * (index / dependencies.length)) + '%');
        if (index < dependencies.length) {
          currentFile.content(dependencies[index].split(/\//).pop());
        } else {
          currentFile.css('opacity', 0);
          changePage('editor');
        }
      });
    }
  }
}