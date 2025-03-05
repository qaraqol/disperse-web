"use client";

import { useState, useRef } from "react";
import Papa from "papaparse";

const CSVUpload = ({ onUpload, disabled }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [preview, setPreview] = useState([]);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    processFile(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    processFile(file);
  };

  const handleBrowseClick = () => {
    fileInputRef.current.click();
  };

  const processFile = (file) => {
    setError("");

    if (!file) return;

    if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
      setError("Please upload a CSV file");
      return;
    }

    setFileName(file.name);

    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setError(`Error parsing CSV: ${results.errors[0].message}`);
          return;
        }

        // Validate data structure
        if (
          !results.meta.fields.includes("receiverName") ||
          !results.meta.fields.includes("amount")
        ) {
          setError("CSV must contain columns: receiverName, amount");
          return;
        }

        const validData = results.data.filter((row) => {
          return (
            row.receiverName &&
            typeof row.amount === "number" &&
            !isNaN(row.amount) &&
            row.amount > 0
          );
        });

        if (validData.length === 0) {
          setError("No valid recipients found in CSV");
          return;
        }

        if (validData.length !== results.data.length) {
          setError(
            `Warning: ${
              results.data.length - validData.length
            } rows were invalid and will be skipped`
          );
        }

        setPreview(validData.slice(0, 5));
        onUpload(validData);
      },
      error: (error) => {
        setError(`Error parsing CSV: ${error.message}`);
      },
    });
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Upload Recipients CSV</h2>

      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center ${
          isDragging
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={disabled ? null : handleDrop}
        onClick={disabled ? null : handleBrowseClick}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".csv"
          className="hidden"
          disabled={disabled}
        />

        <div className="space-y-2">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
            aria-hidden="true"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4h-8m-12 0H8a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          <div className="text-sm text-gray-600">
            <span className="font-medium">Click to upload</span> or drag and
            drop
          </div>

          <p className="text-xs text-gray-500">
            CSV file with columns: receiverName, amount
          </p>
        </div>
      </div>

      {fileName && (
        <div className="mt-4 text-sm text-gray-600">
          <span className="font-medium">File:</span> {fileName}
        </div>
      )}

      {error && <div className="mt-4 text-sm text-red-600">{error}</div>}

      {preview.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Preview ({preview.length} of {preview.length} recipients):
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Receiver
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {preview.map((row, index) => (
                  <tr key={index}>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                      {row.receiverName}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 text-right">
                      {row.amount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-500">
        <p className="font-medium">CSV Format:</p>
        <pre className="mt-1 bg-gray-100 p-2 rounded-md whitespace-pre overflow-x-auto">
          receiverName,amount{"\n"}
          account1,1{"\n"}
          account2,0.5{"\n"}
          account3,10
        </pre>
      </div>
    </div>
  );
};

export default CSVUpload;
