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
const path = __importStar(require("path"));
const core = __importStar(require("@actions/core"));
const toolCache = __importStar(require("@actions/tool-cache"));
function setupSwiftenv(version) {
    return __awaiter(this, void 0, void 0, function* () {
        let toolPath = toolCache.find('swiftenv', version) || (yield installSwiftenv(version));
        core.exportVariable('SWIFTENV_ROOT', toolPath);
        let binPath = path.join(toolPath, '/libexec');
        core.addPath(binPath);
        return path.join(binPath, '/swiftenv');
    });
}
exports.setupSwiftenv = setupSwiftenv;
function installSwiftenv(version) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield core.group('Install swifenv', () => __awaiter(this, void 0, void 0, function* () {
            let downloadPath = yield toolCache.downloadTool('https://github.com/kylef/swiftenv/archive/' + version + '.tar.gz');
            let extractPath = yield toolCache.extractTar(downloadPath);
            let cachedPath = yield toolCache.cacheDir(extractPath, 'swiftenv', version);
            return cachedPath;
        }));
    });
}
