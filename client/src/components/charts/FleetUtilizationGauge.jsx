import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const FleetUtilizationGauge = ({ utilization }) => {
  const data = [
    { name: 'Utilized', value: utilization },
    { name: 'Unutilized', value: 100 - utilization },
  ];
  
  const COLORS = ['#3B82F6', '#E5E7EB'];

  return (
    <div className="h-48 w-full flex flex-col items-center justify-center relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="100%"
            startAngle={180}
            endAngle={0}
            innerRadius={60}
            outerRadius={80}
            paddingAngle={0}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute bottom-0 text-3xl font-bold text-gray-800">
        {utilization}%
      </div>
    </div>
  );
};

export default FleetUtilizationGauge;
