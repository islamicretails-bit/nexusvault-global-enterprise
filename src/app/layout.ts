// src/app/layout.ts
import type { ReactNode } from 'react';
import { useState, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import Head from 'next/head';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useRouter } from 'next/router';
import { AiFillHome, AiFillSetting } from 'react-icons/ai';
import { IoMdPerson } from 'react-icons/io';
import { FaShoppingCart } from 'react-icons/fa';
import Link from 'next/link';
import { useTheme } from '../lib/theme';
import { useWindowSize } from '../lib/useWindowSize';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { width } = useWindowSize();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex flex-col min-h-screen">
      <Head>
        <title>NexusVault Global Enterprise</title>
        <meta name="description" content="NexusVault Global Enterprise" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header
        session={session}
        status={status}
        signIn={signIn}
        signOut={signOut}
        theme={theme}
        toggleTheme={toggleTheme}
      />
      <main className="flex-1 flex flex-col md:flex-row">
        <aside
          className={`${
            width > 768 ? 'w-64' : 'w-full'
          } bg-gray-100 dark:bg-gray-800 p-4 md:p-6 lg:p-8`}
        >
          <nav>
            <ul>
              <li>
                <Link href="/">
                  <a>
                    <AiFillHome size={24} />
                    Home
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/settings">
                  <a>
                    <AiFillSetting size={24} />
                    Settings
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/profile">
                  <a>
                    <IoMdPerson size={24} />
                    Profile
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/cart">
                  <a>
                    <FaShoppingCart size={24} />
                    Cart
                  </a>
                </Link>
              </li>
            </ul>
          </nav>
        </aside>
        <section className="flex-1 p-4 md:p-6 lg:p-8">{children}</section>
      </main>
      <Footer />
    </div>
  );
};

export default Layout;