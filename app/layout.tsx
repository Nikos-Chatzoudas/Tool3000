import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tool 3000",
  description: "A file converter and an image resizer ...multiple file support",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
