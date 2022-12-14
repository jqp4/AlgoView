"use strict";

// https://www.npmjs.com/package/floss-js?activeTab=readme

window.flossGlobalStorageV1_0 = {
    binds: [],
};

/* function of create FLOSS */
window.FLOSS = function ({ name, value, action, defer, bind }) {
    let context = {
        name: bind ? `bind-${window.flossGlobalStorageV1_0.length}` : "window",
        obj: bind ? bind : window,
    };

    window.flossGlobalStorageV1_0[context.name] = {};
    window.flossGlobalStorageV1_0[context.name][name] = value;

    /* если контекст не указан, то глобальная переменная */
    Object.defineProperty(context.obj, name, {
        get: () => {
            return window.flossGlobalStorageV1_0[context.name][name];
        },
        set: (value) => {
            /* только при фактическом изменении, но не при каждом вызове сеттера */
            if (value !== window.flossGlobalStorageV1_0[context.name][name]) {
                window.flossGlobalStorageV1_0[context.name][name] = value;
                action(window.flossGlobalStorageV1_0[context.name][name]);
            }
        },
    });

    if (!defer) action(window.flossGlobalStorageV1_0[context.name][name]);
};
