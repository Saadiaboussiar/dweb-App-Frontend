// hooks/usePointsData.ts
import { useState, useEffect, useMemo } from 'react';
import { type TechnicianBonus } from '../data/technicianPoints';
import { useSelector } from 'react-redux';
import { selectTechnicianId } from '../features/slices/technicianAuthSlice';
import api from '../Interceptors/api';

export type MonthlyData = TechnicianBonus;

export const usePointsData = () => {
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const techId = useSelector(selectTechnicianId);

  console.log('📊 usePointsData - Initial state:', { techId, loading, error, dataCount: monthlyData.length });

  // Memoized calculations for better performance
  const { totalPoints, totalBonus, totalInterventions } = useMemo(() => {
    console.log('🧮 Calculating totals from monthlyData:', monthlyData);
    return monthlyData.reduce((totals, data) => ({
      totalPoints: totals.totalPoints + (data.totalPoints || 0),
      totalBonus: totals.totalBonus + parseFloat(data.totalBonus || '0'),
      totalInterventions: totals.totalInterventions + (data.interventionsCount || 0)
    }), { totalPoints: 0, totalBonus: 0, totalInterventions: 0 });
  }, [monthlyData]);

  // Updated fetchCurrentPointsData with better error handling
  const fetchCurrentData = async (techId: number): Promise<TechnicianBonus | null> => {
    console.log(`📡 fetchCurrentData called for techId: ${techId}`);
    try {
      const endpoint = `/technicianMonthlySummary/current/${techId}`;
      console.log(`🌐 Making API call to: ${endpoint}`);
      
      const response = await api.get(endpoint);
      console.log('✅ fetchCurrentData response:', response.data);
      
      return response.data;
      
    } catch (error: any) {
      console.error('❌ Error in fetchCurrentData:', {
        techId,
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      
      // If 404 or no data, return null instead of throwing
      if (error.response?.status === 404) {
        console.log('⚠️ No current data found (404)');
        return null;
      }
      
      throw error;
    }
  };

  // Updated fetchMonthPointsData with better error handling
  const fetchMonthData = async (month: number, year: number, techId: number): Promise<TechnicianBonus | null> => {
    console.log(`📡 fetchMonthData called: ${month}/${year}/${techId}`);
    try {
      const endpoint = `/technicianMonthlySummary/${month}/${year}/${techId}`;
      console.log(`🌐 Making API call to: ${endpoint}`);
      
      const response = await api.get(endpoint);
      console.log(`✅ fetchMonthData response for ${month}/${year}:`, response.data);
      
      return response.data;
    } catch (error: any) {
      console.warn(`⚠️ No data for ${month}/${year}:`, {
        status: error.response?.status,
        message: error.message,
      });
      
      // Return null for 404 or other errors (data might not exist for that month)
      return null;
    }
  };

  // Load current month data
  const loadCurrentData = async (): Promise<boolean> => {
    if (!techId) {
      console.log('⏭️ loadCurrentData: No techId, skipping');
      return false;
    }
    
    try {
      console.log('🔄 loadCurrentData: Starting...');
      const currentData = await fetchCurrentData(techId);
      
      if (!currentData) {
        console.log('ℹ️ No current data available');
        return false;
      }
      
      console.log('✅ Current data loaded successfully:', currentData);
      
      setMonthlyData(prev => {
        const existingIndex = prev.findIndex(item => 
          item.monthYear === currentData.monthYear
        );
        
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = currentData;
          console.log('📝 Updated existing month entry');
          return updated;
        } else {
          console.log('➕ Added new month entry to monthlyData');
          return [currentData, ...prev];
        }
      });
      
      setError(null);
      return true;
      
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to load current points data';
      console.error('❌ loadCurrentData error:', errorMsg, err);
      setError(errorMsg);
      return false;
    }
  };

  // Load historical data (last 6 months)
  const loadHistoricalData = async () => {
    if (!techId) {
      console.log('⏭️ loadHistoricalData: No techId, skipping');
      return;
    }
    
    console.log('🔄 loadHistoricalData: Starting...');
    
    try {
      const today = new Date();
      const promises = [];
      
      // Get data for last 6 months
      for (let i = 0; i < 6; i++) {
        const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        
        // Skip current month (already loaded)
        if (i === 0) continue;
        
        promises.push(fetchMonthData(month, year, techId));
      }
      
      console.log(`📦 Loading historical data: ${promises.length} months`);
      const results = await Promise.all(promises);
      
      // Filter out null results
      const validResults = results.filter((data): data is TechnicianBonus => data !== null);
      console.log(`✅ Historical data loaded: ${validResults.length} months found`);
      
      if (validResults.length > 0) {
        setMonthlyData(prev => {
          // Merge with existing data, avoiding duplicates
          const existingMonths = new Set(prev.map(item => item.monthYear));
          const newData = validResults.filter(data => !existingMonths.has(data.monthYear));
          
          if (newData.length > 0) {
            console.log(`➕ Adding ${newData.length} new historical months`);
            return [...prev, ...newData];
          }
          
          return prev;
        });
      }
      
    } catch (err) {
      console.error('⚠️ Error loading historical data:', err);
      // Don't set error for historical data - it's optional
    }
  };

  // Main data loading effect
  useEffect(() => {
    console.log('🎬 useEffect triggered, techId:', techId);
    
    const loadAllData = async () => {
      if (!techId) {
        console.log('⏭️ No techId, setting loading to false');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        console.log('🚀 Starting data loading sequence...');
        
        // Step 1: Load current month data
        const currentDataLoaded = await loadCurrentData();
        
        // Step 2: Only load historical data if we have current data
        if (currentDataLoaded) {
          console.log('📚 Loading historical data in background...');
          // Don't await this - let it run in background
          loadHistoricalData();
        } else {
          console.log('⏭️ Skipping historical data - no current data');
        }
        
      } catch (err) {
        console.error('💥 Error in loadAllData:', err);
        setError('Failed to load points data');
        
        // For development/testing, add mock data
        if (process.env.NODE_ENV === 'development') {
          console.log('🧪 Adding mock data for development');
          const mockData: TechnicianBonus = {
            id: 3,
            technicianId: techId,
            monthYear: "2025-12-01",
            totalPoints: 500,
            totalBonus: "200.00",
            interventionsCount: 1,
            lastUpdated: "2025-12-09T20:39:37.108711"
          };
          setMonthlyData([mockData]);
          setError(null);
        }
      } finally {
        console.log('🏁 Data loading complete, setting loading to false');
        setLoading(false);
      }
    };

    loadAllData();
  }, [techId]);

  // Helper function to get data for a specific month
  const getDataForMonth = (monthYear: string) => {
    return monthlyData.find(data => data.monthYear === monthYear);
  };

  // Get current month's data
  const getCurrentData = () => {
    if (monthlyData.length === 0) return null;
    
    // Try to find current month
    const currentMonth = new Date().toISOString().slice(0, 7) + '-01';
    const currentMonthData = monthlyData.find(data => 
      data.monthYear.startsWith(currentMonth.slice(0, 7))
    );
    
    // If no current month data, return the most recent
    return currentMonthData || monthlyData[0];
  };

  // Calculate total points across all months
  const getTotalPoints = (): number => {
    return totalPoints;
  };

  // Calculate total bonus across all months
  const getTotalBonus = (format: boolean = true): string | number => {
    return format ? totalBonus.toFixed(2) : totalBonus;
  };

  // Calculate total interventions across all months
  const getTotalInterventions = (): number => {
    return totalInterventions;
  };

  // Get average points per month
  const getAveragePoints = (): number => {
    if (monthlyData.length === 0) return 0;
    return Math.round(totalPoints / monthlyData.length);
  };

  // Get average bonus per month
  const getAverageBonus = (): string => {
    if (monthlyData.length === 0) return "0.00";
    return (totalBonus / monthlyData.length).toFixed(2);
  };

  // Get best month (highest points)
  const getBestMonth = (): MonthlyData | null => {
    if (monthlyData.length === 0) return null;
    return monthlyData.reduce((best, current) => 
      current.totalPoints > best.totalPoints ? current : best
    );
  };

  // Refresh data
  const refresh = async () => {
    if (!techId) {
      console.log('🔄 Refresh: No techId available');
      return;
    }
    
    console.log('🔄 Manual refresh triggered');
    try {
      setLoading(true);
      await loadCurrentData();
      // Historical data will be auto-loaded if current data exists
    } catch (err) {
      console.error('❌ Refresh error:', err);
      setError('Failed to refresh data');
    } finally {
      setLoading(false);
    }
  };

  console.log('📤 usePointsData return:', {
    monthlyDataCount: monthlyData.length,
    loading,
    error,
    hasCurrentData: !!getCurrentData(),
  });

  return { 
    monthlyData, 
    loading, 
    error, 
    refresh,
    getDataForMonth,
    getCurrentData,
    getTotalPoints,
    getTotalBonus,
    getTotalInterventions,
    getAveragePoints,
    getAverageBonus,
    getBestMonth,
    totalPoints,
    totalBonus: totalBonus.toFixed(2),
    totalInterventions
  };
};