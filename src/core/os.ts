import getos from "getos";

export async function getOS() {
  const detectedSystem = await new Promise<getos.Os>((resolve, reject) => {
    getos((error, os) => {
      os ? resolve(os) : reject(error || "No OS detected");
    });
  });

  return detectedSystem.os;
}

export type OS = getos.Os["os"];
