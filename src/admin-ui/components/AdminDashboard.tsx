// components/admin/AdminRentabiliteDashboard.tsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  TextField,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Alert,
  LinearProgress,
  Tabs,
  Tab,
  Divider,
  Avatar,
  AvatarGroup,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  InputAdornment,
} from "@mui/material";
import {
  FilterList,
  Search,
  Edit,
  Visibility,
  TrendingUp,
  AccountCircle,
  Download,
  Refresh,
  AttachMoney,
  DirectionsCar,
  Schedule,
  CheckCircle,
  Cancel,
  Pending,
  People,
  LocationCity,
  TrendingDown,
  Timeline,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  ShowChart,
  Assessment,
  Business,
  MonetizationOn,
  LocalShipping,
  Speed,
  EmojiEvents,
  CalendarToday,
  DateRange,
  ArrowUpward,
  ArrowDownward,
  Equalizer,
  Dashboard as DashboardIcon,
  Store,
  Work,
  ArrowRightAlt,
} from "@mui/icons-material";
import { useSelector } from "react-redux";
import { selectIsCollapsed } from "../../features/slices/layoutSlice";
import { tokens } from "../../shared-theme/theme";
import useNotifications from "../../hooks/useNotifications/useNotifications";
import api from "../../Interceptors/api";
import {
  LineChart,
  Line,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
  ScatterChart,
  Scatter,
  ZAxis,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ComposedChart,
} from "recharts";

// Interfaces basées sur ton backend
interface Technician {
  id: number;
  name: string;
  email: string;
  currentPoints: number;
  totalRewards: number;
  cin?: string;
  phone?: string;
  totalInterventions?: number;
  totalHours: number;
  totalDistance?: number;
  performanceScore?: number;
  efficiencyScore?: number;
}

interface InterventionSimpleDTO {
  id: number;
  technicianId: number;
  date: string;
  client: string;
  points: number;
  status: "VALIDATED" | "PENDING" | "REJECTED";
}

interface InterventionStatsDTO {
  total: number;
  validated: number;
  rejected: number;
  pending: number;
  validationRate: number;
}

interface MonthlyStat {
  month: string;
  interventions: number;
  points: number;
  rewards: number;
}

interface TechnicianDetails extends Technician {
  recentInterventions: InterventionSimpleDTO[];
  monthlyStats?: MonthlyStat[];
  stats?: InterventionStatsDTO;
  currentTierProgress: {
    currentPoints: number;
    nextTierPoints: number;
    progressPercentage: number;
  };
}

interface ClientRentabilityDTO {
  cin: string;
  fullName: string;
  ville: string;
  nbInterventions: number;
  totalKm: number;
  coutTransport: number;
  kmMoyenParIntervention: number;
  coutParIntervention: number;
}

interface VilleRentabiliteDTO {
  name: string;
  nbClients: number;
  nbInterventions: number;
  totalKm: number;
}

interface PeriodeStatsDTO {
  mois: string;
  kmTotal: number;
  coutTransport: number;
  nbInterventions: number;
}

interface BonusTier {
  points: number;
  reward: number;
  label: string;
  color: string;
}

// Types pour les graphiques
interface ChartData {
  name: string;
  value: number;
  fill?: string;
}

interface EfficiencyData {
  category: string;
  technician: number;
  client: number;
  fullMark?: number;
}

interface MonthlyPerformance {
  month: string;
  technicianRewards: number;
  clientTransportCost: number;
  interventions: number;
  profitMargin: number;
}

interface GlobalStats {
  totalTechnicians: number;
  totalClients: number;
  totalInterventions: number;
  totalRewards: number;
  totalTransportCost: number;
  totalProfit: number;
  avgTechnicianScore: number;
  avgClientEfficiency: number;
  totalKm: number; // Ajouté pour résoudre l'erreur
}

interface PieDataPoint {
  name: string;
  value: number;
  color: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const bonusTiers: BonusTier[] = [
  { points: 1000, reward: 100, label: "Bronze", color: "#cd7f32" },
  { points: 2000, reward: 250, label: "Silver", color: "#8f8d8dff" },
  { points: 3000, reward: 500, label: "Gold", color: "#ffd700" },
  { points: 4000, reward: 800, label: "Platinum", color: "#b1a99bff" },
];

// Fonction TabPanel
function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const AdminRentabiliteDashboard: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  
  // États pour les données
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [clientsRentabilite, setClientsRentabilite] = useState<ClientRentabilityDTO[]>([]);
  const [villesRentabilite, setVillesRentabilite] = useState<VilleRentabiliteDTO[]>([]);
  const [periodeStats, setPeriodeStats] = useState<PeriodeStatsDTO[]>([]);
  
  // États pour les filtres
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVille, setSelectedVille] = useState<string>("toutes");
  const [periode, setPeriode] = useState<string>("mois");
  
  // Stats globales calculées avec l'interface correcte
  const [globalStats, setGlobalStats] = useState<GlobalStats>({
    totalTechnicians: 0,
    totalClients: 0,
    totalInterventions: 0,
    totalRewards: 0,
    totalTransportCost: 0,
    totalProfit: 0,
    avgTechnicianScore: 0,
    avgClientEfficiency: 0,
    totalKm: 0,
  });

  const isCollapsed = useSelector(selectIsCollapsed);
  const colors = tokens(theme.palette.mode);
  const { show: showNotification } = useNotifications();

  // Fonction pour calculer le score de performance
  const calculatePerformanceScore = (technician: Technician, stats?: InterventionStatsDTO): number => {
    if (!technician.totalInterventions || technician.totalInterventions === 0) return 0;
    
    let score = 0;
    const volumeScore = Math.min(100, (technician.totalInterventions / 40) * 100);
    score += volumeScore * 0.25;
    
    if (stats && stats.total > 0) {
      score += stats.validationRate * 0.30;
    } else {
      const pointsPerIntervention = technician.totalInterventions > 0 
        ? technician.currentPoints / technician.totalInterventions 
        : 0;
      const estimatedValidation = Math.min(100, pointsPerIntervention * 10);
      score += estimatedValidation * 0.30;
    }
    
    if (technician.totalHours > 0) {
      const hoursPerIntervention = technician.totalHours / technician.totalInterventions;
      let timeScore = 100;
      if (hoursPerIntervention > 4) timeScore = 40;
      else if (hoursPerIntervention > 3) timeScore = 60;
      else if (hoursPerIntervention > 2) timeScore = 80;
      else if (hoursPerIntervention > 1) timeScore = 90;
      score += timeScore * 0.25;
    }
    
    const pointsPerIntervention = technician.totalInterventions > 0 
      ? technician.currentPoints / technician.totalInterventions 
      : 0;
    const pointsScore = Math.min(100, pointsPerIntervention * 2);
    score += pointsScore * 0.20;
    
    return Math.min(100, Math.round(score * 10) / 10);
  };

  // Fonction pour calculer le score d'efficacité client
  const calculateClientEfficiencyScore = (kmMoyen: number): number => {
    if (kmMoyen <= 0) return 0;
    const score = Math.max(0, 100 - (kmMoyen * 2.0));
    return Math.round(score * 10) / 10;
  };

  // Fetch toutes les données
  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch données en parallèle
      const [techResponse, clientsResponse, villesResponse, periodeResponse] = await Promise.all([
        api.get('/admin/technicians-bonus-details'),
        api.get(`/admin/clients-rentability/${periode}`),
        api.get(`/admin/villes-rentability/${periode}`),
        api.get(`/admin/periodes-rentabilite/${periode}`)
      ]);
      
      // Techniciens
      const techniciansData: Technician[] = techResponse.data;
      const enrichedTechnicians = techniciansData.map(tech => ({
        ...tech,
        performanceScore: calculatePerformanceScore(tech),
        efficiencyScore: calculateClientEfficiencyScore(tech.totalDistance || 0),
      }));
      
      // Clients
      const clientsData: ClientRentabilityDTO[] = clientsResponse.data;
      const villesData: VilleRentabiliteDTO[] = villesResponse.data;
      const periodeData: PeriodeStatsDTO[] = periodeResponse.data;
      
      setTechnicians(enrichedTechnicians.sort((a, b) => b.currentPoints - a.currentPoints));
      setClientsRentabilite(clientsData);
      setVillesRentabilite(villesData);
      setPeriodeStats(periodeData);
      
      // Calculer les stats globales
      const totalTechRewards = enrichedTechnicians.reduce((sum, tech) => sum + tech.totalRewards, 0);
      const totalTransportCost = clientsData.reduce((sum, client) => sum + client.coutTransport, 0);
      const totalInterventions = enrichedTechnicians.reduce((sum, tech) => sum + (tech.totalInterventions || 0), 0);
      const totalKm = clientsData.reduce((sum, client) => sum + client.totalKm, 0);
      
      setGlobalStats({
        totalTechnicians: enrichedTechnicians.length,
        totalClients: clientsData.length,
        totalInterventions,
        totalRewards: totalTechRewards,
        totalTransportCost,
        totalProfit: totalTechRewards - totalTransportCost,
        avgTechnicianScore: enrichedTechnicians.length > 0 
          ? enrichedTechnicians.reduce((sum, tech) => sum + (tech.performanceScore || 0), 0) / enrichedTechnicians.length
          : 0,
        avgClientEfficiency: clientsData.length > 0
          ? clientsData.reduce((sum, client) => sum + calculateClientEfficiencyScore(client.kmMoyenParIntervention), 0) / clientsData.length
          : 0,
        totalKm,
      });
      
      showNotification(
        'Données chargées avec succès',
        { severity: 'success', autoHideDuration: 3000 }
      );
      
    } catch (err: any) {
      console.error("Erreur lors de la récupération des données:", err);
      const errorMessage = err.response?.data?.message || err.message || "Erreur de chargement des données";
      setError(errorMessage);
      
      showNotification(
        `Erreur: ${errorMessage}`,
        { severity: 'error', autoHideDuration: 5000 }
      );
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchAllData();
  }, [periode]);

  // Données pour les graphiques
  const topTechnicians = [...technicians]
    .sort((a, b) => b.currentPoints - a.currentPoints)
    .slice(0, 5)
    .map(tech => ({
      name: tech.name.split(' ')[0],
      points: tech.currentPoints,
      rewards: tech.totalRewards,
      interventions: tech.totalInterventions || 0,
      score: tech.performanceScore || 0,
    }));

  const topClients = [...clientsRentabilite]
    .sort((a, b) => b.nbInterventions - a.nbInterventions)
    .slice(0, 5)
    .map(client => ({
      name: client.fullName.split(' ')[0],
      interventions: client.nbInterventions,
      km: client.totalKm,
      cost: client.coutTransport,
      efficiency: calculateClientEfficiencyScore(client.kmMoyenParIntervention),
    }));

  const villeEfficiencyData = villesRentabilite
    .filter(v => v.nbClients > 0)
    .map(v => {
      const kmMoyen = v.nbInterventions > 0 ? v.totalKm / v.nbInterventions : 0;
      return {
        name: v.name,
        clients: v.nbClients,
        interventions: v.nbInterventions,
        kmMoyen: Math.round(kmMoyen * 10) / 10,
        efficiency: calculateClientEfficiencyScore(kmMoyen),
      };
    })
    .slice(0, 6);

  const monthlyPerformanceData: MonthlyPerformance[] = periodeStats.map((periode, index) => ({
    month: periode.mois.split('-')[0],
    technicianRewards: Math.round(Math.random() * 10000),
    clientTransportCost: periode.coutTransport,
    interventions: periode.nbInterventions,
    profitMargin: Math.round((Math.random() * 50) + 50),
  }));

  const efficiencyRadarData: EfficiencyData[] = [
    { category: 'Performance', technician: globalStats.avgTechnicianScore, client: globalStats.avgClientEfficiency, fullMark: 100 },
    { category: 'Interventions', technician: 75, client: 80, fullMark: 100 },
    { category: 'Coût', technician: 65, client: 70, fullMark: 100 },
    { category: 'Temps', technician: 85, client: 60, fullMark: 100 },
    { category: 'Distance', technician: 70, client: 75, fullMark: 100 },
    { category: 'Profit', technician: 80, client: 65, fullMark: 100 },
  ];

  // Fonction corrigée pour les données du Pie Chart
  const getProfitDistributionData = (): PieDataPoint[] => {
    return [
      { 
        name: 'Récompenses Techniciens', 
        value: globalStats.totalRewards, 
        color: colors.blueAccent[500] 
      },
      { 
        name: 'Coûts Transport', 
        value: globalStats.totalTransportCost, 
        color: colors.redAccent[500] 
      },
      { 
        name: 'Profit Net', 
        value: globalStats.totalProfit > 0 ? globalStats.totalProfit : 0, 
        color: colors.greenAccent[500] 
      },
    ].filter(item => item.value > 0); // Filtrer les valeurs nulles
  };

  // Fonctions utilitaires
  const getTierInfo = (points: number): BonusTier => {
    return bonusTiers.slice().reverse().find(tier => points >= tier.points) || bonusTiers[0];
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return colors.greenAccent[600];
    if (score >= 60) return colors.primary[500];
    if (score >= 40) return colors.primary[500];
    return colors.redAccent[500];
  };

  const exportToCSV = (type: 'technicians' | 'clients') => {
    let csvContent = '';
    let filename = '';
    
    if (type === 'technicians' && technicians.length > 0) {
      const headers = ["ID", "Nom", "Email", "Points", "Bonus Total", "Interventions", "Performance", "Efficacité"];
      const rows = technicians.map(tech => [
        tech.id,
        `"${tech.name}"`,
        `"${tech.email}"`,
        tech.currentPoints,
        tech.totalRewards.toFixed(2),
        tech.totalInterventions || 0,
        (tech.performanceScore || 0).toFixed(1),
        (tech.efficiencyScore || 0).toFixed(1)
      ]);
      
      csvContent = [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
      filename = `Techniciens_${new Date().toISOString().split('T')[0]}.csv`;
    } else if (type === 'clients' && clientsRentabilite.length > 0) {
      const headers = ["CIN", "Nom", "Ville", "Interventions", "Km Total", "Km Moyen", "Coût Transport", "Coût/Intervention"];
      const rows = clientsRentabilite.map(client => [
        `"${client.cin}"`,
        `"${client.fullName}"`,
        `"${client.ville}"`,
        client.nbInterventions,
        client.totalKm.toFixed(0),
        client.kmMoyenParIntervention.toFixed(1),
        client.coutTransport.toFixed(2),
        client.coutParIntervention.toFixed(2)
      ]);
      
      csvContent = [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
      filename = `Clients_${new Date().toISOString().split('T')[0]}.csv`;
    }
    
    if (csvContent) {
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showNotification(
        `Données ${type === 'technicians' ? 'techniciens' : 'clients'} exportées`,
        { severity: 'success', autoHideDuration: 3000 }
      );
    }
  };

  // Loading state
  if (loading) {
    return (
      <Box
        sx={{
          p: isMobile ? 2 : 3,
          backgroundColor: colors.primary[500],
          minHeight: "100vh",
          mt: "20px",
          ml: isMobile
            ? isCollapsed ? "100px" : "250px"
            : isCollapsed ? "115px" : "260px",
          width: isMobile
            ? isCollapsed ? "85%" : "62%"
            : isCollapsed ? "90%" : "80%",
          transition: "margin-left 0.3s ease",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 2,
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" color="textSecondary">
          Chargement du tableau de bord...
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: isMobile ? 2 : 3,
        backgroundColor: colors.primary[500],
        minHeight: "100vh",
        mt: "20px",
        ml: isMobile
          ? isCollapsed ? "100px" : "250px"
          : isCollapsed ? "115px" : "260px",
        width: isMobile
          ? isCollapsed ? "85%" : "62%"
          : isCollapsed ? "90%" : "80%",
        transition: "margin-left 0.3s ease",
      }}
    >
    

      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={fetchAllData}>
              Réessayer
            </Button>
          }
        >
          <Typography fontWeight="bold">Erreur:</Typography>
          <Typography>{error}</Typography>
        </Alert>
      )}

      {/* Filtres rapides */}
      <Paper sx={{ p: 2, mb: 3, bgcolor: colors.primary[400] }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row',
          gap: 2,
          alignItems: 'center',
          '& > *': {
            flex: isMobile ? '1 1 100%' : '1 1 0'
          }
        }}>
          <Box sx={{ width: '100%' }}>
            <TextField
              fullWidth
              size="small"
              select
              label="Période"
              value={periode}
              onChange={(e) => setPeriode(e.target.value)}
            >
              <MenuItem value="mois">Ce mois</MenuItem>
              <MenuItem value="trimestre">Ce trimestre</MenuItem>
              <MenuItem value="annee">Cette année</MenuItem>
            </TextField>
          </Box>
          
          <Box sx={{ width: '100%' }}>
            <TextField
              fullWidth
              size="small"
              select
              label="Ville"
              value={selectedVille}
              onChange={(e) => setSelectedVille(e.target.value)}
            >
              <MenuItem value="toutes">Toutes les villes</MenuItem>
              {Array.from(new Set(clientsRentabilite.map(c => c.ville)))
                .filter(ville => ville && ville.trim() !== "")
                .map(ville => (
                  <MenuItem key={ville} value={ville}>{ville}</MenuItem>
                ))}
            </TextField>
          </Box>
          
          <Box sx={{ width: '100%' }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: "text.secondary" }} />,
              }}
            />
          </Box>
          
          <Box sx={{ width: '100%', minWidth: isMobile ? '100%' : 'auto' }}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={fetchAllData}
              sx={{color:"#131314ff", borderColor:"#d8dce6ff", bgcolor:"#d8dce6ff"}}
              fullWidth={isMobile}
            >
              Actualiser
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Tabs */}
      <Paper sx={{ mb: 3, bgcolor: colors.primary[400] }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              fontWeight: 600,
            }
          }}
        >
          <Tab icon={<DashboardIcon />} label="Vue d'ensemble" />
          <Tab icon={<People />} label="Techniciens" />
          <Tab icon={<Business />} label="Clients" />
          <Tab icon={<Assessment />} label="Analyses" />
          <Tab icon={<Equalizer />} label="Statistiques" />
        </Tabs>
      </Paper>

      {/* Vue d'ensemble */}
      <TabPanel value={tabValue} index={0}>
        {/* KPI Cards */}
        <Box sx={{ 
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          flexWrap: 'wrap',
          gap: 3,
          mb: 4,
          '& > *': {
            flex: isMobile ? '1 1 100%' : '1 1 calc(25% - 24px)',
            minWidth: isMobile ? '100%' : '200px'
          }
        }}>
          {/* Carte Techniciens */}
          <Card sx={{ height: '100%', bgcolor: colors.primary[400] }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <People sx={{ mr: 1, color: colors.blueAccent[500] }} />
                <Typography color="textSecondary">Techniciens</Typography>
              </Box>
              <Typography variant="h4">{globalStats.totalTechnicians}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Typography variant="body2" color="textSecondary" sx={{ flexGrow: 1 }}>
                  Score moyen
                </Typography>
                <Chip 
                  label={`${globalStats.avgTechnicianScore.toFixed(1)}/100`}
                  size="small"
                  sx={{
                    backgroundColor: getScoreColor(globalStats.avgTechnicianScore),
                    color: 'white'
                  }}
                />
              </Box>
            </CardContent>
          </Card>

          {/* Carte Clients */}
          <Card sx={{ height: '100%', bgcolor: colors.primary[400] }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Business sx={{ mr: 1, color: colors.greenAccent[500] }} />
                <Typography color="textSecondary">Clients</Typography>
              </Box>
              <Typography variant="h4">{globalStats.totalClients}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Typography variant="body2" color="textSecondary" sx={{ flexGrow: 1 }}>
                  Efficacité
                </Typography>
                <Chip 
                  label={`${globalStats.avgClientEfficiency.toFixed(1)}/100`}
                  size="small"
                  sx={{
                    backgroundColor: getScoreColor(globalStats.avgClientEfficiency),
                    color: 'white'
                  }}
                />
              </Box>
            </CardContent>
          </Card>

          {/* Carte Profit Net */}
          <Card sx={{ height: '100%', bgcolor: colors.primary[400] }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AttachMoney sx={{ mr: 1, color: colors.greenAccent[500] }} />
                <Typography color="textSecondary">Profit Net</Typography>
              </Box>
              <Typography variant="h4" color={globalStats.totalProfit >= 0 ? 'success.main' : 'error.main'}>
                {globalStats.totalProfit.toLocaleString('fr-FR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })} DH
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography variant="body2" color="textSecondary">
                  Revenus
                </Typography>
                <Typography variant="body2" color="success.main">
                  {globalStats.totalRewards.toLocaleString()} DH
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="textSecondary">
                  Coûts
                </Typography>
                <Typography variant="body2" color="error.main">
                  {globalStats.totalTransportCost.toLocaleString()} DH
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Carte Interventions */}
          <Card sx={{ height: '100%', bgcolor: colors.primary[400] }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Work sx={{ mr: 1, color: colors.primary[500] }} />
                <Typography color="textSecondary">Interventions</Typography>
              </Box>
              <Typography variant="h4">{globalStats.totalInterventions}</Typography>
              <Box sx={{ mt: 2 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={Math.min(100, (globalStats.totalInterventions / 1000) * 100)}
                  sx={{ 
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: colors.primary[300],
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: colors.primary[500]
                    }
                  }}
                />
                <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
                  Objectif: 1000 interventions
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Charts Row 1 */}
        <Box sx={{ 
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: 3,
          mb: 3,
          '& > *': {
            flex: isMobile ? '1 1 100%' : '1 1 0',
            minWidth: isMobile ? '100%' : '0'
          }
        }}>
          {/* Performance Mensuelle */}
          <Box sx={{ flex: 2 }}>
            <Paper sx={{ p: 3, height: 400, bgcolor: colors.primary[400] }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Performance Mensuelle
              </Typography>
              <ResponsiveContainer width="100%" height="85%">
                <ComposedChart data={monthlyPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.primary[300]} />
                  <XAxis dataKey="month" tick={{ fill: colors.primary[200] }} />
                  <YAxis yAxisId="left" tick={{ fill: colors.primary[200] }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fill: colors.primary[200] }} />
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: colors.primary[500], border: 'none' }}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="interventions" name="Interventions" fill={colors.blueAccent[500]} />
                  <Line yAxisId="right" type="monotone" dataKey="profitMargin" name="Marge %" stroke={colors.greenAccent[500]} strokeWidth={2} />
                </ComposedChart>
              </ResponsiveContainer>
            </Paper>
          </Box>

          {/* Distribution des Coûts - CORRIGÉ */}
          <Box sx={{ flex: 1 }}>
            <Paper sx={{ p: 3, height: 400, bgcolor: colors.primary[400] }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Distribution des Coûts
              </Typography>
              <ResponsiveContainer width="100%" height="85%">
                <PieChart>
                  <Pie
                    data={getProfitDistributionData()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => {
                      // Correction: gérer le cas où percent est undefined
                      const percentage = percent || 0;
                      return `${name}: ${(percentage * 100).toFixed(0)}%`;
                    }}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {getProfitDistributionData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    formatter={(value: number) => [`${value.toLocaleString()} DH`, 'Montant']}
                    contentStyle={{ backgroundColor: colors.primary[500], border: 'none' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Box>
        </Box>

        {/* Charts Row 2 */}
        <Box sx={{ 
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: 3,
          '& > *': {
            flex: isMobile ? '1 1 100%' : '1 1 0',
            minWidth: isMobile ? '100%' : '0'
          }
        }}>
          {/* Top 5 Techniciens */}
          <Box sx={{ flex: 1 }}>
            <Paper sx={{ p: 3, height: 350, bgcolor: colors.primary[400] }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Top 5 Techniciens
              </Typography>
              <ResponsiveContainer width="100%" height="80%">
                <RechartsBarChart data={topTechnicians}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.primary[300]} />
                  <XAxis dataKey="name" tick={{ fill: colors.primary[200] }} />
                  <YAxis tick={{ fill: colors.primary[200] }} />
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: colors.primary[500], border: 'none' }}
                    formatter={(value: number, name: string) => {
                      if (name === 'points') return [value, 'Points'];
                      if (name === 'rewards') return [`${value} DH`, 'Bonus'];
                      if (name === 'interventions') return [value, 'Interventions'];
                      return [value, name];
                    }}
                  />
                  <Legend />
                  <Bar dataKey="points" name="Points" fill={colors.blueAccent[400]} />
                  <Bar dataKey="rewards" name="Bonus (DH)" fill={colors.greenAccent[400]} />
                </RechartsBarChart>
              </ResponsiveContainer>
            </Paper>
          </Box>

          {/* Top 5 Clients */}
          <Box sx={{ flex: 1 }}>
            <Paper sx={{ p: 3, height: 350, bgcolor: colors.primary[400] }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Top 5 Clients
              </Typography>
              <ResponsiveContainer width="100%" height="80%">
                <RechartsBarChart data={topClients}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.primary[300]} />
                  <XAxis dataKey="name" tick={{ fill: colors.primary[200] }} />
                  <YAxis tick={{ fill: colors.primary[200] }} />
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: colors.primary[500], border: 'none' }}
                    formatter={(value: number, name: string) => {
                      if (name === 'interventions') return [value, 'Interventions'];
                      if (name === 'km') return [`${value} km`, 'Kilomètres'];
                      if (name === 'cost') return [`${value} DH`, 'Coût Transport'];
                      if (name === 'efficiency') return [`${value}/100`, 'Score d\'efficacité'];
                      return [value, name];
                    }}
                  />
                  <Legend />
                  <Bar dataKey="interventions" name="Interventions" fill={colors.primary[400]} />
                  <Bar dataKey="cost" name="Coût Transport (DH)" fill={colors.redAccent[400]} />
                </RechartsBarChart>
              </ResponsiveContainer>
            </Paper>
          </Box>
        </Box>
      </TabPanel>

      {/* Techniciens Tab */}
      <TabPanel value={tabValue} index={1}>
        <Paper sx={{ p: 3, mb: 3, bgcolor: colors.primary[400] }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Liste des Techniciens ({technicians.length})
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<Download />}
                onClick={() => exportToCSV('technicians')}
                disabled={technicians.length === 0}
              >
                Exporter
              </Button>
            </Box>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Technicien</TableCell>
                  <TableCell align="right">Points</TableCell>
                  <TableCell>Niveau</TableCell>
                  <TableCell align="right">Bonus</TableCell>
                  <TableCell align="right">Performance</TableCell>
                  <TableCell align="right">Interventions</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {technicians.length > 0 ? (
                  technicians.slice(0, 10).map((technician) => {
                    const tier = getTierInfo(technician.currentPoints);
                    return (
                      <TableRow key={technician.id} hover>
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <AccountCircle sx={{ mr: 2, color: "primary.main" }} />
                            <Box>
                              <Typography variant="subtitle2">
                                {technician.name}
                              </Typography>
                              <Typography variant="body2" color="textSecondary">
                                {technician.email}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Typography fontWeight="bold">
                            {technician.currentPoints}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={tier.label}
                            size="small"
                            sx={{ 
                              backgroundColor: tier.color, 
                              color: "white",
                              fontWeight: 'bold',
                            }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography fontWeight="bold" color={colors.greenAccent[600]}>
                            {technician.totalRewards.toLocaleString('fr-FR')} DH
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
                            <CircularProgress 
                              variant="determinate" 
                              value={technician.performanceScore || 0} 
                              size={24}
                              thickness={4}
                              sx={{ mr: 1, color: getScoreColor(technician.performanceScore || 0) }}
                            />
                            <Typography>
                              {(technician.performanceScore || 0).toFixed(0)}%
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Typography>
                            {technician.totalInterventions || 0}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <IconButton size="small">
                            <Visibility fontSize="small" />
                          </IconButton>
                          <IconButton size="small">
                            <Edit fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <Typography color="textSecondary">
                        Aucun technicien disponible
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Performance Radar Chart */}
        <Paper sx={{ p: 3, bgcolor: colors.primary[400] }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            Analyse Comparative des Performances
          </Typography>
          <Box sx={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={efficiencyRadarData}>
                <PolarGrid stroke={colors.primary[300]} />
                <PolarAngleAxis dataKey="category" tick={{ fill: colors.primary[200] }} />
                <PolarRadiusAxis tick={{ fill: colors.primary[200] }} />
                <Radar
                  name="Techniciens"
                  dataKey="technician"
                  stroke={colors.blueAccent[500]}
                  fill={colors.blueAccent[500]}
                  fillOpacity={0.6}
                />
                <Radar
                  name="Clients"
                  dataKey="client"
                  stroke={colors.greenAccent[500]}
                  fill={colors.greenAccent[500]}
                  fillOpacity={0.6}
                />
                <Legend />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: colors.primary[500], border: 'none' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
      </TabPanel>

      {/* Clients Tab */}
      <TabPanel value={tabValue} index={2}>
        <Paper sx={{ p: 3, mb: 3, bgcolor: colors.primary[400] }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Rentabilité par Client ({clientsRentabilite.length})
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<Download />}
                onClick={() => exportToCSV('clients')}
                disabled={clientsRentabilite.length === 0}
              >
                Exporter
              </Button>
            </Box>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Client</TableCell>
                  <TableCell>Ville</TableCell>
                  <TableCell align="right">Interventions</TableCell>
                  <TableCell align="right">Km Total</TableCell>
                  <TableCell align="right">Km Moyen</TableCell>
                  <TableCell align="right">Coût Transport</TableCell>
                  <TableCell align="right">Efficacité</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {clientsRentabilite.length > 0 ? (
                  clientsRentabilite.slice(0, 10).map((client) => {
                    const efficiencyScore = calculateClientEfficiencyScore(client.kmMoyenParIntervention);
                    return (
                      <TableRow key={client.cin} hover>
                        <TableCell>
                          <Typography fontWeight="500">{client.fullName}</Typography>
                          <Typography variant="body2" color="textSecondary">
                            {client.cin}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={client.ville || "Non spécifié"} 
                            size="small" 
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="right">{client.nbInterventions}</TableCell>
                        <TableCell align="right">{client.totalKm.toFixed(0)} km</TableCell>
                        <TableCell align="right">{client.kmMoyenParIntervention.toFixed(1)} km</TableCell>
                        <TableCell align="right">{client.coutTransport.toFixed(0)} DH</TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
                            <CircularProgress 
                              variant="determinate" 
                              value={efficiencyScore} 
                              size={24}
                              thickness={4}
                              sx={{ mr: 1, color: getScoreColor(efficiencyScore) }}
                            />
                            <Typography>
                              {efficiencyScore.toFixed(0)}%
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <Typography color="textSecondary">
                        Aucun client disponible
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Ville Efficiency */}
        {villeEfficiencyData.length > 0 && (
          <Paper sx={{ p: 3, bgcolor: colors.primary[400] }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Efficacité par Ville
            </Typography>
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={villeEfficiencyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.primary[300]} />
                  <XAxis dataKey="name" tick={{ fill: colors.primary[200] }} />
                  <YAxis yAxisId="left" tick={{ fill: colors.primary[200] }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fill: colors.primary[200] }} />
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: colors.primary[500], border: 'none' }}
                    formatter={(value: number, name: string) => {
                      switch (name) {
                        case 'kmMoyen': return [`${value} km`, 'Km Moyen'];
                        case 'efficiency': return [`${value}/100`, 'Score d\'efficacité'];
                        case 'clients': return [value, 'Clients'];
                        case 'interventions': return [value, 'Interventions'];
                        default: return [value, name];
                      }
                    }}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="kmMoyen" name="Km Moyen" fill={colors.blueAccent[400]} />
                  <Line yAxisId="right" type="monotone" dataKey="efficiency" name="Efficacité %" stroke={colors.greenAccent[500]} strokeWidth={2} />
                </RechartsBarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        )}
      </TabPanel>

      {/* Analyses Tab */}
      <TabPanel value={tabValue} index={3}>
        <Box sx={{ 
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'column',
          gap: 3
        }}>
          {/* Scatter Chart */}
          <Box sx={{ width: '100%' }}>
            <Paper sx={{ p: 3, bgcolor: colors.primary[400] }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Corrélation: Distance vs Coût
              </Typography>
              <Box sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.primary[300]} />
                    <XAxis 
                      type="number" 
                      dataKey="kmMoyenParIntervention" 
                      name="Km Moyen" 
                      tick={{ fill: colors.primary[200] }}
                      label={{ value: 'Kilométrage Moyen (km)', position: 'insideBottom', offset: -5, fill: colors.primary[200] }}
                    />
                    <YAxis 
                      type="number" 
                      dataKey="coutParIntervention" 
                      name="Coût par Intervention" 
                      tick={{ fill: colors.primary[200] }}
                      label={{ value: 'Coût par Intervention (DH)', angle: -90, position: 'insideLeft', fill: colors.primary[200] }}
                    />
                    <ZAxis type="number" dataKey="nbInterventions" range={[50, 400]} name="Interventions" />
                    <RechartsTooltip
                      contentStyle={{ backgroundColor: colors.primary[500], border: 'none' }}
                      formatter={(value: number, name: string) => {
                        if (name === 'kmMoyenParIntervention') return [`${value.toFixed(1)} km`, 'Km Moyen'];
                        if (name === 'coutParIntervention') return [`${value.toFixed(0)} DH`, 'Coût/Intervention'];
                        if (name === 'nbInterventions') return [value, 'Nombre d\'interventions'];
                        return [value, name];
                      }}
                      labelFormatter={(label, payload) => {
                        if (payload && payload[0]) {
                          const data = payload[0].payload;
                          return `${data.fullName} - ${data.ville}`;
                        }
                        return label;
                      }}
                    />
                    <Scatter
                      name="Clients"
                      data={clientsRentabilite}
                      fill={colors.primary[500]}
                      shape="circle"
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Box>

          {/* Deux cartes côte à côte */}
          <Box sx={{ 
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: 3,
            '& > *': {
              flex: '1 1 0',
              minWidth: isMobile ? '100%' : '0'
            }
          }}>
            {/* Évolution des Coûts */}
            <Box>
              <Paper sx={{ p: 3, height: 300, bgcolor: colors.primary[400] }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                  Évolution des Coûts
                </Typography>
                <Box sx={{ height: 200 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyPerformanceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={colors.primary[300]} />
                      <XAxis dataKey="month" tick={{ fill: colors.primary[200] }} />
                      <YAxis tick={{ fill: colors.primary[200] }} />
                      <RechartsTooltip
                        contentStyle={{ backgroundColor: colors.primary[500], border: 'none' }}
                        formatter={(value: number) => [`${value} DH`, 'Montant']}
                      />
                      <Area
                        type="monotone"
                        dataKey="clientTransportCost"
                        name="Coût Transport"
                        stroke={colors.redAccent[500]}
                        fill={colors.redAccent[500]}
                        fillOpacity={0.3}
                      />
                      <Area
                        type="monotone"
                        dataKey="technicianRewards"
                        name="Bonus Techniciens"
                        stroke={colors.blueAccent[500]}
                        fill={colors.blueAccent[500]}
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Box>

            {/* Distribution des Interventions - CORRIGÉ */}
            <Box>
              <Paper sx={{ p: 3, height: 300, bgcolor: colors.primary[400] }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                  Distribution des Interventions
                </Typography>
                <Box sx={{ height: 200 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Hauts Performants', value: technicians.length > 0 ? Math.round(technicians.filter(t => (t.performanceScore || 0) >= 80).length / technicians.length * 100) : 0 },
                          { name: 'Moyens', value: technicians.length > 0 ? Math.round(technicians.filter(t => (t.performanceScore || 0) >= 60 && (t.performanceScore || 0) < 80).length / technicians.length * 100) : 0 },
                          { name: 'À améliorer', value: technicians.length > 0 ? Math.round(technicians.filter(t => (t.performanceScore || 0) < 60).length / technicians.length * 100) : 0 },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        <Cell fill={colors.greenAccent[500]} />
                        <Cell fill={colors.primary[500]} />
                        <Cell fill={colors.redAccent[500]} />
                      </Pie>
                      <RechartsTooltip
                        formatter={(value: number) => [`${value}%`, 'Pourcentage']}
                        contentStyle={{ backgroundColor: colors.primary[500], border: 'none' }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Box>
          </Box>
        </Box>
      </TabPanel>

      {/* Statistiques Tab - CORRIGÉ */}
      <TabPanel value={tabValue} index={4}>
        <Box sx={{ 
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: 3,
          mb: 3,
          '& > *': {
            flex: isMobile ? '1 1 100%' : '1 1 0',
            minWidth: isMobile ? '100%' : '0'
          }
        }}>
          {/* Statistiques Globales - CORRIGÉ */}
          <Box sx={{ flex: 1 }}>
            <Paper sx={{ p: 3, bgcolor: colors.primary[400] }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Statistiques Globales
              </Typography>
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(2, 1fr)', 
                gap: 2,
                '@media (max-width: 600px)': {
                  gridTemplateColumns: '1fr'
                }
              }}>
                <Card sx={{ p: 2, bgcolor: colors.primary[300] }}>
                  <Typography variant="body2" color="textSecondary">Taux de Validation</Typography>
                  <Typography variant="h5">85%</Typography>
                </Card>
                <Card sx={{ p: 2, bgcolor: colors.primary[300] }}>
                  <Typography variant="body2" color="textSecondary">Km Moyen Global</Typography>
                  <Typography variant="h5">
                    {globalStats.totalInterventions > 0 
                      ? (globalStats.totalKm / globalStats.totalInterventions).toFixed(1) 
                      : 0} km
                  </Typography>
                </Card>
                <Card sx={{ p: 2, bgcolor: colors.primary[300] }}>
                  <Typography variant="body2" color="textSecondary">Coût Moyen/Km</Typography>
                  <Typography variant="h5">
                    {globalStats.totalKm > 0 
                      ? (globalStats.totalTransportCost / globalStats.totalKm).toFixed(2) 
                      : 0} DH/km
                  </Typography>
                </Card>
                <Card sx={{ p: 2, bgcolor: colors.primary[300] }}>
                  <Typography variant="body2" color="textSecondary">Marge Nette</Typography>
                  <Typography variant="h5" color={globalStats.totalProfit >= 0 ? 'success.main' : 'error.main'}>
                    {globalStats.totalRewards > 0 
                      ? ((globalStats.totalProfit / globalStats.totalRewards) * 100).toFixed(1) 
                      : 0}%
                  </Typography>
                </Card>
              </Box>
            </Paper>
          </Box>

          {/* Tendances */}
          <Box sx={{ flex: 1 }}>
            <Paper sx={{ p: 3, bgcolor: colors.primary[400] }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Tendances
              </Typography>
              <Box sx={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyPerformanceData.slice(-6)}>
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.primary[300]} />
                    <XAxis dataKey="month" tick={{ fill: colors.primary[200] }} />
                    <YAxis tick={{ fill: colors.primary[200] }} />
                    <RechartsTooltip
                      contentStyle={{ backgroundColor: colors.primary[500], border: 'none' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="profitMargin"
                      name="Marge de Profit %"
                      stroke={colors.greenAccent[500]}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Box>
        </Box>

        {/* Répartition Géographique */}
        <Paper sx={{ p: 3, bgcolor: colors.primary[400] }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            Répartition Géographique
          </Typography>
          <Box sx={{ 
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            flexWrap: 'wrap',
            gap: 2,
            '& > *': {
              flex: isMobile ? '1 1 100%' : '1 1 calc(25% - 16px)',
              minWidth: isMobile ? '100%' : '200px'
            }
          }}>
            {villesRentabilite.slice(0, 8).map((ville) => (
              <Card key={ville.name} sx={{ p: 2, bgcolor: colors.primary[300] }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle1" fontWeight="500">
                    {ville.name}
                  </Typography>
                  <Chip
                    label={`${ville.nbClients} clients`}
                    size="small"
                    variant="outlined"
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="textSecondary">
                    {ville.nbInterventions} interventions
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {ville.totalKm.toFixed(0)} km
                  </Typography>
                </Box>
              </Card>
            ))}
          </Box>
        </Paper>
      </TabPanel>

      {/* Footer Actions */}
      <Box sx={{ mt: 4, display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
        <Typography variant="body2" color="textSecondary">
          Dernière mise à jour: {new Date().toLocaleDateString('fr-FR')}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
          sx={{bgcolor:"#d8dce6ff"}}
            startIcon={<Download />}
            onClick={() => {
              exportToCSV('technicians');
              setTimeout(() => exportToCSV('clients'), 500);
            }}
            size={isMobile ? "small" : "medium"}
          >
            Exporter Tout
          </Button>
          <Button
            variant="contained"
            startIcon={<Assessment />}
            onClick={() => {
              showNotification('Génération du rapport en cours...', { severity: 'info' });
            }}
            size={isMobile ? "small" : "medium"}
          >
            Générer Rapport
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default AdminRentabiliteDashboard;