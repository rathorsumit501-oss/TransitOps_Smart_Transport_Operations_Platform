import React, { useEffect, useState } from 'react';
import { Download, FileText, TrendingUp, Droplet, Percent, DollarSign } from 'lucide-react';
import FleetUtilizationGauge from '../components/charts/FleetUtilizationGauge';

const Reports = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/reports/analytics')
      .then(res => res.json())
      .then(data => {
        setAnalytics(data.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching analytics:', err);
        setLoading(false);
      });
  }, []);

  const handleExportCsv = () => {
    window.open('/api/reports/export/csv', '_blank');
  };

  const handleExportPdf = () => {
    window.open('/api/reports/export/pdf', '_blank');
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading reports...</div>;
  }

  const MetricCard = ({ title, value, unit, icon, color }) => (
    <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center justify-center text-center">
      <div className={`p-3 rounded-full ${color} text-white mb-3`}>
        {icon}
      </div>
      <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wide">{title}</h3>
      <p className="text-3xl font-bold text-gray-800 mt-2">
        {value} <span className="text-lg font-normal text-gray-500">{unit}</span>
      </p>
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Reports & Analytics</h1>
        <div className="flex space-x-3">
          <button 
            onClick={handleExportCsv}
            className="flex items-center bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded shadow-sm hover:bg-gray-50"
          >
            <Download size={18} className="mr-2" />
            Export CSV
          </button>
          <button 
            onClick={handleExportPdf}
            className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded shadow-sm hover:bg-indigo-700"
          >
            <FileText size={18} className="mr-2" />
            Export PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard 
          title="Vehicle ROI" 
          value={analytics?.vehicleROI || 0} 
          unit="%" 
          icon={<TrendingUp size={24} />} 
          color="bg-green-500" 
        />
        <MetricCard 
          title="Fuel Efficiency" 
          value={analytics?.fuelEfficiency || 0} 
          unit="km/L" 
          icon={<Droplet size={24} />} 
          color="bg-blue-500" 
        />
        <MetricCard 
          title="Operational Cost" 
          value={`$${analytics?.operationalCost || 0}`} 
          unit="" 
          icon={<DollarSign size={24} />} 
          color="bg-red-500" 
        />
        <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
          <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wide mb-2">Fleet Utilization</h3>
          <div className="w-full flex-1 flex items-center justify-center">
            <FleetUtilizationGauge utilization={analytics?.fleetUtilization || 0} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Financial Overview</h2>
        <div className="flex items-center space-x-8">
          <div>
            <p className="text-sm text-gray-500">Total Revenue</p>
            <p className="text-2xl font-bold text-green-600">${analytics?.totalRevenue || 0}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Costs</p>
            <p className="text-2xl font-bold text-red-600">${analytics?.operationalCost || 0}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Net Profit</p>
            <p className="text-2xl font-bold text-blue-600">
              ${(analytics?.totalRevenue || 0) - (analytics?.operationalCost || 0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
