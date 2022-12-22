"use strict";
exports.__esModule = true;
exports.constructEnv = void 0;
function constructEnv(json) {
    var env = "";
    Object.keys(json).map(function (key) {
        env += "".concat(key, "=").concat(json[key], "\n");
    });
    return env;
}
exports.constructEnv = constructEnv;
//# sourceMappingURL=constructEnv.js.map