import { unref } from 'vue';
import themes from 'juejin-markdown-themes';

const modules = import.meta.glob('/node_modules/highlight.js/styles/*.min.css', { as: 'raw', eager: true });
const highlightThemes = {};
for (let path in modules) {
  const name = path.replace(/(\.\/|\.min\.css)$/i, '').replace('/node_modules/highlight.js/styles/', '');
  const theme = modules[path];
  highlightThemes[name] = { style: theme };
}

let $tree;
let $frontmatter;

const changeTheme = (themeName) => {
  removeTheme();
  const $style = document.createElement('style');
  $style.id = `md_document_${themeName}`
  $style.innerHTML = themes[themeName]?.style ?? themes['juejin'].style;
  document.head.appendChild($style);
  return () => {
    $style.remove();
  };
};

const removeTheme = () => {
  const $rm = document.getElementsByTagName('style')
  for (let i = 0; i < $rm.length; i++) {
    if ($rm[i].id.includes('md_document')) {
      document.head.removeChild($rm[i]);
    }
  }
};

const changeHighlightTheme = (themeName) => {
  removeHighlightTheme();
  const $style = document.createElement('style');
  $style.id = `md_highlightjs_${themeName}`
  $style.innerHTML = highlightThemes[themeName]?.style ?? highlightThemes['github'].style;
  document.head.appendChild($style);
  return () => {
    $style.remove();
  };
};
const removeHighlightTheme = () => {
  const $rm = document.getElementsByTagName('style')
  for (let i = 0; i < $rm.length; i++) {
    if ($rm[i].id.includes('md_highlightjs')) {
      document.head.removeChild($rm[i]);
    }
  }
};

export default (options = { theme: 'github', highlight: 'github' }) => {
  return {
    viewerEffect({ file }) {
      const themeName = unref(file)?.frontmatter?.theme || options.theme || 'github';
      const highlightName = unref(file)?.frontmatter?.highlight || options.highlight || 'github';
      changeTheme(themeName);
      changeHighlightTheme(highlightName);
    },
    actions: [
      {
        title: '选择主题',
        icon: '<svg t="1705299924584" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="24662" width="24" height="24"><path d="M924.99968 758.00064c-11.33056 0.67072-22.99904-0.9984-35.00032-5.00224a82.39104 82.39104 0 0 1-32-16.9984c-16.67072-12.672-35.328-22.67136-56.00256-29.99808a222.08 222.08 0 0 0-66.00192-12.00128c-39.33184 0-73.99936 9.00096-104.00256 26.99776-29.33248 18.00192-56.66816 45.33248-82.00192 82.00192-28.672 38.67136-64 69.00224-105.99936 90.99776s-88.66816 33.3312-140.00128 34.00192c-85.33504-2.00192-156.66688-32-214.00064-89.99936C32 780.672 2.00192 709.32992 0 624v-16c3.99872-146.00192 54.1696-266.99776 150.5024-362.99776S367.3344 99.328 512 96c144.67072 3.99872 265.32864 54.00064 361.99936 150.00064 96 96.67072 146.00192 217.33376 150.00064 361.99936v35.00032a575.05792 575.05792 0 0 1-3.00032 35.00032c-3.99872 21.32992-14.33088 39.33184-31.0016 54.00064-16 14.6688-35.67104 22.32832-58.99776 22.99904l-6.00064 3.00032z m-255.0016-153.99936c21.32992-5.32992 43.33056-7.33184 66.00192-6.00064 35.328 0 69.1712 5.49888 101.49888 16.50176s61.50144 26.8288 87.5008 47.49824c0-8.00256 0.32768-16.67072 0.9984-25.99936 1.3312-9.32864 2.00192-18.66752 2.00192-28.00128-2.66752-118.00064-43.33056-216.00256-121.99936-294.00064C728.00256 235.33056 630.00064 194.66752 512 192c-64.6656 0-124.00128 12.83072-178.00192 38.5024S233.66656 292.33152 195.00032 339.00032l-3.00032 3.00032c-24.66816 28.66688-46.6688 64.3328-66.00192 106.99776-18.66752 41.99936-28.66688 91.66848-29.99808 149.00224v25.99936c1.3312 59.33056 21.49888 108.32896 60.49792 147.00032s88.1664 57.99936 147.50208 57.99936c36.66944-0.67072 70.00064-9.00096 99.99872-25.00096 29.99808-16.67072 55.33184-40.33024 76.00128-70.99904 3.33312-2.00192 6.00064-5.00224 8.00256-9.00096 2.00192-3.328 4.66944-6.67136 8.00256-9.99936 19.99872-24.00256 38.67136-42.99776 56.00256-57.00096s35.99872-25.00096 56.00256-32.9984c19.31776-7.99744 39.99232-14.6688 61.98784-19.99872z m-462.99648 22.99904c18.00192-18.66752 40.66816-28.32896 67.99872-28.99968 27.33056 0.67072 50.00192 10.33216 67.99872 28.99968 18.00192 18.00192 27.33056 40.33024 28.00128 67.00032-0.6656 27.33056-9.99936 50.00192-28.00128 67.99872s-40.66816 27.33056-67.99872 28.00128c-27.33056-0.67072-50.00192-9.99936-67.99872-28.00128s-27.33056-40.66816-28.00128-67.99872c0.6656-26.67008 9.99936-48.9984 28.00128-67.00032z m38.99904-224c12.00128-12.00128 26.99776-18.33472 44.99968-19.00032 18.00192 0.6656 32.9984 6.99904 44.99968 19.00032 12.66688 12.00128 19.00032 26.99776 19.00032 44.99968s-6.33344 32.9984-19.00032 44.99968c-12.00128 12.00128-26.99776 18.33472-44.99968 19.00032-18.00192-0.6656-32.9984-6.99904-44.99968-19.00032s-18.33472-26.99776-19.00032-44.99968c0.6656-18.00192 6.99904-32.9984 19.00032-44.99968z m160-128c12.00128-12.00128 26.99776-18.3296 44.99968-19.00032 18.00192 0.67072 32.9984 6.99904 44.99968 19.00032 12.66688 12.00128 19.00032 26.99776 19.00032 44.99968s-6.33344 32.9984-19.00032 44.99968c-12.00128 12.00128-26.99776 18.33472-44.99968 19.00032-18.00192-0.6656-32.9984-6.99904-44.99968-19.00032s-18.33472-26.99776-19.00032-44.99968c0.6656-18.00192 6.99904-32.9984 19.00032-44.99968z m217.99936 19.00032c12.00128-12.00128 26.99776-18.3296 44.99968-19.00032 18.00192 0.67072 32.9984 6.99904 44.99968 19.00032s18.3296 26.99776 19.00032 44.99968c-0.67072 18.00192-6.99904 32.9984-19.00032 44.99968-12.00128 12.66688-26.99776 19.00032-44.99968 19.00032s-32.9984-6.33344-44.99968-19.00032c-12.672-12.00128-19.00032-26.99776-19.00032-44.99968s6.32832-32.9984 19.00032-44.99968z m138.99776 183.99744c8.66816-8.66816 19.99872-13.33248 34.00192-13.99808 13.33248 0.6656 24.66816 5.33504 34.00192 13.99808 8.66816 9.33376 13.33248 20.66944 13.99808 34.00192-0.67072 13.33248-5.32992 24.66816-13.99808 34.00192-9.32864 8.66816-20.66944 13.33248-34.00192 13.99808-13.99808-0.67072-25.32864-5.32992-34.00192-13.99808-9.32864-9.32864-13.99808-20.66944-13.99808-34.00192s4.66944-24.66816 13.99808-34.00192z" p-id="24663"></path></svg>',
        handler: {
          type: 'dropdown',
          actions: Object.keys(themes).map((themeName) => {
            return {
              title: themeName,
              handler: {
                type: 'action',
                click({ editor, appendBlock, codemirror }) {
                  if (!!$tree.children.length && $tree.children[0].type === 'yaml') {
                    $frontmatter = $tree.children[0];
                  } else {
                    $frontmatter = undefined;
                  }
                  if ($frontmatter) {
                    const machted = $frontmatter.value.match(/theme:\s*(\S*)/i);
                    if (machted) {
                      editor.setValue(editor.getValue().replace($frontmatter.value, $frontmatter.value.replace(/theme:\s*(\S*)/i, `theme: ${themeName}`)));
                    } else {
                      editor.setValue(editor.getValue().replace($frontmatter.value, $frontmatter.value + `\ntheme: ${themeName}`));
                    }
                  } else {
                    editor.setValue(`---\ntheme: ${themeName}\n---` + editor.getValue());
                  }
                }
              }
            };
          })
        }
      },
      {
        title: '选择代码高亮样式',
        icon: '<svg t="1705299649265" class="icon" viewBox="0 0 1194 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="8231" width="24" height="24"><path d="M1191.509333 505.856L718.933333 40.277333a10.581333 10.581333 0 0 0-14.933333 0L385.706667 353.877333a10.666667 10.666667 0 0 0-0.085334 15.018667l0.085334 0.170667 53.333333 52.565333-156.16 153.685333a10.666667 10.666667 0 0 0-0.170667 15.104l0.085334 0.085334 52.650666 51.882666L83.370667 891.733333h-72.533334a10.837333 10.837333 0 0 0-10.837333 10.666667v73.642667c0 5.802667 4.778667 10.581333 10.666667 10.581333h459.946666a10.496 10.496 0 0 0 7.424-2.986667l101.461334-100.864 53.76 53.077334a10.581333 10.581333 0 0 0 15.018666 0l156.16-154.112 53.418667 52.650666a10.581333 10.581333 0 0 0 14.933333 0l318.293334-313.6a10.24 10.24 0 0 0 0.426666-14.933333zM434.346667 890.965333H220.757333l179.2-177.408L506.88 818.858667l-72.362667 72.192z m206.336-82.773333L412.245333 582.826667l91.477334-90.112 228.522666 225.28L640.853333 808.106667z m224.682666-101.546667L515.072 361.472l196.437333-193.450667 350.378667 345.344-196.437333 193.28z" p-id="8232"></path></svg>',
        handler: {
          type: 'dropdown',
          actions: Object.keys(highlightThemes).map((themeName) => {
            return {
              title: themeName,
              handler: {
                type: 'action',
                click({ editor, appendBlock, codemirror }) {
                  if (!!$tree.children.length && $tree.children[0].type === 'yaml') {
                    $frontmatter = $tree.children[0];
                  } else {
                    $frontmatter = undefined;
                  }
                  if ($frontmatter) {
                    const machted = $frontmatter.value.match(/highlight:\s*(\S*)/i);
                    if (machted) {
                      editor.setValue(editor.getValue().replace($frontmatter.value, $frontmatter.value.replace(/highlight:\s*(\S*)/i, `highlight: ${themeName}`)));
                    } else {
                      editor.setValue(editor.getValue().replace($frontmatter.value, $frontmatter.value + `\nhighlight: ${themeName}`));
                    }
                  } else {
                    editor.setValue(`---\nhighlight: ${themeName}\n---` + editor.getValue());
                  }
                }
              }
            };
          })
        }
      }
    ],
    remark(processor) {
      return processor.use(() => (tree) => {
        $tree = tree;
      });
    }
  }
};
