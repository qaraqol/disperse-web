"use client";

import { useState } from "react";

const RecipientsInput = ({
  value,
  onChange,
  onValidation,
  isProcessing,
  selectedTokenBalance,
}) => {
  const [validationError, setValidationError] = useState("");

  const validateAndParseRecipients = () => {
    if (!value.trim()) {
      setValidationError("Please add at least one recipient");
      onValidation(null);
      return;
    }

    try {
      // Split by lines
      const lines = value
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
            memo,
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
        const errorMsg =
          errors.slice(0, 3).join("\n") +
          (errors.length > 3
            ? `\n...and ${errors.length - 3} more errors`
            : "");
        setValidationError(errorMsg);
        onValidation(null);
        return;
      }

      if (parsedRecipients.length === 0) {
        setValidationError("No valid recipients found");
        onValidation(null);
        return;
      }

      setValidationError("");
      onValidation(parsedRecipients);
    } catch (err) {
      console.error("Error parsing recipients:", err);
      setValidationError("Invalid input format");
      onValidation(null);
    }
  };

  const handleInputChange = (e) => {
    onChange(e.target.value);
  };

  const handleClear = () => {
    onChange("");
  };

  return (
    <div className="pt-4 border-t border-gray-200">
      <div className="mb-4">
        <div className="mb-1">
          <div className="flex justify-between items-center">
            <label
              htmlFor="recipientsInput"
              className="block text-sm font-medium text-gray-700"
            >
              <span>Enter Recipients (one per line)</span>
            </label>
            {value && (
              <button
                onClick={handleClear}
                className="text-xs text-red-600 hover:text-red-800"
                disabled={isProcessing}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <textarea
          id="recipientsInput"
          rows={8}
          className="block w-full rounded-md border-2 border-blue-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 font-mono text-sm bg-white"
          value={value}
          onChange={handleInputChange}
          onBlur={validateAndParseRecipients}
          placeholder="account1,1.0000,Payment for services"
          disabled={isProcessing}
        ></textarea>

        <p className="mt-2 text-xs text-gray-600">
          Format: "account,amount,memo" (memo is optional, one entry per line)
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
  );
};

export default RecipientsInput;
