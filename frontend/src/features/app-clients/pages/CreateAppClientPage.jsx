import { useNavigate, useOutletContext } from "react-router-dom";
import Breadcrumbs from "../../../components/Breadcrumbs";
import PageHeader from "../../../components/PageHeader";
import AppClientCreateForm from "../components/AppClientCreateForm";
import { AppClientIcon } from "../components/AppClientIconBox";
import { useAppClients } from "../hooks/useAppClients";
import { CreateAppClientIcon } from "../components/appClientIcons";

export default function CreateAppClientPage() {
  const navigate = useNavigate();
  const { colorMode = "light" } = useOutletContext() || {};
  const { createClient } = useAppClients({ enabled: false });

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
      <Breadcrumbs
        colorMode={colorMode}
        items={[
          {
            label: "App Client",
            to: "/app-client",
            icon: <AppClientIcon className="size-6" />,
          },
          {
            label: "Create App Client",
            icon: <CreateAppClientIcon />,
          },
        ]}
      />

      <PageHeader
        title="Create App Client"
        description="Add a new application client and configure its access settings."
        icon={<CreateAppClientIcon className="h-14 w-14 sm:h-16 sm:w-16" />}
        colorMode={colorMode}
      />

      <AppClientCreateForm
        onClose={handleClose}
        onSubmit={handleSubmit}
        colorMode={colorMode}
      />
    </div>
  );
}
