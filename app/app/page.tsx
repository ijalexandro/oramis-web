import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Oramis | Conversaciones",
  description: "Panel de Oramis.",
};

export default function AppHomePage() {
  redirect("/app/conversations");
}
