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
        clear: {
            get: () => {
                return function () {
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
                }
            }
        },
        kckit: {
            get: () => kckit,
        },
        state: {
            get: () => debugState,
        },
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
        delete window.__debug_plugin[EXTENSION_NAME];
};
