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
exports.createBucket = void 0;
var Minio = require("minio");
function getMinioClient(containerController) {
    return __awaiter(this, void 0, void 0, function () {
        var env;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4, containerController.getEnv()];
                case 1:
                    env = _a.sent();
                    return [2, new Minio.Client({
                            endPoint: env.MINIO_CDN_END_POINT,
                            port: env.MINIO_PORT,
                            useSSL: env.MINIO_USE_SSL,
                            accessKey: env.MINIO_ACCESS_KEY,
                            secretKey: env.MINIO_SECRET_KEY
                        })];
            }
        });
    });
}
function tryCreateBucket(containerController, bucket) {
    return __awaiter(this, void 0, void 0, function () {
        var env;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4, containerController.getEnv()];
                case 1:
                    env = _a.sent();
                    return [2, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                            var minioClient;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4, getMinioClient(containerController)];
                                    case 1:
                                        minioClient = _a.sent();
                                        minioClient.bucketExists(env[bucket], function (err, exists) {
                                            return __awaiter(this, void 0, void 0, function () {
                                                return __generator(this, function (_a) {
                                                    if (exists)
                                                        return [2, resolve(true)];
                                                    if (err)
                                                        return [2, reject(err)];
                                                    minioClient.makeBucket(env[bucket], "us-east-1", function (err) {
                                                        if (err)
                                                            return reject(err);
                                                        if (bucket === "MINIO_PUBLIC_BUCKET") {
                                                            minioClient.setBucketPolicy(env[bucket], JSON.stringify({
                                                                Version: "2012-10-17",
                                                                Statement: [
                                                                    {
                                                                        Effect: "Allow",
                                                                        Principal: { AWS: ["*"] },
                                                                        Action: [
                                                                            "s3:GetBucketLocation",
                                                                            "s3:ListBucket",
                                                                            "s3:ListBucketMultipartUploads",
                                                                        ],
                                                                        Resource: ["arn:aws:s3:::public"]
                                                                    },
                                                                    {
                                                                        Effect: "Allow",
                                                                        Principal: { AWS: ["*"] },
                                                                        Action: [
                                                                            "s3:DeleteObject",
                                                                            "s3:GetObject",
                                                                            "s3:ListMultipartUploadParts",
                                                                            "s3:PutObject",
                                                                            "s3:AbortMultipartUpload",
                                                                        ],
                                                                        Resource: ["arn:aws:s3:::public/*"]
                                                                    },
                                                                ]
                                                            }), function (err) {
                                                                if (err)
                                                                    return reject(err);
                                                                return resolve(true);
                                                            });
                                                        }
                                                        else {
                                                            return resolve(true);
                                                        }
                                                    });
                                                    return [2];
                                                });
                                            });
                                        });
                                        return [2];
                                }
                            });
                        }); })];
            }
        });
    });
}
function createBucket(containerController) {
    return __awaiter(this, void 0, void 0, function () {
        var count;
        var _this = this;
        return __generator(this, function (_a) {
            count = 0;
            return [2, new Promise(function (resolve, reject) {
                    ["MINIO_PUBLIC_BUCKET", "MINIO_PRIVATE_BUCKET"].forEach(function (bucket) {
                        var interval = setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4, tryCreateBucket(containerController, bucket)
                                            .then(function (res) {
                                            clearInterval(interval);
                                            return resolve(true);
                                        })["catch"](function (e) {
                                            console.log("Bucket not created", count, e.message);
                                        })];
                                    case 1:
                                        _a.sent();
                                        if (count > 10) {
                                            return [2, reject("Bucket not created")];
                                        }
                                        ++count;
                                        return [2];
                                }
                            });
                        }); }, 5000);
                    });
                })];
        });
    });
}
exports.createBucket = createBucket;
//# sourceMappingURL=createBucket.js.map