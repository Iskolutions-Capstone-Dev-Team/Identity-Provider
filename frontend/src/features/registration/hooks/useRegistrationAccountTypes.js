import { useQuery } from "@tanstack/react-query";
import { registrationService } from "../../../services/registrationService";
import { ACCOUNT_TYPE_OPTIONS, mergeAccountTypeOptions } from "../../../utils/accountTypes";

function getFallbackAccountTypeOptions() {
  return mergeAccountTypeOptions(ACCOUNT_TYPE_OPTIONS);
}

export function useRegistrationAccountTypes({ enabled = true } = {}) {
  const fetchAccountTypesFn = async () => {
    const registrationConfigs = await registrationService.getRegistrationConfig({
      skipForbiddenAlert: true,
      skipForbiddenRedirect: true,
    });
    
    const apiAccountTypeOptions = registrationConfigs.map((config) => ({
      value: config.accountTypeValue,
      label: config.label,
      backendId: config.backendId,
      clients: config.clients,
    }));
    
    return mergeAccountTypeOptions(
      getFallbackAccountTypeOptions(),
      apiAccountTypeOptions,
    );
  };

  const { data: accountTypeOptions = getFallbackAccountTypeOptions(), isLoading } = useQuery({
    queryKey: ['registrationAccountTypes'],
    queryFn: fetchAccountTypesFn,
    enabled,
  });

  return {
    accountTypeOptions,
    isLoadingAccountTypes: isLoading,
  };
}
