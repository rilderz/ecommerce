export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Generate login URL at runtime so redirect URI reflects the current origin.
export const getLoginUrl = () => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID;

  // safety check (prevents "Invalid URL")
  if (!oauthPortalUrl || !appId) {
    console.error("Missing VITE_OAUTH_PORTAL_URL or VITE_APP_ID");
    return "/login";
  }

  // ensure this only runs in browser
  const redirectUri =
    typeof window !== "undefined"
      ? `${window.location.origin}/api/oauth/callback`
      : "/api/oauth/callback";

  const state = typeof window !== "undefined" ? btoa(redirectUri) : "";

  const url = new URL(`${oauthPortalUrl}/app-auth`);

  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");

  return url.toString();
};