'use client';

import { CustomThemeProvider } from './theme-provider';
import { NextIntlClientProvider } from 'next-intl';

import { EditorProvider } from '@/context/editor-context';
import { AuthProvider } from '@/context/auth-context';

import { Toaster } from 'sonner';
import { ErrorBoundary } from './error-boundary';
import { SWRConfig } from 'swr';

export function Providers({ 
  children, 
  messages, 
  locale,
  initialSettings
}: { 
  children: React.ReactNode;
  messages: any;
  locale: string;
  initialSettings?: any;
}) {
  return (
    <ErrorBoundary>
      <SWRConfig value={{
        revalidateOnFocus: false,
        dedupingInterval: 30000,
        errorRetryCount: 2,
      }}>
        <CustomThemeProvider>
        <NextIntlClientProvider messages={messages} locale={locale} timeZone="Africa/Cairo">
          <AuthProvider>
            <EditorProvider initialSettings={initialSettings}>
              {children}
              <Toaster position="top-center" richColors />
            </EditorProvider>
          </AuthProvider>
        </NextIntlClientProvider>
      </CustomThemeProvider>
      </SWRConfig>
    </ErrorBoundary>
  );
}


