tsx
// src/app/office/page.tsx
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useSession, signIn, signOut } from 'next-auth/react';
import { AiOutlineLock } from 'react-icons/ai';
import { toast } from 'react-toastify';
import { getAdminSecretPasscode } from '../lib/security';

const AdminOfficePage = () => {
  const [passcode, setPasscode] = useState('');
  const [isPasscodeValid, setIsPasscodeValid] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  const handlePasscodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasscode(e.target.value);
  };

  const handlePasscodeSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const adminSecretPasscode = getAdminSecretPasscode();
    if (passcode === adminSecretPasscode) {
      setIsPasscodeValid(true);
      router.push('/office/dashboard');
    } else {
      toast.error('Invalid passcode');
    }
  };

  if (session && session.user.role === 'admin') {
    return <div>You are already logged in as an admin</div>;
  }

  return (
    <div className="flex justify-center items-center h-screen">
      <form
        onSubmit={handlePasscodeSubmit}
        className="bg-white p-4 rounded shadow-md"
      >
        <h2 className="text-lg font-bold mb-2">Admin Office</h2>
        <p className="text-gray-600 mb-4">
          Enter the secret passcode to access the admin office
        </p>
        <input
          type="password"
          value={passcode}
          onChange={handlePasscodeChange}
          placeholder="Enter passcode"
          className="w-full p-2 border border-gray-400 rounded mb-4"
        />
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default AdminOfficePage;