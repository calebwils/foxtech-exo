import React, { useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Activity, ArrowUpRight, FileText, Loader2, RefreshCcw, AlertOctagon, PackageCheck, Archive } from 'lucide-react';

// Mock Data for KPIs
const KPIS = [
  { label: 'Total Revenue', value: '$124,592', change: '+12.5%', trend: 'up', icon: DollarSign, color: 'bg-blue-50 text-blue-600' },
  { label: 'Total Orders', value: '1,450', change: '+5.2%', trend: 'up', icon: ShoppingCart, color: 'bg-fox-50 text-fox-600' },
  { label: 'Active Customers', value: '8,920', change: '-2.1%', trend: 'down', icon: Users, color: 'bg-purple-50 text-purple-600' },
  { label: 'Avg. Order Value', value: '$85.90', change: '+3.4%', trend: 'up', icon: Activity, color: 'bg-emerald-50 text-emerald-600' },
];

const MONTHLY_DATA = [
  { month: 'Jan', value: 40 },
  { month: 'Feb', value: 35 },
  { month: 'Mar', value: 55 },
  { month: 'Apr', value: 70 },
  { month: 'May', value: 60 },
  { month: 'Jun', value: 85 },
  { month: 'Jul', value: 95 },
  { month: 'Aug', value: 75 },
  { month: 'Sep', value: 65 },
  { month: 'Oct', value: 80 },
  { month: 'Nov', value: 90 },
  { month: 'Dec', value: 100 },
];

const CATEGORY_DATA = [
  { name: 'Electronics', value: 45, color: 'bg-blue-500' },
  { name: 'Drones', value: 30, color: 'bg-fox-500' },
  { name: 'Wearables', value: 15, color: 'bg-purple-500' },
  { name: 'Photography', value: 10, color: 'bg-emerald-500' },
];

// Mock Data for Lifecycle Timeline
const LIFECYCLE_EVENTS = [
  { id: 1, date: '2023-11-15', product: 'Izito Pro Drone X', type: 'Sold', details: 'Order #ORD-2023-001 shipped to California', icon: ShoppingCart, color: 'text-green-700 bg-green-50 ring-green-600/20' },
  { id: 2, date: '2023-11-12', product: 'Smart Sensor Hub', type: 'Returned', details: 'Customer reported connectivity issues', icon: RefreshCcw, color: 'text-red-700 bg-red-50 ring-red-600/20' },
  { id: 3, date: '2023-10-28', product: 'Izito Watch Ultra', type: 'Replaced', details: 'Warranty replacement sent for Ticket #9921', icon: PackageCheck, color: 'text-orange-700 bg-orange-50 ring-orange-600/20' },
  { id: 4, date: '2023-09-05', product: 'Battery Pack 5000mAh', type: 'Expired', details: 'Batch #B-902 removed from inventory (Shelf Life)', icon: AlertOctagon, color: 'text-slate-700 bg-slate-50 ring-slate-600/20' },
  { id: 5, date: '2023-08-20', product: 'Izito Cam Lens Pro', type: 'Restock', details: 'Inbound shipment of 500 units received', icon: Archive, color: 'text-blue-700 bg-blue-50 ring-blue-600/20' },
  { id: 6, date: '2023-08-15', product: 'Mini Drone Lite', type: 'Sold', details: 'Bulk order #ORD-2023-882 for local school', icon: ShoppingCart, color: 'text-green-700 bg-green-50 ring-green-600/20' },
  { id: 7, date: '2023-07-30', product: 'Smart Home Hub', type: 'Returned', details: 'Item damaged during shipping', icon: RefreshCcw, color: 'text-red-700 bg-red-50 ring-red-600/20' },
];

export const AnalyticsView: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateReport = () => {
    setIsGenerating(true);

    // Simulate server processing delay
    setTimeout(() => {
      // CSV Helper to escape special characters
      const escapeCsv = (value: string | number) => {
        const str = String(value);
        if (str.includes(',') || str.includes('\n') || str.includes('"')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      const joinRow = (row: (string | number)[]) => row.map(escapeCsv).join(',');

      // SECTION 1: HEADER
      const reportHeader = [
        'IZITOBUY ANALYTICS REPORT',
        `Generated: ${new Date().toLocaleString()}`,
        '', // Empty Row
      ];

      // SECTION 2: KPIS
      const kpiSection = [
        'KEY PERFORMANCE INDICATORS',
        ['Metric', 'Value', 'Change', 'Trend'].join(','),
        ...KPIS.map(kpi => joinRow([kpi.label, kpi.value, kpi.change, kpi.trend])),
        ''
      ];
      
      // SECTION 3: MONTHLY DATA
      const monthlySection = [
        'REVENUE OVERVIEW (MONTHLY)',
        ['Month', 'Revenue Index'].join(','),
        ...MONTHLY_DATA.map(d => joinRow([d.month, d.value])),
        ''
      ];

      // SECTION 4: CATEGORY DATA
      const categorySection = [
        'SALES BY CATEGORY',
        ['Category', 'Percentage'].join(','),
        ...CATEGORY_DATA.map(c => joinRow([c.name, c.value + '%'])),
        ''
      ];

      // SECTION 5: EVENTS
      const eventSection = [
        'PRODUCT LIFECYCLE EVENTS',
        ['Date', 'Product', 'Event Type', 'Details'].join(','),
        ...LIFECYCLE_EVENTS.map(e => joinRow([e.date, e.product, e.type, e.details]))
      ];

      const csvContent = [
        ...reportHeader,
        ...kpiSection,
        ...monthlySection,
        ...categorySection,
        ...eventSection
      ].join('\n');

      // Add Byte Order Mark (BOM) \uFEFF so Excel recognizes it as UTF-8
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `izitobuy_analytics_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setIsGenerating(false);
    }, 1500);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Analytics Dashboard</h1>
          <p className="mt-2 text-sm text-slate-600">
            Real-time insights into your store performance and product lifecycle.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <select className="block w-full sm:w-auto rounded-md border-slate-300 py-2 pl-3 pr-10 text-base focus:border-fox-500 focus:outline-none focus:ring-fox-500 sm:text-sm border shadow-sm bg-white">
            <option>Last 30 Days</option>
            <option>Last Quarter</option>
            <option>Year to Date</option>
            <option>All Time</option>
          </select>
          
          <button
            onClick={handleGenerateReport}
            disabled={isGenerating}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-fox-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-fox-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fox-600 disabled:opacity-70 disabled:cursor-not-allowed transition-all min-w-[160px]"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4" />
                Generate Report
              </>
            )}
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {KPIS.map((kpi) => (
          <div key={kpi.label} className="bg-white overflow-hidden rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-5">
              <div className="flex items-center">
                <div className={`flex-shrink-0 rounded-md p-3 ${kpi.color}`}>
                  <kpi.icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="truncate text-sm font-medium text-slate-500">{kpi.label}</dt>
                    <dd>
                      <div className="text-2xl font-bold text-slate-900">{kpi.value}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 px-5 py-3">
              <div className="text-sm">
                <div className={`font-medium inline-flex items-center ${kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  {kpi.trend === 'up' ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                  {kpi.change}
                </div>
                <span className="text-slate-500 ml-2">vs last month</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900">Revenue Overview</h3>
            <button className="text-sm text-fox-600 font-medium hover:text-fox-700 flex items-center">
              View Details <ArrowUpRight className="w-4 h-4 ml-1" />
            </button>
          </div>
          
          {/* Custom CSS Bar Chart */}
          <div className="h-64 flex items-end justify-between gap-2 sm:gap-4 mt-8">
            {MONTHLY_DATA.map((item) => (
              <div key={item.month} className="flex flex-col items-center group flex-1">
                <div className="w-full relative flex flex-col justify-end items-center h-full">
                   {/* Tooltip */}
                   <div className="absolute bottom-full mb-2 hidden group-hover:block z-10">
                     <div className="bg-slate-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                       ${item.value}k
                     </div>
                     <div className="w-2 h-2 bg-slate-800 rotate-45 absolute left-1/2 -translate-x-1/2 -bottom-1"></div>
                   </div>
                   {/* Bar */}
                   <div 
                    className="w-full bg-fox-100 rounded-t-sm hover:bg-fox-500 transition-all duration-300 relative overflow-hidden"
                    style={{ height: `${item.value}%` }}
                   >
                     <div className="absolute bottom-0 left-0 right-0 h-1 bg-fox-200/50"></div>
                   </div>
                </div>
                <span className="mt-3 text-xs text-slate-500 font-medium">{item.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Side Widgets */}
        <div className="space-y-8">
          {/* Categories */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Sales by Category</h3>
            <div className="space-y-4">
              {CATEGORY_DATA.map((cat) => (
                <div key={cat.name}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium text-slate-700">{cat.name}</span>
                    <span className="text-slate-500">{cat.value}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className={`h-2.5 rounded-full ${cat.color}`} 
                      style={{ width: `${cat.value}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System Health */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">System Health</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
                <span className="text-sm font-medium text-green-800">API Status</span>
                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                  Operational
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-sm font-medium text-slate-700">Last Backup</span>
                <span className="text-xs text-slate-500">2 hours ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Lifecycle Timeline */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50">
          <h3 className="text-lg font-bold text-slate-900">Product Lifecycle Events</h3>
          <p className="text-sm text-slate-500 mt-1">Recent activities including sales, returns, replacements, and inventory expiry.</p>
        </div>
        <ul role="list" className="divide-y divide-slate-200">
          {LIFECYCLE_EVENTS.map((event) => (
            <li key={event.id} className="px-6 py-4 hover:bg-slate-50 transition-colors">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <span className={`inline-flex items-center justify-center h-10 w-10 rounded-full ring-1 ring-inset ${event.color}`}>
                    <event.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {event.type}: {event.product}
                  </p>
                  <p className="text-sm text-slate-500 truncate">
                    {event.details}
                  </p>
                </div>
                <div className="inline-flex items-center text-sm text-slate-500 font-mono">
                  {event.date}
                </div>
              </div>
            </li>
          ))}
        </ul>
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 text-center">
           <button className="text-sm text-fox-600 font-medium hover:text-fox-700">View Full History</button>
        </div>
      </div>
    </div>
  );
};