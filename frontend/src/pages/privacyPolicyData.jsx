import { Info, CircleCheck, Database, CircleHelp, KeySquare, FileText, ShieldCheck, Share2, Monitor, Cookie, Timer, UserCheck, PencilLine, Mail } from "lucide-react";

export const privacyPolicySections = [
  {
    id: "introduction",
    title: "Introduction",
    icon: <Info className="h-4 w-4 shrink-0" />,
    content: (
      <>
        <p>
          The Identity Provider (IDP) and One Portal (OP) are information systems developed as part of the Unified Access: User Pool-Based Identity Provider for Multi-System Integration in PUP Taguig project. These systems are designed to provide secure identity management, centralized authentication, and unified access to authorized institutional services.
        </p>
        <p>
          The privacy and protection of personal information are of utmost importance. This Privacy Policy explains how personal data is collected, used, stored, protected, and processed in accordance with the Data Privacy Act of 2012 (Republic Act No. 10173), its Implementing Rules and Regulations, and applicable institutional data privacy policies.
        </p>
        <p>
          This Privacy Policy applies solely to the Identity Provider and One Portal systems and does not extend to third-party applications, websites, or services that may be accessed through these systems.
        </p>
      </>
    )
  },
  {
    id: "consent",
    title: "Consent",
    icon: <CircleCheck className="h-4 w-4 shrink-0" />,
    content: (
      <p>
        By accessing and using the Identity Provider or One Portal, you acknowledge that you have read, understood, and agreed to this Privacy Policy. Your continued use of the systems constitutes your consent to the collection, processing, storage, and use of your personal information for legitimate institutional purposes.
      </p>
    )
  },
  {
    id: "information-we-collect",
    title: "Information We Collect",
    icon: <Database className="h-4 w-4 shrink-0" />,
    content: (
      <>
        <p>
          To provide secure authentication and centralized identity management, the systems may collect the following information:
        </p>
        <h4 className="font-semibold mt-4 mb-2">Personal Information</h4>
        <ul className="list-disc pl-6 space-y-1 mb-4">
          <li>Full Name</li>
          <li>Institutional Email Address</li>
          <li>Employee or Student Number</li>
          <li>User Role</li>
          <li>Organizational Unit or Department</li>
          <li>Affiliated Service Providers</li>
          <li>Profile Information (when applicable)</li>
        </ul>
        <h4 className="font-semibold mt-4 mb-2">Authentication Information</h4>
        <ul className="list-disc pl-6 space-y-1 mb-4">
          <li>Username</li>
          <li>Encrypted Password</li>
          <li>Multi-factor authentication data (if enabled)</li>
          <li>Password reset information</li>
        </ul>
        <h4 className="font-semibold mt-4 mb-2">System Activity Information</h4>
        <p className="mb-2">
          The systems automatically record activity necessary for security and auditing purposes, including:
        </p>
        <ul className="list-disc pl-6 space-y-1 mb-4">
          <li>Login and logout timestamps</li>
          <li>Authentication attempts</li>
          <li>IP Address</li>
          <li>Browser and device information</li>
          <li>Operating system</li>
          <li>Session identifiers</li>
          <li>Accessed applications</li>
          <li>Audit logs</li>
          <li>Administrative actions</li>
          <li>Error logs</li>
        </ul>
        <p>
          Only information necessary for authentication, authorization, security, and system administration is collected.
        </p>
      </>
    )
  },
  {
    id: "how-we-use-your-information",
    title: "How We Use Your Information",
    icon: <CircleHelp className="h-4 w-4 shrink-0" />,
    content: (
      <>
        <p className="mb-2">
          Collected information is used exclusively for legitimate institutional purposes, including:
        </p>
        <ul className="list-disc pl-6 space-y-1 mb-4">
          <li>Authenticating users before granting system access</li>
          <li>Managing user identities and accounts</li>
          <li>Providing Single Sign-On (SSO) authentication</li>
          <li>Implementing Role-Based Access Control (RBAC)</li>
          <li>Authorizing access to integrated applications</li>
          <li>Monitoring system security</li>
          <li>Detecting unauthorized access attempts</li>
          <li>Maintaining audit trails for administrative actions</li>
          <li>Troubleshooting system issues</li>
          <li>Improving system reliability and performance</li>
          <li>Complying with institutional policies and applicable laws</li>
        </ul>
        <p>
          Personal information is never sold, rented, or used for commercial marketing purposes.
        </p>
      </>
    )
  },
  {
    id: "identity-and-access-management",
    title: "Identity and Access Management",
    icon: <KeySquare className="h-4 w-4 shrink-0" />,
    content: (
      <>
        <p className="mb-2">
          The Identity Provider serves as the centralized authentication authority for participating institutional systems. When a user signs in:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Authentication credentials are securely verified.</li>
          <li>Authorized identity information may be shared only with integrated applications that the user is permitted to access.</li>
          <li>Only the minimum information required for authentication and authorization is shared.</li>
          <li>Service providers cannot access information beyond what is necessary to identify and authorize the user.</li>
        </ul>
      </>
    )
  },
  {
    id: "audit-logs-and-security-monitoring",
    title: "Audit Logs and Security Monitoring",
    icon: <FileText className="h-4 w-4 shrink-0" />,
    content: (
      <>
        <p className="mb-2">
          To maintain the confidentiality, integrity, and availability of institutional systems, the Identity Provider and One Portal maintain audit logs that may include:
        </p>
        <ul className="list-disc pl-6 space-y-1 mb-4">
          <li>User logins and logouts</li>
          <li>Authentication successes and failures</li>
          <li>Password changes</li>
          <li>Administrative actions</li>
          <li>User management activities</li>
          <li>Role and permission updates</li>
          <li>Access to integrated applications</li>
          <li>Security-related events</li>
        </ul>
        <p>
          Audit logs are collected solely for security monitoring, incident investigation, compliance, and system administration.
        </p>
      </>
    )
  },
  {
    id: "data-storage-and-security",
    title: "Data Storage and Security",
    icon: <ShieldCheck className="h-4 w-4 shrink-0" />,
    content: (
      <>
        <p className="mb-4">
          Appropriate administrative, organizational, and technical safeguards are implemented to protect personal information against unauthorized access, disclosure, alteration, loss, misuse, or destruction.
        </p>
        <p className="mb-2">Security measures include:</p>
        <ul className="list-disc pl-6 space-y-1 mb-4">
          <li>Encrypted password storage</li>
          <li>Secure communication using HTTPS/TLS</li>
          <li>Access control based on assigned roles</li>
          <li>Authentication token protection</li>
          <li>Session management</li>
          <li>Audit logging</li>
          <li>Principle of least privilege</li>
          <li>Regular security monitoring</li>
          <li>Controlled administrative access</li>
        </ul>
        <p>
          Only authorized system administrators are permitted to access administrative functions based on their assigned responsibilities.
        </p>
      </>
    )
  },
  {
    id: "data-sharing-and-disclosure",
    title: "Data Sharing and Disclosure",
    icon: <Share2 className="h-4 w-4 shrink-0" />,
    content: (
      <>
        <p className="mb-4">
          Personal information is not sold, rented, or disclosed to third parties.
        </p>
        <p className="mb-2">Information may only be shared under the following circumstances:</p>
        <ul className="list-disc pl-6 space-y-1 mb-4">
          <li>With authorized integrated institutional applications for authentication and authorization purposes;</li>
          <li>With authorized University personnel performing official administrative duties;</li>
          <li>When required by law, legal process, or government authorities;</li>
          <li>To protect the security, integrity, and availability of institutional systems.</li>
        </ul>
        <p>
          Only the minimum amount of information necessary for the intended purpose is disclosed.
        </p>
      </>
    )
  },
  {
    id: "third-party-services",
    title: "Third-Party Services",
    icon: <Monitor className="h-4 w-4 shrink-0" />,
    content: (
      <>
        <p className="mb-4">
          The Identity Provider and One Portal may integrate with authorized institutional applications or external authentication technologies to facilitate secure access.
        </p>
        <p>
          Each integrated application is responsible for protecting any personal information it receives in accordance with its own privacy policies and applicable laws. Users are encouraged to review the privacy practices of those services where applicable. This approach is consistent with PUP's broader privacy framework regarding linked services.
        </p>
      </>
    )
  },
  {
    id: "cookies-and-session-management",
    title: "Cookies and Session Management",
    icon: <Cookie className="h-4 w-4 shrink-0" />,
    content: (
      <>
        <p className="mb-2">
          The systems use essential cookies and secure session technologies to:
        </p>
        <ul className="list-disc pl-6 space-y-1 mb-4">
          <li>Maintain authenticated sessions</li>
          <li>Remember user preferences</li>
          <li>Protect against unauthorized access</li>
          <li>Improve system functionality</li>
        </ul>
        <p>
          These cookies are necessary for the operation of the systems and do not collect personal information for advertising or marketing purposes.
        </p>
      </>
    )
  },
  {
    id: "data-retention",
    title: "Data Retention",
    icon: <Timer className="h-4 w-4 shrink-0" />,
    content: (
      <>
        <p className="mb-2">
          Personal information, authentication records, and audit logs are retained only for as long as necessary to:
        </p>
        <ul className="list-disc pl-6 space-y-1 mb-4">
          <li>Provide authentication services;</li>
          <li>Maintain system security;</li>
          <li>Support administrative operations;</li>
          <li>Comply with institutional record retention requirements;</li>
          <li>Fulfill legal and regulatory obligations.</li>
        </ul>
        <p>
          Data that is no longer required shall be securely archived or disposed of in accordance with applicable institutional policies.
        </p>
      </>
    )
  },
  {
    id: "rights-of-data-subjects",
    title: "Rights of Data Subjects",
    icon: <UserCheck className="h-4 w-4 shrink-0" />,
    content: (
      <>
        <p className="mb-2">
          In accordance with the Data Privacy Act of 2012, users have the right to:
        </p>
        <ul className="list-disc pl-6 space-y-1 mb-4">
          <li>Be informed regarding the processing of their personal information;</li>
          <li>Access their personal information;</li>
          <li>Request correction of inaccurate or incomplete information;</li>
          <li>Request the updating of personal information when appropriate;</li>
          <li>Raise concerns regarding the processing of their personal data, subject to applicable institutional procedures and legal requirements.</li>
        </ul>
        <p>
          Users are responsible for maintaining the confidentiality of their login credentials and must immediately report any suspected unauthorized access to their account.
        </p>
      </>
    )
  },
  {
    id: "policy-updates",
    title: "Policy Updates",
    icon: <PencilLine className="h-4 w-4 shrink-0" />,
    content: (
      <>
        <p className="mb-4">
          This Privacy Policy may be revised from time to time to reflect improvements to the systems, changes in institutional policies, technological developments, or updates in applicable laws and regulations.
        </p>
        <p>
          The latest version of this Privacy Policy shall always be made available through the Identity Provider and One Portal.
        </p>
      </>
    )
  },
  {
    id: "contact-information",
    title: "Contact Information",
    icon: <Mail className="h-4 w-4 shrink-0" />,
    content: (
      <>
        <p className="mb-4">
          For questions, requests, or concerns regarding this Privacy Policy or the processing of personal information, users may contact the system administrators or the appropriate office responsible for data privacy within the Polytechnic University of the Philippines.
        </p>
        <p className="mb-4">
          For official University-wide data privacy concerns, users may also contact the PUP Data Privacy Office through the University's official communication channels.
        </p>
        <p>
          <strong>Email:</strong> <a href="mailto:iskolutions.team@gmail.com" className="font-medium underline !text-inherit hover:!text-[#f8d24e] transition-colors duration-200">iskolutions.team@gmail.com</a>
        </p>
      </>
    )
  }
];
