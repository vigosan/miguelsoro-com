import { useEffect } from "react";
import { useRouter } from "next/router";

export default function AdminSettings() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/settings/general");
  }, [router]);

  return null;
}
