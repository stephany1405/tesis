export function getJWT(cookieName) {
  const cookies = document.cookie.split("; ");

  for (const cookie of cookies) {
    const [name, value] = cookie.split("=");
    if (name.trim() === cookieName) {
      return value;
    }
  }

  return null;
}