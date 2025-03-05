"use client";

import { useState } from "react";

const ManualInput = ({ onSubmit, disabled, initialRecipients = [] }) => {
  const [recipients, setRecipients] = useState(
    initialRecipients.length > 0
      ? initialRecipients.map((r) => ({
          receiverName: r.receiverName,
          amount: r.amount,
        }))
      : [{ receiverName: "", amount: "" }]
  );
  const [errors, setErrors] = useState([]);

  const handleChange = (index, field, value) => {
    const updatedRecipients = [...recipients];

    if (field === "amount") {
      // Only allow numeric input for amount
      if (value === "" || !isNaN(value)) {
        updatedRecipients[index][field] = value;
      }
    } else {
      updatedRecipients[index][field] = value;
    }

    setRecipients(updatedRecipients);
    validateRecipients(updatedRecipients);
  };

  const validateRecipients = (list) => {
    const newErrors = [];

    list.forEach((recipient, index) => {
      if (!recipient.receiverName && !recipient.amount) {
        // Skip validation for completely empty rows
        return;
      }

      if (!recipient.receiverName) {
        newErrors[index] = {
          ...newErrors[index],
          receiverName: "Receiver name is required",
        };
      } else if (!/^[a-z1-5.]{1,12}$/.test(recipient.receiverName)) {
        newErrors[index] = {
          ...newErrors[index],
          receiverName:
            "Invalid WAX account name (must be 1-12 chars, only a-z, 1-5, and .)",
        };
      }

      if (!recipient.amount) {
        newErrors[index] = {
          ...newErrors[index],
          amount: "Amount is required",
        };
      } else if (isNaN(recipient.amount) || Number(recipient.amount) <= 0) {
        newErrors[index] = {
          ...newErrors[index],
          amount: "Amount must be greater than 0",
        };
      }
    });

    setErrors(newErrors);
    return newErrors.filter(Boolean).length === 0;
  };

  const addRecipient = () => {
    setRecipients([...recipients, { receiverName: "", amount: "" }]);
  };

  const removeRecipient = (index) => {
    const updatedRecipients = recipients.filter((_, i) => i !== index);
    setRecipients(updatedRecipients);

    // Update errors array
    const updatedErrors = errors.filter((_, i) => i !== index);
    setErrors(updatedErrors);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Filter out empty rows
    const filledRecipients = recipients.filter(
      (r) => r.receiverName && r.amount
    );

    if (filledRecipients.length === 0) {
      alert("Please add at least one recipient");
      return;
    }

    // Convert string amounts to numbers
    const formattedRecipients = filledRecipients.map((r) => ({
      receiverName: r.receiverName,
      amount: Number(r.amount),
    }));

    if (validateRecipients(formattedRecipients)) {
      onSubmit(formattedRecipients);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Manual Input</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Receiver Name <span className="text-red-500">*</span>
                </th>
                <th
                  scope="col"
                  className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Amount <span className="text-red-500">*</span>
                </th>
                <th scope="col" className="relative px-3 py-3 w-10">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recipients.map((recipient, index) => (
                <tr key={index}>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={recipient.receiverName}
                      onChange={(e) =>
                        handleChange(index, "receiverName", e.target.value)
                      }
                      disabled={disabled}
                      className={`block w-full rounded-md shadow-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                        errors[index]?.receiverName ? "border-red-300" : ""
                      }`}
                      placeholder="account.wam"
                    />
                    {errors[index]?.receiverName && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors[index].receiverName}
                      </p>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={recipient.amount}
                      onChange={(e) =>
                        handleChange(index, "amount", e.target.value)
                      }
                      disabled={disabled}
                      className={`block w-full rounded-md shadow-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                        errors[index]?.amount ? "border-red-300" : ""
                      }`}
                      placeholder="1.0000"
                    />
                    {errors[index]?.amount && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors[index].amount}
                      </p>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right text-sm font-medium">
                    <button
                      type="button"
                      onClick={() => removeRecipient(index)}
                      disabled={disabled || recipients.length === 1}
                      className="text-red-600 hover:text-red-900 disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                      <svg
                        className="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between">
          <button
            type="button"
            onClick={addRecipient}
            disabled={disabled}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
          >
            <svg
              className="-ml-0.5 mr-2 h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Add Recipient
          </button>

          <button
            type="submit"
            disabled={disabled}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Save Recipients
          </button>
        </div>
      </form>
    </div>
  );
};

export default ManualInput;
