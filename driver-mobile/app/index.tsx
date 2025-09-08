import { useEffect } from "react";
import { useRouter } from "expo-router";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to landing page
    router.replace("/landing");
  }, []);

  return null;
}
