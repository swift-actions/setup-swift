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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const system = __importStar(require("./os"));
const versions = __importStar(require("./swift-versions"));
const linux = __importStar(require("./linux-install"));
const ops = __importStar(require("os"));
const getos_1 = __importDefault(require("getos"));
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        let version = versions.verify(core.getInput('swift-version', { required: true }));
        let os = core.getInput('os', { required: true });
        console.log(`This platform is ${process.platform}`);
        console.log(process.env['RUNNER_OS']);
        console.log(ops.release());
        getos_1.default((_, os) => {
            console.log(JSON.stringify(os));
        });
        let platform = system.getSystem(os);
        switch (platform.os) {
            case system.OS.Ubuntu:
                yield linux.install(version, platform);
                break;
            default:
                core.setFailed(`${os} is not supported`);
                return;
        }
    });
}
run();
