import { getAnalytics, generateCsvExport, generatePdfExport } from '../services/reportService.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getAnalyticsData = asyncHandler(async (req, res) => {
  const analytics = await getAnalytics();
  res.status(200).json(new ApiResponse(200, analytics, 'Analytics data retrieved successfully'));
});

export const exportCsv = asyncHandler(async (req, res) => {
  const csvData = await generateCsvExport();
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=report.csv');
  res.status(200).send(csvData);
});

export const exportPdf = asyncHandler(async (req, res) => {
  const pdfBuffer = await generatePdfExport();
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=report.pdf');
  res.status(200).send(pdfBuffer);
});
