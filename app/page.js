"use client";

import { useState, useEffect } from "react";
import TransactionLogs from "./components/TransactionLogs";
import TransactionStatus from "./components/TransactionStatus";
import WalletLogin from "./components/WalletLogin";
import TokenSelector from "./components/TokenSelector";
import { sendTokenTransfer } from "./lib/walletAuth";

export default function Home() {
  const [activeTab, setActiveTab] = useState("transfer");

  // Initialize with default config
  const [config, setConfig] = useState({
    rpcApi: "https://wax.qaraqol.com", // Fixed RPC endpoint, no longer user-configurable
    contractName: "",
    tokenName: "",
    tokenPrecision: 4,
    defaultMemo: "Disperse", // Now a default memo
    batchSize: 15,
  });

  // Load config from localStorage after mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedConfig = localStorage.getItem("disperseConfig");
        if (savedConfig) {
          const loadedConfig = JSON.parse(savedConfig);
          // Always use the default RPC endpoint
          setConfig({
            ...loadedConfig,
            rpcApi: "https://wax.qaraqol.com",
          });
        }
      } catch (err) {
        console.error("Failed to load config from localStorage:", err);
      }
    }
  }, []);

  const [recipientsInput, setRecipientsInput] = useState("");
  const [validationError, setValidationError] = useState("");
  const [logs, setLogs] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState(null);
  const [walletData, setWalletData] = useState(null);
  const [selectedTokenBalance, setSelectedTokenBalance] = useState(null);

  const addLog = (message, type = "info") => {
    const timestamp = new Date().toISOString();
    setLogs((prev) => [...prev, { timestamp, message, type }]);
  };

  const handleConfigUpdate = (newConfig) => {
    // Ensure the RPC endpoint remains fixed
    const updatedConfig = {
      ...newConfig,
      rpcApi: "https://wax.qaraqol.com",
    };

    setConfig(updatedConfig);

    // Store the updated config in localStorage for persistence
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("disperseConfig", JSON.stringify(updatedConfig));
      }
    } catch (err) {
      console.error("Failed to save config to localStorage:", err);
    }
  };

  const handleTokenSelect = (tokenData) => {
    handleConfigUpdate({
      ...config,
      contractName: tokenData.contractName,
      tokenName: tokenData.tokenName,
      tokenPrecision: tokenData.tokenPrecision,
    });
    setSelectedTokenBalance(tokenData.balance);
  };

  const validateAndParseRecipients = () => {
    if (!recipientsInput.trim()) {
      setValidationError("Please add at least one recipient");
      return null;
    }

    try {
      // Split by lines
      const lines = recipientsInput
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line);

      const errors = [];
      const parsedRecipients = [];
      let totalAmount = 0;

      lines.forEach((line, lineIndex) => {
        let parts = [];
        let receiverName, amount, memo;

        // Try to parse based on commas
        if (line.includes(",")) {
          parts = line.split(",").map((part) => part.trim());

          if (parts.length >= 1) receiverName = parts[0];
          if (parts.length >= 2) amount = parts[1];
          if (parts.length >= 3) memo = parts[2];
        }
        // Try space-separated format as fallback
        else {
          parts = line.split(/\s+/);
          if (parts.length >= 1) receiverName = parts[0];
          if (parts.length >= 2) amount = parts[1];
          // No memo support for space-separated format
        }

        // Use default memo if not specified
        memo = memo || config.defaultMemo;

        // Validate receiver name
        if (!receiverName) {
          errors.push(`Line ${lineIndex + 1}: Missing receiver name`);
        } else if (!/^[a-z1-5.]{1,12}$/.test(receiverName)) {
          errors.push(
            `Line ${lineIndex + 1}: Invalid WAX account name "${receiverName}"`
          );
        }

        // Validate amount
        if (!amount) {
          errors.push(`Line ${lineIndex + 1}: Missing amount`);
        } else if (isNaN(amount) || Number(amount) <= 0) {
          errors.push(`Line ${lineIndex + 1}: Invalid amount "${amount}"`);
        }

        if (receiverName && amount && !isNaN(amount) && Number(amount) > 0) {
          const parsedAmount = Number(amount);
          totalAmount += parsedAmount;

          parsedRecipients.push({
            receiverName,
            amount: parsedAmount,
            memo: memo,
          });
        }
      });

      // Check if total amount exceeds available balance
      if (
        selectedTokenBalance &&
        totalAmount > parseFloat(selectedTokenBalance)
      ) {
        errors.push(
          `Total amount (${totalAmount}) exceeds your available balance (${selectedTokenBalance})`
        );
      }

      if (errors.length > 0) {
        setValidationError(
          errors.slice(0, 3).join("\n") +
            (errors.length > 3
              ? `\n...and ${errors.length - 3} more errors`
              : "")
        );
        return null;
      }

      if (parsedRecipients.length === 0) {
        setValidationError("No valid recipients found");
        return null;
      }

      setValidationError("");
      return parsedRecipients;
    } catch (err) {
      console.error("Error parsing recipients:", err);
      setValidationError("Invalid input format");
      return null;
    }
  };

  const handleStartProcess = async () => {
    // Reset status
    setTransactionStatus(null);

    // Check wallet connection
    if (!walletData || !walletData.session) {
      setTransactionStatus({ error: "Please connect your wallet first" });
      return;
    }

    // Check if token is selected
    if (!config.contractName || !config.tokenName) {
      setTransactionStatus({ error: "Please select a token first" });
      return;
    }

    // Validate and parse recipients
    const parsedRecipients = validateAndParseRecipients();
    if (!parsedRecipients) {
      return;
    }

    // Count recipients
    const recipientCount = parsedRecipients.length;

    // Start processing
    setIsProcessing(true);
    addLog(
      `Starting to process ${recipientCount} transfers of ${config.tokenName} in batches of ${config.batchSize}`
    );

    try {
      // Process transactions with the wallet session
      const result = await sendTokenTransfer(
        walletData.session,
        parsedRecipients,
        config
      );

      // Set success/error status based on result
      if (result.success > 0) {
        // Handle transaction ID
        const txId = result.lastTxId;

        if (result.failed === 0) {
          // All successful
          setTransactionStatus({
            success: true,
            transactionId: txId,
          });
          addLog(`Transaction successful! ID: ${txId}`, "success");
        } else {
          // Partially successful
          setTransactionStatus({
            success: true,
            warning: `${result.failed} of ${
              result.success + result.failed
            } transfers failed`,
            transactionId: txId,
          });
          addLog(`Transaction partially successful. ID: ${txId}`, "warning");
        }
      } else {
        // All failed
        setTransactionStatus({
          error: "All transactions failed",
        });
      }

      addLog(
        `Completed processing. ${result.success} successful, ${result.failed} failed.`,
        result.failed > 0 ? "warning" : "success"
      );
    } catch (error) {
      setTransactionStatus({ error: error.message });
      addLog(`Error processing transfers: ${error.message}`, "error");
      console.error("Full error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const handleWalletLogin = (data) => {
    setWalletData(data);
    setConfig((prev) => ({
      ...prev,
      senderName: data.account,
    }));
    addLog(`Connected to wallet as ${data.account}`, "success");
  };

  const handleWalletLogout = () => {
    setWalletData(null);
    setConfig((prev) => ({
      ...prev,
      senderName: "",
    }));
    setSelectedTokenBalance(null);
    addLog("Disconnected from wallet", "info");
  };

  const tabs = [
    { id: "transfer", label: "Transfer Tokens" },
    { id: "logs", label: "Transaction Logs" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900 text-center">
            Disperse Token Tool
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex space-x-1 rounded-lg bg-gray-100 p-1 w-fit">
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

        <div className="bg-white shadow rounded-lg p-6">
          {transactionStatus && (
            <TransactionStatus status={transactionStatus} />
          )}

          {activeTab === "transfer" && (
            <div>
              {!walletData ? (
                // Centered wallet login when not connected
                <div className="flex justify-center items-center py-12">
                  <div className="text-center">
                    <h2 className="text-xl font-semibold mb-6 text-gray-700">
                      Connect Your Wallet to Begin
                    </h2>
                    <WalletLogin
                      onLogin={handleWalletLogin}
                      onLogout={handleWalletLogout}
                      walletData={walletData}
                    />
                  </div>
                </div>
              ) : (
                // Main content when wallet is connected
                <div className="space-y-6">
                  {/* Wallet info at top */}
                  <div className="flex justify-end">
                    <WalletLogin
                      onLogin={handleWalletLogin}
                      onLogout={handleWalletLogout}
                      walletData={walletData}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Token Selection */}
                    <div>
                      <TokenSelector
                        walletAccount={walletData?.account}
                        onTokenSelect={handleTokenSelect}
                        isProcessing={isProcessing}
                      />
                    </div>

                    {/* Simple Settings */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold">
                          Transfer Settings
                        </h2>
                        {config.contractName && config.tokenName && (
                          <div className="px-3 py-1 bg-green-50 border border-green-100 rounded-md text-sm text-green-800">
                            <span className="font-medium">
                              {config.tokenName}
                            </span>{" "}
                            selected
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label
                            htmlFor="defaultMemo"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Default Memo
                          </label>
                          <input
                            type="text"
                            name="defaultMemo"
                            id="defaultMemo"
                            value={config.defaultMemo}
                            onChange={(e) =>
                              handleConfigUpdate({
                                ...config,
                                defaultMemo: e.target.value,
                              })
                            }
                            disabled={isProcessing}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                            placeholder="Disperse"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="batchSize"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Batch Size
                          </label>
                          <input
                            type="number"
                            name="batchSize"
                            id="batchSize"
                            value={config.batchSize}
                            onChange={(e) =>
                              handleConfigUpdate({
                                ...config,
                                batchSize:
                                  e.target.value === ""
                                    ? ""
                                    : Number(e.target.value),
                              })
                            }
                            disabled={isProcessing}
                            min="1"
                            max="50"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                            required
                          />
                        </div>
                      </div>

                      {config.contractName && config.tokenName && (
                        <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-md">
                          <h3 className="text-sm font-medium text-blue-800 mb-2">
                            Token Details
                          </h3>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Symbol:</span>
                              <span className="font-medium">
                                {config.tokenName}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Contract:</span>
                              <span className="font-medium text-xs">
                                {config.contractName}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Precision:</span>
                              <span className="font-medium">
                                {config.tokenPrecision}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Balance:</span>
                              <span className="font-medium">
                                {selectedTokenBalance}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Recipients Input with Special Styling */}
                  <div className="pt-4 border-t border-gray-200">
                    <div className="mb-4">
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-lg border border-blue-200">
                        <div className="flex justify-between items-center mb-2">
                          <label
                            htmlFor="recipientsInput"
                            className="block text-sm font-medium text-blue-700"
                          >
                            <span className="border-b-2 border-blue-400 pb-0.5">
                              Enter Recipients (one per line)
                            </span>
                          </label>
                          {recipientsInput && (
                            <button
                              onClick={() => setRecipientsInput("")}
                              className="text-xs text-red-600 hover:text-red-800"
                              disabled={isProcessing}
                            >
                              Clear
                            </button>
                          )}
                        </div>
                        <textarea
                          id="recipientsInput"
                          rows={8}
                          className="block w-full rounded-md border-blue-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 font-mono text-sm bg-white"
                          value={recipientsInput}
                          onChange={(e) => setRecipientsInput(e.target.value)}
                          placeholder="account1,1.0000,Payment for services&#10;account2,2.5000,Refund&#10;account3,3.0000"
                          disabled={isProcessing}
                        ></textarea>
                        <p className="mt-2 text-xs text-blue-700">
                          Format: "account,amount,memo" (memo is optional, one
                          entry per line)
                        </p>

                        {validationError && (
                          <div className="mt-2 p-2 bg-red-50 border border-red-100 rounded-md">
                            <p className="text-xs text-red-600 whitespace-pre-line">
                              {validationError}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Transfer Button */}
                  <div className="pt-4 border-t border-gray-200 flex justify-end">
                    <button
                      onClick={handleStartProcess}
                      disabled={
                        !config.senderName ||
                        !config.contractName ||
                        !config.tokenName ||
                        !recipientsInput.trim() ||
                        isProcessing
                      }
                      className={`px-6 py-3 rounded-md text-base font-medium ${
                        !config.senderName ||
                        !config.contractName ||
                        !config.tokenName ||
                        !recipientsInput.trim() ||
                        isProcessing
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-blue-600 text-white hover:bg-blue-700"
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
                        "Transfer Tokens"
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "logs" && (
            <TransactionLogs logs={logs} onClear={clearLogs} />
          )}
        </div>
      </main>

      <footer className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
        <p>
          Disperse Token Tool • Built by{" "}
          <a
            href="https://qaraqol.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Qaraqol
          </a>{" "}
          with Next.js
        </p>
      </footer>
    </div>
  );
}
