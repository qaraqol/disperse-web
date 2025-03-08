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
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Transfer Settings</h2>
        {config.contractName && config.tokenName && (
          <div className="px-3 py-1 bg-green-50 border border-green-100 rounded-md text-sm text-green-800">
            <span className="font-medium">{config.tokenName}</span> selected
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
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

        <div className="lg:col-span-2">
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

      {/* Token details box with more spacing and contrast */}
      {config.contractName && config.tokenName ? (
        <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-md flex-grow flex flex-col">
          <h3 className="text-base font-medium text-blue-800 p-4 border-b border-blue-200">
            Token Details
          </h3>
          <div className="grid grid-cols-1 gap-y-4 p-4 flex-grow">
            <div className="bg-blue-100 rounded-md p-3 shadow-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">Symbol:</span>
                <span className="font-bold text-blue-800">
                  {config.tokenName}
                </span>
              </div>
            </div>

            <div className="bg-blue-100 rounded-md p-3 shadow-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">Contract:</span>
                <span className="font-medium text-blue-800">
                  {config.contractName}
                </span>
              </div>
            </div>

            <div className="bg-blue-100 rounded-md p-3 shadow-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">
                  Decimal Precision:
                </span>
                <span className="font-bold text-blue-800">
                  {config.tokenPrecision}
                </span>
              </div>
            </div>

            <div className="bg-blue-100 rounded-md p-3 shadow-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">Balance:</span>
                <span className="font-bold text-blue-800">
                  {selectedTokenBalance}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Placeholder to keep spacing consistent
        <div className="mt-6 p-4 border-2 border-gray-200 rounded-md flex-grow bg-gray-50 flex items-center justify-center text-gray-400 text-sm">
          Select a token to view details
        </div>
      )}
    </div>
  );
};

export default TransferSettings;
