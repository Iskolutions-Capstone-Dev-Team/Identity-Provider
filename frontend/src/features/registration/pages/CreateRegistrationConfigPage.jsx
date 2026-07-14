import { useNavigate, useOutletContext } from "react-router-dom";
import Breadcrumbs from "../../../components/Breadcrumbs";
import RegistrationCreateForm from "../components/RegistrationCreateForm";
import { CreateRegistrationIcon } from "../components/registrationIcons";
import { useAllAppClients } from "../../app-clients/hooks/useAllAppClients";
import { registrationService } from "../../../services/registrationService";
import { getAllAppClientSelectOptions } from "../../../utils/userPoolAccess";
import { toast } from "sonner";

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

    try {
      await registrationService.createAccountType({
        name: accountTypeName,
        clientIds: nextConfig.clientIds,
      });

      navigate("/registration", {
        state: {
          successMessage: `Created ${accountTypeName} account type.`,
        },
      });
    } catch (error) {
      console.error("Failed to create account type:", error);
      toast.error(
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        "Unable to create account type.",
        { style: { backgroundColor: "#ef4444", color: "white", borderColor: "#ef4444" } }
      );
    }
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

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
            <CreateRegistrationIcon className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">New Registration</h1>
            <p className="text-muted-foreground">Add a new account type and pre-approve app clients.</p>
          </div>
        </div>
      </div>

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
