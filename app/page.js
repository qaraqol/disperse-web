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
    rpcApi: "https://wax.qaraqol.com",
    contractName: "", // Will be populated from token selector
    tokenName: "", // Will be populated from token selector
    tokenPrecision: 4,
    memo: "Disperse",
    batchSize: 15,
  });

  // Load config from localStorage after mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedConfig = localStorage.getItem("disperseConfig");
        if (savedConfig) {
          setConfig(JSON.parse(savedConfig));
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
    setConfig(newConfig);

    // Store the updated config in localStorage for persistence
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("disperseConfig", JSON.stringify(newConfig));
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
        let receiverName, amount;

        // Check for CSV format: receiverName,amount
        if (line.includes(",")) {
          [receiverName, amount] = line
            .split(",", 2)
            .map((part) => part.trim());
        }
        // Check for space-separated format: receiverName amount
        else {
          const parts = line.split(/\s+/);
          if (parts.length >= 2) {
            receiverName = parts[0].trim();
            amount = parts[1].trim();
          }
        }

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
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Disperse Token Tool
          </h1>
          <div className="flex items-center">
            <WalletLogin
              onLogin={handleWalletLogin}
              onLogout={handleWalletLogout}
              walletData={walletData}
            />
          </div>
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
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Token Selection */}
                <div>
                  <TokenSelector
                    walletAccount={walletData?.account}
                    onTokenSelect={handleTokenSelect}
                    isProcessing={isProcessing}
                  />
                </div>

                {/* Advanced Settings */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold mb-4">
                    Advanced Settings
                  </h2>
                  <div>
                    <label
                      htmlFor="memo"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Memo
                    </label>
                    <input
                      type="text"
                      name="memo"
                      id="memo"
                      value={config.memo}
                      onChange={(e) =>
                        handleConfigUpdate({
                          ...config,
                          memo: e.target.value,
                        })
                      }
                      disabled={isProcessing}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                      placeholder="Disperse"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="rpcApi"
                      className="block text-sm font-medium text-gray-700"
                    >
                      RPC API Endpoint <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="rpcApi"
                      id="rpcApi"
                      value={config.rpcApi}
                      onChange={(e) =>
                        handleConfigUpdate({
                          ...config,
                          rpcApi: e.target.value,
                        })
                      }
                      disabled={isProcessing}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                      placeholder="https://wax.qaraqol.com"
                      required
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      WAX blockchain RPC endpoint
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="batchSize"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Batch Size <span className="text-red-500">*</span>
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
                            e.target.value === "" ? "" : Number(e.target.value),
                        })
                      }
                      disabled={isProcessing}
                      min="1"
                      max="50"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                      required
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Number of transfers per transaction (Recommended: 10-15)
                    </p>
                  </div>

                  {config.contractName && config.tokenName && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-100 rounded-md">
                      <h3 className="text-sm font-medium text-green-800">
                        Selected Token
                      </h3>
                      <div className="mt-1 grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-gray-600">Token:</p>
                          <p className="font-medium">{config.tokenName}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Contract:</p>
                          <p className="font-medium">{config.contractName}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Precision:</p>
                          <p className="font-medium">{config.tokenPrecision}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Balance:</p>
                          <p className="font-medium">{selectedTokenBalance}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Recipients Input */}
              <div className="pt-4 border-t border-gray-200">
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <label
                      htmlFor="recipientsInput"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Enter Recipients (one per line)
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
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 font-mono text-sm"
                    value={recipientsInput}
                    onChange={(e) => setRecipientsInput(e.target.value)}
                    placeholder="account1,1.0000&#10;account2,2.5000&#10;account3,3.0000"
                    disabled={isProcessing}
                  ></textarea>
                  <p className="mt-1 text-xs text-gray-500">
                    Format: "account,amount" or "account amount" (one entry per
                    line)
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
