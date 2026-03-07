import LoginHeader from "../components/LoginHeader";
import LoginFooter from "../components/LoginFooter";

export default function AuthLayout({ children }) {
  return (
    <div className="font-[Poppins]">
      <LoginHeader />
      <main className="hero min-h-screen" style={{ backgroundImage: "url(/assets/images/pup_bg.png)" }}>
        {children}
      </main>
      <LoginFooter />
    </div>
  );
}