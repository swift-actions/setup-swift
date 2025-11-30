const getos = jest.genMockFromModule("getos");

let system = null;

function __setSystem(newSystem) {
  system = newSystem;
}

const mockGetos = function (callback) {
  callback(null, system);
};

mockGetos.__setSystem = function (newSystem) {
  system = newSystem;
};

module.exports = mockGetos;
