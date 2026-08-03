import { useEffect, useState } from "react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import { createPortal } from "react-dom";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import RegistrationCreateForm from "../components/RegistrationCreateForm";
import { SquarePlus } from "lucide-react";
import { useAllAppClients } from "../../app-clients/hooks/useAllAppClients";
import { registrationService } from "../../../services/registrationService";
import { getAllAppClientSelectOptions } from "../../../utils/userPoolAccess";
import { toast } from "sonner";

export default function CreateRegistrationConfigPage() {
  const [breadcrumbsContainer, setBreadcrumbsContainer] = useState(null);

  useEffect(() => {
    setBreadcrumbsContainer(document.getElementById("navbar-breadcrumbs"));
  }, []);

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
      {breadcrumbsContainer && createPortal(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/registration">Registration</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>New Registration</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>,
        breadcrumbsContainer
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#7b0d15] text-[#f8d24e] dark:bg-[#f8d24e] dark:text-[#7b0d15] rounded-xl flex items-center justify-center">
            <SquarePlus className="w-8 h-8" />
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
