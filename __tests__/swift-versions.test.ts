import * as versions from "../src/swift-versions";

describe("swift version resolver", () => {
  it("identifies X.X.X versions", async () => {
    const version = await versions.verify("5.0.3");
    expect(version).toBe("5.0.3");
  });

  it("identifies X.X.0 versions", async () => {
    const version = await versions.verify("5.0.0");
    expect(version).toBe("5.0");
  });

  it("identifies X.X versions", async () => {
    const version = await versions.verify("5.0");
    expect(version).toBe("5.0.3");
  });

  it("identifies ~X.X versions", async () => {
    const version = await versions.verify("~5.0");
    expect(version).toBe("5.0.3");
  });

  it("identifies X versions", async () => {
    const version = await versions.verify("5");
    expect(version).toBe("5.2.4");
  });

  it("throws an error if version is invalid", async () => {
    expect.assertions(1);
    try {
      await versions.verify("foo");
    } catch (e) {
      expect(e).toEqual(new Error("Version must be a valid semver format."));
    }
  });

  it("throws an error if no matching version is found", async () => {
    expect.assertions(1);
    try {
      await versions.verify("1.0");
    } catch (e) {
      expect(e).toEqual(new Error('Version "1.0" is not available'));
    }
  });
});
