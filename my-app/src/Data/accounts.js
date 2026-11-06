import { supabase } from "../lib/supabaseClient";

// letters, numbers, _ . - and 3–20 characters long
export const USERNAME_RE = /^[A-Za-z0-9_.-]{3,20}$/;

// turn a profiles row into the user object the app already uses
const toUser = (profile, email) =>
  profile && {
    id: profile.id,
    name: profile.username,
    games: profile.games ?? [],
    avatar: profile.avatar_url ?? null,
    email,
  };

// escape % and _ so they're matched literally in ilike searches
const escapeLike = (s) => s.replace(/[\\%_]/g, "\\$&");

export async function fetchProfile(authUser) {
  if (!authUser) return null;
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", authUser.id)
    .single();
  if (error) {
    console.error("Couldn't load profile:", error.message);
    return null;
  }
  return toUser(data, authUser.email);
}

export async function isUsernameTaken(username) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .ilike("username", escapeLike(username))
    .limit(1);
  if (error) throw error;
  return data.length > 0;
}

export async function signUp({ email, password, username, games }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username, games }, // the database trigger turns this into a profile
      emailRedirectTo: window.location.origin, // confirmation link comes back to this site
    },
  });
  if (error) throw error;
  return data;
}

export async function logIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return fetchProfile(data.user);
}

export async function logOut() {
  await supabase.auth.signOut();
}

export async function updateProfile(id, { games, avatar }) {
  const { error } = await supabase
    .from("profiles")
    .update({ games, avatar_url: avatar })
    .eq("id", id);
  if (error) throw error;
}

// search every account by username
export async function searchAllPlayers(query) {
  const q = query.trim();
  const { data, error } = await supabase
    .from("profiles")
    .select("username, games, avatar_url")
    .ilike("username", `%${escapeLike(q)}%`)
    .order("username")
    .limit(20);
  if (error) throw error;

  return data.map((p) => ({
    name: p.username,
    avatar: p.avatar_url ?? null,
    registered: true,
    games: Object.fromEntries((p.games ?? []).map((id) => [id, {}])),
  }));
}

// shrink an uploaded image to a small square and return it as a data URL
export function resizeImage(file, size = 128) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      const side = Math.min(img.width, img.height);
      ctx.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, size, size);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read that image."));
    };

    img.src = url;
  });
}