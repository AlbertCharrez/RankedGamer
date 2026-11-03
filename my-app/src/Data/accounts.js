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

// update fields on a saved account, e.g. updateAccount("Albert", { avatar: "..." })
export function updateAccount(name, changes) {
  const accounts = loadAccounts();
  const key = accountKey(name);
  if (!accounts[key]) return;
  accounts[key] = { ...accounts[key], ...changes };
  saveAccounts(accounts);
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

      // crop to a centered square, then scale down
      const side = Math.min(img.width, img.height);
      const sx = (img.width - side) / 2;
      const sy = (img.height - side) / 2;
      ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);

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

// search every registered account by username
export async function searchAllPlayers(query) {
  const q = query.trim().toLowerCase();

  return Object.values(loadAccounts())
    .filter((acc) => acc.name.toLowerCase().includes(q))
    .map((acc) => ({
      name: acc.name,
      avatar: acc.avatar ?? null,
      registered: true,
      games: Object.fromEntries((acc.games ?? []).map((id) => [id, {}])),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}