import { versionFromString } from "../src/get-version";

describe("version lookup", () => {
  it("identifies version from swift version", async () => {
    const version = versionFromString(
      "Apple Swift version 5.4.2 (swiftlang-1205.0.28.2 clang-1205.0.19.57)"
    );
    expect(version).toBe("5.4.2");
  });

  it("identifies version from swift-driver version", async () => {
    const version = versionFromString(
      "swift-driver version: 1.26.9 Apple Swift version 5.5 (swiftlang-1300.0.31.1 clang-1300.0.29.1)"
    );
    expect(version).toBe("5.5");
  });
});
