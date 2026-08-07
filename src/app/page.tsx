tsx
// src/app/page.tsx
import type { NextPage } from 'next';
import { useState, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import { AiOutlineSearch } from 'react-icons/ai';
import { ProductCard } from '../components/ProductCard';
import { AppleToast } from '../components/AppleToast';
import { getProducts } from '../lib/api';
import { useDebounce } from '../lib/hooks';

const HomePage: NextPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    const fetchProducts = async () => {
      const data = await getProducts(debouncedSearchTerm);
      setProducts(data);
    };
    fetchProducts();
  }, [debouncedSearchTerm]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    router.push({
      pathname: '/search',
      query: { term: searchTerm },
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8">
      <header className="flex justify-between items-center py-4">
        <h1 className="text-3xl font-bold">NexaVault Digital Marketplace</h1>
        {status === 'authenticated' ? (
          <button
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => signOut()}
          >
            Sign Out
          </button>
        ) : (
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => signIn()}
          >
            Sign In
          </button>
        )}
      </header>
      <form onSubmit={handleSearch} className="flex justify-center py-4">
        <input
          type="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search for products..."
          className="w-full p-2 pl-10 text-sm text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-gray-500 focus:border-gray-500"
        />
        <button
          type="submit"
          className="ml-2 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
        >
          <AiOutlineSearch size={20} />
        </button>
      </form>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 py-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      <AppleToast />
    </div>
  );
};

export default HomePage;