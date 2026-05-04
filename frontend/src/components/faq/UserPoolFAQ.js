const UserPoolFAQ = {
  id: "user-pool",
  title: "User Pool",
  iconPath:
    "M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z",
  questions: [
    {
      id: "user-pool-purpose",
      question: "What is the User Pool for?",
      answer: [
        "User Pool is where authorized admins manage system administrator and user accounts inside the IDP.",
        "Available account actions depend on the permissions assigned to the signed-in administrator.",
      ],
    },
    {
      id: "create-system-administrator",
      question: "How to create System Administrator account",
      answer: [
        "Click Add User, then select System Administrator as the account type and complete the required account details.",
        "Assign the needed administrator role or status, review the information, then submit the form.",
      ],
    },
    {
      id: "create-user-account",
      question: "How to create user account",
      answer: [
        "Click Add User, then select an account type other than System Administrator and fill in the required user details.",
        "Assign available app client access when needed, review the information, then submit the form.",
      ],
    },
    {
      id: "edit-user-account",
      question: "How to edit a user account",
      answer: [
        "Find the account in User Pool, click Edit, then update the allowed fields such as status, roles, or app client access.",
      ],
    },
  ],
};

export default UserPoolFAQ;