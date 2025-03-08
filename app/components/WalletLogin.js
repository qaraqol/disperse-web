"use client";

import { useState, useEffect } from "react";
import { loginWithWallet, logout } from "../lib/walletAuth";

const WalletLogin = ({ onLogin, onLogout, walletData }) => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState("");

  const handleWalletLogin = async () => {
    setIsLoggingIn(true);
    setError("");

    try {
      const data = await loginWithWallet();
      onLogin(data);
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Failed to connect wallet. Please try again.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Reset the loading state if the wallet plugin is closed without connecting
  useEffect(() => {
    if (isLoggingIn) {
      const timer = setTimeout(() => {
        // If still in logging in state after 30 seconds, assume the user closed the popup
        setIsLoggingIn(false);
      }, 30000);

      return () => clearTimeout(timer);
    }
  }, [isLoggingIn]);

  const handleLogout = async () => {
    try {
      if (walletData && walletData.session) {
        await logout(walletData.session);
      }
      onLogout();
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  if (!walletData) {
    return (
      <div className="relative">
        <button
          onClick={handleWalletLogin}
          disabled={isLoggingIn}
          className="flex items-center justify-center px-6 py-3 border border-blue-300 rounded-md shadow-sm bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          {isLoggingIn ? (
            <span className="flex items-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-5 w-5 text-blue-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Connecting Wallet...
            </span>
          ) : (
            <span className="flex items-center text-blue-600 font-medium">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              Connect Wallet
            </span>
          )}
        </button>

        {error && (
          <div className="absolute right-0 left-0 mt-2 p-2 bg-red-50 border border-red-100 rounded-md text-sm text-red-600 z-10">
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center">
      <div className="px-3 py-2 bg-blue-50 border border-blue-100 rounded-md h-full">
        <div className="flex items-center">
          <div className="mr-2 h-2 w-2 rounded-full bg-green-500"></div>
          <div>
            <div className="font-medium text-sm">{walletData.account}</div>
            <div className="text-xs text-gray-500">
              {walletData.permission} Permission
            </div>
          </div>
        </div>
      </div>
      <button
        onClick={handleLogout}
        className="ml-2 px-3 py-2 h-full text-sm border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50"
      >
        Disconnect
      </button>
    </div>
  );
};

export default WalletLogin;
