import { useNavigate, useOutletContext } from "react-router-dom";
import Breadcrumbs from "../components/Breadcrumbs";
import PageHeader from "../components/PageHeader";
import AppClientCreateForm from "../components/app-client/AppClientCreateForm";
import { AppClientIcon } from "../components/app-client/AppClientIconBox";
import { useAppClients } from "../hooks/useAppClients";

function CreateAppClientIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
  );
}

function CreateAppClientHeaderIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-14 w-14 sm:h-16 sm:w-16">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
  );
}

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
        icon={<CreateAppClientHeaderIcon />}
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
