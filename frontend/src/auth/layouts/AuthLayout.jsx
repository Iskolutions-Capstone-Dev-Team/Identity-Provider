import LoginHeader from "../components/LoginHeader";
import LoginFooter from "../components/LoginFooter";

export default function AuthLayout({ children }) {
  return (
    <div className="font-[Poppins]">
      <LoginHeader />
      <main className="hero min-h-screen" style={{ backgroundImage: "url(/assets/images/PUP_Bg.jpg)" }}>
        {children}
      </main>
      <LoginFooter />
    </div>
  );
}