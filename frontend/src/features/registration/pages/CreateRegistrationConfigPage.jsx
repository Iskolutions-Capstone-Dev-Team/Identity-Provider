import { useNavigate, useOutletContext } from "react-router-dom";
import Breadcrumbs from "../../../components/Breadcrumbs";
import PageHeader from "../../../components/PageHeader";
import RegistrationCreateForm from "../components/RegistrationCreateForm";
import { RegistrationIcon, CreateRegistrationIcon } from "../components/registrationIcons";
import { useAllAppClients } from "../../app-clients/hooks/useAllAppClients";
import { registrationService } from "../../../services/registrationService";
import { getAllAppClientSelectOptions } from "../../../utils/userPoolAccess";

export default function CreateRegistrationConfigPage() {
  const navigate = useNavigate();
  const { colorMode = "light" } = useOutletContext() || {};
  const { appClients, appClientsError, isLoadingAppClients } = useAllAppClients({
    enabled: true,
  });
  const appClientOptions = getAllAppClientSelectOptions(appClients);

  const handleClose = () => {
    navigate("/registration");
  };

  const handleSave = async (nextConfig) => {
    const accountTypeName = nextConfig?.name || nextConfig?.label || "";

    await registrationService.createAccountType({
      name: accountTypeName,
      clientIds: nextConfig.clientIds,
    });

    navigate("/registration", {
      state: {
        successMessage: `Created ${accountTypeName} account type.`,
      },
    });
  };

  return (
    <div className="mx-auto flex w-full min-w-0 max-w-[96rem] flex-col gap-6 px-1 min-[1800px]:max-w-[112rem] min-[2200px]:max-w-[128rem] sm:px-0">
      <Breadcrumbs
        colorMode={colorMode}
        items={[
          {
            label: "Registration",
            to: "/registration",
          },
          {
            label: "New Registration",
          },
        ]}
      />

      <PageHeader
        title="New Registration"
        description="Add a new account type and pre-approve app clients."
        icon={<CreateRegistrationIcon className="h-14 w-14 sm:h-16 sm:w-16" />}
        colorMode={colorMode}
      />

      <RegistrationCreateForm
        appClientOptions={appClientOptions}
        isLoadingAppClients={isLoadingAppClients}
        appClientsError={appClientsError}
        onClose={handleClose}
        onSave={handleSave}
        colorMode={colorMode}
      />
    </div>
  );
}
