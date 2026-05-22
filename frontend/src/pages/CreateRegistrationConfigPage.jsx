import { useNavigate, useOutletContext } from "react-router-dom";
import Breadcrumbs from "../components/Breadcrumbs";
import PageHeader from "../components/PageHeader";
import RegistrationCreateForm from "../components/registration/RegistrationCreateForm";
import { useAllAppClients } from "../hooks/useAllAppClients";
import { registrationService } from "../services/registrationService";
import { getAllAppClientSelectOptions } from "../utils/userPoolAccess";

function RegistrationBreadcrumbIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
      <path fillRule="evenodd" d="M9 1.5H5.625c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0 0 16.5 9h-1.875a1.875 1.875 0 0 1-1.875-1.875V5.25A3.75 3.75 0 0 0 9 1.5Zm6.61 10.936a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 14.47a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd"/>
      <path d="M12.971 1.816A5.23 5.23 0 0 1 14.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 0 1 3.434 1.279 9.768 9.768 0 0 0-6.963-6.963Z" />
    </svg>
  );
}

function CreateRegistrationIcon({ className = "size-6" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
  );
}

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
            icon: <RegistrationBreadcrumbIcon />,
          },
          {
            label: "Create Registration",
            icon: <CreateRegistrationIcon />,
          },
        ]}
      />

      <PageHeader
        title="Create Registration"
        description="Add a new registration config and pre-approve app clients."
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
