import { supabase } from "../lib/supabaseClient";

// letters, numbers, _ . - and 3–20 characters long
export const USERNAME_RE = /^[A-Za-z0-9_.-]{3,20}$/;

// Marvel Rivals UID: numbers only
export const RIVALS_UID_RE = /^\d{5,15}$/;

// columns that are safe to show to anyone (no email)
const PUBLIC_FIELDS = "id, username, games, avatar_url, steam_id, rivals_uid, created_at";

// turn a profiles row into the user object the app uses
const toUser = (profile, email) =>
  profile && {
    id: profile.id,
    name: profile.username,
    games: profile.games ?? [],
    avatar: profile.avatar_url ?? null,
    steamId: profile.steam_id ?? null,
    rivalsUid: profile.rivals_uid ?? null,
    createdAt: profile.created_at ?? null,
    ...(email ? { email } : {}),
  };

// escape % and _ so they're matched literally in ilike searches
const escapeLike = (s) => s.replace(/[\\%_]/g, "\\$&");

// accepts a SteamID64 or a steamcommunity.com/profiles/... link
// returns the ID, null for empty, or undefined if it's not valid
export function parseSteamId(input) {
  const s = input.trim();
  if (!s) return null;
  const match = s.match(/7656119\d{10}/);
  return match ? match[0] : undefined;
}

export const steamProfileUrl = (id) => `https://steamcommunity.com/profiles/${id}`;

// ---------- Auth ----------

export async function signUp({ email, password, username, games }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username, games },
      emailRedirectTo: window.location.origin,
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

// ---------- Profiles ----------

export async function fetchProfile(authUser) {
  if (!authUser) return null;
  const { data, error } = await supabase
    .from("profiles")
    .select(PUBLIC_FIELDS)
    .eq("id", authUser.id)
    .single();
  if (error) {
    console.error("Couldn't load profile:", error.message);
    return null;
  }
  return toUser(data, authUser.email);
}

// look up a profile by username (used when someone opens /u/<name>)
export async function fetchProfileByUsername(username) {
  const { data, error } = await supabase
    .from("profiles")
    .select(PUBLIC_FIELDS)
    .ilike("username", escapeLike(username))
    .maybeSingle();
  if (error) throw error;
  return toUser(data); // null if no one has that name
}

export async function isUsernameTaken(username, excludeId = null) {
  let query = supabase
    .from("profiles")
    .select("id")
    .ilike("username", escapeLike(username))
    .limit(1);
  if (excludeId) query = query.neq("id", excludeId);

  const { data, error } = await query;
  if (error) throw error;
  return data.length > 0;
}

// returns what the database actually saved (the name may have been changed to dunceN)
export async function updateProfile(id, { username, games, avatar, steamId, rivalsUid }) {
  const { data, error } = await supabase
    .from("profiles")
    .update({
      username,
      games,
      avatar_url: avatar,
      steam_id: steamId,
      rivals_uid: rivalsUid,
    })
    .eq("id", id)
    .select(PUBLIC_FIELDS)
    .single();
  if (error) throw error;
  return toUser(data);
}

// search every account by username
export async function searchAllPlayers(query) {
  const q = query.trim();
  const { data, error } = await supabase
    .from("profiles")
    .select(PUBLIC_FIELDS)
    .ilike("username", `%${escapeLike(q)}%`)
    .order("username")
    .limit(20);
  if (error) throw error;
  return data.map((p) => toUser(p));
}

// ---------- Images ----------

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