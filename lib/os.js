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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getos_1 = __importDefault(require("getos"));
var OS;
(function (OS) {
    OS[OS["MacOS"] = 0] = "MacOS";
    OS[OS["Ubuntu"] = 1] = "Ubuntu";
})(OS = exports.OS || (exports.OS = {}));
const AVAILABLE_OS = {
    'macOS': ['latest'],
    'Ubuntu': ['18.04', '16.04']
};
function getSystem() {
    return __awaiter(this, void 0, void 0, function* () {
        let detectedSystem = yield new Promise((resolve, reject) => {
            getos_1.default((error, os) => {
                os ? resolve(os) : reject(error || "No OS detected");
            });
        });
        let system;
        switch (detectedSystem.os) {
            case 'darwin':
                system = { os: OS.MacOS, version: 'latest', name: 'macOS' };
                break;
            case 'linux':
                if (detectedSystem.dist !== 'Ubuntu Linux') {
                    throw new Error(`"${detectedSystem.dist}" is not a supported linux distribution`);
                }
                system = { os: OS.Ubuntu, version: detectedSystem.release, name: 'Ubuntu' };
                break;
            default:
                throw new Error(`"${detectedSystem.os}" is not a supported platform`);
        }
        if (!AVAILABLE_OS[system.name].includes(system.version)) {
            throw new Error(`Version "${system.version}" of ${system.name} is not supported`);
        }
        return system;
    });
}
exports.getSystem = getSystem;
