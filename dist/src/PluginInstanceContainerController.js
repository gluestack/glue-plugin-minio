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
exports.PluginInstanceContainerController = void 0;
var DockerodeHelper = require("@gluestack/helpers").DockerodeHelper;
var constructEnv_1 = require("./helpers/constructEnv");
var createBucket_1 = require("./helpers/createBucket");
var PluginInstanceContainerController = (function () {
    function PluginInstanceContainerController(app, callerInstance) {
        this.status = "down";
        this.bucketName = "public";
        this.app = app;
        this.callerInstance = callerInstance;
        this.setStatus(this.callerInstance.gluePluginStore.get("status"));
        this.setPortNumber(this.callerInstance.gluePluginStore.get("port_number"));
        this.setConsolePortNumber(this.callerInstance.gluePluginStore.get("console_port_number"));
        this.setContainerId(this.callerInstance.gluePluginStore.get("container_id"));
    }
    PluginInstanceContainerController.prototype.getBucketName = function () {
        return this.bucketName;
    };
    PluginInstanceContainerController.prototype.getCallerInstance = function () {
        return this.callerInstance;
    };
    PluginInstanceContainerController.prototype.getEnv = function () {
        return __awaiter(this, void 0, void 0, function () {
            var minio_credentials;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        minio_credentials = {
                            username: "gluestack",
                            password: "password"
                        };
                        if (!this.callerInstance.gluePluginStore.get("minio_credentials") ||
                            !this.callerInstance.gluePluginStore.get("minio_credentials").username)
                            this.callerInstance.gluePluginStore.set("minio_credentials", minio_credentials);
                        minio_credentials =
                            this.callerInstance.gluePluginStore.get("minio_credentials");
                        _a = {
                            MINIO_END_POINT: "host.docker.internal"
                        };
                        return [4, this.getPortNumber()];
                    case 1: return [2, (_a.MINIO_PORT = _b.sent(),
                            _a.MINIO_USE_SSL = false,
                            _a.MINIO_ACCESS_KEY = minio_credentials.username,
                            _a.MINIO_SECRET_KEY = minio_credentials.password,
                            _a.MINIO_BUCKET = this.getBucketName(),
                            _a)];
                }
            });
        });
    };
    PluginInstanceContainerController.prototype.getDockerJson = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b;
            var _c, _d, _e, _f, _g;
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0:
                        _c = {
                            Image: "minio/minio"
                        };
                        _d = {};
                        _e = {};
                        _a = "9000/tcp";
                        _f = {};
                        return [4, this.getPortNumber()];
                    case 1:
                        _e[_a] = [
                            (_f.HostPort = (_h.sent()).toString(),
                                _f)
                        ];
                        _b = "9001/tcp";
                        _g = {};
                        return [4, this.getConsolePortNumber()];
                    case 2: return [2, (_c.HostConfig = (_d.PortBindings = (_e[_b] = [
                            (_g.HostPort = (_h.sent()).toString(),
                                _g)
                        ],
                            _e),
                            _d.Binds = [
                                "".concat(process.cwd() +
                                    this.callerInstance.getInstallationPath().substring(1), "/data:/data"),
                            ],
                            _d),
                            _c.ExposedPorts = {
                                "9000/tcp": {},
                                "9001/tcp": {}
                            },
                            _c.Cmd = ["server", "/data", "--console-address", ":9001"],
                            _c)];
                }
            });
        });
    };
    PluginInstanceContainerController.prototype.getStatus = function () {
        return this.status;
    };
    PluginInstanceContainerController.prototype.getPortNumber = function (returnDefault) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2, new Promise(function (resolve, reject) {
                        if (_this.portNumber) {
                            return resolve(_this.portNumber);
                        }
                        var ports = _this.callerInstance.callerPlugin.gluePluginStore.get("ports") || [];
                        DockerodeHelper.getPort(10310, ports)
                            .then(function (port) {
                            _this.setPortNumber(port);
                            ports.push(port);
                            _this.callerInstance.callerPlugin.gluePluginStore.set("ports", ports);
                            return resolve(_this.portNumber);
                        })["catch"](function (e) {
                            reject(e);
                        });
                    })];
            });
        });
    };
    PluginInstanceContainerController.prototype.getConsolePortNumber = function (returnDefault) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2, new Promise(function (resolve, reject) {
                        if (_this.consolePortNumber) {
                            return resolve(_this.consolePortNumber);
                        }
                        var ports = _this.callerInstance.callerPlugin.gluePluginStore.get("console_ports") ||
                            [];
                        DockerodeHelper.getPort(9160, ports)
                            .then(function (port) {
                            _this.setConsolePortNumber(port);
                            ports.push(port);
                            _this.callerInstance.callerPlugin.gluePluginStore.set("console_ports", ports);
                            return resolve(_this.consolePortNumber);
                        })["catch"](function (e) {
                            reject(e);
                        });
                    })];
            });
        });
    };
    PluginInstanceContainerController.prototype.getContainerId = function () {
        return this.containerId;
    };
    PluginInstanceContainerController.prototype.setStatus = function (status) {
        this.callerInstance.gluePluginStore.set("status", status || "down");
        return (this.status = status || "down");
    };
    PluginInstanceContainerController.prototype.setPortNumber = function (portNumber) {
        this.callerInstance.gluePluginStore.set("port_number", portNumber || null);
        return (this.portNumber = portNumber || null);
    };
    PluginInstanceContainerController.prototype.setConsolePortNumber = function (consolePortNumber) {
        this.callerInstance.gluePluginStore.set("console_port_number", consolePortNumber || null);
        return (this.consolePortNumber = consolePortNumber || null);
    };
    PluginInstanceContainerController.prototype.setContainerId = function (containerId) {
        this.callerInstance.gluePluginStore.set("container_id", containerId || null);
        return (this.containerId = containerId || null);
    };
    PluginInstanceContainerController.prototype.setDockerfile = function (dockerfile) {
        this.callerInstance.gluePluginStore.set("dockerfile", dockerfile || null);
        return (this.dockerfile = dockerfile || null);
    };
    PluginInstanceContainerController.prototype.getConfig = function () { };
    PluginInstanceContainerController.prototype.up = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                            var _a, _b, _c;
                            var _this = this;
                            return __generator(this, function (_d) {
                                switch (_d.label) {
                                    case 0:
                                        _b = (_a = DockerodeHelper).up;
                                        return [4, this.getDockerJson()];
                                    case 1:
                                        _c = [_d.sent()];
                                        return [4, this.getEnv()];
                                    case 2:
                                        _c = _c.concat([_d.sent()]);
                                        return [4, this.getPortNumber()];
                                    case 3:
                                        _b.apply(_a, _c.concat([_d.sent(), this.callerInstance.getName()]))
                                            .then(function (_a) {
                                            var status = _a.status, containerId = _a.containerId;
                                            return __awaiter(_this, void 0, void 0, function () {
                                                var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
                                                return __generator(this, function (_s) {
                                                    switch (_s.label) {
                                                        case 0:
                                                            this.setStatus(status);
                                                            this.setContainerId(containerId);
                                                            console.log("\x1b[32m");
                                                            _c = (_b = console).log;
                                                            _d = "API: http://localhost:".concat;
                                                            return [4, this.getPortNumber()];
                                                        case 1:
                                                            _c.apply(_b, [_d.apply("API: http://localhost:", [_s.sent()])]);
                                                            _f = (_e = console).log;
                                                            _g = "Console: http://localhost:".concat;
                                                            return [4, this.getConsolePortNumber()];
                                                        case 2:
                                                            _f.apply(_e, [_g.apply("Console: http://localhost:", [_s.sent(), "/ open in browser"])]);
                                                            console.log("\x1b[0m");
                                                            console.log("\x1b[36m");
                                                            console.log("Credentials to login in minio console: ");
                                                            _j = (_h = console).log;
                                                            _k = "username: ".concat;
                                                            return [4, this.getEnv()];
                                                        case 3:
                                                            _j.apply(_h, [_k.apply("username: ", [(_s.sent()).MINIO_ACCESS_KEY])]);
                                                            _m = (_l = console).log;
                                                            _o = "password: ".concat;
                                                            return [4, this.getEnv()];
                                                        case 4:
                                                            _m.apply(_l, [_o.apply("password: ", [(_s.sent()).MINIO_SECRET_KEY])]);
                                                            console.log("\x1b[0m");
                                                            console.log("Env for using minio API: ");
                                                            _q = (_p = console).log;
                                                            _r = constructEnv_1.constructEnv;
                                                            return [4, this.getEnv()];
                                                        case 5:
                                                            _q.apply(_p, [_r.apply(void 0, [_s.sent()])]);
                                                            (0, createBucket_1.createBucket)(this)
                                                                .then(function () {
                                                                return resolve(true);
                                                            })["catch"](function () {
                                                                console.log("\x1b[33m");
                                                                console.log("Could not create public bucket, please create one manually");
                                                                console.log("\x1b[0m");
                                                            });
                                                            return [2];
                                                    }
                                                });
                                            });
                                        })["catch"](function (e) {
                                            return reject(e);
                                        })["catch"](function (e) {
                                            return reject(e);
                                        });
                                        return [2];
                                }
                            });
                        }); })];
                    case 1:
                        _a.sent();
                        return [2];
                }
            });
        });
    };
    PluginInstanceContainerController.prototype.down = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                            var _this = this;
                            return __generator(this, function (_a) {
                                DockerodeHelper.down(this.getContainerId(), this.callerInstance.getName())
                                    .then(function () {
                                    _this.setStatus("down");
                                    _this.setContainerId(null);
                                    return resolve(true);
                                })["catch"](function (e) {
                                    return reject(e);
                                });
                                return [2];
                            });
                        }); })];
                    case 1:
                        _a.sent();
                        return [2];
                }
            });
        });
    };
    PluginInstanceContainerController.prototype.build = function () {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2];
        }); });
    };
    return PluginInstanceContainerController;
}());
exports.PluginInstanceContainerController = PluginInstanceContainerController;
//# sourceMappingURL=PluginInstanceContainerController.js.map