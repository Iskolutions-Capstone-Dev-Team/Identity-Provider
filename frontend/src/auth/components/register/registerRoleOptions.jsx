import { Book, Users, Contact, GraduationCap } from "lucide-react";

export const roleOptions = [
  {
    id: "student",
    label: "Student",
    Icon: Book,
  },
  {
    id: "guest",
    label: "Guest",
    Icon: Users,
  },
  {
    id: "applicant",
    label: "Applicant",
    Icon: Contact,
  },
  {
    id: "alumni",
    label: "Alumni",
    Icon: GraduationCap,
  },
];