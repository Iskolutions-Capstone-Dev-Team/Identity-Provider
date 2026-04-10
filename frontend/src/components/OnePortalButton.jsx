import { useNavigate } from "react-router-dom";

const ONE_PORTAL_PLACEHOLDER_PATH = "/one-portal";

export default function OnePortalButton({ className = "" }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(ONE_PORTAL_PLACEHOLDER_PATH);
  };

  return (
    <button type="button" aria-label="One Portal" title="One Portal" className={className} onClick={handleClick}>
      <img src="/assets/images/PUP_Logo.png" alt="" aria-hidden="true" className="h-14 w-14 rounded-full p-1 object-contain"/>
    </button>
  );
}