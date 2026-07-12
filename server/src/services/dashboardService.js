import prisma from '../config/db.js';

export const getDashboardStats = async () => {
  const [
    activeVehicles,
    availableVehicles,
    maintenanceVehicles,
    driversOnDuty,
    pendingTrips,
    activeTrips,
    expiringLicenses,
    expiringDocuments,
  ] = await Promise.all([
    prisma.vehicle.count({ where: { status: 'ACTIVE' } }),
    prisma.vehicle.count({ where: { status: 'AVAILABLE' } }),
    prisma.vehicle.count({ where: { status: 'MAINTENANCE' } }),
    prisma.driver.count({ where: { status: 'ON_DUTY' } }),
    prisma.trip.count({ where: { status: 'PENDING' } }),
    prisma.trip.count({ where: { status: 'ACTIVE' } }),
    prisma.driver.findMany({
      where: {
        licenseExpiry: {
          lte: new Date(new Date().setDate(new Date().getDate() + 30)),
        },
      },
      select: { id: true, name: true, licenseExpiry: true },
    }),
    prisma.vehicle.findMany({
      where: {
        documentExpiry: {
          lte: new Date(new Date().setDate(new Date().getDate() + 30)),
        },
      },
      select: { id: true, registrationNumber: true, documentExpiry: true },
    }),
  ]);

  return {
    activeVehicles,
    availableVehicles,
    maintenanceVehicles,
    driversOnDuty,
    pendingTrips,
    activeTrips,
    reminders: {
      expiringLicenses,
      expiringDocuments,
    },
  };
};

export const getDashboardCharts = async () => {
  const vehicleStatus = await prisma.vehicle.groupBy({
    by: ['status'],
    _count: {
      id: true,
    },
  });

  const currentYear = new Date().getFullYear();
  const startDate = new Date(`${currentYear}-01-01`);
  const endDate = new Date(`${currentYear}-12-31`);

  const [fuelData, expenseData, tripsData] = await Promise.all([
    prisma.fuelExpense.groupBy({
      by: ['month'],
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        amount: true,
        liters: true,
      },
    }),
    prisma.expense.groupBy({
      by: ['month'],
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        amount: true,
      },
    }),
    prisma.trip.groupBy({
      by: ['month'],
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: {
        id: true,
      },
    }),
  ]);

  return {
    vehicleStatus: vehicleStatus.map(v => ({
      name: v.status,
      value: v._count.id,
    })),
    fuelConsumption: fuelData,
    expenseAnalysis: expenseData,
    monthlyTrips: tripsData,
  };
};
