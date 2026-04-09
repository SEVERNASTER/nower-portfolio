const API_URL = "http://127.0.0.1:8000/api";

export async function getProfile(clerkId: string) {
  const res = await fetch(`${API_URL}/profile?clerk_id=${clerkId}`);
  return res.json();
}

export async function updateProfile(data: {
  clerk_id: string;
  full_name: string;
  profession: string;
  bio: string;
}) {
  const res = await fetch(`${API_URL}/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(data),
  });

  const json = await res.json();
  if (!res.ok) throw json;
  return json;
}

export async function updateContact(data: {
  clerk_id: string;
  phone: string;
  city: string;
}) {
  const res = await fetch(`${API_URL}/profile/contact`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(data),
  });

  const json = await res.json();
  if (!res.ok) throw json;
  return json;
}
