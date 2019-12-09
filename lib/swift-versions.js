"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const semver = __importStar(require("semver"));
const core = __importStar(require("@actions/core"));
const os_1 = require("./os");
const AVAILABLE_VERSIONS = [
    '5.1.1',
    '5.1',
    '5.0.3',
    '5.0.2',
    '5.0.1',
    '5.0',
    '4.2.4',
    '4.2.3',
    '4.2.2',
    '4.2.1',
    '4.2',
    '4.1.3',
    '4.1.2',
    '4.1.1',
    '4.1',
    '4.0.3',
    '4.0.2',
    '4.0',
    '3.1.1',
    '3.1',
    '3.0.2',
    '3.0.1',
    '3.0',
    '2.2.1',
    '2.2'
].map(semver.coerce).filter(notEmpty);
function notEmpty(value) {
    return value !== null && value !== undefined;
}
function swiftPackage(version, system) {
    let platform;
    let archiveFile;
    let archiveName;
    switch (system.os) {
        case os_1.OS.MacOS:
            platform = 'xcode';
            archiveName = `swift-${version}-RELEASE-osx`;
            archiveFile = `${archiveName}.pkg`;
            break;
        case os_1.OS.Ubuntu:
            platform = `ubuntu${system.version.replace(/\D/g, "")}`;
            archiveName = `swift-${version}-RELEASE-ubuntu${system.version}`;
            archiveFile = `${archiveName}.tar.gz`;
            break;
        default:
            throw new Error('Cannot create download URL for an unsupported platform');
    }
    return {
        url: `https://swift.org/builds/swift-${version}-release/${platform}/swift-${version}-RELEASE/${archiveFile}`,
        name: archiveName,
        fileName: archiveFile
    };
}
exports.swiftPackage = swiftPackage;
function verify(version) {
    let range = semver.validRange(version);
    if (range === null) {
        throw new Error('Version must be a valid semver format.');
    }
    core.debug(`Resolved range ${range}`);
    let matchingVersion = evaluateVersions(AVAILABLE_VERSIONS, version);
    if (matchingVersion === null) {
        throw new Error(`Version "${version}" is not available`);
    }
    core.debug(`Found matching version ${matchingVersion}`);
    return matchingVersion;
}
exports.verify = verify;
// TODO - should we just export this from @actions/tool-cache? Lifted directly from there
function evaluateVersions(versions, versionSpec) {
    let version = null;
    versions = versions.sort((a, b) => {
        if (semver.gt(a, b)) {
            return 1;
        }
        return -1;
    });
    for (let i = versions.length - 1; i >= 0; i--) {
        const potential = versions[i];
        const satisfied = semver.satisfies(potential, versionSpec);
        if (satisfied) {
            version = potential;
            break;
        }
    }
    if (version === null) {
        return null;
    }
    return `${version.major}.${version.minor}${version.patch > 0 ? `.${version.patch}` : ''}`;
}
