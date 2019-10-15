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
const os = __importStar(require("os"));
const path = __importStar(require("path"));
const exec_1 = require("@actions/exec");
const core = __importStar(require("@actions/core"));
const toolCache = __importStar(require("@actions/tool-cache"));
function install(version) {
    return __awaiter(this, void 0, void 0, function* () {
        if (os.platform() !== 'linux') {
            core.error('Trying to run linux installer on non-linux os');
            return;
        }
        let swiftPath = toolCache.find('swift-linux', version);
        if (swiftPath === null || swiftPath.trim().length == 0) {
            core.debug(`No matching installation found`);
            let [[pkg, signature], _] = yield Promise.all([
                download(version, os.release()),
                setupKeys()
            ]);
            yield verify(signature);
            swiftPath = yield unpack(pkg, version);
        }
        else {
            core.debug('Matching installation found');
        }
        let binPath = path.join(swiftPath, '/usr/bin');
        core.addPath(binPath);
        core.debug('Swift installed');
    });
}
exports.install = install;
function download(version, ubuntuVersion) {
    return __awaiter(this, void 0, void 0, function* () {
        core.debug(`Downloading swift ${version} for ubuntu ${ubuntuVersion}`);
        let versionUpperCased = version.toUpperCase();
        let ubuntuVersionString = ubuntuVersion.replace(/\D/g, "");
        let url = `https://swift.org/builds/swift-${version}/ubuntu${ubuntuVersionString}/swift-${versionUpperCased}-RELEASE/swift-${versionUpperCased}-RELEASE-ubuntu${ubuntuVersion}.tar.gz`;
        return yield Promise.all([
            toolCache.downloadTool(url),
            toolCache.downloadTool(`${url}.sig`)
        ]);
    });
}
function unpack(packagePath, version) {
    return __awaiter(this, void 0, void 0, function* () {
        core.debug('Extracting package');
        let extractPath = yield toolCache.extractTar(packagePath);
        let basename = path.basename(packagePath, '.tar.gz');
        let cachedPath = yield toolCache.cacheDir(path.join(extractPath, basename), 'swift-linux', version);
        return cachedPath;
    });
}
function setupKeys() {
    return __awaiter(this, void 0, void 0, function* () {
        core.debug('Fetching verification keys');
        yield exec_1.exec('wget -q -O - https://swift.org/keys/all-keys.asc | gpg --import -');
        yield exec_1.exec('gpg --keyserver hkp://pool.sks-keyservers.net --refresh-keys Swift');
    });
}
function verify(path) {
    return __awaiter(this, void 0, void 0, function* () {
        core.debug('Verifying signature');
        yield exec_1.exec('gpg', ['--verify', path]);
    });
}
