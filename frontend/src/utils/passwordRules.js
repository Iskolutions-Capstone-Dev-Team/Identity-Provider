const MIN_PASSWORD_LENGTH = 8;
const PASSWORD_CHARSETS = { uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ", lowercase: "abcdefghijklmnopqrstuvwxyz", number: "0123456789", special: "!@#$%^&*" };
const PASSWORD_CHARACTER_POOL = Object.values(PASSWORD_CHARSETS).join("");
const MAX_UINT32 = 0x100000000;

function getRandomIndex(maxExclusive) {
  if (!Number.isInteger(maxExclusive) || maxExclusive <= 0) {
    return 0;
  }

  const cryptoApi = globalThis?.crypto;

  if (cryptoApi?.getRandomValues) {
    const threshold = MAX_UINT32 - (MAX_UINT32 % maxExclusive);
    const randomValue = new Uint32Array(1);

    do {
      cryptoApi.getRandomValues(randomValue);
    } while (randomValue[0] >= threshold);

    return randomValue[0] % maxExclusive;
  }

  return Math.floor(Math.random() * maxExclusive);
}

function getRandomCharacter(characters) {
  return characters[getRandomIndex(characters.length)] ?? "";
}

function shuffleCharacters(characters = []) {
  const nextCharacters = [...characters];

  for (let index = nextCharacters.length - 1; index > 0; index -= 1) {
    const randomIndex = getRandomIndex(index + 1);
    [nextCharacters[index], nextCharacters[randomIndex]] = [
      nextCharacters[randomIndex],
      nextCharacters[index],
    ];
  }

  return nextCharacters;
}

export function getPasswordRequirementChecks(password = "") {
  return {
    length: password.length >= MIN_PASSWORD_LENGTH,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*]/.test(password),
  };
}

export function isTemporaryPasswordValid(password = "") {
  return Object.values(getPasswordRequirementChecks(password)).every(Boolean);
}

export function getTemporaryPasswordValidationMessage(password = "") {
  if (isTemporaryPasswordValid(password)) {
    return "";
  }

  return "Temporary password must be at least 8 characters and include one uppercase letter, one number, and one special character.";
}

export function generateTemporaryPassword(length = 12) {
  const normalizedLength = Number.isInteger(length)
    ? Math.max(length, MIN_PASSWORD_LENGTH)
    : 12;
  const passwordCharacters = [
    getRandomCharacter(PASSWORD_CHARSETS.uppercase),
    getRandomCharacter(PASSWORD_CHARSETS.lowercase),
    getRandomCharacter(PASSWORD_CHARSETS.number),
    getRandomCharacter(PASSWORD_CHARSETS.special),
  ];

  while (passwordCharacters.length < normalizedLength) {
    passwordCharacters.push(getRandomCharacter(PASSWORD_CHARACTER_POOL));
  }

  return shuffleCharacters(passwordCharacters).join("");
}

export function generateHiddenInvitationPassword(length = 24) {
  return generateTemporaryPassword(length);
}
