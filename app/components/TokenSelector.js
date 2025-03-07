"use client";

import { useState, useEffect } from "react";

const TokenSelector = ({ walletAccount, onTokenSelect, isProcessing }) => {
  const [tokens, setTokens] = useState([]);
  const [filteredTokens, setFilteredTokens] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedToken, setSelectedToken] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchTokens = async () => {
      if (!walletAccount) {
        setTokens([]);
        setFilteredTokens([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `https://lightapi-wax.qaraqol.com/api/balances/wax/${walletAccount}`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch balances: ${response.status}`);
        }

        const data = await response.json();

        if (data.balances && Array.isArray(data.balances)) {
          // Filter tokens with non-zero balance
          const availableTokens = data.balances.filter(
            (token) => parseFloat(token.amount) > 0
          );

          // Sort tokens by currency name alphabetically
          availableTokens.sort((a, b) => a.currency.localeCompare(b.currency));

          setTokens(availableTokens);
          setFilteredTokens(availableTokens);

          // Select first token by default if available
          if (availableTokens.length > 0 && !selectedToken) {
            handleTokenSelect(availableTokens[0]);
          }
        } else {
          setTokens([]);
          setFilteredTokens([]);
        }
      } catch (err) {
        console.error("Error fetching token balances:", err);
        setError("Unable to load token balances. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTokens();
  }, [walletAccount]);

  // Filter tokens when search query changes
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredTokens(tokens);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = tokens.filter(
        (token) =>
          token.currency.toLowerCase().includes(query) ||
          token.contract.toLowerCase().includes(query)
      );
      setFilteredTokens(filtered);
    }
  }, [searchQuery, tokens]);

  const handleTokenSelect = (token) => {
    setSelectedToken(token);
    onTokenSelect({
      contractName: token.contract,
      tokenName: token.currency,
      tokenPrecision: parseInt(token.decimals),
      balance: token.amount,
    });
  };

  if (!walletAccount) {
    return (
      <div className="bg-blue-50 border border-blue-100 rounded-md p-4 text-sm text-blue-700">
        Connect your wallet to view available tokens
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Your Tokens</h2>

      {isLoading ? (
        <div className="flex items-center space-x-2 text-gray-500">
          <svg
            className="animate-spin h-5 w-5"
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
          <span>Loading tokens...</span>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-100 rounded-md p-4 text-sm text-red-700">
          {error}
        </div>
      ) : tokens.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-100 rounded-md p-4 text-sm text-yellow-700">
          No tokens found with available balance
        </div>
      ) : (
        <div className="space-y-2">
          {/* Search bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Search tokens..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={isProcessing}
            />
          </div>

          {/* Token count */}
          <div className="text-xs text-gray-500">
            {filteredTokens.length} of {tokens.length} tokens
            {searchQuery && ` matching "${searchQuery}"`}
          </div>

          {/* Token list with scrollbar */}
          <div className="border border-gray-200 rounded-md overflow-hidden">
            <div className="max-h-72 overflow-y-auto">
              {filteredTokens.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  No tokens match your search
                </div>
              ) : (
                filteredTokens.map((token) => (
                  <div
                    key={`${token.contract}-${token.currency}`}
                    onClick={() => !isProcessing && handleTokenSelect(token)}
                    className={`p-3 border-b border-gray-200 last:border-b-0 cursor-pointer transition ${
                      selectedToken &&
                      selectedToken.currency === token.currency &&
                      selectedToken.contract === token.contract
                        ? "bg-blue-50"
                        : "hover:bg-gray-50"
                    } ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{token.currency}</div>
                        <div className="text-xs text-gray-500">
                          {token.contract}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {parseFloat(token.amount).toFixed(token.decimals)}
                        </div>
                        <div className="text-xs text-gray-500">Balance</div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TokenSelector;
