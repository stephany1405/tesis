export function getJWT(CookieName) {
  const cookies = document.cookie.split("; ");

  const cookie = cookies.find((cookie) => cookie.startsWith(`${CookieName}=`));

  return cookie ? cookie.split("=")[1] : null;
}
