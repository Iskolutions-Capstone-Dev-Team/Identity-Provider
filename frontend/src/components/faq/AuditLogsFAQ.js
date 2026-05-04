const AuditLogsFAQ = {
  id: "audit-logs",
  title: "Audit Logs",
  iconPath:
    "M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Zm3.75 11.625a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z",
  questions: [
    {
      id: "logs-purpose",
      question: "What is the Audit Logs for?",
      answer: [
        "You use Audit Logs to review recorded actions and security events inside the IDP.",
        "You can check who performed an action, what was affected, when it happened, and whether it succeeded.",
      ],
    },
    {
      id: "log-types",
      question: "What is the difference between transaction and security logs?",
      answer: [
        "You use transaction logs to review system management activity such as changes to users, roles, clients, and registration settings.",
        "You use security logs to review authentication and security-related events.",
      ],
    },
  ],
};

export default AuditLogsFAQ;