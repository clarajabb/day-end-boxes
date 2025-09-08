import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { format } from 'date-fns';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

import Layout from '@/components/Layout';
import Button from '@/components/ui/Button';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useInventory } from '@/hooks/useInventory';
import { BoxInventory, InventoryStatus } from '@/types/inventory';

const statusColors = {
  [InventoryStatus.ACTIVE]: 'green',
  [InventoryStatus.SOLD_OUT]: 'red',
  [InventoryStatus.EXPIRED]: 'gray',
} as const;

export default function InventoryPage() {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const { inventory, loading, error, deleteInventory } = useInventory(selectedDate);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this inventory item?')) {
      try {
        await deleteInventory(id);
      } catch (error) {
        console.error('Failed to delete inventory:', error);
      }
    }
  };

  const columns = [
    {
      key: 'boxType',
      label: 'Box Type',
      render: (item: BoxInventory) => (
        <div>
          <div className="font-medium text-gray-900">{item.boxType.name}</div>
          <div className="text-sm text-gray-500">{item.boxType.category}</div>
        </div>
      ),
    },
    {
      key: 'quantity',
      label: 'Quantity',
      render: (item: BoxInventory) => (
        <div>
          <div className="font-medium text-gray-900">
            {item.remainingQuantity} / {item.originalQuantity}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
            <div
              className="bg-green-600 h-2 rounded-full"
              style={{
                width: `${(item.remainingQuantity / item.originalQuantity) * 100}%`,
              }}
            />
          </div>
        </div>
      ),
    },
    {
      key: 'price',
      label: 'Price',
      render: (item: BoxInventory) => (
        <div>
          <div className="font-medium text-gray-900">
            ${item.price.toFixed(2)}
          </div>
          <div className="text-sm text-gray-500">
            Was ${item.boxType.originalPrice.toFixed(2)}
          </div>
        </div>
      ),
    },
    {
      key: 'pickupTime',
      label: 'Pickup Window',
      render: (item: BoxInventory) => (
        <div className="text-sm text-gray-900">
          {item.pickupStartTime} - {item.pickupEndTime}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (item: BoxInventory) => (
        <Badge color={statusColors[item.status]}>
          {item.status.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (item: BoxInventory) => (
        <div className="flex space-x-2">
          <Link href={`/inventory/${item.id}/edit`}>
            <Button variant="outline" size="sm">
              <PencilIcon className="h-4 w-4" />
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDelete(item.id)}
            className="text-red-600 hover:text-red-700 hover:border-red-300"
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Head>
        <title>Inventory Management - Day-End Boxes Merchant</title>
      </Head>
      
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
              <p className="mt-1 text-sm text-gray-600">
                Manage your daily box inventory and availability
              </p>
            </div>
            <Link href="/inventory/create">
              <Button>
                <PlusIcon className="h-5 w-5 mr-2" />
                Add Inventory
              </Button>
            </Link>
          </div>

          {/* Date Filter */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center space-x-4">
              <label htmlFor="date" className="text-sm font-medium text-gray-700">
                Select Date:
              </label>
              <input
                type="date"
                id="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
            </div>
          </div>

          {/* Inventory Table */}
          <div className="bg-white shadow rounded-lg">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : error ? (
              <div className="flex justify-center items-center py-12">
                <div className="text-center">
                  <div className="text-red-600 text-sm font-medium">
                    Failed to load inventory
                  </div>
                  <div className="text-gray-500 text-sm mt-1">{error}</div>
                </div>
              </div>
            ) : inventory.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg font-medium">
                  No inventory for {format(new Date(selectedDate), 'MMMM d, yyyy')}
                </div>
                <div className="text-gray-400 text-sm mt-2">
                  Create your first inventory item to get started
                </div>
                <Link href="/inventory/create">
                  <Button className="mt-4">
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add Inventory
                  </Button>
                </Link>
              </div>
            ) : (
              <Table
                data={inventory}
                columns={columns}
                keyField="id"
              />
            )}
          </div>
        </div>
      </Layout>
    </>
  );
}
