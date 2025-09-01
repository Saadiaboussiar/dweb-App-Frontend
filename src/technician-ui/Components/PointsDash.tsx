import React, { useState } from "react";

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
import TrendingDownIcon from "@mui/icons-material/TrendingDown";

interface MonthlyData {
  month: string;
  points: number;
  reward: number;
}

interface RewardTier {
  goal: number;
  description: string;
}

const monthlyData: MonthlyData[] = [
  { month: "Jan", points: 1250, reward: 125 },
  { month: "Fév", points: 1350, reward: 135 },
  { month: "Mar", points: 1800, reward: 180 },
  { month: "Avr", points: 2200, reward: 220 },
  { month: "Mai", points: 1950, reward: 195 },
  { month: "Jui", points: 2400, reward: 240 },
  { month: "Juil", points: 2650, reward: 265 },
  { month: "Aoû", points: 3100, reward: 310 },
  { month: "Sep", points: 2850, reward: 285 },
  { month: "Oct", points: 3200, reward: 320 },
  { month: "Nov", points: 2950, reward: 295 },
  { month: "Déc", points: 3500, reward: 350 },
];

const getFullMonthName = (abbreviation: string) => {
  const monthMap: { [key: string]: string } = {
    'Jan': 'Janvier',
    'Fév': 'Février', 
    'Mar': 'Mars',
    'Avr': 'Avril',
    'Mai': 'Mai',
    'Jui': 'Juin',
    'Juil': 'Juillet',
    'Aoû': 'Août',
    'Sep': 'Septembre',
    'Oct': 'Octobre',
    'Nov': 'Novembre',
    'Déc': 'Décembre'
  };
  return monthMap[abbreviation] || abbreviation;
};

const rewardTiers: RewardTier[] = [
  { goal: 2000, description: "Niveau Bronze" },
  { goal: 3000, description: "Niveau Argent" },
  { goal: 4000, description: "Niveau Or" },
  { goal: 5000, description: "Niveau Platine" },
];

const PointsDash = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [selectedPeriod, setSelectedPeriod] = useState<"6m" | "12m">("12m");
  const isCollapsed = useSelector(selectIsCollapsed);
  const colors = tokens(theme.palette.mode);
  const notifications = useNotifications();

  const currentMonth = monthlyData[monthlyData.length - 2];
  const previousMonth = monthlyData[monthlyData.length - 3];

  const pointsChange =
    ((currentMonth.points - previousMonth.points) / previousMonth.points) * 100;

  const currentPoints = currentMonth.points;
  const nextGoal =
    rewardTiers.find((tier) => tier.goal > currentPoints) ||
    rewardTiers[rewardTiers.length - 1];
  const progressPercentage = Math.min(
    (currentPoints / nextGoal.goal) * 100,
    100
  );

  const chartData =
    selectedPeriod === "6m" ? monthlyData.slice(-6) : monthlyData;

  const capitalizeFirstLetter = (s: string) => {
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

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
        {/* Total Points Card */}
        <Card
          elevation={3}
          sx={{
            borderRadius: 2,
            flex: isMobile ? "1" : "1 1 calc(25% - 24px)",
            minWidth: isMobile ? "100%" : "200px",
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <AccountBalanceWallet
                sx={{ mr: 1, color: colors.blueAccent[400] }}
              />
              <Typography variant="h6" color="textSecondary">
                Points Totaux
              </Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              {currentMonth.points.toLocaleString()}
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
                {pointsChange.toFixed(1)}% par rapport au mois dernier
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
              ${currentMonth.reward.toLocaleString()}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Basé sur {currentMonth.points.toLocaleString()} points
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
          </CardContent>
        </Card>

        {/* Period Card */}
        <Card
          elevation={3}
          sx={{
            borderRadius: 2,
            flex: isMobile ? "1" : "1 1 calc(25% - 24px)",
            minWidth: isMobile ? "100%" : "200px",
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <CalendarMonth sx={{ mr: 1, color: colors.blueAccent[400] }} />
              <Typography variant="h6" color="textSecondary">
                Période
              </Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              {capitalizeFirstLetter(
                new Date().toLocaleString("fr-FR", { month: "long" })
              )}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {new Date().getFullYear()}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Progress to Next Goal */}
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2, mb: 4 }}>
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
      </Paper>

      {/* Points History Chart */}
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Historique des Points
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
                formatter={(value: number) => [
                  
                  <span
                    style={{
                      color: colors.blueAccent[500],
                      fontWeight: "bold",
                    }}
                  >
                    {value} points 
                  </span>,
                  
                ]}

                labelFormatter={(label: String) => (


                  <div style={{ fontWeight: "bold", marginBottom: "5px" ,color: colors.blueAccent[500],}}>
                    Mois: {getFullMonthName(String(label))}
                  </div>
                )}
              />
              <Line
                type="monotone"
                dataKey="points"
                stroke={colors.blueAccent[400]}
                strokeWidth={2}
                dot={{ r: 4, fill: colors.blueAccent[500] }}
                activeDot={{ r: 6, fill: colors.blueAccent[800] }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </Paper>
    </Box>
  );
};

export default PointsDash;
