"use client";
import { useRouter } from "next/navigation";
import { authClient } from "./auth-client";

export function UserMenu() {
  const router = useRouter();
  const { data } = authClient.useSession();
  if (!data) return null;
  return (
    <span className="muted">
      {data.user.email}{" "}
      <button type="button" onClick={async () => { await authClient.signOut(); router.push("/login"); router.refresh(); }}>
        Sign out
      </button>
    </span>
  );
}
