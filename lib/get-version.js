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
Object.defineProperty(exports, "__esModule", { value: true });
const exec_1 = require("@actions/exec");
function getVersion(command = 'swift', args = ['--version']) {
    return __awaiter(this, void 0, void 0, function* () {
        let output = '';
        let error = '';
        const options = {
            listeners: {
                stdout: (data) => {
                    output += data.toString();
                },
                stderr: (data) => {
                    error += data.toString();
                }
            }
        };
        yield exec_1.exec(command, args, options);
        if (error) {
            throw new Error(error);
        }
        const match = output.match(/(?<version>[0-9]+\.[0-9+]+(\.[0-9]+)?)/) || { groups: { version: null } };
        if (!match.groups || !match.groups.version) {
            return null;
        }
        return match.groups.version;
    });
}
exports.getVersion = getVersion;
