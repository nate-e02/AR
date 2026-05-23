import "./globals.css";

export const metadata = {
  title: "Food AR",
  description: "Interactive AR dining experience",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}