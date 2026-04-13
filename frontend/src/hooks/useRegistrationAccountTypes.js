import { useEffect, useState } from "react";
import { registrationService } from "../services/registrationService";
import { ACCOUNT_TYPE_OPTIONS, mergeAccountTypeOptions } from "../utils/accountTypes";

function getFallbackAccountTypeOptions() {
  return mergeAccountTypeOptions(ACCOUNT_TYPE_OPTIONS);
}

export function useRegistrationAccountTypes({ enabled = true } = {}) {
  const [accountTypeOptions, setAccountTypeOptions] = useState(() =>
    getFallbackAccountTypeOptions(),
  );
  const [isLoadingAccountTypes, setIsLoadingAccountTypes] = useState(enabled);

  useEffect(() => {
    const fallbackAccountTypeOptions = getFallbackAccountTypeOptions();
    setAccountTypeOptions(fallbackAccountTypeOptions);

    if (!enabled) {
      setIsLoadingAccountTypes(false);
      return undefined;
    }

    let cancelled = false;

    const fetchAccountTypes = async () => {
      try {
        setIsLoadingAccountTypes(true);
        const registrationConfigs =
          await registrationService.getRegistrationConfig({
            skipForbiddenAlert: true,
            skipForbiddenRedirect: true,
          });
        const apiAccountTypeOptions = registrationConfigs.map((config) => ({
          value: config.accountTypeValue,
          label: config.label,
          backendId: config.backendId,
        }));

        if (!cancelled) {
          setAccountTypeOptions(
            mergeAccountTypeOptions(
              fallbackAccountTypeOptions,
              apiAccountTypeOptions,
            ),
          );
        }
      } catch (error) {
        console.error("Failed to load registration account types:", error);

        if (!cancelled) {
          setAccountTypeOptions(fallbackAccountTypeOptions);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingAccountTypes(false);
        }
      }
    };

    fetchAccountTypes();

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return {
    accountTypeOptions,
    isLoadingAccountTypes,
  };
}
