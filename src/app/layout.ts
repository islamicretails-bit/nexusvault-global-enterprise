// src/app/layout.ts
import type { ReactNode } from 'react';
import { useState, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import Head from 'next/head';
import Link from 'next/link';
import { AiOutlineMenu, AiOutlineClose } from 'react-icons/ai';
import { useRouter } from 'next/router';
import { useTheme } from 'next-themes';
import { MoonIcon, SunIcon } from '@heroicons/react/24/solid';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleThemeSwitch = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Head>
        <title>NexusVault Global Enterprise</title>
        <meta name="description" content="NexusVault Global Enterprise" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <header className="bg-gray-900 text-white py-4">
        <nav className="container mx-auto flex justify-between items-center">
          <Link href="/">
            <a>
              <span className="text-2xl font-bold">NexusVault</span>
            </a>
          </Link>
          <div className="flex items-center">
            {session ? (
              <button
                className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-md"
                onClick={signOut}
              >
                Sign out
              </button>
            ) : (
              <button
                className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-md"
                onClick={signIn}
              >
                Sign in
              </button>
            )}
            <button
              className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-md ml-4"
              onClick={handleThemeSwitch}
            >
              {theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
            </button>
          </div>
        </nav>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="bg-gray-900 text-white py-4">
        <div className="container mx-auto text-center">
          &copy; {new Date().getFullYear()} NexusVault Global Enterprise
        </div>
      </footer>
    </div>
  );
};

export default Layout;