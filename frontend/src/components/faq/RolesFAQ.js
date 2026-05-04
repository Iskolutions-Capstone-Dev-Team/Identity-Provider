const RolesFAQ = {
  id: "roles",
  title: "Roles",
  iconPath:
    "M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z",
  questions: [
    {
      id: "roles-purpose",
      question: "What is the Roles for?",
      answer: [
        "Roles define sets of permissions that control what an administrator can access and manage in the IDP.",
        "A user's assigned role permissions affects the pages, buttons, and actions available to them.",
      ],
    },
    {
      id: "create-role",
      question: "How to create role",
      answer: [
        "Click Add Role, enter the role name and description, then select the permissions that should belong to that role.",
        "Review the permission list before saving because the role will control what assigned users can do.",
      ],
    },
    {
      id: "edit-role",
      question: "How to edit a role",
      answer: [
        "Find the role in the Roles, click Edit, then update the role name, description or assigned permissions.",
        "Save the changes after reviewing them because updates can affect users assigned to that role.",
      ],
    },
    {
      id: "delete-role",
      question: "Can you delete a role?",
      answer: [
        "A role can only be deleted when the system allows it and it is not currently assigned to any user.",
        "If a role is already used by a user account, you remove or change its role first before deleting the role.",
      ],
    },
  ],
};

export default RolesFAQ;