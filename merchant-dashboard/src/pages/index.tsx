import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import Head from 'next/head';

import Layout from '@/components/Layout';
import DashboardStats from '@/components/dashboard/DashboardStats';
import RecentReservations from '@/components/dashboard/RecentReservations';
import InventoryOverview from '@/components/dashboard/InventoryOverview';
import QuickActions from '@/components/dashboard/QuickActions';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return; // Still loading
    
    if (!session) {
      router.push('/auth/login');
      return;
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect to login
  }

  return (
    <>
      <Head>
        <title>Dashboard - Day-End Boxes Merchant</title>
        <meta name="description" content="Merchant dashboard for Day-End Boxes" />
      </Head>
      
      <Layout>
        <div className="space-y-6">
          {/* Welcome Header */}
          <div className="bg-white shadow rounded-lg p-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {session.user?.name || 'Merchant'}!
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Here's what's happening with your boxes today.
            </p>
          </div>

          {/* Quick Actions */}
          <QuickActions />

          {/* Dashboard Stats */}
          <DashboardStats />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Inventory Overview */}
            <InventoryOverview />
            
            {/* Recent Reservations */}
            <RecentReservations />
          </div>
        </div>
      </Layout>
    </>
  );
}
