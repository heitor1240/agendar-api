import './globals.css';
import Header from '@/src/components/Header';
import AppProviders from './providers';

export const metadata = {
  title: 'BarberPro — Tradição & Estilo em cada corte',
  description: 'BarberPro - Agende seu corte de cabelo online. Tradição & Estilo em cada corte. Seg–Sáb: 09h–20h.',
  openGraph: {
    title: 'BarberPro — Agendamento de Barbearia',
    description: 'Agende seu horário online na BarberPro. Tradição & Estilo em cada corte.',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        <meta name="theme-color" content="#C9A84C" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div style={{ minHeight: '100vh', background: 'var(--black)' }}>
          <AppProviders>
            <Header />
            <main>{children}</main>
          </AppProviders>
        </div>
      </body>
    </html>
  );
}
