"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var OS;
(function (OS) {
    OS["MacOS"] = "macOS";
    OS["Ubuntu"] = "ubuntu";
})(OS = exports.OS || (exports.OS = {}));
const AVAILABLE_OS = {
    'macOS': ['latest', '10.14'],
    'ubuntu': ['18.04', '16.04']
};
function getSystem(system) {
    let parts = system.split('-');
    if (parts.length < 2) {
        throw new Error(`Provided os "${system}" not valid`);
    }
    let name = parts[0];
    let version = name == 'ubuntu' && parts[1] == 'latest' ? '18.04' : parts[1];
    if (!Object.keys(AVAILABLE_OS).includes(name)) {
        throw new Error(`"${name}" is not a supported platform`);
    }
    if (!AVAILABLE_OS[name].includes(version)) {
        throw new Error(`Version "${version}" of ${name} is not supported`);
    }
    let enumName = name[0].toUpperCase() + name.slice(1);
    return { os: OS[enumName], version, name: `${name}-${version}` };
}
exports.getSystem = getSystem;
