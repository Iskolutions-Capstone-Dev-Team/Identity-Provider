import { IconTile } from "@/components/reui/icon-tile"
import { Settings2Icon } from "lucide-react"

export function Pattern() {
  return (
    <div className="flex items-center justify-center">
      <IconTile
        render={<a href="#" aria-label="Open settings" />}
        variant="elevated"
        className="hover:bg-accent focus-visible:ring-ring focus-visible:ring-offset-background transition-colors outline-none focus-visible:ring-2 focus-visible:ring-offset-2">
        <Settings2Icon aria-hidden="true" />
      </IconTile>
    </div>
  );
}