# Disperse Web UI

A modern web interface for distributing tokens on the WAX blockchain, allowing for efficient batch transfers to multiple accounts.

## Features

- **User-friendly web interface**: Modern UI built with Next.js and Tailwind CSS
- **Support for multiple wallets**: Connect using WAX Cloud Wallet or Anchor
- **Simple recipient input**: Add recipients directly in text format
- **Batched transfers**: Efficiently process transactions in configurable batches
- **Persistent settings**: Configurations are saved between sessions
- **Real-time transaction status**: Clear feedback on transaction progress and results
- **Blockchain integration**: Direct integration with WAX blockchain

## Technologies

- **Next.js** (App Router): For modern React application structure
- **Tailwind CSS**: For styling and responsive design
- **WharfKit**: For blockchain wallet integration
- **EOSJS**: For blockchain interactions

## Prerequisites

- Node.js 16+ and npm/yarn
- A modern web browser
- WAX account with sufficient tokens

## Getting Started

1. Clone the repository:

```bash
git clone https://github.com/qaraqol/disperse-web.git
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
2. Click the "Connect Wallet" button in the top-right corner
3. Choose either WAX Cloud Wallet or Anchor from the wallet plugin dialog
4. Complete the authentication process in the popup window
5. Your wallet will now be connected, showing your account name

### Configuring Token Settings

1. On the main Transfer Tokens page, configure your token settings:

   - Token Contract: The contract that issued the token (e.g., "eosio.token" for WAX, "alien.worlds" for TLM)
   - Token Symbol: The token symbol (e.g., "WAX", "TLM")
   - Token Precision: The decimal precision for the token (WAX: 8, TLM: 4)
   - Memo: Optional memo to include with transfers

2. Advanced settings (on the same page):
   - RPC API Endpoint: The WAX blockchain endpoint (default: https://wax.qaraqol.com)
   - Batch Size: Number of transfers per transaction (recommended: 10-15)

The application automatically saves your settings for future use.

### Adding Recipients

Add recipients directly in the text input area:

1. Use one entry per line
2. Format each entry as `accountname,amount` or `accountname amount`
3. Example:
   ```
   account1,1
   account2,0.5
   account3,10
   ```

### Processing Transfers

1. After configuring settings and adding recipients
2. Click "Transfer Tokens" to begin transfers
3. Approve the transaction in your wallet when prompted
4. View transaction status and results on the screen
5. View detailed logs in the Transaction Logs tab

## Security Notes

- Your private keys never leave your computer
- Authentication is handled securely through WharfKit and wallet plugins
- For additional security, consider running this tool locally
- All transactions require explicit approval in your wallet

## Credits

This tool was built by [Qaraqol](https://qaraqol.com) using Next.js and blockchain technologies.

## License

ISC
