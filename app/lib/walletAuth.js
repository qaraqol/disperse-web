"use client";

import { SessionKit } from "@wharfkit/session";
import { WebRenderer } from "@wharfkit/web-renderer";
import { WalletPluginAnchor } from "@wharfkit/wallet-plugin-anchor";
import { WalletPluginCloudWallet } from "@wharfkit/wallet-plugin-cloudwallet";

let sessionKit;

// Initialize the SessionKit
export function initSessionKit() {
  if (typeof window === "undefined") return null;

  if (!sessionKit) {
    const webRenderer = new WebRenderer();

    sessionKit = new SessionKit({
      appName: "Disperse Token Tool",
      chains: [
        {
          id: "1064487b3cd1a897ce03ae5b6a865651747e2e152090f99c1d19d44e01aea5a4", // WAX Mainnet chain ID
          url: "https://wax.greymass.com",
        },
      ],
      ui: webRenderer,
      walletPlugins: [new WalletPluginAnchor(), new WalletPluginCloudWallet()],
    });

    // Ensure dialog element is appended
    if (document.readyState === "complete") {
      webRenderer.appendDialogElement();
    }
  }

  return sessionKit;
}

// Login with a wallet
export async function loginWithWallet() {
  try {
    const kit = initSessionKit();
    if (!kit) throw new Error("SessionKit not initialized");

    const { session } = await kit.login();

    return {
      session,
      account: session.actor.toString(),
      chainId: session.chain.id,
      permission: session.permission.toString(),
    };
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
}

// Logout
export async function logout(session) {
  try {
    const kit = initSessionKit();
    if (!kit) throw new Error("SessionKit not initialized");

    await kit.logout(session);
  } catch (error) {
    console.error("Logout failed:", error);
    throw error;
  }
}

// Send a token transfer
export async function sendTokenTransfer(session, recipients, config) {
  try {
    if (!session) {
      throw new Error("No active session");
    }

    const batchSize = config.batchSize || 15;
    const totalBatches = Math.ceil(recipients.length / batchSize);
    let successCount = 0;
    let failedCount = 0;
    let lastTxId = null;

    // Process in batches
    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;

      try {
        // Create actions for this batch
        const actions = batch.map((recipient) => ({
          account: config.contractName,
          name: "transfer",
          authorization: [session.permissionLevel],
          data: {
            from: session.actor,
            to: recipient.receiverName,
            quantity: `${recipient.amount.toFixed(config.tokenPrecision)} ${
              config.tokenName
            }`,
            memo: recipient.memo || config.defaultMemo || "",
          },
        }));

        // Send the transaction
        const result = await session.transact({
          actions,
        });

        successCount += batch.length;

        // Extract the transaction ID from the result
        let txId;
        console.log("Transaction result:", result);

        if (result && result.resolved) {
          txId = result.response.transaction_id;
        } else {
          txId = `tx-${Date.now()}`; // Fallback
        }

        lastTxId = txId;

        // Add delay between batches
        if (i + batchSize < recipients.length) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      } catch (error) {
        failedCount += batch.length;
        console.error(`Batch ${batchNumber} failed:`, error);
      }
    }

    return {
      success: successCount,
      failed: failedCount,
      lastTxId: lastTxId ? lastTxId : "Unknown",
    };
  } catch (error) {
    console.error("Transaction failed:", error);
    throw error;
  }
}
