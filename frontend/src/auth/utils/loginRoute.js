const defaultClientId = import.meta.env.VITE_CLIENT_ID ?? "";

export function buildLoginPath(clientId = defaultClientId) {
  if (!clientId) {
    return "/login";
  }

  const params = new URLSearchParams({
    client_id: clientId,
  });

  return `/login?${params.toString()}`;
}

export function getLoginClientId(searchParams) {
  return searchParams.get("client_id") || defaultClientId;
}
