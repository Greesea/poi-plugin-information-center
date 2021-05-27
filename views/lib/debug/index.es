import {EXTENSION_KEY, EXTENSION_NAME} from "../../constants.es";
import kckit from "kckit";

let noop = () => {
};
let createLogHook = type => {
    return function () {
        console[type].apply(this, [`[${EXTENSION_KEY}]`].concat(Array.from(arguments)));
    }
};
let hookConfig = {
    log: createLogHook("log"),
    warn: createLogHook("warn"),
    info: createLogHook("info"),
    error: createLogHook("error"),
}
let proxyConsole = new Proxy(console, {
    get: (value, prop) => hookConfig[prop] ?? value,
});
let emptyConsole = new Proxy(Object.create(null), {
    get: () => noop,
});

let debugState = false;
let defineProp = (function (obj) {
    return Object.assign({}, this, obj);
}).bind({
    configurable: true,
    enumerable: true,
});

export const debugConsole = () => debugState ? proxyConsole : emptyConsole;
export const debugEnable = () => {
    if (debugState)
        return;
    debugState = true;

    let debugEntry = Object.create(null);
    Object.defineProperties(debugEntry, {
        reload: {
            get: () => () => {
                Array.from(document.querySelectorAll("head link")).forEach(element => (element.href || "").indexOf(EXTENSION_KEY) > -1 ? element.remove() : 1);
                reloadPlugin(EXTENSION_KEY);
            }
        },
        clear: defineProp({
            get: () => function () {
                Array.from(arguments).forEach(type => {
                    switch (type) {
                        case "settings":
                            debugConsole().warn("clear settings");
                            window.config.set(`plugin.${EXTENSION_KEY}.pluginSettings`, {});
                            break;
                        case "reload":
                            debugConsole().warn("reload plugin");
                            debugEntry.reload();
                            break;
                    }
                });
            },
        }),
        kckit: defineProp({
            get: () => kckit,
        }),
        state: defineProp({
            get: () => debugState,
        }),
        openDevTools: defineProp({
            get: () => debugOpenDevTools
        }),
    });

    if (!window.__debug_plugin)
        window.__debug_plugin = Object.create(null);

    Object.defineProperty(window.__debug_plugin, EXTENSION_NAME, {
        configurable: true,
        get: () => debugEntry,
    });
};
export const debugCleanup = () => {
    debugState = false;

    if (window.__debug_plugin && window.__debug_plugin[EXTENSION_NAME])
        _.forEach(Object.keys(window.__debug_plugin[EXTENSION_NAME]), key => {
            delete window.__debug_plugin[EXTENSION_NAME][key];
        });
};
export const debugOpenDevTools = () => {
    let remoteWindow = remote.require("electron").BrowserWindow.getAllWindows().find(url => url.getURL().endsWith(EXTENSION_KEY));
    remoteWindow?.openDevTools({
        mode: "detach",
    });
};
