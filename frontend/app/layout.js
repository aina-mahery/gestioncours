import "./globals.css";
import AppShell from "../components/layout/AppShell";
import I18nProvider from "../components/providers/I18nProvider";

export const metadata = {
  title: "GestionCours Pro",
  description: "Application de gestion de cours, membres, présence, paiements et forum."
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        <I18nProvider>
          <AppShell>{children}</AppShell>
        </I18nProvider>
      </body>
    </html>
  );
}
