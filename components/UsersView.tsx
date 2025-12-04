
import React from 'react';
import { User, Store, ShoppingBag, Shield, MoreHorizontal, Mail } from 'lucide-react';

// Mock Data for Visualization
const MOCK_USERS = [
  { id: 'u-admin', name: 'Owner Admin', email: 'admin@izitobuy.com', role: 'admin', storeName: 'Izitobuy HQ', joinDate: '2023-01-01' },
  { id: 'u-seller', name: 'Seller Account', email: 'seller@store.com', role: 'seller', storeName: 'My Demo Store', joinDate: '2023-05-12' },
  { id: 'u-cust1', name: 'Alice Freeman', email: 'customer@gmail.com', role: 'customer', joinDate: '2023-06-20' },
  { id: 'u-cust2', name: 'Bob Smith', email: 'bob.s@example.com', role: 'customer', joinDate: '2023-07-15' },
  { id: 'u-sell2', name: 'Tech Gadgets Inc', email: 'sales@techgadgets.com', role: 'seller', storeName: 'Tech Gadgets', joinDate: '2023-08-02' },
  { id: 'u-cust3', name: 'Charlie Brown', email: 'charlie@test.com', role: 'customer', joinDate: '2023-09-10' },
];

export const UsersView: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
          <p className="mt-2 text-sm text-slate-600">
            Overview of all registered Customers, Sellers, and Administrators.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
         <div className="bg-white overflow-hidden rounded-lg border border-slate-200 shadow-sm p-5 flex items-center">
            <div className="flex-shrink-0 bg-blue-50 rounded-md p-3">
               <ShoppingBag className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-slate-500 truncate">Total Customers</dt>
                <dd className="text-2xl font-bold text-slate-900">3,402</dd>
              </dl>
            </div>
         </div>
         <div className="bg-white overflow-hidden rounded-lg border border-slate-200 shadow-sm p-5 flex items-center">
            <div className="flex-shrink-0 bg-fox-50 rounded-md p-3">
               <Store className="h-6 w-6 text-fox-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-slate-500 truncate">Active Sellers</dt>
                <dd className="text-2xl font-bold text-slate-900">128</dd>
              </dl>
            </div>
         </div>
         <div className="bg-white overflow-hidden rounded-lg border border-slate-200 shadow-sm p-5 flex items-center">
            <div className="flex-shrink-0 bg-slate-100 rounded-md p-3">
               <Shield className="h-6 w-6 text-slate-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-slate-500 truncate">Administrators</dt>
                <dd className="text-2xl font-bold text-slate-900">3</dd>
              </dl>
            </div>
         </div>
      </div>

      {/* User List Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
         <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h3 className="text-lg font-medium leading-6 text-slate-900">All Users</h3>
         </div>
         <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
               <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Joined</th>
                  <th className="relative px-6 py-3"><span className="sr-only">Edit</span></th>
               </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
               {MOCK_USERS.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50">
                     <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                           <div className="h-10 w-10 flex-shrink-0">
                              <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-bold ${
                                 user.role === 'admin' ? 'bg-red-600' : 
                                 user.role === 'seller' ? 'bg-fox-600' : 'bg-blue-400'
                              }`}>
                                 {user.name.charAt(0)}
                              </div>
                           </div>
                           <div className="ml-4">
                              <div className="text-sm font-medium text-slate-900">{user.name}</div>
                              <div className="text-sm text-slate-500">{user.email}</div>
                              {user.storeName && (
                                 <div className="text-xs text-fox-600 font-medium flex items-center gap-1 mt-0.5">
                                    <Store className="w-3 h-3" /> {user.storeName}
                                 </div>
                              )}
                           </div>
                        </div>
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                           user.role === 'admin' ? 'bg-red-100 text-red-800' :
                           user.role === 'seller' ? 'bg-fox-100 text-fox-800' :
                           'bg-blue-100 text-blue-800'
                        }`}>
                           {user.role.toUpperCase()}
                        </span>
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                           Active
                        </span>
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {user.joinDate}
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-slate-400 hover:text-slate-600">
                           <MoreHorizontal className="w-5 h-5" />
                        </button>
                     </td>
                  </tr>
               ))}
            </tbody>
         </table>
      </div>
    </div>
  );
};
