"use client";

import { useState, useEffect } from "react";
import TransactionLogs from "./components/TransactionLogs";
import TransactionStatus from "./components/TransactionStatus";
import WalletLogin from "./components/WalletLogin";
import TokenSelector from "./components/TokenSelector";
import TransferSettings from "./components/TransferSettings";
import RecipientsInput from "./components/RecipientsInput";
import { sendTokenTransfer } from "./lib/walletAuth";

export default function Home() {
  const [activeTab, setActiveTab] = useState("transfer");

  // Initialize with default config
  const [config, setConfig] = useState({
    rpcApi: "https://wax.qaraqol.com",
    contractName: "",
    tokenName: "",
    tokenPrecision: 4,
    defaultMemo: "Disperse",
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
  const [parsedRecipients, setParsedRecipients] = useState(null);
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

    // Check if recipients are valid
    if (!parsedRecipients) {
      setTransactionStatus({
        error: "Please check your recipient list format",
      });
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
    setParsedRecipients(null);
    addLog("Disconnected from wallet", "info");
  };

  const handleRecipientsValidation = (validatedRecipients) => {
    setParsedRecipients(validatedRecipients);
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
                // Centered wallet login when not connected - fixed alignment
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-8 text-center shadow-sm w-full max-w-md">
                    <h2 className="text-xl font-semibold mb-6 text-gray-700">
                      Connect Your Wallet to Begin
                    </h2>
                    <div className="flex justify-center">
                      <WalletLogin
                        onLogin={handleWalletLogin}
                        onLogout={handleWalletLogout}
                        walletData={walletData}
                      />
                    </div>
                    <p className="mt-6 text-sm text-gray-600">
                      Connect with Anchor or WAX Cloud Wallet to access your
                      tokens
                    </p>
                  </div>
                </div>
              ) : (
                // Main content when wallet is connected
                <div className="space-y-6">
                  <div className="flex justify-end">
                    <WalletLogin
                      onLogin={handleWalletLogin}
                      onLogout={handleWalletLogout}
                      walletData={walletData}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:min-h-[400px]">
                    <div className="h-full">
                      <TokenSelector
                        walletAccount={walletData?.account}
                        onTokenSelect={handleTokenSelect}
                        isProcessing={isProcessing}
                      />
                    </div>

                    <div className="h-full">
                      <TransferSettings
                        config={config}
                        onUpdate={handleConfigUpdate}
                        selectedTokenBalance={selectedTokenBalance}
                        isProcessing={isProcessing}
                      />
                    </div>
                  </div>

                  <RecipientsInput
                    value={recipientsInput}
                    onChange={setRecipientsInput}
                    onValidation={handleRecipientsValidation}
                    selectedTokenBalance={selectedTokenBalance}
                    isProcessing={isProcessing}
                  />

                  <div className="pt-4 border-t border-gray-200 flex justify-end">
                    <button
                      onClick={handleStartProcess}
                      disabled={
                        !config.senderName ||
                        !config.contractName ||
                        !config.tokenName ||
                        !parsedRecipients ||
                        isProcessing
                      }
                      className={`px-6 py-3 rounded-md text-base font-medium ${
                        !config.senderName ||
                        !config.contractName ||
                        !config.tokenName ||
                        !parsedRecipients ||
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
