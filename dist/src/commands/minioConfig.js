"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.writeInstance = exports.defaultConfig = void 0;
var prompts = require("prompts");
exports.defaultConfig = {
    username: "gluestack",
    password: "password",
    admin_end_point: "host.docker.internal",
    cdn_end_point: "127.0.0.1",
    port: "10310"
};
var getNewInstanceQuestions = function (oldConfig) {
    return [
        {
            type: 'confirm',
            name: "choice",
            message: "Do you want to use external minio?",
            initial: false
        },
        {
            type: function (prev) { return (prev === true ? 'text' : null); },
            name: "username",
            message: "What is your minio username?",
            initial: (oldConfig === null || oldConfig === void 0 ? void 0 : oldConfig.username) || exports.defaultConfig.username
        },
        {
            type: function (prev) { return (prev ? 'text' : null); },
            name: "password",
            message: "What is your minio password?",
            initial: (oldConfig === null || oldConfig === void 0 ? void 0 : oldConfig.password) || exports.defaultConfig.password
        },
        {
            type: function (prev) { return (prev ? 'text' : null); },
            name: "admin_end_point",
            message: "What is your minio admin-end-point?",
            initial: (oldConfig === null || oldConfig === void 0 ? void 0 : oldConfig.admin_end_point) || exports.defaultConfig.admin_end_point
        },
        {
            type: function (prev) { return (prev ? 'text' : null); },
            name: "cdn_end_point",
            message: "What is your minio cdn-end-point?",
            initial: (oldConfig === null || oldConfig === void 0 ? void 0 : oldConfig.cdn_end_point) || exports.defaultConfig.cdn_end_point
        },
        {
            type: function (prev) { return (prev ? 'text' : null); },
            name: "port",
            message: "What is your minio port?",
            initial: (oldConfig === null || oldConfig === void 0 ? void 0 : oldConfig.port) || exports.defaultConfig.port
        }
    ];
};
var writeInstance = function (pluginInstance) { return __awaiter(void 0, void 0, void 0, function () {
    var response, _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0: return [4, prompts(getNewInstanceQuestions(pluginInstance.gluePluginStore.get("minio_credentials")))];
            case 1:
                response = _c.sent();
                if (!!response.choice) return [3, 3];
                response = exports.defaultConfig;
                _a = response;
                _b = "".concat;
                return [4, pluginInstance.containerController.getPortNumber()];
            case 2:
                _a.port = _b.apply("", [_c.sent()]);
                return [3, 4];
            case 3:
                delete response.choice;
                _c.label = 4;
            case 4:
                Object.keys(response).forEach(function (key) { return response[key] = response[key].trim(); });
                pluginInstance.gluePluginStore.set("minio_credentials", response);
                console.log();
                console.log("Saved ".concat(pluginInstance.getName(), " config"));
                response.port = parseInt(response.port);
                console.table(response);
                console.log();
                return [2];
        }
    });
}); };
exports.writeInstance = writeInstance;
//# sourceMappingURL=minioConfig.js.map