const DEFAULT_CACHE_MS = 500;
const cachedRequests = new Map();

export function getCachedRequest(
  key,
  requestFactory,
  { cacheMs = DEFAULT_CACHE_MS } = {},
) {
  const cachedRequest = cachedRequests.get(key);
  const now = Date.now();

  if (cachedRequest?.promise) {
    return cachedRequest.promise;
  }

  if (
    cachedRequest &&
    Object.prototype.hasOwnProperty.call(cachedRequest, "data") &&
    now - cachedRequest.timestamp < cacheMs
  ) {
    return Promise.resolve(cachedRequest.data);
  }

  const promise = Promise.resolve()
    .then(requestFactory)
    .then((data) => {
      cachedRequests.set(key, {
        data,
        timestamp: Date.now(),
      });

      return data;
    })
    .catch((error) => {
      cachedRequests.delete(key);
      throw error;
    });

  cachedRequests.set(key, {
    promise,
    timestamp: now,
  });

  return promise;
}

export function clearCachedRequests(prefix = "") {
  if (!prefix) {
    cachedRequests.clear();
    return;
  }

  Array.from(cachedRequests.keys()).forEach((key) => {
    if (key.startsWith(prefix)) {
      cachedRequests.delete(key);
    }
  });
}