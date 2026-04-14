import { PropsWithChildren } from "react";
import { I18nextProvider } from "react-i18next";
import { i18n } from "../../i18n";
import { Toaster } from "../../components/ui/sonner";
import { ThemeProvider } from "../../theme/ThemeProvider";

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider>
        {children}
        <Toaster richColors />
      </ThemeProvider>
    </I18nextProvider>
  );
}
