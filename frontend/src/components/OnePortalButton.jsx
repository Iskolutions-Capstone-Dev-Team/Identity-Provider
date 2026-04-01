export default function OnePortalButton({ className = "" }) {
  return (
    <button type="button" aria-label="One Portal" title="One Portal" className={className}>
      <img src="/assets/images/PUP_Logo.png" alt="" aria-hidden="true" className="h-14 w-14 rounded-full p-1 object-contain"/>
    </button>
  );
}