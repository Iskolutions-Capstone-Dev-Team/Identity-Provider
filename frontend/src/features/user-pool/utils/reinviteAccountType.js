import { registrationService } from "../../../services/registrationService";
import { getAccountTypeBackendId } from "../../../utils/accountTypes";

function getMatchingClientCount(user = {}, config = {}) {
  const userClientIds = new Set(user.accessibleClientIds || []);
  const userClientNames = new Set(
    (user.accessibleClientNames || []).map((name) => name.toLowerCase()),
  );

  return (config.clients || []).filter((client) => {
    const clientName = client.name?.toLowerCase() || "";

    return userClientIds.has(client.id) || userClientNames.has(clientName);
  }).length;
}

export async function resolveReinviteAccountTypeId(user = {}) {
  if (Number.isInteger(user.accountTypeId) && user.accountTypeId > 0) {
    return user.accountTypeId;
  }

  const accountTypeId = getAccountTypeBackendId(user.accountType);

  if (accountTypeId) {
    return accountTypeId;
  }

  const resolvedAccountTypeId = await registrationService.resolveAccountTypeIdByName(
    user.accountType,
  );

  if (resolvedAccountTypeId) {
    return resolvedAccountTypeId;
  }

  const registrationConfigs = await registrationService.getRegistrationConfig({
    skipForbiddenAlert: true,
    skipForbiddenRedirect: true,
  });
  const matchedConfig = registrationConfigs
    .map((config) => ({
      config,
      matchingClientCount: getMatchingClientCount(user, config),
    }))
    .filter((match) => match.matchingClientCount > 0)
    .sort((first, second) => second.matchingClientCount - first.matchingClientCount)
    .at(0)?.config;

  return matchedConfig?.backendId ?? null;
}
