import ResetPasswordClient from "./ResetPasswordClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Recuperar contraseña | Oramis",
  description: "Recuperá tu acceso a Oramis.",
};

export default function ResetPasswordPage() {
  return <ResetPasswordClient />;
}
