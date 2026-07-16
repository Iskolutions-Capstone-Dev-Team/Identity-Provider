import { useEffect, useState } from "react";
import { useNavigate, useOutletContext, Link } from "react-router-dom";
import AppClientCreateForm from "../components/AppClientCreateForm";
import { useAppClients } from "../hooks/useAppClients";
import { CreateAppClientIcon } from "../components/appClientIcons";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator, BreadcrumbLink } from "@/components/ui/breadcrumb";
import { createPortal } from "react-dom";

export default function CreateAppClientPage() {
  const navigate = useNavigate();
  const { colorMode = "light" } = useOutletContext() || {};
  const { createClient } = useAppClients({ enabled: false });
  const [breadcrumbsContainer, setBreadcrumbsContainer] = useState(null);

  useEffect(() => {
    setBreadcrumbsContainer(document.getElementById("navbar-breadcrumbs"));
  }, []);

  const handleClose = () => {
    navigate("/app-client");
  };

  const handleSubmit = async (payload) => {
    const response = await createClient(payload);

    navigate("/app-client", {
      state: {
        successMessage: "App client successfully created!",
        secretModal: {
          open: true,
          title: "Client secret created",
          clientId: response?.client_id || "",
          clientName: payload?.name || "",
          secret: response?.client_secret || "",
          loading: false,
          hasError: false,
        },
      },
    });
  };

  return (
    <div className="mx-auto flex w-full min-w-0 max-w-[96rem] flex-col gap-6 px-1 min-[1800px]:max-w-[112rem] min-[2200px]:max-w-[128rem] sm:px-0">
      {breadcrumbsContainer && createPortal(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/app-client">Client</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>New Client</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>,
        breadcrumbsContainer
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 text-primary rounded-xl">
            <CreateAppClientIcon className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">New Client</h1>
            <p className="text-muted-foreground">Add a new application and configure its access settings.</p>
          </div>
        </div>
      </div>

      <AppClientCreateForm
        onClose={handleClose}
        onSubmit={handleSubmit}
        colorMode={colorMode}
      />
    </div>
  );
}
