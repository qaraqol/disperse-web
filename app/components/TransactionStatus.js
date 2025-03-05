"use client";

import React from "react";

const TransactionStatus = ({ status }) => {
  if (!status) return null;

  // Extract and safely convert properties
  const { success, error, warning } = status;

  // Safely handle transaction ID which might be an object
  let transactionId = "";
  let transactionUrl = "#";
  let shortTransactionId = "";

  if (status.transactionId) {
    if (typeof status.transactionId === "string") {
      transactionId = status.transactionId;

      // Only use the first part as tx ID if it starts with 'tx-' or 'complex-'
      if (
        transactionId.startsWith("tx-") ||
        transactionId.startsWith("complex-")
      ) {
        shortTransactionId = "View transaction";
      } else {
        // This is likely a real transaction ID
        transactionUrl = `https://wax.bloks.io/transaction/${transactionId}`;
        shortTransactionId =
          transactionId.length > 20
            ? `${transactionId.substring(0, 8)}...${transactionId.substring(
                transactionId.length - 8
              )}`
            : transactionId;
      }
    } else {
      // Handle case where transactionId is an object
      console.log("Complex transaction ID object:", status.transactionId);
      transactionId = "complex_transaction_id";
      shortTransactionId = "View transaction details";
      transactionUrl = `https://wax.bloks.io/`;
    }
  }

  return (
    <div className="my-4">
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-green-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                Transaction Successful
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <p>Your transaction has been successfully processed.</p>

                {transactionId && !transactionId.startsWith("manual-") && (
                  <p className="mt-1">
                    <span className="font-medium">Transaction ID:</span>{" "}
                    <a
                      href={transactionUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                    >
                      {shortTransactionId}
                    </a>
                  </p>
                )}

                {warning && typeof warning === "string" && (
                  <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800">
                    {warning}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Transaction Failed
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>There was an error processing your transaction:</p>
                <p className="mt-1 font-mono text-xs bg-red-100 p-2 rounded">
                  {typeof error === "string" ? error : "Unknown error occurred"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionStatus;
