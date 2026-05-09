const ONE_PORTAL_URL = import.meta.env.VITE_ONE_PORTAL_URL;

export default function OnePortalButton({ className = "" }) {
  const handleClick = () => {
    window.location.href = ONE_PORTAL_URL;
  };

  return (
    <button type="button" aria-label="One Portal" title="One Portal" className={className} onClick={handleClick}>
      <img src="/assets/images/PUP_Logo.png" alt="" aria-hidden="true" className="h-14 w-14 rounded-full p-1 object-contain"/>
    </button>
  );
}