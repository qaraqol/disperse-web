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

  return (
    <div className="mb-6">
      {!walletData ? (
        <div className="flex flex-col items-center justify-center p-6 border border-gray-200 rounded-lg bg-white shadow-sm">
          <h2 className="text-lg font-medium mb-4">Connect Your Wallet</h2>

          <div className="flex gap-3 w-full">
            <button
              onClick={handleWalletLogin}
              disabled={isLoggingIn}
              className="flex-1 flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isLoggingIn ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700"
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
                  Connecting...
                </span>
              ) : (
                <span className="flex items-center">Connect Wallet</span>
              )}
            </button>
          </div>

          {error && <div className="mt-3 text-sm text-red-600">{error}</div>}

          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
            <p>
              <strong>Supported Wallets:</strong>
            </p>
            <ul className="mt-1 list-disc pl-5">
              <li>Anchor Wallet</li>
              <li>WAX Cloud Wallet</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
          <div className="flex items-center">
            {/* <img
              src="https://wax.io/favicon.ico"
              alt="WAX"
              className="w-6 h-6 mr-3"
            /> */}
            <div>
              <div className="font-medium">{walletData.account}</div>
              <div className="text-xs text-gray-500">
                {walletData.permission} Permission
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
};

export default WalletLogin;
