export function isOnAuthPage(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  return ["/login", "/signup", "/forgot-password"].includes(window.location.pathname);
}
