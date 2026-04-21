import { useState } from 'react';
import { getProfile, updateProfile, updateContact } from './profileService';

export function useProfile() {
  const [loading, setLoading] = useState(false);
  const [errors,  setErrors]  = useState<Record<string, string>>({});
  const [success, setSuccess] = useState('');

  const fetchProfile = async (clerkId: string) => {
    try {
      return await getProfile(clerkId);
    } catch (err) {
      console.error('fetchProfile error:', err);
    }
  };

  /**
   * Guarda perfil + contacto en dos llamadas paralelas (sin imagen).
   * Para incluir imagen usa syncWithImage.
   */
  const saveProfile = async (data: {
    clerk_id:   string;
    full_name:  string;
    profession: string;
    bio:        string;
    phone:      string;
    city:       string;
  }) => {
    setLoading(true);
    setErrors({});
    setSuccess('');

    try {
      await Promise.all([
        updateProfile({
          clerk_id: data.clerk_id,
          full_name: data.full_name,
          profession: data.profession,
          bio:data.bio,
        }),
        updateContact({
          clerk_id: data.clerk_id,
          phone: data.phone,
          city: data.city,
        }),
      ]);

      setSuccess('Perfil y contacto actualizados correctamente');
    } catch (err: unknown) {
      const e = err as { errors?: Record<string, string[]>; message?: string };
      if (e.errors) {
        const formatted: Record<string, string> = {};
        for (const key in e.errors) {
          formatted[key === 'full_name' ? 'fullName' : key] = e.errors[key][0];
        }
        setErrors(formatted);
      } else {
        setErrors({ server: e.message ?? 'Error del servidor' });
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
    setLoading,
  };
}