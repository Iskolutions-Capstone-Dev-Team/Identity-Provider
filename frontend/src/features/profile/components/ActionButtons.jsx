import { Button } from "../../../components/ui/button";
import { Pencil, Lock } from "lucide-react";

export default function ActionButtons({ openEdit, openPassword }) {
  return (
    <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-start">
      <Button type="button" onClick={openEdit} variant="outline" className="h-11 px-6 rounded-lg font-bold text-[15px]">
        <Pencil className="size-4 mr-2" />
        Edit Profile
      </Button>

      <Button type="button" onClick={openPassword} className="h-11 px-6 rounded-lg font-bold text-[15px] bg-[#7b0d15] text-white hover:bg-[#7b0d15]/90 dark:bg-white dark:text-black dark:hover:bg-white/90">
        <Lock className="size-4 mr-2" />
        Change Password
      </Button>
    </div>
  );
}