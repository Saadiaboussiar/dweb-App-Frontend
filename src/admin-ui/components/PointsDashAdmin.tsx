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
} from "@mui/icons-material";
import { useSelector } from "react-redux";
import { selectIsCollapsed } from "../../features/slices/layoutSlice";
import { tokens } from "../../shared-theme/theme";
import useNotifications from "../../hooks/useNotifications/useNotifications";
import api from "../../Interceptors/api";

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

interface BonusTier {
  points: number;
  reward: number;
  label: string;
  color: string;
}

const bonusTiers: BonusTier[] = [
  { points: 1000, reward: 100, label: "Bronze", color: "#cd7f32" },
  { points: 2000, reward: 250, label: "Silver", color: "#8f8d8dff" },
  { points: 3000, reward: 500, label: "Gold", color: "#ffd700" },
  { points: 4000, reward: 800, label: "Platinum", color: "#b1a99bff" },
];

// Fonction pour calculer le score de performance (0-100)
const calculatePerformanceScore = (technician: Technician, stats?: InterventionStatsDTO): number => {
  if (!technician.totalInterventions || technician.totalInterventions === 0) {
    return 0;
  }

  let score = 0;

  // 1. Volume de travail (25%) - Nombre d'interventions
  const volumeScore = Math.min(100, (technician.totalInterventions / 40) * 100);
  score += volumeScore * 0.25;

  // 2. Taux de validation (30%) - Si stats disponibles
  if (stats && stats.total > 0) {
    const validationScore = stats.validationRate; // Déjà en pourcentage
    score += validationScore * 0.30;
  } else {
    // Estimation basée sur les points (plus de points = meilleure validation)
    const pointsPerIntervention = technician.totalInterventions > 0 
      ? technician.currentPoints / technician.totalInterventions 
      : 0;
    const estimatedValidation = Math.min(100, pointsPerIntervention * 10); // 10 points/intervention = 100%
    score += estimatedValidation * 0.30;
  }

  // 3. Efficacité temps (25%) - Moins d'heures par intervention = mieux
  if (technician.totalHours > 0) {
    const hoursPerIntervention = technician.totalHours / technician.totalInterventions;
    let timeScore = 100;
    
    if (hoursPerIntervention > 4) timeScore = 40;        // >4h = mauvais
    else if (hoursPerIntervention > 3) timeScore = 60;   // 3-4h = moyen
    else if (hoursPerIntervention > 2) timeScore = 80;   // 2-3h = bon
    else if (hoursPerIntervention > 1) timeScore = 90;   // 1-2h = très bon
    // <1h = excellent (100)
    
    score += timeScore * 0.25;
  }

  // 4. Productivité points (20%) - Points par intervention
  const pointsPerIntervention = technician.totalInterventions > 0 
    ? technician.currentPoints / technician.totalInterventions 
    : 0;
  const pointsScore = Math.min(100, pointsPerIntervention * 2); // 50 points/intervention = 100%
  score += pointsScore * 0.20;

  return Math.min(100, Math.round(score * 10) / 10); // Arrondi à 1 décimale
};

// Fonction pour calculer le score d'efficacité (0-100)
const calculateEfficiencyScore = (technician: Technician): number => {
  if (!technician.totalInterventions || technician.totalInterventions === 0) {
    return 0;
  }

  let score = 0;

  // 1. Efficacité distance (50%) - Moins de km par intervention = mieux
  if (technician.totalDistance && technician.totalDistance > 0) {
    const kmPerIntervention = technician.totalDistance / technician.totalInterventions;
    let distanceScore = 100;
    
    if (kmPerIntervention > 50) distanceScore = 20;      // >50km = très mauvais
    else if (kmPerIntervention > 40) distanceScore = 40; // 40-50km = mauvais
    else if (kmPerIntervention > 30) distanceScore = 60; // 30-40km = moyen
    else if (kmPerIntervention > 20) distanceScore = 80; // 20-30km = bon
    else if (kmPerIntervention > 10) distanceScore = 90; // 10-20km = très bon
    // <10km = excellent (100)
    
    score += distanceScore * 0.50;
  } else {
    // Si pas de distance, on donne un score moyen
    score += 70 * 0.50;
  }

  // 2. Efficacité temps (30%) - Moins d'heures par intervention = mieux
  if (technician.totalHours > 0) {
    const hoursPerIntervention = technician.totalHours / technician.totalInterventions;
    let timeScore = 100;
    
    if (hoursPerIntervention > 4) timeScore = 40;        // >4h = mauvais
    else if (hoursPerIntervention > 3) timeScore = 60;   // 3-4h = moyen
    else if (hoursPerIntervention > 2) timeScore = 80;   // 2-3h = bon
    else if (hoursPerIntervention > 1) timeScore = 90;   // 1-2h = très bon
    // <1h = excellent (100)
    
    score += timeScore * 0.30;
  }

  // 3. Rendement financier (20%) - Bonus par intervention
  if (technician.totalRewards > 0) {
    const rewardsPerIntervention = technician.totalRewards / technician.totalInterventions;
    const rewardsScore = Math.min(100, rewardsPerIntervention * 4); // 25€/intervention = 100%
    score += rewardsScore * 0.20;
  }

  return Math.min(100, Math.round(score * 10) / 10); // Arrondi à 1 décimale
};

const AdminTechnicianBonusDashboard: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [filteredTechnicians, setFilteredTechnicians] = useState<Technician[]>([]);
  const [selectedTechnician, setSelectedTechnician] = useState<Technician | null>(null);
  const [technicianDetails, setTechnicianDetails] = useState<TechnicianDetails | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [tierFilter, setTierFilter] = useState("all");
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [newPoints, setNewPoints] = useState(0);
  const [sortBy, setSortBy] = useState("points");

  const isCollapsed = useSelector(selectIsCollapsed);
  const colors = tokens(theme.palette.mode);
  const { show: showNotification } = useNotifications();

  // Fetch technicians data
  const fetchTechniciansData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get('/admin/technicians-bonus-details');
      const techniciansData: Technician[] = response.data;
      
      // Calculer les scores pour chaque technicien
      const enrichedTechnicians = techniciansData.map(tech => ({
        ...tech,
        performanceScore: calculatePerformanceScore(tech),
        efficiencyScore: calculateEfficiencyScore(tech),
      }));
      
      // Trier par défaut (points décroissants)
      enrichedTechnicians.sort((a, b) => b.currentPoints - a.currentPoints);
      
      setTechnicians(enrichedTechnicians);
      setFilteredTechnicians(enrichedTechnicians);
      
      showNotification(
        `${enrichedTechnicians.length} techniciens chargés avec succès`,
        {
          severity: 'success',
          autoHideDuration: 3000,
        }
      );
      
    } catch (err: any) {
      console.error("Erreur lors de la récupération des techniciens:", err);
      const errorMessage = err.response?.data?.message || err.message || "Erreur de chargement des données";
      setError(errorMessage);
      setTechnicians([]);
      setFilteredTechnicians([]);
      
      showNotification(
        `Erreur: ${errorMessage}`,
        {
          severity: 'error',
          autoHideDuration: 5000,
        }
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch technician details avec toutes les données
  const fetchTechnicianDetails = async (technicianId: number) => {
    setLoadingDetails(true);
    
    try {
      // Récupérer les détails de base du technicien
      const detailsResponse = await api.get(`/admin/technician-bonus-details/${technicianId}`);
      const baseDetails: Technician = detailsResponse.data;
      
      // Récupérer les statistiques
      const statsResponse = await api.get(`/admin/statistics/${technicianId}`);
      const stats: InterventionStatsDTO = statsResponse.data;
      
      // Récupérer les interventions récentes
      const interventionsResponse = await api.get(`/admin/technician-interventions/${technicianId}/recent`);
      const recentInterventions: InterventionSimpleDTO[] = interventionsResponse.data;
      
      // Calculer les scores avec les stats
      const performanceScore = calculatePerformanceScore(baseDetails, stats);
      const efficiencyScore = calculateEfficiencyScore(baseDetails);
      
      // Calculer la progression du niveau
      const currentTierProgress = calculateTierProgress(baseDetails.currentPoints);
      
      // Générer des statistiques mensuelles à partir des interventions
      const monthlyStats = generateMonthlyStats(recentInterventions, baseDetails.totalRewards);
      
      const details: TechnicianDetails = {
        ...baseDetails,
        performanceScore,
        efficiencyScore,
        recentInterventions,
        monthlyStats,
        stats,
        currentTierProgress,
      };
      
      setTechnicianDetails(details);
      setViewDialogOpen(true);
      
    } catch (err: any) {
      console.error("Erreur lors de la récupération des détails:", err);
      showNotification(
        'Erreur lors du chargement des détails du technicien',
        {
          severity: 'error',
          autoHideDuration: 4000,
        }
      );
    } finally {
      setLoadingDetails(false);
    }
  };

  // Générer des statistiques mensuelles à partir des interventions
  const generateMonthlyStats = (interventions: InterventionSimpleDTO[], totalRewards: number): MonthlyStat[] => {
    const monthlyStatsMap: { [key: string]: MonthlyStat } = {};
    
    interventions.forEach(intervention => {
      const date = new Date(intervention.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      const monthLabel = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
      
      if (!monthlyStatsMap[monthKey]) {
        monthlyStatsMap[monthKey] = {
          month: monthLabel,
          interventions: 0,
          points: 0,
          rewards: 0,
        };
      }
      
      monthlyStatsMap[monthKey].interventions += 1;
      monthlyStatsMap[monthKey].points += intervention.points || 0;
      // Estimation du bonus (points * 0.1)
      monthlyStatsMap[monthKey].rewards += (intervention.points || 0) * 0.1;
    });
    
    // Convertir en tableau et trier par mois
    return Object.values(monthlyStatsMap)
      .sort((a, b) => {
        const [yearA, monthA] = a.month.split(' ');
        const [yearB, monthB] = b.month.split(' ');
        return new Date(`${monthB} ${yearB}`).getTime() - new Date(`${monthA} ${yearA}`).getTime();
      })
      .slice(0, 6); // Limiter à 6 derniers mois
  };

  // Calculer la progression du niveau
  const calculateTierProgress = (points: number) => {
    const currentTier = getTierInfo(points);
    const nextTier = bonusTiers.find(tier => tier.points > currentTier.points);
    
    if (!nextTier) {
      return {
        currentPoints: points,
        nextTierPoints: currentTier.points,
        progressPercentage: 100
      };
    }
    
    const progressInCurrentTier = points - currentTier.points;
    const tierRange = nextTier.points - currentTier.points;
    const progressPercentage = (progressInCurrentTier / tierRange) * 100;
    
    return {
      currentPoints: points,
      nextTierPoints: nextTier.points,
      progressPercentage: Math.min(100, Math.max(0, progressPercentage))
    };
  };

  // Update technician points
  const updateTechnicianPoints = async (technicianId: number, points: number) => {
    try {
      await api.put(`/admin/update-technician-points/${technicianId}`, {
        points: points,
      });
      
      // Refresh technicians list
      await fetchTechniciansData();
      
      showNotification(
        'Points mis à jour avec succès',
        {
          severity: 'success',
          autoHideDuration: 3000,
        }
      );
      
    } catch (err: any) {
      console.error("Erreur lors de la mise à jour des points:", err);
      const errorMessage = err.response?.data?.message || 'Erreur lors de la mise à jour des points';
      
      showNotification(
        `Erreur: ${errorMessage}`,
        {
          severity: 'error',
          autoHideDuration: 4000,
        }
      );
      
      throw err;
    }
  };

  // Handle edit points
  const handleEditPoints = async () => {
    if (!selectedTechnician) return;
    
    try {
      await updateTechnicianPoints(selectedTechnician.id, newPoints);
      setEditDialogOpen(false);
      
    } catch (err) {
      // Error is already handled by updateTechnicianPoints
    }
  };

  // Export technicians data to CSV
  const exportToCSV = () => {
    if (technicians.length === 0) {
      showNotification(
        'Aucune donnée à exporter',
        {
          severity: 'warning',
          autoHideDuration: 3000,
        }
      );
      return;
    }
    
    const headers = ["ID", "Nom", "Email", "CIN", "Téléphone", "Points", "Bonus Total", "Interventions", "Heures Total", "Distance Total", "Performance", "Efficacité"];
    
    const csvRows = [
      headers.join(","),
      ...technicians.map(tech => [
        tech.id,
        `"${tech.name}"`,
        `"${tech.email}"`,
        tech.cin ? `"${tech.cin}"` : '',
        tech.phone ? `"${tech.phone}"` : '',
        tech.currentPoints,
        tech.totalRewards.toFixed(2),
        tech.totalInterventions || 0,
        tech.totalHours.toFixed(1),
        (tech.totalDistance || 0).toFixed(1),
        (tech.performanceScore || 0).toFixed(1),
        (tech.efficiencyScore || 0).toFixed(1)
      ].join(","))
    ];
    
    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `Techniciens_Bonus_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification(
      'Données exportées avec succès',
      {
        severity: 'success',
        autoHideDuration: 3000,
      }
    );
  };

  // Initial data fetch
  useEffect(() => {
    fetchTechniciansData();
  }, []);

  // Filter and sort technicians
  useEffect(() => {
    let result = [...technicians];

    // Filter by search term
    if (searchTerm) {
      result = result.filter(
        (tech) =>
          tech.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tech.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (tech.cin && tech.cin.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (tech.phone && tech.phone.includes(searchTerm))
      );
    }

    // Filter by tier
    if (tierFilter !== "all") {
      result = result.filter(tech => {
        const tier = getTierInfo(tech.currentPoints);
        return tier.label.toLowerCase() === tierFilter.toLowerCase();
      });
    }

    // Sort results
    switch (sortBy) {
      case "points":
        result.sort((a, b) => b.currentPoints - a.currentPoints);
        break;
      case "rewards":
        result.sort((a, b) => b.totalRewards - a.totalRewards);
        break;
      case "performance":
        result.sort((a, b) => (b.performanceScore || 0) - (a.performanceScore || 0));
        break;
      case "efficiency":
        result.sort((a, b) => (b.efficiencyScore || 0) - (a.efficiencyScore || 0));
        break;
      case "interventions":
        result.sort((a, b) => (b.totalInterventions || 0) - (a.totalInterventions || 0));
        break;
    }

    setFilteredTechnicians(result);
  }, [searchTerm, tierFilter, sortBy, technicians]);

  const handleViewDetails = async (technician: Technician) => {
    setSelectedTechnician(technician);
    await fetchTechnicianDetails(technician.id);
  };

  const openEditDialog = (technician: Technician) => {
    setSelectedTechnician(technician);
    setNewPoints(technician.currentPoints);
    setEditDialogOpen(true);
  };

  const getTierInfo = (points: number): BonusTier => {
    return (
      bonusTiers
        .slice()
        .reverse()
        .find((tier) => points >= tier.points) || bonusTiers[0]
    );
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return colors.greenAccent[600];
    if (score >= 60) return colors.primary[500];
    if (score >= 40) return colors.primary[500];
    return colors.redAccent[500];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "VALIDATED": return <CheckCircle fontSize="small" color="success" />;
      case "PENDING": return <Pending fontSize="small" color="warning" />;
      case "REJECTED": return <Cancel fontSize="small" color="error" />;
      default: return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "VALIDATED": return "Validée";
      case "PENDING": return "En attente";
      case "REJECTED": return "Rejetée";
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "VALIDATED": return "success";
      case "PENDING": return "warning";
      case "REJECTED": return "error";
      default: return "default";
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
            ? isCollapsed
              ? "100px"
              : "250px"
            : isCollapsed
            ? "115px"
            : "260px",
          width: isMobile
            ? isCollapsed
              ? "85%"
              : "62%"
            : isCollapsed
            ? "90%"
            : "80%",
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
          Chargement des techniciens...
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
          ? isCollapsed
            ? "100px"
            : "250px"
          : isCollapsed
          ? "115px"
          : "260px",
        width: isMobile
          ? isCollapsed
            ? "85%"
            : "62%"
          : isCollapsed
          ? "90%"
          : "80%",
        transition: "margin-left 0.3s ease",
      }}
    >
      

      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={fetchTechniciansData}
            >
              Réessayer
            </Button>
          }
        >
          <Typography fontWeight="bold">Erreur:</Typography>
          <Typography>{error}</Typography>
        </Alert>
      )}

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: colors.primary[400] }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            gap: 3,
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ 
            display: "flex", 
            flexDirection: isMobile ? "column" : "row", 
            gap: 3, 
            flex: 1,
            '& > *': {
              flex: isMobile ? '1 1 100%' : '1 1 calc(25% - 16px)',
              minWidth: isMobile ? '100%' : 200
            }
          }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Rechercher un technicien..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <Search sx={{ mr: 1, color: "text.secondary" }} />
                ),
              }}
            />
            
            <TextField
              fullWidth
              select
              label="Niveau"
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
            >
              <MenuItem value="all">Tous les niveaux</MenuItem>
              <MenuItem value="bronze">Bronze</MenuItem>
              <MenuItem value="silver">Silver</MenuItem>
              <MenuItem value="gold">Gold</MenuItem>
              <MenuItem value="platinum">Platinum</MenuItem>
            </TextField>
            
            <TextField
              fullWidth
              select
              label="Trier par"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <MenuItem value="points">Points (décroissant)</MenuItem>
              <MenuItem value="rewards">Bonus (décroissant)</MenuItem>
              <MenuItem value="performance">Performance (décroissant)</MenuItem>
              <MenuItem value="efficiency">Efficacité (décroissant)</MenuItem>
              <MenuItem value="interventions">Interventions (décroissant)</MenuItem>
            </TextField>
            
            <TextField
              fullWidth
              select
              label="Nombre à afficher"
              value="all"
              onChange={() => {}}
            >
              <MenuItem value="10">10</MenuItem>
              <MenuItem value="25">25</MenuItem>
              <MenuItem value="50">50</MenuItem>
              <MenuItem value="all">Tous</MenuItem>
            </TextField>
          </Box>
          
          <Box sx={{ 
            display: "flex", 
            gap: 2, 
            width: isMobile ? '100%' : 'auto',
            mt: isMobile ? 2 : 0 
          }}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={fetchTechniciansData}
              disabled={loading}
              sx={{color:colors.primary[700],
                borderBlockColor:colors.primary[600]
              }}
            >
              {loading ? <CircularProgress size={20} /> : 'Actualiser'}
            </Button>
            
            <Button
              variant="contained"
              startIcon={<Download />}
              onClick={exportToCSV}
              disabled={technicians.length === 0}
            >
              Exporter CSV
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Statistics Cards */}
      <Box
        sx={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          gap: 3,
          mb: 4,
          flexWrap: "wrap",
        }}
      >
        <Card
          sx={{
            flex: isMobile ? "1" : "1 1 calc(25% - 24px)",
            minWidth: "200px",
            bgcolor: colors.primary[400],
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <AccountCircle sx={{ color: colors.blueAccent[400] }} />
              <Typography color="textSecondary" gutterBottom>
                Total Techniciens
              </Typography>
            </Box>
            <Typography variant="h4" component="div">
              {technicians.length}
            </Typography>
          </CardContent>
        </Card>

        <Card
          sx={{
            flex: isMobile ? "1" : "1 1 calc(25% - 24px)",
            minWidth: "200px",
            bgcolor: colors.primary[400],
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <TrendingUp sx={{ color: colors.greenAccent[400] }} />
              <Typography color="textSecondary" gutterBottom>
                Points Moyens
              </Typography>
            </Box>
            <Typography variant="h4" component="div">
              {technicians.length > 0 
                ? Math.round(technicians.reduce((sum, tech) => sum + tech.currentPoints, 0) / technicians.length)
                : 0}
            </Typography>
          </CardContent>
        </Card>

        <Card
          sx={{
            flex: isMobile ? "1" : "1 1 calc(25% - 24px)",
            minWidth: "200px",
            bgcolor: colors.primary[400],
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <AttachMoney sx={{ color: colors.greenAccent[400] }} />
              <Typography color="textSecondary" gutterBottom>
                Bonus Total
              </Typography>
            </Box>
            <Typography variant="h4" component="div">
              {technicians.reduce((sum, tech) => sum + tech.totalRewards, 0).toLocaleString('fr-FR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })} DH
            </Typography>
          </CardContent>
        </Card>

        <Card
          sx={{
            flex: isMobile ? "1" : "1 1 calc(25% - 24px)",
            minWidth: "200px",
            bgcolor: colors.primary[400],
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Schedule sx={{ color: colors.primary[500] }} />
              <Typography color="textSecondary" gutterBottom>
                Interventions Total
              </Typography>
            </Box>
            <Typography variant="h4" component="div">
              {technicians.reduce((sum, tech) => sum + (tech.totalInterventions || 0), 0)}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Technicians Table */}
      <Paper
        sx={{ width: "100%", overflow: "hidden", bgcolor: colors.primary[400] }}
      >
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Technicien</TableCell>
                <TableCell align="right">Points</TableCell>
                <TableCell>Niveau</TableCell>
                <TableCell align="right">Bonus</TableCell>
                <TableCell align="right">Performance</TableCell>
                <TableCell align="right">Efficacité</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTechnicians.length > 0 ? (
                filteredTechnicians.map((technician) => {
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
                            <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                              {technician.cin && (
                                <Chip 
                                  label={`CIN: ${technician.cin}`} 
                                  size="small" 
                                  variant="outlined"
                                />
                              )}
                              {technician.totalInterventions && (
                                <Chip 
                                  label={`${technician.totalInterventions} int.`} 
                                  size="small" 
                                  variant="outlined"
                                />
                              )}
                            </Box>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Typography fontWeight="bold" variant="h6">
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
                            minWidth: 80
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          fontWeight="bold"
                          color={colors.greenAccent[600]}
                          variant="h6"
                        >
                          {technician.totalRewards.toLocaleString('fr-FR', {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0
                          })} DH
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <TrendingUp
                              sx={{ 
                                mr: 1, 
                                color: getScoreColor(technician.performanceScore || 0),
                                fontSize: 16
                              }}
                            />
                            <Typography variant="h6" fontWeight="bold">
                              {(technician.performanceScore || 0).toFixed(0)}%
                            </Typography>
                          </Box>
                          <Typography variant="caption" color="textSecondary">
                            {technician.totalInterventions || 0} interventions
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <DirectionsCar
                              sx={{ 
                                mr: 1, 
                                color: getScoreColor(technician.efficiencyScore || 0),
                                fontSize: 16
                              }}
                            />
                            <Typography variant="h6" fontWeight="bold">
                              {(technician.efficiencyScore || 0).toFixed(0)}%
                            </Typography>
                          </Box>
                          <Typography variant="caption" color="textSecondary">
                            {technician.totalDistance?.toFixed(0) || '0'} km
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                          <IconButton 
                            onClick={() => handleViewDetails(technician)}
                            disabled={loadingDetails}
                            title="Voir les détails"
                            size="small"
                          >
                            {loadingDetails && selectedTechnician?.id === technician.id ? (
                              <CircularProgress size={20} />
                            ) : (
                              <Visibility fontSize="small" />
                            )}
                          </IconButton>
                          <IconButton 
                            onClick={() => openEditDialog(technician)}
                            title="Modifier les points"
                            size="small"
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography color="textSecondary">
                      {searchTerm || tierFilter !== "all" 
                        ? "Aucun technicien ne correspond aux critères de recherche" 
                        : "Aucun technicien disponible"}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* View Details Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>
          <Typography variant="h6">
            Détails du Technicien: {selectedTechnician?.name}
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          {technicianDetails && (
            <Box>
              {/* Informations générales */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Informations Générales
                </Typography>
                <Box sx={{ 
                  display: "flex", 
                  flexWrap: "wrap", 
                  gap: 3,
                  '& > *': {
                    flex: isMobile ? '1 1 100%' : '1 1 calc(50% - 12px)',
                    minWidth: isMobile ? '100%' : 200
                  }
                }}>
                  <Box>
                    <Typography variant="body2" color="textSecondary">Nom</Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {technicianDetails.name}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="textSecondary">Email</Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {technicianDetails.email}
                    </Typography>
                  </Box>
                  
                  {technicianDetails.cin && (
                    <Box>
                      <Typography variant="body2" color="textSecondary">CIN</Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {technicianDetails.cin}
                      </Typography>
                    </Box>
                  )}
                  
                  {technicianDetails.phone && (
                    <Box>
                      <Typography variant="body2" color="textSecondary">Téléphone</Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {technicianDetails.phone}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>

              {/* Statistiques principales */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Statistiques Principales
                </Typography>
                <Box sx={{ 
                  display: "flex", 
                  flexWrap: "wrap", 
                  gap: 3,
                  '& > *': {
                    flex: isMobile ? '1 1 100%' : '1 1 calc(33.33% - 16px)',
                    minWidth: isMobile ? '100%' : 150
                  }
                }}>
                  <Card sx={{ p: 2, bgcolor: colors.primary[100] }}>
                    <Typography variant="body2" color="textSecondary">Points Totaux</Typography>
                    <Typography variant="h5" fontWeight="bold">
                      {technicianDetails.currentPoints}
                    </Typography>
                  </Card>
                  
                  <Card sx={{ p: 2, bgcolor: colors.primary[100] }}>
                    <Typography variant="body2" color="textSecondary">Bonus Total</Typography>
                    <Typography variant="h5" fontWeight="bold" color={colors.greenAccent[600]}>
                      {technicianDetails.totalRewards.toLocaleString('fr-FR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })} DH
                    </Typography>
                  </Card>
                  
                  <Card sx={{ p: 2, bgcolor: colors.primary[100] }}>
                    <Typography variant="body2" color="textSecondary">Interventions</Typography>
                    <Typography variant="h5" fontWeight="bold">
                      {technicianDetails.totalInterventions || 0}
                    </Typography>
                  </Card>
                </Box>
                
                <Box sx={{ 
                  display: "flex", 
                  flexWrap: "wrap", 
                  gap: 3,
                  mt: 2,
                  '& > *': {
                    flex: isMobile ? '1 1 100%' : '1 1 calc(33.33% - 16px)',
                    minWidth: isMobile ? '100%' : 150
                  }
                }}>
                  <Card sx={{ p: 2, bgcolor: colors.primary[100] }}>
                    <Typography variant="body2" color="textSecondary">Heures Total</Typography>
                    <Typography variant="h5" fontWeight="bold">
                      {technicianDetails.totalHours.toFixed(1)}h
                    </Typography>
                  </Card>
                  
                  <Card sx={{ p: 2, bgcolor: colors.primary[100] }}>
                    <Typography variant="body2" color="textSecondary">Distance Total</Typography>
                    <Typography variant="h5" fontWeight="bold">
                      {technicianDetails.totalDistance?.toFixed(1) || '0'} km
                    </Typography>
                  </Card>
                  
                  <Card sx={{ p: 2, bgcolor: colors.primary[100] }}>
                    <Typography variant="body2" color="textSecondary">Niveau Actuel</Typography>
                    <Chip
                      label={getTierInfo(technicianDetails.currentPoints).label}
                      sx={{ 
                        backgroundColor: getTierInfo(technicianDetails.currentPoints).color, 
                        color: "white",
                        fontWeight: 'bold',
                        mt: 1
                      }}
                    />
                  </Card>
                </Box>
              </Box>

              {/* Scores */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Scores d'Évaluation
                </Typography>
                <Box sx={{ 
                  display: "flex", 
                  flexWrap: "wrap", 
                  gap: 3,
                  '& > *': {
                    flex: isMobile ? '1 1 100%' : '1 1 calc(50% - 12px)',
                    minWidth: isMobile ? '100%' : 200
                  }
                }}>
                  <Card sx={{ p: 3 }}>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Score de Performance
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <CircularProgress 
                        variant="determinate" 
                        value={technicianDetails.performanceScore || 0} 
                        size={80}
                        thickness={4}
                        sx={{ color: getScoreColor(technicianDetails.performanceScore || 0) }}
                      />
                      <Box>
                        <Typography variant="h3" fontWeight="bold">
                          {(technicianDetails.performanceScore || 0).toFixed(0)}%
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Basé sur le volume et la qualité
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" color="textSecondary">
                        Calculé à partir de:
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        • Volume d'interventions (25%)<br/>
                        • Taux de validation (30%)<br/>
                        • Efficacité temps (25%)<br/>
                        • Productivité points (20%)
                      </Typography>
                    </Box>
                  </Card>
                  
                  <Card sx={{ p: 3 }}>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Score d'Efficacité
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <CircularProgress 
                        variant="determinate" 
                        value={technicianDetails.efficiencyScore || 0} 
                        size={80}
                        thickness={4}
                        sx={{ color: getScoreColor(technicianDetails.efficiencyScore || 0) }}
                      />
                      <Box>
                        <Typography variant="h3" fontWeight="bold">
                          {(technicianDetails.efficiencyScore || 0).toFixed(0)}%
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Basé sur la distance et le coût
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" color="textSecondary">
                        Calculé à partir de:
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        • Efficacité distance (50%)<br/>
                        • Efficacité temps (30%)<br/>
                        • Rendement financier (20%)
                      </Typography>
                    </Box>
                  </Card>
                </Box>
              </Box>

              {/* Statistiques de validation */}
              {technicianDetails.stats && (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Statistiques de Validation
                  </Typography>
                  <Box sx={{ 
                    display: "flex", 
                    flexWrap: "wrap", 
                    gap: 3,
                    '& > *': {
                      flex: isMobile ? '1 1 100%' : '1 1 calc(25% - 16px)',
                      minWidth: isMobile ? '100%' : 150
                    }
                  }}>
                    <Card sx={{ p: 2, textAlign: 'center' }}>
                      <CheckCircle sx={{ color: colors.greenAccent[600], fontSize: 40, mb: 1 }} />
                      <Typography variant="h4" fontWeight="bold" color={colors.greenAccent[600]}>
                        {technicianDetails.stats.validated}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Validées
                      </Typography>
                    </Card>
                    
                    <Card sx={{ p: 2, textAlign: 'center' }}>
                      <Pending sx={{ color: colors.primary[600], fontSize: 40, mb: 1 }} />
                      <Typography variant="h4" fontWeight="bold" color={colors.primary[600]}>
                        {technicianDetails.stats.pending}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        En attente
                      </Typography>
                    </Card>
                    
                    <Card sx={{ p: 2, textAlign: 'center' }}>
                      <Cancel sx={{ color: colors.redAccent[600], fontSize: 40, mb: 1 }} />
                      <Typography variant="h4" fontWeight="bold" color={colors.redAccent[600]}>
                        {technicianDetails.stats.rejected}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Rejetées
                      </Typography>
                    </Card>
                    
                    <Card sx={{ p: 2, textAlign: 'center' }}>
                      <TrendingUp sx={{ color: colors.blueAccent[600], fontSize: 40, mb: 1 }} />
                      <Typography variant="h4" fontWeight="bold" color={colors.blueAccent[600]}>
                        {technicianDetails.stats.validationRate.toFixed(1)}%
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Taux de validation
                      </Typography>
                    </Card>
                  </Box>
                </Box>
              )}

              {/* Progression du niveau */}
              {technicianDetails.currentTierProgress && (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Progression du Niveau
                  </Typography>
                  <Card sx={{ p: 3, bgcolor: colors.primary[100] }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">
                        Niveau actuel: {getTierInfo(technicianDetails.currentPoints).label}
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {technicianDetails.currentTierProgress.currentPoints} / {technicianDetails.currentTierProgress.nextTierPoints} points
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={technicianDetails.currentTierProgress.progressPercentage} 
                      sx={{ 
                        height: 10, 
                        borderRadius: 5,
                        backgroundColor: colors.primary[300],
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: getTierInfo(technicianDetails.currentPoints).color,
                        }
                      }}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <Typography variant="caption" color="textSecondary">
                        Prochain niveau: {bonusTiers.find(t => t.points > getTierInfo(technicianDetails.currentPoints).points)?.label || 'Max'}
                      </Typography>
                      <Typography variant="caption" fontWeight="bold">
                        {technicianDetails.currentTierProgress.progressPercentage.toFixed(1)}%
                      </Typography>
                    </Box>
                  </Card>
                </Box>
              )}

              {/* Dernières interventions */}
              {technicianDetails.recentInterventions && technicianDetails.recentInterventions.length > 0 && (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Dernières Interventions ({technicianDetails.recentInterventions.length})
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Date</TableCell>
                          <TableCell>Client</TableCell>
                          <TableCell align="right">Points</TableCell>
                          <TableCell>Statut</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {technicianDetails.recentInterventions.slice(0, 10).map((intervention) => (
                          <TableRow key={intervention.id}>
                            <TableCell>
                              {new Date(intervention.date).toLocaleDateString('fr-FR')}
                            </TableCell>
                            <TableCell>{intervention.client}</TableCell>
                            <TableCell align="right">
                              <Chip 
                                label={`+${intervention.points}`} 
                                size="small" 
                                color="primary"
                              />
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {getStatusIcon(intervention.status)}
                                <Typography variant="body2">
                                  {getStatusLabel(intervention.status)}
                                </Typography>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}

              {/* Statistiques mensuelles */}
              {technicianDetails.monthlyStats && technicianDetails.monthlyStats.length > 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Statistiques Mensuelles (6 derniers mois)
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Mois</TableCell>
                          <TableCell align="right">Interventions</TableCell>
                          <TableCell align="right">Points</TableCell>
                          <TableCell align="right">Bonus estimé</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {technicianDetails.monthlyStats.map((stat, index) => (
                          <TableRow key={index}>
                            <TableCell>{stat.month}</TableCell>
                            <TableCell align="right">{stat.interventions}</TableCell>
                            <TableCell align="right">{stat.points}</TableCell>
                            <TableCell align="right">
                              {stat.rewards.toLocaleString('fr-FR', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                              })} DH
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>
            Fermer
          </Button>
          <Button 
            variant="contained" 
            onClick={() => selectedTechnician && openEditDialog(selectedTechnician)}
          >
            Modifier les Points
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Points Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Modifier les Points - {selectedTechnician?.name}
        </DialogTitle>
        <DialogContent>
          {selectedTechnician && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Points actuels: {selectedTechnician.currentPoints}
              </Typography>
              
              <TextField
                fullWidth
                type="number"
                label="Nouveau total de points"
                value={newPoints}
                onChange={(e) => setNewPoints(Number(e.target.value))}
                sx={{ mt: 2 }}
                InputProps={{
                  inputProps: { min: 0 }
                }}
              />
              
              {/* Affichage du niveau actuel et futur */}
              {newPoints !== selectedTechnician.currentPoints && (
                <Box sx={{ mt: 3, p: 2, bgcolor: colors.primary[100], borderRadius: 1 }}>
                  <Typography variant="body2" color="textSecondary">
                    Niveau actuel: {getTierInfo(selectedTechnician.currentPoints).label}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Nouveau niveau: {getTierInfo(newPoints).label}
                  </Typography>
                  {getTierInfo(newPoints).reward > getTierInfo(selectedTechnician.currentPoints).reward && (
                    <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                      Nouveau bonus de niveau: {getTierInfo(newPoints).reward} DH
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>
            Annuler
          </Button>
          <Button
            variant="contained"
            onClick={handleEditPoints}
          >
            Sauvegarder
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminTechnicianBonusDashboard;