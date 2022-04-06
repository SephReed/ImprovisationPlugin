"use strict";
const exports = {};
const module = { exports };
const oneLoadMap = new Map();
const require = (path) => {
    if (path.endsWith(".js") === false) {
        path += ".js";
    }
    if (oneLoadMap.has(path)) {
        return exports;
    }
    oneLoadMap.set(path, undefined);
    println("Loading: " + path);
    load(path);
    // println("Items: " + Object.keys(exports).join());
    return exports;
};
