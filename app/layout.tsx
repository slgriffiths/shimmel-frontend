import type { Metadata } from 'next';
import ClientLayout from './client-layout';

export const metadata: Metadata = {
  title: 'Shimmel AI',
  description: 'AI-powered workflow automation platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" style={{ margin: 0, padding: 0 }}>
      <body style={{ margin: 0, padding: 0 }}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}