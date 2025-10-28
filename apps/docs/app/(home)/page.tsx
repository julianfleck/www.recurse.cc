import { redirect } from "next/navigation";

export default function HomePage() {
  // Redirect to documentation
  redirect("/docs/introduction");
}
