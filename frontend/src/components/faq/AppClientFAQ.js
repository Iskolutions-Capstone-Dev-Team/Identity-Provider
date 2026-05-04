const AppClientFAQ = {
  id: "app-client",
  title: "App Client",
  iconPath:
    "M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12H3V5.25",
  questions: [
    {
      id: "client-purpose",
      question: "What is the App Client for?",
      answer: [
        "You use App Client to manage applications that connect to the IDP for login and authorization.",
        "You can configure each client with the settings needed for a connected system to communicate with the identity provider.",
      ],
    },
    {
      id: "create-client",
      question: "How to create a client",
      answer: [
        "You click Add Client, fill in the required client details, and configure the allowed application settings.",
        "You should review the information before saving because the generated client secret will be used to connect.",
      ],
    },
    {
      id: "edit-client",
      question: "How to edit a client",
      answer: [
        "You find the client in the App Client page, click Edit, then update the allowed client settings.",
        "You should save changes only after reviewing them because client settings affect how the connected application signs in.",
      ],
    },
    {
      id: "client-secret",
      question: "What does the client secret do?",
      answer: [
        "You use the client secret as a private credential that helps a trusted application prove its identity to the IDP.",
        "You should store it securely because rotating it will require the connected application to use the new secret.",
      ],
    },
    {
      id: "multiple-clients",
      question: "Can you create multiple clients?",
      answer: [
        "Yes, you can create multiple clients when different applications or environments need their own IDP connection.",
      ],
    },
  ],
};

export default AppClientFAQ;