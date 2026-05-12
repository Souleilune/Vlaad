import { LoginPanel } from "@/components/auth/login-panel";

export default function LoginPage() {
  return (
    <LoginPanel
      audience="user"
      badge="User Access"
      title="Sign in"
      description="Use your registered account to load your profile, reports, and authenticated tools."
      heroTitle="Step back into the live emergency network."
      heroDescription="Signed-in users can track requests, manage reports, and keep their donor profile tied to the live feed instead of browsing as a guest."
      submitLabel="Enter profile"
      successRoute="/map"
    />
  );
}
