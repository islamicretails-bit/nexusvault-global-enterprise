import type { NextPage } from 'next';
import { useState, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import { AiRouterConfig } from '../types/index';
import { getAiRouterConfig } from '../lib/ai-router';
import { getGeoLocation } from '../lib/geo-currency';
import { getNotifications } from '../lib/notifications';
import { getSecureStorageUrl } from '../lib/s3-storage';
import { getSeoMetadata } from '../lib/seo-generator';
import Layout from '../components/Layout';
import OfficeDashboard from '../components/office/Dashboard';
import OfficeSettings from '../components/office/Settings';
import OfficeNotifications from '../components/office/Notifications';

const OfficePage: NextPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [aiRouterConfig, setAiRouterConfig] = useState<AiRouterConfig | null>(null);
  const [geoLocation, setGeoLocation] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [secureStorageUrl, setSecureStorageUrl] = useState<string | null>(null);
  const [seoMetadata, setSeoMetadata] = useState<any | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      signIn();
    }
  }, [status]);

  useEffect(() => {
    if (session) {
      getAiRouterConfig().then((config) => setAiRouterConfig(config));
      getGeoLocation().then((location) => setGeoLocation(location));
      getNotifications().then((notifications) => setNotifications(notifications));
      getSecureStorageUrl().then((url) => setSecureStorageUrl(url));
      getSeoMetadata().then((metadata) => setSeoMetadata(metadata));
    }
  }, [session]);

  const handleSignOut = () => {
    signOut();
  };

  return (
    <Layout>
      <div className="container mx-auto p-4 pt-6 md:p-6 lg:p-12 xl:p-24">
        <div className="flex flex-wrap justify-center">
          <div className="w-full lg:w-1/2 xl:w-1/3 p-6">
            <OfficeDashboard
              aiRouterConfig={aiRouterConfig}
              geoLocation={geoLocation}
              secureStorageUrl={secureStorageUrl}
              seoMetadata={seoMetadata}
            />
          </div>
          <div className="w-full lg:w-1/2 xl:w-1/3 p-6">
            <OfficeSettings />
          </div>
          <div className="w-full lg:w-1/2 xl:w-1/3 p-6">
            <OfficeNotifications notifications={notifications} />
          </div>
        </div>
        <button
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          onClick={handleSignOut}
        >
          Sign Out
        </button>
      </div>
    </Layout>
  );
};

export default OfficePage;