import '@/app/global.css';
import Header from '../components/layout/Header';
import Providers from './providers';


// Import Google fonts
import { Inter, Playfair_Display } from 'next/font/google';

//Define font objects. PLayfair Display for headings, Inter for body/UI
// `display: 'swap'` loads quickly; `variable: '--font-name'` makes it accessible in CSS
const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair',
});
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata = {
  title: 'Rental',
  description: 'Rent anything you need, lend anything you own.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <body>
        <Header />
        <Providers>
          {children}
        </Providers>
        <footer>...</footer>
      </body>
    </html>
  );
}