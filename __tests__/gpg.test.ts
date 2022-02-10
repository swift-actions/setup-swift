import * as exec from "@actions/exec";
import { setupKeys, verify, refreshKeys } from "../src/gpg";

jest.mock("@actions/exec");

const mockExec = exec.exec as jest.Mock;

describe("gpg", () => {
  afterEach(() => {
    mockExec.mockClear();
  });

  it("uses the first responding keyserver in the pool", async () => {
    mockExec.mockImplementation(() => Promise.resolve(0));
    await refreshKeys();
    expect(mockExec).toBeCalledTimes(1);
  });

  // NOTE: Currently disabled as the pool only contains one server
  // it("uses the next keyserver in the pool if the previous fails", async () => {
  //   const failingServers = 3;
  //   let testedServers = 0;

  //   mockExec.mockImplementation(() => {
  //     testedServers++;
  //     if (testedServers >= failingServers) {
  //       return Promise.resolve(0);
  //     } else {
  //       return Promise.resolve(1);
  //     }
  //   });

  //   await refreshKeys();
  //   expect(mockExec).toBeCalledTimes(3);
  // });

  it("makes a second attempt if the keyserver fails", async () => {
    const attempts = 2;
    let tests = 0;

    mockExec.mockImplementation(() => {
      tests++;
      if (tests >= attempts) {
        return Promise.resolve(0);
      } else {
        return Promise.resolve(1);
      }
    });

    await refreshKeys();
    expect(mockExec).toBeCalledTimes(2);
  });

  it("throws an error if all servers in the pool fails", async () => {
    mockExec.mockImplementation(() => Promise.resolve(1));

    try {
      await refreshKeys();
    } catch (e) {
      expect(e).toEqual(
        new Error("Failed to refresh keys from any server in the pool.")
      );
    }
  });
});
