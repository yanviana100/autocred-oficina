import { redirect } from "next/navigation";

// O fluxo de onboarding em wizard foi descontinuado.
// A configuração inicial agora é guiada pelo checklist no dashboard.
export default function OnboardingPage() {
  redirect("/dashboard");
}
