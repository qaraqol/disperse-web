# Disperse Web UI

A modern web interface for the Disperse token transfer tool for WAX blockchain.

## Features

- User-friendly interface for token transfers
- CSV upload for batch processing
- Manual input option for recipients
- Real-time logging and transaction feedback
- Batch processing with configurable settings
- Detailed transaction status and reporting

## Prerequisites

- Node.js 16+ and npm/yarn
- Active WAX account with sufficient tokens
- Private key with active permission

## Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Run the development server:

```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser

## Building for Production

```bash
npm run build
npm start
# or
yarn build
yarn start
```

## Using the Web UI

### Configuration

1. Navigate to the "Configuration" tab
2. Enter your WAX account settings:
   - RPC API Endpoint: Choose a WAX API endpoint
   - Private Key: Your account's active private key
   - Sender Account: Your WAX account name
   - Token Contract: Contract for the token you want to send
   - Token Symbol: Symbol of the token (e.g., WAX, TLM)
   - Token Precision: Decimal precision for the token
   - Memo: Optional memo to include with transfers
   - Batch Size: Number of transfers per blockchain transaction

### Adding Recipients

You can add recipients in two ways:

#### Upload CSV

1. Navigate to the "Upload CSV" tab
2. Drag and drop a CSV file or click to browse
3. The CSV must have headers: `receiverName,amount`
4. Review the preview to confirm data is parsed correctly

#### Manual Input

1. Navigate to the "Manual Input" tab
2. Enter account names and amounts manually
3. Click "Add Recipient" for additional entries
4. Click "Save Recipients" when done

### Processing Transfers

1. After configuring settings and adding recipients
2. Click "Start Processing" to begin transfers
3. Monitor progress in the "Logs" tab
4. When complete, you can download logs for record-keeping

## Security Notes

- Your private key is only used client-side for signing transactions
- The private key is never stored or sent to any server
- For additional security, consider running this tool locally
