import './globals.css';
import { Toaster } from 'react-hot-toast';

export const metadata = {
  title: 'LearnFlow — Your Learning Management System',
  description: 'A modern LMS with structured video courses, progress tracking, and sequential learning flow.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-surface-50 dark:bg-surface-950 text-surface-900 dark:text-white font-sans antialiased">
        <Toaster
          position="top-right"
          toastOptions={{
            className: '!bg-white dark:!bg-surface-800 !text-surface-900 dark:!text-white !shadow-xl',
          }}
        />
        {children}
      </body>
    </html>
  );
}
