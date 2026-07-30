import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Autocomplete, AutocompleteContent, AutocompleteEmpty, AutocompleteInput, AutocompleteItem, AutocompleteList } from "@/components/reui/autocomplete";
import { authPageBackground } from "../auth/utils/authBackground";
import DotField from "@/components/ui/DotField";
import { Button } from "@/components/ui/button";
import { SearchIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

const items = [
  { id: "dashboard", value: "dashboard" },
  { id: "user-pool", value: "user-pool" },
  { id: "roles", value: "roles" },
  { id: "audit-logs", value: "audit-logs" },
  { id: "faq", value: "faq" },
  { id: "app-client", value: "app-client" },
  { id: "registration", value: "registration" },
  { id: "profile", value: "profile" },
];

export default function NotFound() {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const query = e.currentTarget.elements.search.value;
    if (query) {
      navigate(query.startsWith("/") ? query : "/" + query);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden font-[Poppins] text-white flex items-center justify-center p-4" style={{ background: authPageBackground }}>
      <div className="absolute inset-0 overflow-hidden">
        <DotField
          dotRadius={1.5}
          dotSpacing={14}
          bulgeStrength={67}
          glowRadius={160}
          sparkle={false}
          waveAmplitude={0}
          cursorRadius={500}
          cursorForce={0.1}
          bulgeOnly
          gradientFrom="rgba(255, 255, 255, 0.22)"
          gradientTo="rgba(255, 255, 255, 0.08)"
          glowColor="rgba(0, 0, 0, 0.2)"
        />
      </div>

      <div className="relative z-10 flex w-full max-w-xl items-center justify-center p-4">
        <Empty className="rounded-[2rem] border-[3px] border-[#a13a3a]/60 bg-[#5b0b10]/35 p-1 shadow-[0_34px_90px_-42px_rgba(0,0,0,0.95)] backdrop-blur-sm w-full text-white">
          <div className="rounded-[calc(2rem-7px)] bg-[linear-gradient(180deg,rgba(122,13,21,0.72),rgba(55,6,11,0.78))] px-6 py-6 sm:px-9 sm:py-7 lg:px-10 w-full flex flex-col items-center">
            <EmptyHeader className="max-w-full mb-2">
              <EmptyTitle className="text-[22px] font-bold text-white mb-1 text-center">404 — Not Found</EmptyTitle>
              <EmptyDescription className="text-[15px] text-white/70 max-w-md mx-auto text-center">
              The page you&apos;re looking for doesn&apos;t exist. Try searching
              for what you need below.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent className="max-w-full w-full mx-auto mt-4">
            <div className="w-full sm:w-3/4 mx-auto">
              <Autocomplete items={items} autoHighlight>
                <form onSubmit={handleSubmit} className="flex flex-row items-center gap-2 w-full">
                  <AutocompleteInput name="search" placeholder="Try searching for pages…" showClear className="h-12 w-full rounded-xl bg-background pl-4 pr-10 text-base shadow-sm border border-input focus-visible:ring-[#ffd700] text-black" />
                  <Button type="submit" size="icon" className="shrink-0 h-12 w-12 rounded-xl bg-[#ffd700] text-[#6f0f15] hover:bg-[#991b1b] hover:text-white transition duration-300 border-0">
                    <SearchIcon className="h-4 w-4" />
                  </Button>
                </form>
                <AutocompleteContent>
                  <AutocompleteEmpty>No items found.</AutocompleteEmpty>
                  <AutocompleteList>
                    {(item) => (
                      <AutocompleteItem key={item.id} value={item.value}>
                        {item.value}
                      </AutocompleteItem>
                    )}
                  </AutocompleteList>
                </AutocompleteContent>
              </Autocomplete>
            </div>
            <EmptyDescription className="text-[15px] text-white/70 mt-6 text-center">
              Need help? <a href="mailto:iskolutions.team@gmail.com" className="font-semibold text-[#ffd700] underline decoration-transparent transition duration-300 hover:decoration-[#ffd700]">Contact support</a>
            </EmptyDescription>
          </EmptyContent>
          </div>
        </Empty>
      </div>
    </div>
  );
}
