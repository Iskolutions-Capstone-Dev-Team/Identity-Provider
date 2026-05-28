import { startAuthentication, startRegistration } from "@simplewebauthn/browser";

function getPublicKeyOptions(options = {}) {
  return options.publicKey || options;
}

export async function createPasskeyCredential(options) {
  return startRegistration({
    optionsJSON: getPublicKeyOptions(options),
  });
}

export async function getPasskeyCredential(options) {
  return startAuthentication({
    optionsJSON: getPublicKeyOptions(options),
  });
}