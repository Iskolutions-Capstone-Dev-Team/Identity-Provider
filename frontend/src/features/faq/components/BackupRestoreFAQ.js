const BackupRestoreFAQ = {
  id: "backup-restore",
  title: "Backup & Restore",
  iconPath:
    "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4",
  questions: [
    {
      id: "backup-restore-purpose",
      question: "What is Backup & Restore for?",
      answer: [
        "You use Backup & Restore as a safety net to protect system data and maintain database health.",
        "It allows you to create saved copies of the system, recover information from a previous backup, and automatically clean up old activity logs.",
      ],
    },
    {
      id: "create-backup",
      question: "How do I create a new system backup?",
      answer: [
        "You go to the Backup & Restore tab and click 'Run Backup Now'.",
        "The system creates a secure snapshot of all accounts, roles, and settings, and automatically saves it in safe storage.",
        "You can view the date, type, and file size of your most recent backup in the Latest Backup Details card.",
      ],
    },
    {
      id: "restore-backup",
      question: "How do I restore data from a previous backup?",
      answer: [
        "You go to Restore Backup and drag your saved backup file into the upload box, or click 'Add files' to browse your device.",
        "Once the file is selected, click 'Restore Backup' to load the saved information.",
        "Please note: Restoring replaces current system data with the information from the backup file, returning the system to that exact point in time.",
      ],
    },
    {
      id: "log-retention-policy",
      question: "What does Log Retention & Purge do?",
      answer: [
        "You use Log Retention & Purge to automatically organize and clean historical audit and security logs so the system continues running fast and efficiently.",
        "The system keeps active logs from the last 13 months readily available for review.",
        "Logs older than 13 months are safely bundled into compressed long-term storage so the database never gets overcrowded.",
      ],
    },
    {
      id: "log-retention-schedule",
      question: "When does log cleanup run, and can I trigger it manually?",
      answer: [
        "The system automatically runs log maintenance every day at a scheduled time (08:00 UTC).",
        "If you need to perform maintenance immediately, administrators with Superadmin access can click 'Run Retention Now' and confirm the prompt.",
      ],
    },
    {
      id: "backup-permissions",
      question: "Who can create backups, restore data, or purge logs?",
      answer: [
        "Because these tools manage sensitive system-wide information, only authorized administrators with the proper permissions can view and use Backup & Restore.",
        "Running manual log retention specifically requires Superadmin privileges to prevent accidental data removal.",
      ],
    },
  ],
};

export default BackupRestoreFAQ;
