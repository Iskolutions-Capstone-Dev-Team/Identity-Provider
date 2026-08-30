import { User, Settings, Monitor, FileText, Shield, Database } from "lucide-react";

export const PERMISSION_GROUPS = [
  {
    value: "userpool",
    trigger: "Userpool",
    icon: <User className="text-muted-foreground size-4" />,
    permissions: [
      "Activate user", "Add user", "Assign appclient to user", "Assign Roles",
      "Delete User", "Edit User", "View All Users", "View Admins", "View Users based on Appclient",
      "Remove appclient from user", "Remove Roles", "Suspend user"
    ]
  },
  {
    value: "role",
    trigger: "Role",
    icon: <Shield className="text-muted-foreground size-4" />,
    permissions: [
      "Add roles", "Delete Roles", "Edit Roles", "View roles"
    ]
  },
  {
    value: "appclient",
    trigger: "AppClient",
    icon: <Monitor className="text-muted-foreground size-4" />,
    permissions: [
      "Add appclient", "Delete appclient", "Edit appclient", "View all appclients", "View Connected Appclients"
    ]
  },
  {
    value: "auditlogs",
    trigger: "Audit Logs",
    icon: <FileText className="text-muted-foreground size-4" />,
    permissions: [
      "View Audit Logs", "View Security Logs"
    ]
  },
  {
    value: "registrationconfig",
    trigger: "Registration Config",
    icon: <Settings className="text-muted-foreground size-4" />,
    permissions: [
      "Create Registration Config", "Edit Registration Config", "View Registration Config", "Delete Registration Config"
    ]
  },
  {
    value: "backuprestore",
    trigger: "Backup & Restore",
    icon: <Database className="text-muted-foreground size-4" />,
    permissions: [
      "Manage Backup and Restore"
    ]
  }
];
