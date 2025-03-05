import { NextResponse } from "next/server";
import { Api, JsonRpc } from "eosjs";
import { JsSignatureProvider } from "eosjs/dist/eosjs-jssig";

// This endpoint processes token transfers in batches
export async function POST(request) {
  try {
    const { config, recipients } = await request.json();

    if (!config || !recipients || recipients.length === 0) {
      return NextResponse.json(
        { error: "Invalid request - missing configuration or recipients" },
        { status: 400 }
      );
    }

    // Validate required configuration
    if (
      !config.privateKey ||
      !config.senderName ||
      !config.rpcApi ||
      !config.contractName ||
      !config.tokenName ||
      config.tokenPrecision === undefined
    ) {
      return NextResponse.json(
        { error: "Missing required configuration parameters" },
        { status: 400 }
      );
    }

    const results = {
      success: 0,
      failed: 0,
      batches: [],
    };

    // Setup EOSJS
    const rpc = new JsonRpc(config.rpcApi, { fetch });
    const signatureProvider = new JsSignatureProvider([config.privateKey]);
    const api = new Api({
      rpc,
      signatureProvider,
      textDecoder: new TextDecoder(),
      textEncoder: new TextEncoder(),
    });

    // Process in batches
    const batchSize = config.batchSize || 15;
    const totalBatches = Math.ceil(recipients.length / batchSize);

    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;

      try {
        // Create batch transaction
        const actions = batch.map((recipient) => ({
          account: config.contractName,
          name: "transfer",
          authorization: [
            {
              actor: config.senderName,
              permission: "active",
            },
          ],
          data: {
            from: config.senderName,
            to: recipient.receiverName,
            quantity: `${recipient.amount.toFixed(config.tokenPrecision)} ${
              config.tokenName
            }`,
            memo: config.memo || "",
          },
        }));

        const transaction = { actions };
        actions.map((action) => {
          console.log(action.data);
        });
        // Send the transaction
        const result = await api.transact(transaction, {
          blocksBehind: 3,
          expireSeconds: 30,
        });

        // Record successful batch
        results.success += batch.length;
        results.batches.push({
          batchNumber,
          status: "success",
          transactionId: result.transaction_id,
          recipients: batch.map((r) => ({
            receiverName: r.receiverName,
            amount: r.amount,
          })),
        });
      } catch (error) {
        // Record failed batch with detailed error
        console.error("Transaction Error:", error);

        // Extract detailed error information
        let detailedError = "Unknown error";
        if (error.json && error.json.error) {
          detailedError = JSON.stringify(error.json.error);
        } else if (error.details) {
          detailedError = JSON.stringify(error.details);
        } else if (error.message) {
          detailedError = error.message;
        }

        results.failed += batch.length;
        results.batches.push({
          batchNumber,
          status: "failed",
          error: detailedError,
          errorObject: JSON.stringify(error, Object.getOwnPropertyNames(error)),
          recipients: batch.map((r) => ({
            receiverName: r.receiverName,
            amount: r.amount,
          })),
        });
      }

      // Add delay between batches (only if not the last batch)
      if (i + batchSize < recipients.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
