import prisma from '../config/db.js';
import { Parser } from 'json2csv';
import PDFDocument from 'pdfkit';

export const getAnalytics = async () => {
  const currentYear = new Date().getFullYear();
  const startDate = new Date(`${currentYear}-01-01`);
  const endDate = new Date(`${currentYear}-12-31`);

  const [vehicles, trips, expenses, fuelExpenses] = await Promise.all([
    prisma.vehicle.findMany(),
    prisma.trip.findMany({ where: { date: { gte: startDate, lte: endDate } } }),
    prisma.expense.findMany({ where: { date: { gte: startDate, lte: endDate } } }),
    prisma.fuelExpense.findMany({ where: { date: { gte: startDate, lte: endDate } } }),
  ]);

  let totalRevenue = 0;
  let totalDistance = 0;
  trips.forEach((t) => {
    totalRevenue += t.revenue || 0;
    totalDistance += t.distance || 0;
  });

  let totalOperationalCost = 0;
  expenses.forEach((e) => {
    totalOperationalCost += e.amount || 0;
  });

  let totalFuelCost = 0;
  let totalFuelLiters = 0;
  fuelExpenses.forEach((f) => {
    totalFuelCost += f.amount || 0;
    totalFuelLiters += f.liters || 0;
  });

  totalOperationalCost += totalFuelCost;

  const vehicleROI = totalOperationalCost > 0 ? ((totalRevenue - totalOperationalCost) / totalOperationalCost) * 100 : 0;
  const fuelEfficiency = totalFuelLiters > 0 ? totalDistance / totalFuelLiters : 0;
  
  const activeVehicles = vehicles.filter(v => v.status === 'ACTIVE' || v.status === 'ON_TRIP').length;
  const fleetUtilization = vehicles.length > 0 ? (activeVehicles / vehicles.length) * 100 : 0;

  return {
    vehicleROI: Number(vehicleROI.toFixed(2)),
    fuelEfficiency: Number(fuelEfficiency.toFixed(2)),
    fleetUtilization: Number(fleetUtilization.toFixed(2)),
    operationalCost: Number(totalOperationalCost.toFixed(2)),
    totalRevenue: Number(totalRevenue.toFixed(2)),
  };
};

export const generateCsvExport = async () => {
  const expenses = await prisma.expense.findMany({
    include: {
      vehicle: { select: { registrationNumber: true } }
    },
    orderBy: { date: 'desc' }
  });

  const formattedData = expenses.map(e => ({
    Date: e.date.toISOString().split('T')[0],
    Vehicle: e.vehicle?.registrationNumber || 'N/A',
    Category: e.category,
    Amount: e.amount,
    Description: e.description
  }));

  const parser = new Parser();
  const csv = parser.parse(formattedData);
  return csv;
};

export const generatePdfExport = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      const expenses = await prisma.expense.findMany({
        include: { vehicle: { select: { registrationNumber: true } } },
        orderBy: { date: 'desc' },
        take: 100,
      });

      const doc = new PDFDocument({ margin: 30, size: 'A4' });
      const chunks = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      doc.fontSize(20).text('Financial Report', { align: 'center' });
      doc.moveDown();

      doc.fontSize(12);
      expenses.forEach((e) => {
        const dateStr = e.date.toISOString().split('T')[0];
        const vehicle = e.vehicle?.registrationNumber || 'N/A';
        doc.text(`${dateStr} | ${vehicle} | ${e.category} | $${e.amount}`);
      });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};
