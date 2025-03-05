"use client";

import React from "react";

const Dashboard = ({
  children,
  activeTab,
  setActiveTab,
  config,
  recipients,
  isProcessing,
  onStartProcess,
}) => {
  // Check if there are any WalletLogin components in children
  // This will help us debug if WalletLogin is being rendered twice
  const childrenArray = React.Children.toArray(children);

  const tabs = [
    { id: "upload", label: "Upload CSV" },
    { id: "manual", label: "Manual Input" },
    { id: "config", label: "Configuration" },
  ];

  const isConfigValid = config.senderName; // Now we check for senderName from wallet
  const hasRecipients = recipients.length > 0;
  const canProcess = isConfigValid && hasRecipients && !isProcessing;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Disperse Token Tool
          </h1>
          <p className="mt-1 text-gray-500">
            Distribute tokens to multiple accounts via WAX blockchain
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex justify-between items-center">
          <div className="flex space-x-1 rounded-lg bg-gray-100 p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  activeTab === tab.id
                    ? "bg-white shadow text-blue-600"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-3">
            <div className="text-sm">
              <span className="font-medium">Recipients:</span>{" "}
              <span
                className={hasRecipients ? "text-green-600" : "text-gray-500"}
              >
                {recipients.length} loaded
              </span>
            </div>
            <button
              onClick={onStartProcess}
              disabled={!canProcess}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                canProcess
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {isProcessing ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline"
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
                  Processing...
                </>
              ) : (
                "Start Processing"
              )}
            </button>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">{children}</div>
      </main>

      <footer className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
        <p>Disperse Token Tool • Built with Next.js</p>
      </footer>
    </div>
  );
};

export default Dashboard;
