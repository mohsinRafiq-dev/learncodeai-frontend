import { useEffect } from "react";
import { useAuth } from "./useAuth";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";

/**
 * Hook to check if user account is suspended and handle accordingly
 * Should be used on protected routes
 */
export const useSuspensionCheck = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user exists and account is suspended
    if (user && user.accountStatus === "suspended") {
      // Logout user
      logout();
      // Redirect to signin with error message
      navigate("/signin?error=account_suspended");
    }
  }, [user, logout, navigate]);

  return user?.accountStatus !== "suspended";
};

/**
 * Hook to verify user profile and check suspension status
 * Useful for refreshing user state periodically
 */
export const useVerifyUserStatus = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const checkStatus = async () => {
    if (!user) return;

    try {
      const response = await authAPI.getProfile();
      if (response.data.user.accountStatus === "suspended") {
        logout();
        navigate("/signin?error=account_suspended");
      }
    } catch (error) {
      console.error("Failed to verify user status:", error);
    }
  };

  return checkStatus;
};

