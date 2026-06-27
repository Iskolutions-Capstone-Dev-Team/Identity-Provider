import { EmptySearchIcon } from "./componentIcons";

export default function EmptySearchState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center">
      <EmptySearchIcon className="mb-4 size-12 text-current" />
      <span>{message}</span>
    </div>
  );
}