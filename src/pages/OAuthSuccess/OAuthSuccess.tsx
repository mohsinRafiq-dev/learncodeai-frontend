import { useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate, useSearchParams } from "react-router-dom";
import { STORAGE_KEYS, ROUTES } from "../../constants";
import { authAPI } from "../../services/api";

export default function OAuthSuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setUserAndToken } = useAuth();

  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");

    if (error) {
      navigate(ROUTES.SIGNIN + "?error=" + error);
      return;
    }

    if (token) {
      // Store token and update AuthContext, then redirect
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      authAPI
        .getProfile()
        .then((data) => {
          if (data.status === "success") {
            setUserAndToken(data.data.user, token);
            // Check for redirect parameter in the original OAuth request
            const redirectTo =
              sessionStorage.getItem("oauth_redirect") || ROUTES.HOME;
            sessionStorage.removeItem("oauth_redirect");
            navigate(redirectTo);
          } else {
            navigate(ROUTES.SIGNIN + "?error=oauth_failed");
          }
        })
        .catch(() => {
          navigate(ROUTES.SIGNIN + "?error=oauth_failed");
        });
    } else {
      navigate(ROUTES.SIGNIN);
    }
  }, [searchParams, navigate, setUserAndToken]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Completing authentication...</p>
      </div>
    </div>
  );
}

