import { useUser } from "@clerk/clerk-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000/api";

const SsoCallback = () => {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoaded || !user) return;

    const syncUserIfMissing = async () => {
      const clerkId = user.id;
      const email = user.primaryEmailAddress?.emailAddress;
      const name = user.fullName || user.firstName || "Usuario";

      if (!email) return;

      try {
        const profileRes = await fetch(
          `${API_URL}/profile?clerk_id=${encodeURIComponent(clerkId)}`,
          {
            headers: { Accept: "application/json" },
          }
        );

        if (profileRes.ok) {
          navigate("/profile");
          return;
        }

        if (profileRes.status !== 404) {
          const errorData = await profileRes.json();
          console.error(
            "Error verificando usuario existente:",
            errorData
          );
          navigate("/profile");
          return;
        }

        const res = await fetch(`${API_URL}/sync-user`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            clerk_id: clerkId,
            full_name: name,
            email,
            registration_type: "google",
          }),
        });

        const data = await res.json();
        console.log("Usuario creado en backend:", data);

        navigate("/profile");
      } catch (error) {
        console.error("Error sincronizando usuario:", error);
      }
    };

    syncUserIfMissing();
  }, [user, isLoaded, navigate]);

  return <div>Autenticando...</div>;
};

export default SsoCallback;