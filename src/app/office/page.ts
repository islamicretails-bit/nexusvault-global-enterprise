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
import Head from 'next/head';
import Header from '../components/Header';
import Footer from '../components/Footer';
import OfficeDashboard from '../components/office/Dashboard';

const OfficePage: NextPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [aiRouterConfig, setAiRouterConfig] = useState<AiRouterConfig | null>(null);
  const [geoLocation, setGeoLocation] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [secureStorageUrl, setSecureStorageUrl] = useState<string | null>(null);
  const [seoMetadata, setSeoMetadata] = useState<any | null>(null);

  useEffect(() => {
    const fetchAiRouterConfig = async () => {
      const config = await getAiRouterConfig();
      setAiRouterConfig(config);
    };
    fetchAiRouterConfig();

    const fetchGeoLocation = async () => {
      const location = await getGeoLocation();
      setGeoLocation(location);
    };
    fetchGeoLocation();

    const fetchNotifications = async () => {
      const notifications = await getNotifications();
      setNotifications(notifications);
    };
    fetchNotifications();

    const fetchSecureStorageUrl = async () => {
      const url = await getSecureStorageUrl();
      setSecureStorageUrl(url);
    };
    fetchSecureStorageUrl();

    const fetchSeoMetadata = async () => {
      const metadata = await getSeoMetadata();
      setSeoMetadata(metadata);
    };
    fetchSeoMetadata();
  }, []);

  if (status === 'unauthenticated') {
    signIn();
    return <div>Signing in...</div>;
  }

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Head>
        <title>Office Page</title>
        <meta name="description" content="Office page description" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <OfficeDashboard
        aiRouterConfig={aiRouterConfig}
        geoLocation={geoLocation}
        notifications={notifications}
        secureStorageUrl={secureStorageUrl}
        seoMetadata={seoMetadata}
      />
      <Footer />
    </div>
  );
};

export default OfficePage;