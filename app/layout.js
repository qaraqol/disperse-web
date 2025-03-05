import "./globals.css";

export const metadata = {
  title: "Disperse Token Tool",
  description:
    "Web UI for distributing tokens to multiple accounts via WAX blockchain",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Add a meta tag to ensure proper viewport */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>{children}</body>
    </html>
  );
}
