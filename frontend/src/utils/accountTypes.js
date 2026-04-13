const ACCOUNT_TYPE_STORAGE_KEY = "idp.registration.accountTypes";

const DEFAULT_ACCOUNT_TYPE_OPTIONS = Object.freeze([
  {
    id: "System Administrator",
    value: "System Administrator",
    label: "System Administrator",
    backendId: 1,
    isAdminType: true,
    aliases: ["Admin", "System Administrator"],
  },
  {
    id: "applicant",
    value: "applicant",
    label: "Applicant",
    backendId: 4,
    isAdminType: false,
    aliases: ["applicant"],
  },
  {
    id: "faculty",
    value: "faculty",
    label: "Faculty",
    backendId: 2,
    isAdminType: false,
    aliases: ["faculty"],
  },
  {
    id: "guest",
    value: "guest",
    label: "Guest",
    backendId: 5,
    isAdminType: false,
    aliases: ["guest"],
  },
  {
    id: "student",
    value: "student",
    label: "Student",
    backendId: 3,
    isAdminType: false,
    aliases: ["student"],
  },
]);

export const ACCOUNT_TYPE_OPTIONS = DEFAULT_ACCOUNT_TYPE_OPTIONS;

function normalizeText(value) {
  return typeof value === "string"
    ? value.trim().replace(/\s+/g, " ").toLowerCase()
    : "";
}

function toTitleCase(value) {
  return value
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function mergeAliases(...aliasLists) {
  return Array.from(
    new Set(
      aliasLists
        .flat()
        .map((alias) => normalizeText(alias))
        .filter(Boolean),
    ),
  );
}

function findMatchingOption(value, options = ACCOUNT_TYPE_OPTIONS) {
  const normalizedValue = normalizeAccountType(value);

  if (!normalizedValue) {
    return null;
  }

  return (
    (Array.isArray(options) ? options : []).find((option) => {
      const normalizedOptionId = normalizeText(option?.id);
      const normalizedOptionValue = normalizeText(option?.value);
      const normalizedAliases = Array.isArray(option?.aliases)
        ? option.aliases.map((alias) => normalizeText(alias))
        : [];

      return (
        normalizedOptionId === normalizedValue ||
        normalizedOptionValue === normalizedValue ||
        normalizedAliases.includes(normalizedValue)
      );
    }) || null
  );
}

function getStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage;
  } catch (error) {
    console.error("Unable to access local storage:", error);
    return null;
  }
}

function readStoredAccountTypes() {
  const storage = getStorage();

  if (!storage) {
    return [];
  }

  try {
    const rawValue = storage.getItem(ACCOUNT_TYPE_STORAGE_KEY);
    const parsedValue = JSON.parse(rawValue ?? "[]");

    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch (error) {
    console.error("Unable to read stored account types:", error);
    return [];
  }
}

function writeStoredAccountTypes(options) {
  const storage = getStorage();

  if (!storage) {
    return;
  }

  try {
    storage.setItem(ACCOUNT_TYPE_STORAGE_KEY, JSON.stringify(options));
  } catch (error) {
    console.error("Unable to store account types:", error);
  }
}

export function normalizeAccountType(value) {
  return normalizeText(value);
}

export function buildAccountTypeOption(value, overrides = {}) {
  const normalizedValue = normalizeAccountType(value);

  if (!normalizedValue) {
    return null;
  }

  const matchedDefaultOption = findMatchingOption(
    normalizedValue,
    ACCOUNT_TYPE_OPTIONS,
  );

  if (matchedDefaultOption) {
    return {
      ...matchedDefaultOption,
      backendId:
        overrides.backendId ?? matchedDefaultOption.backendId ?? null,
      aliases: mergeAliases(
        matchedDefaultOption.aliases,
        overrides.aliases,
        normalizedValue,
      ),
    };
  }

  const rawLabel =
    typeof overrides.label === "string" && overrides.label.trim()
      ? overrides.label.trim()
      : toTitleCase(normalizedValue);

  return {
    id: normalizedValue,
    value: normalizedValue,
    label: rawLabel,
    backendId:
      Number.isInteger(overrides.backendId) && overrides.backendId > 0
        ? overrides.backendId
        : null,
    isAdminType: false,
    aliases: mergeAliases(overrides.aliases, normalizedValue),
  };
}

export function mergeAccountTypeOptions(...sources) {
  const optionMap = new Map();
  const orderedOptionIds = [];

  const appendOption = (candidate) => {
    const nextOption =
      typeof candidate === "string"
        ? buildAccountTypeOption(candidate)
        : buildAccountTypeOption(
            candidate?.value ??
              candidate?.accountTypeValue ??
              candidate?.accountType ??
              candidate?.account_type ??
              candidate?.name ??
              candidate?.label ??
              candidate?.id,
            candidate,
          );

    if (!nextOption) {
      return;
    }

    const existingOption = optionMap.get(nextOption.id);

    if (!existingOption) {
      optionMap.set(nextOption.id, nextOption);
      orderedOptionIds.push(nextOption.id);
      return;
    }

    optionMap.set(nextOption.id, {
      ...existingOption,
      ...nextOption,
      backendId: nextOption.backendId ?? existingOption.backendId ?? null,
      aliases: mergeAliases(existingOption.aliases, nextOption.aliases),
    });
  };

  ACCOUNT_TYPE_OPTIONS.forEach(appendOption);
  sources.flat().forEach(appendOption);

  return orderedOptionIds
    .map((optionId) => optionMap.get(optionId))
    .filter(Boolean);
}

export function getStoredAccountTypeOptions() {
  return mergeAccountTypeOptions(readStoredAccountTypes()).filter(
    (option) => !findMatchingOption(option.value, ACCOUNT_TYPE_OPTIONS),
  );
}

export function rememberAccountTypeOption(option) {
  const nextOption =
    typeof option === "string"
      ? buildAccountTypeOption(option)
      : buildAccountTypeOption(
          option?.value ??
            option?.accountTypeValue ??
            option?.accountType ??
            option?.account_type ??
            option?.name ??
            option?.label ??
            option?.id,
          option,
        );

  if (!nextOption || findMatchingOption(nextOption.value, ACCOUNT_TYPE_OPTIONS)) {
    return;
  }

  const storedOptions = getStoredAccountTypeOptions();
  const nextStoredOptions = mergeAccountTypeOptions(storedOptions, nextOption)
    .filter((storedOption) => !findMatchingOption(storedOption.value, ACCOUNT_TYPE_OPTIONS))
    .map((storedOption) => ({
      value: storedOption.value,
      label: storedOption.label,
      backendId: storedOption.backendId,
    }));

  writeStoredAccountTypes(nextStoredOptions);
}

export function forgetAccountTypeOption(value) {
  const normalizedValue = normalizeAccountType(value);

  if (!normalizedValue) {
    return;
  }

  const nextStoredOptions = getStoredAccountTypeOptions()
    .filter((option) => option.value !== normalizedValue)
    .map((option) => ({
      value: option.value,
      label: option.label,
      backendId: option.backendId,
    }));

  writeStoredAccountTypes(nextStoredOptions);
}

export function getAccountTypeOption(value, options = ACCOUNT_TYPE_OPTIONS) {
  return findMatchingOption(value, options);
}

export function getAccountTypeLabel(value, options = ACCOUNT_TYPE_OPTIONS) {
  return getAccountTypeOption(value, options)?.label || "";
}

export function getAccountTypeValue(value, options = ACCOUNT_TYPE_OPTIONS) {
  const matchedOption = getAccountTypeOption(value, options);

  if (matchedOption?.value) {
    return matchedOption.value;
  }

  return typeof value === "string" ? value.trim() : "";
}

export function getAccountTypeBackendId(value, options = ACCOUNT_TYPE_OPTIONS) {
  return getAccountTypeOption(value, options)?.backendId ?? null;
}

export function isAdminAccountType(value, options = ACCOUNT_TYPE_OPTIONS) {
  return Boolean(getAccountTypeOption(value, options)?.isAdminType);
}
