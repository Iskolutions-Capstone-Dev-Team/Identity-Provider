const RegistrationFAQ = {
  id: "registration",
  title: "Registration",
  iconPath:
    "M10.125 2.25h-4.5c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125v-9M10.125 2.25h.375a9 9 0 0 1 9 9v.375M10.125 2.25A3.375 3.375 0 0 1 13.5 5.625v1.5c0 .621.504 1.125 1.125 1.125h1.5a3.375 3.375 0 0 1 3.375 3.375M9 15l2.25 2.25L15 12",
  questions: [
    {
      id: "registration-purpose",
      question: "What is the Registration for?",
      answer: [
        "You use Registration to manage account types and the app clients allowed for each type.",
        "This setup controls which connected systems a registered account can access.",
      ],
    },
    {
      id: "account-type",
      question: "What is an account type?",
      answer: [
        "An account type defines a user category and the app clients that category is permitted to access.",
        "You assign clients to an account type so users under that type only see systems allowed for them.",
      ],
    },
    {
      id: "create-account-type",
      question: "How to create an account type",
      answer: [
        "You click Add Account Type, enter the account type name, then choose the app clients it can access.",
        "You review the selected clients before saving because they control the systems available to that account type.",
      ],
    },
    {
      id: "edit-account-type",
      question: "How to edit an account type",
      answer: [
        "You find the account type in Registration, click Edit, then update the app clients linked to it.",
        "You save changes only after reviewing them because updates affect the access of users under that account type.",
      ],
    },
  ],
};

export default RegistrationFAQ;