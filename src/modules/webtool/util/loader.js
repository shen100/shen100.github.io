export function loadResource(url, timeout = 10000) {
    return new Promise((resolve, reject) => {
        const isJS = url.endsWith('.js');
        const element = isJS ? document.createElement('script') : document.createElement('link');
        
        let timer = setTimeout(() => {
            cleanup();
            reject(new Error(`加载超时: ${url}`));
        }, timeout);

        function cleanup() {
            clearTimeout(timer);
            element.onload = element.onerror = null;
        }

        if (isJS) {
            element.src = url;
        } else {
            element.rel = 'stylesheet';
            element.href = url;
        }

        element.onload = () => {
            cleanup();
            resolve();
        };
        element.onerror = () => {
            cleanup();
            reject(new Error(`加载失败: ${url}`));
        };

        document.head.appendChild(element);
    });
}

