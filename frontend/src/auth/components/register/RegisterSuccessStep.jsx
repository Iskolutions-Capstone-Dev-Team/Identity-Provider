import { Link } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";

export default function RegisterSuccessStep({ loginPath }) {
  return (
    <Card className="border-none bg-transparent shadow-none">
      <CardContent className="space-y-5 text-center p-0">
        <img src="/assets/images/IDP_Logo.png" alt="IDP Logo" className="float-logo mx-auto block h-20 object-contain drop-shadow-[0_0_22px_rgba(248,210,78,0.5)]"/>

      <div className="space-y-2">
        <h2 className="scroll-m-20 text-3xl font-semibold tracking-tight text-white">
          Account Ready
        </h2>
        <p className="text-sm text-muted-foreground text-white/80">
          Your registration is complete. You can now sign in using your email
          and password.
        </p>
      </div>

      <Button asChild className="h-12 w-full rounded-xl bg-[#ffd700] text-sm font-bold text-[#6f0f15] shadow-[0_18px_40px_-22px_rgba(248,210,78,0.9)] hover:bg-[#991b1b] hover:text-white transition duration-300">
        <Link to={loginPath}>Go to Login</Link>
      </Button>
      </CardContent>
    </Card>
  );
}