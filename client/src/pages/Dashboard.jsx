import React, { useEffect, useState } from 'react';
import { Truck, Users, Activity, AlertTriangle, FileText, CheckCircle } from 'lucide-react';
import VehicleStatusDonut from '../components/charts/VehicleStatusDonut';
import MonthlyBarChart from '../components/charts/MonthlyBarChart';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, chartsRes] = await Promise.all([
          fetch('/api/dashboard/stats').then(res => res.json()),
          fetch('/api/dashboard/charts').then(res => res.json())
        ]);
        setStats(statsRes.data);
        setCharts(chartsRes.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading dashboard...</div>;
  }

  const KpiCard = ({ title, value, icon, color }) => (
    <div className="bg-white rounded-lg shadow p-6 flex items-center">
      <div className={`p-4 rounded-full ${color} text-white mr-4`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500 uppercase font-semibold">{title}</p>
        <h3 className="text-2xl font-bold text-gray-800">{value || 0}</h3>
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <KpiCard title="Active Vehicles" value={stats?.activeVehicles} icon={<Activity />} color="bg-green-500" />
        <KpiCard title="Available Vehicles" value={stats?.availableVehicles} icon={<CheckCircle />} color="bg-blue-500" />
        <KpiCard title="Maintenance" value={stats?.maintenanceVehicles} icon={<AlertTriangle />} color="bg-yellow-500" />
        <KpiCard title="Drivers On Duty" value={stats?.driversOnDuty} icon={<Users />} color="bg-purple-500" />
        <KpiCard title="Active Trips" value={stats?.activeTrips} icon={<Truck />} color="bg-indigo-500" />
        <KpiCard title="Pending Trips" value={stats?.pendingTrips} icon={<FileText />} color="bg-orange-500" />
      </div>

      {(stats?.reminders?.expiringLicenses?.length > 0 || stats?.reminders?.expiringDocuments?.length > 0) && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded shadow-sm">
          <h3 className="text-red-800 font-bold mb-2 flex items-center">
            <AlertTriangle className="mr-2" size={20} /> Action Required: Upcoming Expirations
          </h3>
          <ul className="list-disc ml-5 text-red-700 space-y-1">
            {stats.reminders.expiringLicenses.map(d => (
              <li key={d.id}>Driver <strong>{d.name}</strong>'s license expires on {new Date(d.licenseExpiry).toLocaleDateString()}</li>
            ))}
            {stats.reminders.expiringDocuments.map(v => (
              <li key={v.id}>Vehicle <strong>{v.registrationNumber}</strong>'s documents expire on {new Date(v.documentExpiry).toLocaleDateString()}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Vehicle Status</h3>
          <VehicleStatusDonut data={charts?.vehicleStatus || []} />
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Trips</h3>
          <MonthlyBarChart 
            data={charts?.monthlyTrips || []} 
            dataKey1="_count.id" 
            name1="Trips" 
            fill1="#3B82F6" 
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
