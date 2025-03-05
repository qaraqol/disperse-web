"use client";

import { useState } from "react";
import Dashboard from "./components/Dashboard";
import ConfigForm from "./components/ConfigForm";
import CSVUpload from "./components/CSVUpload";
import ManualInput from "./components/ManualInput";
import TransactionLogs from "./components/TransactionLogs";
import TransactionStatus from "./components/TransactionStatus";
import WalletLogin from "./components/WalletLogin";
import { sendTokenTransfer } from "./lib/walletAuth";

export default function Home() {
  const [activeTab, setActiveTab] = useState("upload");
  const [config, setConfig] = useState(() => {
    // Try to load config from localStorage on initial load
    if (typeof window !== "undefined") {
      try {
        const savedConfig = localStorage.getItem("disperseConfig");
        if (savedConfig) {
          return JSON.parse(savedConfig);
        }
      } catch (err) {
        console.error("Failed to load config from localStorage:", err);
      }
    }

    // Default config if nothing in localStorage
    return {
      rpcApi: "https://wax.greymass.com",
      contractName: "alien.worlds", // eosio.token for WAX tokens
      tokenName: "TLM",
      tokenPrecision: 4, // Common include 8 for WAX and 4 for TLM
      memo: "Disperse",
      batchSize: 15,
    };
  });
  const [recipients, setRecipients] = useState([]);
  const [logs, setLogs] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState(null);
  const [walletData, setWalletData] = useState(null);

  const addLog = (message, type = "info") => {
    const timestamp = new Date().toISOString();
    setLogs((prev) => [...prev, { timestamp, message, type }]);
  };

  const handleConfigUpdate = (newConfig) => {
    setConfig(newConfig);
  };

  const handleCSVUpload = (data) => {
    setRecipients(data);
    addLog(`Loaded ${data.length} recipients from CSV file`, "success");
  };

  const handleManualInput = (data) => {
    setRecipients(data);
    addLog(`Added ${data.length} recipients manually`, "success");
  };

  const handleStartProcess = async () => {
    if (recipients.length === 0) {
      setTransactionStatus({ error: "No recipients to process" });
      return;
    }

    if (!walletData || !walletData.session) {
      setTransactionStatus({ error: "Please connect your wallet first" });
      return;
    }

    setIsProcessing(true);
    setTransactionStatus(null);
    addLog(
      `Starting to process ${recipients.length} transfers in batches of ${config.batchSize}`
    );

    try {
      // Process transactions with the wallet session
      const result = await sendTokenTransfer(
        walletData.session,
        recipients,
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
    // Update the config with the authenticated account
    setConfig((prev) => ({
      ...prev,
      senderName: data.account,
    }));
    addLog(`Connected to wallet as ${data.account}`, "success");
  };

  const handleWalletLogout = () => {
    setWalletData(null);
    // Clear the sender name
    setConfig((prev) => ({
      ...prev,
      senderName: "",
    }));
    addLog("Disconnected from wallet", "info");
  };

  return (
    <Dashboard
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      config={config}
      recipients={recipients}
      isProcessing={isProcessing}
      onConfigUpdate={handleConfigUpdate}
      onCSVUpload={handleCSVUpload}
      onManualInput={handleManualInput}
      onStartProcess={handleStartProcess}
      onClearLogs={clearLogs}
    >
      <WalletLogin
        onLogin={handleWalletLogin}
        onLogout={handleWalletLogout}
        walletData={walletData}
      />

      {transactionStatus && <TransactionStatus status={transactionStatus} />}

      {activeTab === "upload" && (
        <CSVUpload onUpload={handleCSVUpload} disabled={isProcessing} />
      )}
      {activeTab === "manual" && (
        <ManualInput
          onSubmit={handleManualInput}
          disabled={isProcessing}
          initialRecipients={recipients}
        />
      )}
      {activeTab === "config" && (
        <ConfigForm
          config={config}
          onUpdate={handleConfigUpdate}
          disabled={isProcessing}
        />
      )}
      {activeTab === "logs" && (
        <TransactionLogs logs={logs} onClear={clearLogs} />
      )}
    </Dashboard>
  );
}
