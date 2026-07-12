import { getDashboardStats, getDashboardCharts } from '../services/dashboardService.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getStats = asyncHandler(async (req, res) => {
  const stats = await getDashboardStats();
  res.status(200).json(new ApiResponse(200, stats, 'Dashboard stats retrieved successfully'));
});

export const getCharts = asyncHandler(async (req, res) => {
  const charts = await getDashboardCharts();
  res.status(200).json(new ApiResponse(200, charts, 'Dashboard charts retrieved successfully'));
});
