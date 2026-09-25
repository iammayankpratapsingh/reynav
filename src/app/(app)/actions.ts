"use server";
// Sign-out Server Action.
import { redirect } from "next/navigation";
import { signOut } from "@/backend/services/auth/auth-service";

export async function signOutAction(): Promise<void> {
  await signOut();
  redirect("/login");
}
