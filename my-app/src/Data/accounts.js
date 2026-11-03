const ACCOUNTS_KEY = "rg-accounts";

export const loadAccounts = () => {
  try { return JSON.parse(localStorage.getItem(ACCOUNTS_KEY)) ?? {}; } catch { return {}; }
};

export const saveAccounts = (accounts) => {
  try { localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts)); } catch {}
};

export const accountKey = (name) => name.trim().toLowerCase(); // case-insensitive usernames

export async function hashPassword(password) {
  const data = new TextEncoder().encode(password);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}