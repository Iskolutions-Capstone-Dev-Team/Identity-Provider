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

export function buildRegisterPasswordSetupPath( clientId = defaultClientId, email = "" ) {
  const params = new URLSearchParams();

  if (clientId) {
    params.set("client_id", clientId);
  }

  if (email) {
    params.set("email", email);
  }

  const queryString = params.toString();

  return queryString
    ? `/register/set-password?${queryString}`
    : "/register/set-password";
}

export function getLoginClientId(searchParams) {
  return searchParams.get("client_id") || defaultClientId;
}