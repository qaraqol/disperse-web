# Disperse Web UI

A modern web interface for distributing tokens on the WAX blockchain, allowing for efficient batch transfers to multiple accounts.

## Features

- **User-friendly web interface**: Modern UI built with Next.js and Tailwind CSS
- **Support for multiple wallets**: Connect using WAX Cloud Wallet or Anchor
- **CSV upload**: Batch process transfers from CSV files
- **Manual input**: Add recipients manually with validation
- **Batched transfers**: Efficiently process transactions in configurable batches
- **Persistent settings**: Configurations are saved between sessions
- **Real-time transaction status**: Clear feedback on transaction progress and results
- **Blockchain integration**: Direct integration with WAX blockchain

## Technologies

- **Next.js** (App Router): For modern React application structure
- **Tailwind CSS**: For styling and responsive design
- **WharfKit**: For blockchain wallet integration
- **PapaParse**: For CSV processing
- **EOSJS**: For blockchain interactions

## Prerequisites

- Node.js 16+ and npm/yarn
- A modern web browser
- WAX account with sufficient tokens

## Getting Started

1. Clone the repository:

```bash
git clone https://github.com/yourusername/disperse-web.git
cd disperse-web
```

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

## Using the Application

### Connecting Your Wallet

1. Open the application in your browser
2. Click the "Connect Wallet" button
3. Choose either WAX Cloud Wallet or Anchor
4. Complete the authentication process in the popup window
5. Your wallet will now be connected, showing your account name

### Configuring Token Settings

1. Navigate to the "Configuration" tab
2. Configure token settings:
   - Token Contract: The contract that issued the token (e.g., "eosio.token" for WAX, "alien.worlds" for TLM)
   - Token Symbol: The token symbol (e.g., "WAX", "TLM")
   - Token Precision: The decimal precision for the token (WAX: 8, TLM: 4)
   - Memo: Optional memo to include with transfers
   - Batch Size: Number of transfers per transaction (recommended: 10-15)
3. Click "Save Configuration"

### Adding Recipients

You can add recipients in two ways:

#### Upload CSV

1. Navigate to the "Upload CSV" tab
2. Drag and drop a CSV file or click to browse
3. The CSV must have headers: `receiverName,amount`
4. Example:
   ```
   receiverName,amount
   account1,1
   account2,0.5
   account3,10
   ```
5. Review the preview to confirm data is parsed correctly

#### Manual Input

1. Navigate to the "Manual Input" tab
2. Enter account names and amounts manually
3. Click "Add Recipient" for additional entries
4. Click "Save Recipients" when finished

### Processing Transfers

1. After configuring settings and adding recipients
2. Click "Start Processing" to begin transfers
3. Approve the transaction in your wallet when prompted
4. View transaction status and results on the screen

## Security Notes

- Your private keys never leave your computer
- Authentication is handled securely through WharfKit and wallet plugins
- For additional security, consider running this tool locally
- All transactions require explicit approval in your wallet

## Credits

This project is an extension of the original Disperse CLI tool, adding a web interface for improved usability.

## License

ISC
