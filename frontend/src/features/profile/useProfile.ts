import { useState } from "react";
import { getProfile, updateProfile } from "./profileService";

export function useProfile() {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState("");

  const fetchProfile = async (clerkId: string) => {
    try {
      return await getProfile(clerkId);
    } catch (err) {
      console.error(err);
    }
  };

  const saveProfile = async (data: any) => {
    setLoading(true);
    setErrors({});
    setSuccess("");

    try {
      await updateProfile(data);
      setSuccess("Perfil actualizado correctamente");
    } catch (err: any) {
      if (err.errors) {
        const formatted: Record<string, string> = {};

        for (const key in err.errors) {
          const formKey = key === "full_name" ? "fullName" : key;
          formatted[formKey] = err.errors[key][0];
        }

        setErrors(formatted);
      } else {
        setErrors({ server: err.message || "Error del servidor" });
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    errors,
    success,
    fetchProfile,
    saveProfile,
    setErrors,
    setSuccess,
  };
}