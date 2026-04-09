import { useUser } from "@clerk/clerk-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SsoCallback = () => {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoaded || !user) return;

    const syncUser = async () => {
      const email = user.primaryEmailAddress?.emailAddress;
      const name = user.fullName || user.firstName || "Usuario";

      if (!email) return;

      if (!email.endsWith("@est.umss.edu")) {
        alert("Solo correos institucionales");
        return;
      }

      try {
        const res = await fetch("http://127.0.0.1:8000/api/sync-user", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, name }),
        });

        const data = await res.json();
        console.log("USER GUARDADO:", data);

        navigate("/profile");
      } catch (error) {
        console.error("Error guardando usuario", error);
      }
    };

    syncUser();
  }, [user, isLoaded]);

  return <div>Autenticando...</div>;
};

export default SsoCallback;