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
} from "@mui/material";
import {
  TrendingUp,
  AccountBalanceWallet,
  EmojiEvents,
  CalendarMonth,
  TrendingDown,
} from "@mui/icons-material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { tokens } from "../../shared-theme/theme";
import { useSelector } from "react-redux";
import { selectIsCollapsed } from "../../features/slices/layoutSlice";
import useNotifications from "../../hooks/useNotifications/useNotifications";
import { usePointsData, type MonthlyData } from "../../hooks/usePointsData";

interface RewardTier {
  goal: number;
  description: string;
}

const rewardTiers: RewardTier[] = [
  { goal: 500, description: "Niveau Bronze" },
  { goal: 1000, description: "Niveau Argent" },
  { goal: 2000, description: "Niveau Or" },
  { goal: 3000, description: "Niveau Platine" },
];

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

const PointsDash = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [selectedPeriod, setSelectedPeriod] = useState<"6m" | "12m">("12m");

  const isCollapsed = useSelector(selectIsCollapsed);
  const colors = tokens(theme.palette.mode);
  const notifications = useNotifications();
  
  // Use the points data hook with ALL helper methods
  const { 
    monthlyData, 
    loading, 
    error, 
    refresh,
    getCurrentData,
    getDataForMonth,
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

  console.log("monthlyData: ",monthlyData)
  // Calculate month-over-month change
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

  // Transform API data for chart
  const transformChartData = (data: MonthlyData[]) => {
    return data.map(item => {
      const date = new Date(item.monthYear);
      const month = date.getMonth() + 1; // Convert to 1-indexed
      const year = date.getFullYear();
      
      return {
        month: getMonthAbbreviation(month),
        fullMonth: getFullMonthName(month),
        year,
        monthNumber: month,
        points: item.totalPoints,
        reward: parseFloat(item.totalBonus) || 0,
        rawData: item
      };
    }).sort((a, b) => {
      // Sort by year then month
      if (a.year !== b.year) return a.year - b.year;
      return a.monthNumber - b.monthNumber;
    });
  };

  // Get previous month data
  const getPreviousMonthData = (data: MonthlyData[]) => {
    if (data.length < 2) return null;
    
    const sortedData = [...data].sort((a, b) => 
      new Date(b.monthYear).getTime() - new Date(a.monthYear).getTime()
    );
    
    return sortedData[1] || null;
  };

  const pointsChange = calculatePointsChange(monthlyData);
  const previousMonthData = getPreviousMonthData(monthlyData);
  
  const nextGoal = rewardTiers.find((tier) => tier.goal > currentPoints) ||
    rewardTiers[rewardTiers.length - 1];
  const progressPercentage = Math.min(
    (currentPoints / nextGoal.goal) * 100,
    100
  );

  // Transform data for chart
  const chartTransformedData = transformChartData(monthlyData);
  const chartData = selectedPeriod === "6m" 
    ? chartTransformedData.slice(-6) 
    : chartTransformedData;

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

  // Define tooltip formatter functions outside of JSX
  const formatTooltipValue = (value: number, name: string) => {
    if (name === "points") {
      return [
        <span
          key="points"
          style={{
            color: colors.blueAccent[500],
            fontWeight: "bold",
          }}
        >
          {value} points
        </span>,
        "Points"
      ];
    } else if (name === "reward") {
      return [
        <span
          key="reward"
          style={{
            color: colors.greenAccent[500],
            fontWeight: "bold",
          }}
        >
          ${value.toFixed(2)}
        </span>,
        "Récompense"
      ];
    }
    return [value, name];
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
  if (loading) {
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
          Chargement des données de points...
        </Typography>
      </Box>
    );
  }

  // Error state
  if (error) {
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
        <Typography variant="h6" color="error">
          Erreur: {error}
        </Typography>
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
          Aucune donnée de points disponible.
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
          xs: "80%", // Mobile (0-599px): always full width
          sm: "90%", // Tablet (600-899px)
          md: isCollapsed ? "85%" : "73%",
          lg: isCollapsed ? "90%" : "80%", // Desktop (900px+)
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
      {/* Summary Cards - Using Flexbox instead of Grid */}
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
              <AccountBalanceWallet
                sx={{ mr: 1, color: colors.blueAccent[400] }}
              />
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

        {/* Monthly Reward Card */}
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
              <AccountBalanceWallet
                sx={{ mr: 1, color: colors.blueAccent[400] }}
              />
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

        {/* Total All-Time Points Card */}
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
              <TrendingUp sx={{ mr: 1, color: colors.blueAccent[400] }} />
              <Typography variant="h6" color="textSecondary">
                Points Totaux
              </Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              {getTotalPoints().toLocaleString()}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {getTotalInterventions()} interventions
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {getTotalBonus()}DH total bonus 
            </Typography>
          </CardContent>
        </Card>

        {/* Current Tier Card */}
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
              <EmojiEvents sx={{ mr: 1, color: colors.blueAccent[400] }} />
              <Typography variant="h6" color="textSecondary">
                Niveau Actuel
              </Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              {nextGoal.description.split(" ")[0]}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {nextGoal.description}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {progressPercentage.toFixed(0)}% complété
            </Typography>
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
        {/* Average Points Card */}
        <Card
          elevation={2}
          sx={{
            borderRadius: 2,
            flex: isMobile ? "1" : "1 1 calc(33% - 24px)",
            minWidth: isMobile ? "100%" : "150px",
            bgcolor: colors.primary[300]
          }}
        >
          <CardContent sx={{ p: 2 }}>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Moyenne Mensuelle
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {getAveragePoints().toLocaleString()} points
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {getAverageBonus()}DH bonus moyen
            </Typography>
          </CardContent>
        </Card>

        {/* Best Month Card */}
        <Card
          elevation={2}
          sx={{
            borderRadius: 2,
            flex: isMobile ? "1" : "1 1 calc(33% - 24px)",
            minWidth: isMobile ? "100%" : "150px",
            bgcolor: colors.primary[300]
          }}
        >
          <CardContent sx={{ p: 2 }}>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Meilleur Mois
            </Typography>
            {getBestMonth() && (
              <>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {getBestMonth()?.totalPoints.toLocaleString()} points
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {getBestMonth()?.monthYear ? 
                    new Date(getBestMonth()!.monthYear).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) 
                    : 'N/A'}
                </Typography>
              </>
            )}
          </CardContent>
        </Card>

        {/* Period Card */}
        <Card
          elevation={2}
          sx={{
            borderRadius: 2,
            flex: isMobile ? "1" : "1 1 calc(33% - 24px)",
            minWidth: isMobile ? "100%" : "150px",
            bgcolor: colors.primary[300]
          }}
        >
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <CalendarMonth sx={{ mr: 1, fontSize: 16, color: colors.blueAccent[400] }} />
              <Typography variant="body2" color="textSecondary">
                Période
              </Typography>
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {getCurrentMonthName()}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {currentData?.monthYear ? new Date(currentData.monthYear).getFullYear() : new Date().getFullYear()}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Progress to Next Goal */}
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2, mb: 4, bgcolor: colors.primary[400] }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Progression vers le prochain objectif: {nextGoal.description}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <Typography
            variant="body2"
            color="textSecondary"
            sx={{ flexGrow: 1 }}
          >
            {currentPoints.toLocaleString()} / {nextGoal.goal.toLocaleString()}{" "}
            points
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {progressPercentage.toFixed(0)}%
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={progressPercentage}
          sx={{
            height: 10,
            borderRadius: 5,
            backgroundColor: theme.palette.grey[200],
            "& .MuiLinearProgress-bar": {
              borderRadius: 5,
              backgroundColor: colors.blueAccent[400],
            },
          }}
        />
        {previousMonthData && (
          <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
            Le mois dernier: {previousMonthData.totalPoints.toLocaleString()} points (${parseFloat(previousMonthData.totalBonus || "0").toFixed(2)})
          </Typography>
        )}
      </Paper>

      {/* Points History Chart */}
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2, bgcolor: colors.primary[400] }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Historique des Points ({selectedPeriod === "6m" ? "6 mois" : "12 mois"})
          </Typography>
          <Box>
            <button
              onClick={() => setSelectedPeriod("6m")}
              style={{
                backgroundColor:
                  selectedPeriod === "6m"
                    ? colors.blueAccent[400]
                    : "transparent",
                color:
                  selectedPeriod === "6m" ? "white" : colors.blueAccent[400],
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
                backgroundColor:
                  selectedPeriod === "12m"
                    ? colors.blueAccent[400]
                    : "transparent",
                color:
                  selectedPeriod === "12m" ? "white" : colors.blueAccent[400],
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
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={colors.primary[300]}
              />
              <XAxis
                dataKey="month"
                tick={{ fill: colors.primary[200] }}
                interval={0}
                textAnchor="end"
                height={60}
              />
              <YAxis tick={{ fill: colors.primary[200] }} />

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
              <Line
                type="monotone"
                dataKey="points"
                stroke={colors.blueAccent[400]}
                strokeWidth={2}
                dot={{ r: 4, fill: colors.blueAccent[500] }}
                activeDot={{ r: 6, fill: colors.blueAccent[800] }}
              />
              {/* You can add another line for rewards if desired */}
              {/* <Line
                type="monotone"
                dataKey="reward"
                stroke={colors.greenAccent[400]}
                strokeWidth={2}
                dot={{ r: 4, fill: colors.greenAccent[500] }}
                activeDot={{ r: 6, fill: colors.greenAccent[800] }}
              /> */}
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </Paper>

      {/* Refresh button */}
      <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={() => refresh()}
          style={{
            backgroundColor: colors.blueAccent[400],
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

export default PointsDash;