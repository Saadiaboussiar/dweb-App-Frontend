// components/dashboard/TechnicianDashboard.tsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  useTheme,
  useMediaQuery,
  Alert,
} from "@mui/material";
import {
  TrendingUp,
  AccountBalanceWallet,
  EmojiEvents,
  CalendarMonth,
  TrendingDown,
  CheckCircle,
  Cancel,
  Assessment,
  Dashboard as DashboardIcon,
  People,
  Timeline,
} from "@mui/icons-material";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { tokens } from "../../shared-theme/theme";
import { useSelector } from "react-redux";
import { selectIsCollapsed } from "../../features/slices/layoutSlice";
import { usePointsData, type MonthlyData } from "../../hooks/usePointsData";
import api from "../../Interceptors/api";

// Types
interface InterventionStats {
  total: number;
  validated: number;
  rejected: number;
  pending: number;
  validationRate: number;
}

interface DashboardMetrics {
  points: number;
  bonus: number;
  interventions: number;
  validationRate: number;
  successRate: number;
  avgPointsPerIntervention: number;
}

// Helper function to get full month name in French
const getFullMonthName = (monthNumber: number) => {
  const months = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];
  return months[monthNumber - 1] || '';
};

// Helper function to get month abbreviation in French
const getMonthAbbreviation = (monthNumber: number) => {
  const months = [
    'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jui',
    'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'
  ];
  return months[monthNumber - 1] || '';
};

const TechnicianDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [selectedPeriod, setSelectedPeriod] = useState<"6m" | "12m">("12m");
  const [loadingStats, setLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [interventionStats, setInterventionStats] = useState<InterventionStats>({
    total: 0,
    validated: 0,
    rejected: 0,
    pending: 0,
    validationRate: 0,
  });
  const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetrics>({
    points: 0,
    bonus: 0,
    interventions: 0,
    validationRate: 0,
    successRate: 0,
    avgPointsPerIntervention: 0,
  });

  const isCollapsed = useSelector(selectIsCollapsed);
  const colors = tokens(theme.palette.mode);
  
  // Use the points data hook with ALL helper methods
  const { 
    monthlyData, 
    loading: pointsLoading, 
    error: pointsError, 
    refresh,
    getCurrentData,
    getTotalPoints,
    getTotalBonus,
    getTotalInterventions,
    getAveragePoints,
    getAverageBonus,
    getBestMonth,
    totalPoints,
    totalBonus,
    totalInterventions
  } = usePointsData();

  // Get current month data using the helper method
  const currentData = getCurrentData();
  const currentPoints = currentData?.totalPoints || 0;
  const currentBonus = currentData ? parseFloat(currentData.totalBonus || "0") : 0;
  const currentInterventions = currentData?.interventionsCount || 0;

  // Fetch intervention statistics
  useEffect(() => {
    const fetchInterventionStats = async () => {
      const techId = Number(sessionStorage.getItem("userId"));
      if (!techId) return;

      setLoadingStats(true);
      try {
        // Try to fetch from API
        const response = await api.get(`/intervention/statistics/${techId}`);
        
        setInterventionStats(response.data);
        setStatsError(null);
      } catch (error: any) {
        console.error('Error fetching intervention stats:', error);
        setStatsError('Failed to load intervention statistics');
        
        // Mock data for development
        const mockStats: InterventionStats = {
          total: totalInterventions || 42,
          validated: Math.round((totalInterventions || 42) * 0.85),
          rejected: Math.round((totalInterventions || 42) * 0.1),
          pending: Math.round((totalInterventions || 42) * 0.05),
          validationRate: 85,
        };
        setInterventionStats(mockStats);
      } finally {
        setLoadingStats(false);
      }
    };

    if (totalInterventions > 0 || !pointsLoading) {
      fetchInterventionStats();
    }
  }, [totalInterventions, pointsLoading]);

  // Calculate dashboard metrics
  useEffect(() => {
    if (monthlyData.length > 0 && interventionStats.total > 0) {
      const successRate = interventionStats.validated > 0 ? 
        (interventionStats.validated / interventionStats.total) * 100 : 0;
      
      const avgPointsPerIntervention = totalInterventions > 0 ? 
        totalPoints / totalInterventions : 0;

      setDashboardMetrics({
        points: currentPoints,
        bonus: currentBonus,
        interventions: currentInterventions,
        validationRate: interventionStats.validationRate,
        successRate: successRate,
        avgPointsPerIntervention: avgPointsPerIntervention,
      });
    }
  }, [monthlyData, interventionStats, currentPoints, currentBonus, currentInterventions, totalPoints, totalInterventions]);

  // Calculate month-over-month change for points
  const calculatePointsChange = (data: MonthlyData[]) => {
    if (data.length < 2) return 0;
    
    const sortedData = [...data].sort((a, b) => 
      new Date(a.monthYear).getTime() - new Date(b.monthYear).getTime()
    );
    
    const current = sortedData[sortedData.length - 1];
    const previous = sortedData[sortedData.length - 2];
    
    if (!current || !previous) return 0;
    
    return ((current.totalPoints - previous.totalPoints) / previous.totalPoints) * 100;
  };

  // Calculate month-over-month change for validation rate
  const calculateValidationRateChange = (): number => {
    if (monthlyData.length < 2 || !interventionStats.validationRate) return 0;
    
    // Simple mock calculation - in real app, you'd compare with previous month's validation rate
    return 5.2; // Mock 5.2% improvement
  };

  // Transform API data for chart
  const transformChartData = (data: MonthlyData[]) => {
    return data.map(item => {
      const date = new Date(item.monthYear);
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      
      return {
        month: getMonthAbbreviation(month),
        fullMonth: getFullMonthName(month),
        year,
        monthNumber: month,
        points: item.totalPoints,
        reward: parseFloat(item.totalBonus) || 0,
        interventions: item.interventionsCount || 0,
        rawData: item
      };
    }).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.monthNumber - b.monthNumber;
    });
  };

  const pointsChange = calculatePointsChange(monthlyData);
  const validationRateChange = calculateValidationRateChange();
  
  const chartTransformedData = transformChartData(monthlyData);
  const chartData = selectedPeriod === "6m" 
    ? chartTransformedData.slice(-6) 
    : chartTransformedData;

  // Data for intervention status pie chart
  const interventionStatusData = [
    { name: 'Validées', value: interventionStats.validated, color: colors.greenAccent[500] },
    { name: 'Rejetées', value: interventionStats.rejected, color: colors.redAccent[500] },
    { name: 'En attente', value: interventionStats.pending, color: '#ebc54aff' },
  ];

  // Data for performance metrics
  const performanceData = [
    { 
      label: 'Taux de Validation', 
      value: interventionStats.validationRate, 
      target: 90,
      unit: '%' 
    },
    { 
      label: 'Moy. Points/Mois', 
      value: getAveragePoints(), 
      target: 500,
      unit: ' pts' 
    },
    { 
      label: 'Moy. Bonus/Mois', 
      value: parseFloat(getAverageBonus()), 
      target: 200,
      unit: ' DH' 
    },
  ];

  const capitalizeFirstLetter = (s: string) => {
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  // Get current month name
  const getCurrentMonthName = () => {
    if (currentData?.monthYear) {
      const date = new Date(currentData.monthYear);
      const monthName = date.toLocaleString('fr-FR', { month: 'long' });
      return capitalizeFirstLetter(monthName);
    }
    return capitalizeFirstLetter(new Date().toLocaleString('fr-FR', { month: 'long' }));
  };

  // Define tooltip formatter functions
  const formatTooltipValue = (value: number, name: string) => {
    switch (name) {
      case "points":
        return [
          <span key="points" style={{ color: colors.blueAccent[500], fontWeight: "bold" }}>
            {value} points
          </span>,
          "Points"
        ];
      case "reward":
        return [
          <span key="reward" style={{ color: colors.greenAccent[500], fontWeight: "bold" }}>
            {value.toFixed(2)} DH
          </span>,
          "Récompense"
        ];
      case "interventions":
        return [
          <span key="interventions" style={{ color: colors.redAccent[500], fontWeight: "bold" }}>
            {value} interventions
          </span>,
          "Interventions"
        ];
      default:
        return [value, name];
    }
  };

  const formatTooltipLabel = (label: string, payload: readonly any[]) => {
    if (payload && payload.length > 0 && payload[0]?.payload) {
      const dataPoint = payload[0].payload;
      return (
        <div style={{ fontWeight: "bold", marginBottom: "5px", color: colors.blueAccent[500] }}>
          {dataPoint.fullMonth} {dataPoint.year}
        </div>
      );
    }
    return (
      <div style={{ fontWeight: "bold", marginBottom: "5px", color: colors.blueAccent[500] }}>
        Mois: {label}
      </div>
    );
  };

  // Loading state
  if (pointsLoading || loadingStats) {
    return (
      <Box
        sx={{
          p: isMobile ? 1 : 3,
          backgroundColor: colors.primary[500],
          minHeight: "100vh",
          width: {
            xs: "80%",
            sm: "90%",
            md: isCollapsed ? "85%" : "73%",
            lg: isCollapsed ? "90%" : "80%",
          },
          ml: {
            xs: "98px",
            sm: "85px",
            md: isCollapsed ? "120px" : "250px",
            lg: !isCollapsed ? "260px" : "120px",
          },
          mt: "30px",
          transition: "margin-left 0.3s ease",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Typography variant="h6" color="textSecondary">
          Chargement du tableau de bord...
        </Typography>
      </Box>
    );
  }

  // Error state
  if (pointsError || statsError) {
    return (
      <Box
        sx={{
          p: isMobile ? 1 : 3,
          backgroundColor: colors.primary[500],
          minHeight: "100vh",
          width: {
            xs: "80%",
            sm: "90%",
            md: isCollapsed ? "85%" : "73%",
            lg: isCollapsed ? "90%" : "80%",
          },
          ml: {
            xs: "98px",
            sm: "85px",
            md: isCollapsed ? "120px" : "250px",
            lg: !isCollapsed ? "260px" : "120px",
          },
          mt: "30px",
          transition: "margin-left 0.3s ease",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Alert severity="error" sx={{ maxWidth: 600 }}>
          <Typography variant="h6" gutterBottom>
            Erreur de chargement
          </Typography>
          <Typography>
            {pointsError || statsError}
          </Typography>
        </Alert>
      </Box>
    );
  }

  // No data state
  if (monthlyData.length === 0) {
    return (
      <Box
        sx={{
          p: isMobile ? 1 : 3,
          backgroundColor: colors.primary[500],
          minHeight: "100vh",
          width: {
            xs: "80%",
            sm: "90%",
            md: isCollapsed ? "85%" : "73%",
            lg: isCollapsed ? "90%" : "80%",
          },
          ml: {
            xs: "98px",
            sm: "85px",
            md: isCollapsed ? "120px" : "250px",
            lg: !isCollapsed ? "260px" : "120px",
          },
          mt: "30px",
          transition: "margin-left 0.3s ease",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Typography variant="h6" color="textSecondary">
          Aucune donnée disponible pour le tableau de bord.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: isMobile ? 1 : 3,
        backgroundColor: colors.primary[500],
        minHeight: "100vh",
        width: {
          xs: "80%",
          sm: "90%",
          md: isCollapsed ? "85%" : "73%",
          lg: isCollapsed ? "90%" : "80%",
        },
        ml: {
          xs: "98px",
          sm: "85px",
          md: isCollapsed ? "120px" : "250px",
          lg: !isCollapsed ? "260px" : "120px",
        },
        mt: "30px",
        transition: "margin-left 0.3s ease",
      }}
    >
      

      {/* Summary Cards */}
      <Box
        sx={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          flexWrap: "wrap",
          gap: 3,
          mb: 4,
        }}
      >
        {/* Current Month Points Card */}
        <Card
          elevation={3}
          sx={{
            borderRadius: 2,
            flex: isMobile ? "1" : "1 1 calc(25% - 24px)",
            minWidth: isMobile ? "100%" : "200px",
            bgcolor: colors.primary[400]
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <AccountBalanceWallet sx={{ mr: 1, color: colors.blueAccent[400] }} />
              <Typography variant="h6" color="textSecondary">
                Points du Mois
              </Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              {currentPoints.toLocaleString()}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              {pointsChange >= 0 ? (
                <TrendingUp color="success" sx={{ mr: 0.5 }} />
              ) : (
                <TrendingDown color="error" sx={{ mr: 0.5 }} />
              )}
              <Typography
                variant="body2"
                color={pointsChange >= 0 ? "success.main" : "error.main"}
                sx={{ fontWeight: 500 }}
              >
                {pointsChange >= 0 ? "+" : ""}
                {pointsChange.toFixed(1)}% vs mois précédent
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Monthly Bonus Card */}
        <Card
          elevation={3}
          sx={{
            borderRadius: 2,
            flex: isMobile ? "1" : "1 1 calc(25% - 24px)",
            minWidth: isMobile ? "100%" : "200px",
            bgcolor: colors.primary[400]
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <AccountBalanceWallet sx={{ mr: 1, color: '#ebc54aff' }} />
              <Typography variant="h6" color="textSecondary">
                Récompense Mensuelle
              </Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              {currentBonus.toFixed(2)} DH
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Basé sur {currentPoints.toLocaleString()} points
            </Typography>
          </CardContent>
        </Card>

        {/* Interventions Card */}
        <Card
          elevation={3}
          sx={{
            borderRadius: 2,
            flex: isMobile ? "1" : "1 1 calc(25% - 24px)",
            minWidth: isMobile ? "100%" : "200px",
            bgcolor: colors.primary[400]
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <People sx={{ mr: 1, color: colors.redAccent[400] }} />
              <Typography variant="h6" color="textSecondary">
                Interventions
              </Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              {currentInterventions}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {interventionStats.validated} validées • {interventionStats.rejected} rejetées
            </Typography>
          </CardContent>
        </Card>

        {/* Validation Rate Card */}
        <Card
          elevation={3}
          sx={{
            borderRadius: 2,
            flex: isMobile ? "1" : "1 1 calc(25% - 24px)",
            minWidth: isMobile ? "100%" : "200px",
            bgcolor: colors.primary[400]
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Assessment sx={{ mr: 1, color: colors.greenAccent[400] }} />
              <Typography variant="h6" color="textSecondary">
                Taux de Validation
              </Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              {interventionStats.validationRate.toFixed(1)}%
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              {validationRateChange >= 0 ? (
                <TrendingUp sx={{color:colors.greenAccent[400] ,  mr: 0.5 }}  />
              ) : (
                <TrendingDown color="error" sx={{ mr: 0.5 }} />
              )}
              <Typography
                variant="body2"
                color={validationRateChange >= 0 ?  colors.greenAccent[400] : "error.main"}
                sx={{ fontWeight: 500 }}
              >
                {validationRateChange >= 0 ? "+" : ""}
                {validationRateChange.toFixed(1)}% vs mois précédent
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Additional Stats Row */}
      <Box
        sx={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          flexWrap: "wrap",
          gap: 3,
          mb: 4,
        }}
      >
        {/* Total Points Card */}
        <Card
          elevation={2}
          sx={{
            borderRadius: 2,
            flex: isMobile ? "1" : "1 1 calc(33% - 24px)",
            minWidth: isMobile ? "100%" : "150px",
            bgcolor: colors.greenAccent[700]
          }}
        >
          <CardContent sx={{ p: 2 }}>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Points Totaux
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {getTotalPoints().toLocaleString()} points
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {getTotalInterventions()} interventions totales
            </Typography>
          </CardContent>
        </Card>

        {/* Average Performance Card */}
        <Card
          elevation={2}
          sx={{
            borderRadius: 2,
            flex: isMobile ? "1" : "1 1 calc(33% - 24px)",
            minWidth: isMobile ? "100%" : "150px",
            bgcolor: colors.greenAccent[700]
          }}
        >
          <CardContent sx={{ p: 2 }}>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Performance Moyenne
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {getAveragePoints().toLocaleString()} pts/mois
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {getAverageBonus()} DH bonus moyen
            </Typography>
          </CardContent>
        </Card>

        {/* Success Rate Card */}
        <Card
          elevation={2}
          sx={{
            borderRadius: 2,
            flex: isMobile ? "1" : "1 1 calc(33% - 24px)",
            minWidth: isMobile ? "100%" : "150px",
            bgcolor: colors.greenAccent[700]
          }}
        >
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <CheckCircle sx={{ mr: 1, fontSize: 16, color: colors.greenAccent[200] }} />
              <Typography variant="body2" color="textSecondary">
                Taux de Réussite
              </Typography>
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {dashboardMetrics.successRate.toFixed(1)}%
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {interventionStats.validated} sur {interventionStats.total} interventions
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Charts Section */}
      <Box
        sx={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          flexWrap: "wrap",
          gap: 3,
          mb: 4,
        }}
      >
        {/* Points & Interventions Trend Chart */}
        <Paper 
          elevation={3} 
          sx={{ 
            p: 3, 
            borderRadius: 2, 
            flex: isMobile ? "1" : "2",
            minWidth: isMobile ? "100%" : "400px",
            bgcolor: colors.primary[400] 
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Tendances des Points & Interventions ({selectedPeriod === "6m" ? "6 mois" : "12 mois"})
            </Typography>
            <Box>
              <button
                onClick={() => setSelectedPeriod("6m")}
                style={{
                  backgroundColor: selectedPeriod === "6m" ? colors.blueAccent[400] : "transparent",
                  color: selectedPeriod === "6m" ? "white" : colors.blueAccent[400],
                  border: `1px solid ${colors.blueAccent[400]}`,
                  padding: "6px 12px",
                  borderRadius: "4px 0 0 4px",
                  cursor: "pointer",
                  fontWeight: 500,
                }}
              >
                6M
              </button>
              <button
                onClick={() => setSelectedPeriod("12m")}
                style={{
                  backgroundColor: selectedPeriod === "12m" ? colors.blueAccent[400] : "transparent",
                  color: selectedPeriod === "12m" ? "white" : colors.blueAccent[400],
                  border: `1px solid ${colors.blueAccent[400]}`,
                  padding: "6px 12px",
                  borderRadius: "0 4px 4px 0",
                  cursor: "pointer",
                  fontWeight: 500,
                  borderLeft: "none",
                }}
              >
                12M
              </button>
            </Box>
          </Box>

          <Box sx={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.primary[300]} />
                <XAxis 
                  dataKey="month" 
                  tick={{ fill: colors.primary[200] }} 
                  interval={0}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  yAxisId="left"
                  tick={{ fill: colors.primary[200] }}
                  label={{ 
                    value: 'Points', 
                    angle: -90, 
                    position: 'insideLeft',
                    fill: colors.primary[200]
                  }}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right"
                  tick={{ fill: colors.primary[200] }}
                  label={{ 
                    value: 'Interventions', 
                    angle: 90, 
                    position: 'insideRight',
                    fill: colors.primary[200]
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    padding: "10px",
                  }}
                  formatter={formatTooltipValue}
                  labelFormatter={formatTooltipLabel}
                />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="points"
                  stroke={colors.blueAccent[400]}
                  strokeWidth={2}
                  dot={{ r: 4, fill: colors.blueAccent[500] }}
                  activeDot={{ r: 6, fill: colors.blueAccent[800] }}
                  name="Points"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="interventions"
                  stroke={'#ebc54aff'}
                  strokeWidth={2}
                  dot={{ r: 4, fill: '#ebc54aff' }}
                  activeDot={{ r: 6, fill: '#ebc54aff' }}
                  name="Interventions"
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </Paper>

        {/* Intervention Status Pie Chart */}
        <Paper 
          elevation={3} 
          sx={{ 
            p: 3, 
            borderRadius: 2, 
            flex: isMobile ? "1" : "1",
            minWidth: isMobile ? "100%" : "300px",
            bgcolor: colors.primary[400] 
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
            Statut des Interventions
          </Typography>
          
          <Box sx={{ height: 250, mb: 2 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={interventionStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {interventionStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${value} interventions`, 'Count']}
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    padding: "10px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "center", gap: 1, flexWrap: "wrap" }}>
            <Box sx={{ display: "flex", alignItems: "center", mr: 2 }}>
              <Box sx={{ width: 12, height: 12, backgroundColor: colors.greenAccent[500], mr: 1, borderRadius: 1 }} />
              <Typography variant="body2">{interventionStats.validated} Validées</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", mr: 2 }}>
              <Box sx={{ width: 12, height: 12, backgroundColor: colors.redAccent[500], mr: 1, borderRadius: 1 }} />
              <Typography variant="body2">{interventionStats.rejected} Rejetées</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Box sx={{ width: 12, height: 12, backgroundColor: '#ebc54aff', mr: 1, borderRadius: 1 }} />
              <Typography variant="body2">{interventionStats.pending} En attente</Typography>
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Performance Metrics Bar Chart */}
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2, mb: 4, bgcolor: colors.primary[400] }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
          Métriques de Performance vs Objectifs
        </Typography>
        
        <Box sx={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.primary[300]} />
              <XAxis 
                dataKey="label" 
                tick={{ fill: colors.primary[200] }}
                angle={isMobile ? -45 : 0}
                textAnchor={isMobile ? "end" : "middle"}
                height={isMobile ? 80 : 60}
              />
              <YAxis tick={{ fill: colors.primary[200] }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: colors.primary[400],
                  border: "1px solid #1b1b1bff",
                  borderRadius: "4px",
                  padding: "10px",
                }}
                formatter={(value: number, name: string, props: any) => {
                  const unit = props.payload.unit || '';
                  return [name === 'value' ? `${value}${unit}` : `${value}${unit}`, name === 'value' ? 'Actuel' : 'Cible'];
                }}
              />
              <Legend />
              <Bar 
                dataKey="value" 
                name="Valeur Actuelle" 
                fill={colors.blueAccent[400]} 
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="target" 
                name="Objectif" 
                fill={colors.greenAccent[400]} 
                radius={[4, 4, 0, 0]}
                opacity={0.6}
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Paper>

      {/* Validation Progress */}
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2, mb: 4, bgcolor: colors.primary[400] }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Progression du Taux de Validation
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <Typography variant="body2" color="textSecondary" sx={{ flexGrow: 1 }}>
            {interventionStats.validationRate.toFixed(1)}% / 100%
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            Objectif: 90%
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={interventionStats.validationRate}
          sx={{
            height: 10,
            borderRadius: 5,
            backgroundColor: theme.palette.grey[200],
            "& .MuiLinearProgress-bar": {
              borderRadius: 5,
              backgroundColor: interventionStats.validationRate >= 90 
                ? colors.greenAccent[400] 
                : interventionStats.validationRate >= 70 
                  ? '#ebc54aff'
                  : colors.redAccent[400],
            },
          }}
        />
        <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
          {interventionStats.validationRate >= 90 
            ? "Excellent travail! Vous avez dépassé l'objectif." 
            : interventionStats.validationRate >= 70 
              ? "Bien! Continue comme ça pour atteindre l'objectif de 90%." 
              : "Amélioration nécessaire. Ciblez plus d'interventions validées."}
        </Typography>
      </Paper>

      {/* Refresh button */}
      <Box sx={{ mt: 3, mr: isCollapsed ? 120 : 105 ,display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={() => refresh()}
          style={{
            backgroundColor: colors.blueAccent[500],
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: 500,
          }}
        >
          Rafraîchir les données
        </button>
      </Box>
    </Box>
  );
};

export default TechnicianDashboard;