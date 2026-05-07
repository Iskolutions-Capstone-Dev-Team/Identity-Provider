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
        "You use Roles to define sets of permissions that control what an administrator can access and manage in the IDP.",
        "You should assign roles carefully because they affect the pages, buttons, and actions available to a user.",
      ],
    },
    {
      id: "create-role",
      question: "How to create role",
      answer: [
        "You click Add Role, enter the role name and description, then select the permissions that should belong to that role.",
        "You should review the permission list before saving because the role will control what assigned users can do.",
      ],
    },
    {
      id: "edit-role",
      question: "How to edit a role",
      answer: [
        "You find the role in Roles, click Edit, then update the description or assigned permissions. The role name stays locked after creation.",
        "You should save changes only after reviewing them because updates can affect users assigned to that role.",
      ],
    },
    {
      id: "delete-role",
      question: "Can you delete a role?",
      answer: [
        "You can delete a role only when the system allows it and it is not currently assigned to any user.",
        "If a role is already used by a user account, you need to remove or change that role first before deleting it.",
      ],
    },
  ],
};

export default RolesFAQ;