export function sanitizePositiveIntegerParam( value, fallback, min = 1, max = Number.MAX_SAFE_INTEGER ) {
  const fallbackValue = Number.isInteger(fallback) ? fallback : min;
  const minValue = Number.isInteger(min) ? min : 1;
  const maxValue =
    Number.isInteger(max) && max >= minValue ? max : Number.MAX_SAFE_INTEGER;

  const parseCandidate = (candidate) => {
    if (typeof candidate === "number") {
      return Number.isInteger(candidate) ? candidate : null;
    }

    if (typeof candidate !== "string") {
      return null;
    }

    const trimmedCandidate = candidate.trim();

    try {
      const decodedCandidate = decodeURIComponent(trimmedCandidate);
      return /^\d+$/.test(decodedCandidate) ? Number(decodedCandidate) : null;
    } catch {
      return null;
    }
  };

  const parsedValue = parseCandidate(value);

  if (parsedValue === null || parsedValue < minValue) {
    return fallbackValue;
  }

  return Math.min(parsedValue, maxValue);
}

export function buildSafePaginationParams(
  { page, limit } = {},
  {
    defaultPage = 1,
    defaultLimit = 10,
    minPage = 1,
    minLimit = 1,
    maxLimit = 100,
  } = {},
) {
  return {
    page: sanitizePositiveIntegerParam(page, defaultPage, minPage),
    limit: sanitizePositiveIntegerParam(limit, defaultLimit, minLimit, maxLimit),
  };
}
