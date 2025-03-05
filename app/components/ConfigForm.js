"use client";

import { useState } from "react";

const ConfigForm = ({ config, onUpdate, disabled }) => {
  const [formData, setFormData] = useState(config);

  const handleChange = (e) => {
    const { name, value, type } = e.target;

    // Handle numeric inputs
    if (type === "number") {
      setFormData({
        ...formData,
        [name]: value === "" ? "" : Number(value),
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Store the updated config in localStorage for persistence
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("disperseConfig", JSON.stringify(formData));
      }
    } catch (err) {
      console.error("Failed to save config to localStorage:", err);
    }

    onUpdate(formData);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Configuration Settings</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
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
                value={formData.rpcApi}
                onChange={handleChange}
                disabled={disabled}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                placeholder="https://wax.greymass.com"
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                WAX blockchain RPC endpoint
              </p>
            </div>

            <div>
              <label
                htmlFor="rpcApi"
                className="block text-sm font-medium text-gray-700"
              >
                Note
              </label>
              <p className="mt-1 text-sm text-gray-500">
                Connect your wallet at the top of the page to use your WAX
                account. No private keys needed!
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="contractName"
                className="block text-sm font-medium text-gray-700"
              >
                Token Contract <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="contractName"
                id="contractName"
                value={formData.contractName}
                onChange={handleChange}
                disabled={disabled}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                placeholder="eosio.token"
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                Contract name (e.g., eosio.token for WAX, alien.worlds for TLM)
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="tokenName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Token Symbol <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="tokenName"
                  id="tokenName"
                  value={formData.tokenName}
                  onChange={handleChange}
                  disabled={disabled}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                  placeholder="WAX"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="tokenPrecision"
                  className="block text-sm font-medium text-gray-700"
                >
                  Token Precision <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="tokenPrecision"
                  id="tokenPrecision"
                  value={formData.tokenPrecision}
                  onChange={handleChange}
                  disabled={disabled}
                  min="0"
                  max="18"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                  required
                />
                <p className="mt-1 text-sm text-gray-500">WAX: 8, TLM: 4</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
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
                  value={formData.memo}
                  onChange={handleChange}
                  disabled={disabled}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                  placeholder="Disperse"
                />
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
                  value={formData.batchSize}
                  onChange={handleChange}
                  disabled={disabled}
                  min="1"
                  max="50"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                  required
                />
                <p className="mt-1 text-sm text-gray-500">Recommended: 10-15</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={disabled}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Save Configuration
          </button>
        </div>
      </form>
    </div>
  );
};

export default ConfigForm;
