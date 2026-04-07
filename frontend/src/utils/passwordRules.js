const MIN_PASSWORD_LENGTH = 8;
const PASSWORD_CHARSETS = { uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ", lowercase: "abcdefghijklmnopqrstuvwxyz", number: "0123456789", special: "!@#$%^&*" };
const PASSWORD_CHARACTER_POOL = Object.values(PASSWORD_CHARSETS).join("");

function getRandomCharacter(characters) {
  return characters[Math.floor(Math.random() * characters.length)] ?? "";
}

function shuffleCharacters(characters = []) {
  const nextCharacters = [...characters];

  for (let index = nextCharacters.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
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