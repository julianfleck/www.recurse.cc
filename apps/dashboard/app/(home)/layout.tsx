import { redirect } from "next/navigation";

export default function Layout() {
  // Redirect to dashboard if not already there
  redirect("/dashboard");
}


