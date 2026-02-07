import LoginButtons from "@/components/LoginButtons";

export const metadata = {
  title: "Sign In | Secure Authentication",
  description: "Sign in to your account using Google, GitHub, or Facebook",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100">
      <LoginButtons />
    </div>
  );
}
