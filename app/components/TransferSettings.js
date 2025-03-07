"use client";

const TransferSettings = ({
  config,
  onUpdate,
  selectedTokenBalance,
  isProcessing,
}) => {
  const handleChange = (e) => {
    const { name, value, type } = e.target;

    // Handle numeric inputs
    if (type === "number") {
      onUpdate({
        ...config,
        [name]: value === "" ? "" : Number(value),
      });
    } else {
      onUpdate({
        ...config,
        [name]: value,
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Transfer Settings</h2>
        {config.contractName && config.tokenName && (
          <div className="px-3 py-1 bg-green-50 border border-green-100 rounded-md text-sm text-green-800">
            <span className="font-medium">{config.tokenName}</span> selected
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
            onChange={handleChange}
            disabled={isProcessing}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
            placeholder="Disperse"
          />
          <p className="mt-1 text-xs text-gray-500">
            Used when no specific memo is provided
          </p>
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
            onChange={handleChange}
            disabled={isProcessing}
            min="1"
            max="50"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            Number of transfers per batch (10-15 recommended)
          </p>
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
            onChange={handleChange}
            disabled={isProcessing}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
            placeholder="https://wax.qaraqol.com"
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            WAX blockchain RPC endpoint
          </p>
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
              <span className="font-medium">{config.tokenName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Contract:</span>
              <span className="font-medium text-xs">{config.contractName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Precision:</span>
              <span className="font-medium">{config.tokenPrecision}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Balance:</span>
              <span className="font-medium">{selectedTokenBalance}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransferSettings;
