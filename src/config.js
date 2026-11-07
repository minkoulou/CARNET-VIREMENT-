const env = import.meta.env
// Benoit garde l'argent (keeper) ; Brice est celui qui le confie.
export const PEOPLE = [
  { name: env.VITE_USER1_NAME, email: String(env.VITE_USER1_EMAIL).toLowerCase(), keeper: true },
  { name: env.VITE_USER2_NAME, email: String(env.VITE_USER2_EMAIL).toLowerCase() },
]
