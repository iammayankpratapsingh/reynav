// Connections route: kept as a deep link into settings, where connections are listed.
import { redirect } from "next/navigation";

export default function ConnectionsSettingsPage() {
  redirect("/settings");
}
