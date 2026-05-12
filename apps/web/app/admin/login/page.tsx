import { LoginPanel } from "@/components/auth/login-panel";

export default function AdminLoginPage() {
  return (
    <LoginPanel
      audience="admin"
      badge="Admin Access"
      title="Restricted sign in"
      description="Use an administrator account to enter moderation, analytics, verified-source management, and broadcast tools."
      heroTitle="Enter the control room without passing through the public homepage."
      heroDescription="This dedicated admin login route is built for operators who need to move directly into moderation and live dashboard analytics."
      submitLabel="Enter admin dashboard"
      successRoute="/admin"
    />
  );
}
