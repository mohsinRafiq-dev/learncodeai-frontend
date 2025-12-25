// Navigation and routing functions
import { ROUTES } from "../../constants";

// Navigation handlers
export const handleNavigation = (
  navigate: (path: string) => void,
  route: string,
  params?: Record<string, string>
) => {
  let navigationPath = route;

  // Add query parameters if provided
  if (params && Object.keys(params).length > 0) {
    const searchParams = new URLSearchParams(params);
    navigationPath += `?${searchParams.toString()}`;
  }

  navigate(navigationPath);
};

// Redirect with parameters
export const redirectWithParams = (
  navigate: (path: string) => void,
  route: string,
  params: Record<string, string>
) => {
  const searchParams = new URLSearchParams(params);
  navigate(`${route}?${searchParams.toString()}`);
};

// Get redirect URL from search params
export const getRedirectUrl = (
  searchParams: URLSearchParams,
  fallbackRoute: string = ROUTES.HOME
): string => {
  return searchParams.get("redirect") || fallbackRoute;
};

// Store redirect for OAuth
export const storeOAuthRedirect = (searchParams: URLSearchParams) => {
  const redirectTo = searchParams.get("redirect");
  if (redirectTo) {
    sessionStorage.setItem("oauth_redirect", redirectTo);
  }
};

// Get and clear OAuth redirect
export const getAndClearOAuthRedirect = (): string => {
  const redirect = sessionStorage.getItem("oauth_redirect") || ROUTES.HOME;
  sessionStorage.removeItem("oauth_redirect");
  return redirect;
};

// Check if current route matches
export const isCurrentRoute = (
  currentPath: string,
  targetRoute: string
): boolean => {
  return currentPath === targetRoute;
};

// Generate breadcrumb navigation
export const generateBreadcrumbs = (
  currentPath: string
): Array<{ label: string; path: string }> => {
  const breadcrumbs = [];

  // Always include home
  breadcrumbs.push({ label: "Home", path: ROUTES.HOME });

  // Add current page based on path
  switch (currentPath) {
    case ROUTES.EDITOR:
      breadcrumbs.push({ label: "Code Editor", path: ROUTES.EDITOR });
      break;
    case ROUTES.SIGNIN:
      breadcrumbs.push({ label: "Sign In", path: ROUTES.SIGNIN });
      break;
    case ROUTES.SIGNUP:
      breadcrumbs.push({ label: "Sign Up", path: ROUTES.SIGNUP });
      break;
    case ROUTES.EMAIL_VERIFICATION:
      breadcrumbs.push({
        label: "Email Verification",
        path: ROUTES.EMAIL_VERIFICATION,
      });
      break;
    case ROUTES.FORGOT_PASSWORD:
      breadcrumbs.push({
        label: "Forgot Password",
        path: ROUTES.FORGOT_PASSWORD,
      });
      break;
    case ROUTES.RESET_PASSWORD:
      breadcrumbs.push({
        label: "Reset Password",
        path: ROUTES.RESET_PASSWORD,
      });
      break;
    default:
      if (currentPath !== ROUTES.HOME) {
        breadcrumbs.push({ label: "Current Page", path: currentPath });
      }
  }

  return breadcrumbs;
};

