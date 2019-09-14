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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const exec_1 = require("@actions/exec");
const setup_swiftenv_1 = require("./setup-swiftenv");
function selectSwift(version) {
    return __awaiter(this, void 0, void 0, function* () {
        core.exportVariable('SWIFT_VERSION', version);
        yield installSwift(version);
    });
}
exports.selectSwift = selectSwift;
function installSwift(version) {
    return __awaiter(this, void 0, void 0, function* () {
        let swiftenv = yield setup_swiftenv_1.setupSwiftenv('1.4.0');
        core.startGroup('Install swift');
        try {
            yield exec_1.exec(`"${swiftenv}"`, ['install', version, '--verify']);
        }
        catch (error) {
            if (/already installed/.test(error)) {
                core.debug(error);
            }
            else {
                core.setFailed(error);
            }
        }
        core.endGroup();
    });
}
