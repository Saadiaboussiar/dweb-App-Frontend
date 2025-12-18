// components/admin/ClientRentabiliteDashboard.tsx
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
} from "@mui/material";
import {
  TrendingUp,
  People,
  LocationCity,
  DirectionsCar,
  TrendingDown,
  Download,
  Timeline,
} from "@mui/icons-material";
import {
  LineChart,
  Line,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ScatterChart,
  Scatter,
  ZAxis,
} from "recharts";
import { tokens } from "../../../shared-theme/theme";
import { useSelector } from "react-redux";
import { selectIsCollapsed } from "../../../features/slices/layoutSlice";
import api from "../../../Interceptors/api";

// Types basés sur tes DTOs
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
  mois: string; // Format: "Janvier-2024"
  kmTotal: number;
  coutTransport: number;
  nbInterventions: number;
}

const ClientRentabiliteDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [periode, setPeriode] = useState<string>("mois"); // "mois", "trimestre", "annee"
  const [selectedVille, setSelectedVille] = useState<string>("toutes");
  
  const isCollapsed = useSelector(selectIsCollapsed);
  const colors = tokens(theme.palette.mode);
  
  // États pour les données
  const [clientsRentabilite, setClientsRentabilite] = useState<ClientRentabilityDTO[]>([]);
  const [villesRentabilite, setVillesRentabilite] = useState<VilleRentabiliteDTO[]>([]);
  const [periodeStats, setPeriodeStats] = useState<PeriodeStatsDTO[]>([]);
  const [statsGlobales, setStatsGlobales] = useState({
    totalClients: 0,
    totalInterventions: 0,
    totalKm: 0,
    coutTransportTotal: 0,
    kmMoyenGlobal: 0,
    coutParInterventionMoyen: 0,
  });

  // Fonction pour calculer le score d'efficacité (0-100)
  const calculerScoreEfficacite = (kmMoyen: number): number => {
    if (kmMoyen <= 0) return 0;
    // Score = 100 - (kmMoyen × facteur de pénalité)
    // Plus kmMoyen est bas, plus le score est élevé
    const facteurPenalite = 2.0;
    const score = Math.max(0, 100 - (kmMoyen * facteurPenalite));
    return Math.round(score * 10) / 10; // Arrondi à 1 décimale
  };

  // Fonction pour déterminer la catégorie
  const getCategorieEfficacite = (score: number): string => {
    if (score >= 80) return "Très Efficace";
    if (score >= 60) return "Efficace";
    if (score >= 40) return "Acceptable";
    return "Peu Efficace";
  };

  // Fonction pour la couleur de la catégorie
  const getCategorieColor = (score: number): string => {
    if (score >= 80) return colors.greenAccent[500];
    if (score >= 60) return colors.primary[500];
    if (score >= 40) return colors.redAccent[500];
    return colors.redAccent[500];
  };

  // Fetch toutes les données en parallèle
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch toutes les données en parallèle
        const [clientsResponse, villesResponse, periodeResponse] = await Promise.all([
          api.get(`/admin/clients-rentability/${periode}`),
          api.get(`/admin/villes-rentability/${periode}`),
          api.get(`/admin/periodes-rentabilite/${periode}`)
        ]);
        
        const clientsData: ClientRentabilityDTO[] = clientsResponse.data;
        const villesData: VilleRentabiliteDTO[] = villesResponse.data;
        const periodeData: PeriodeStatsDTO[] = periodeResponse.data;
        
        // Trier les périodes par mois (Janvier à Décembre)
        const moisOrdre = [
          "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
          "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
        ];
        
        const periodeDataSorted = [...periodeData].sort((a, b) => {
          const moisA = a.mois.split("-")[0];
          const moisB = b.mois.split("-")[0];
          return moisOrdre.indexOf(moisA) - moisOrdre.indexOf(moisB);
        });
        
        setClientsRentabilite(clientsData);
        setVillesRentabilite(villesData);
        setPeriodeStats(periodeDataSorted);
        
        // Calculer les stats globales
        if (clientsData.length > 0) {
          const totalStats = clientsData.reduce((acc, client) => ({
            totalClients: acc.totalClients + 1,
            totalInterventions: acc.totalInterventions + client.nbInterventions,
            totalKm: acc.totalKm + client.totalKm,
            coutTransportTotal: acc.coutTransportTotal + client.coutTransport,
            kmMoyenGlobal: acc.kmMoyenGlobal + client.kmMoyenParIntervention,
            coutParInterventionMoyen: acc.coutParInterventionMoyen + client.coutParIntervention,
          }), {
            totalClients: 0,
            totalInterventions: 0,
            totalKm: 0,
            coutTransportTotal: 0,
            kmMoyenGlobal: 0,
            coutParInterventionMoyen: 0,
          });
          
          setStatsGlobales({
            totalClients: totalStats.totalClients,
            totalInterventions: totalStats.totalInterventions,
            totalKm: totalStats.totalKm,
            coutTransportTotal: totalStats.coutTransportTotal,
            kmMoyenGlobal: totalStats.totalClients > 0 ? totalStats.kmMoyenGlobal / totalStats.totalClients : 0,
            coutParInterventionMoyen: totalStats.totalClients > 0 ? totalStats.coutParInterventionMoyen / totalStats.totalClients : 0,
          });
        }
        
      } catch (err: any) {
        console.error("Erreur lors de la récupération des données:", err);
        setError(err.response?.data?.message || err.message || "Erreur de chargement des données");
        
        // Réinitialiser les données en cas d'erreur
        setClientsRentabilite([]);
        setVillesRentabilite([]);
        setPeriodeStats([]);
        setStatsGlobales({
          totalClients: 0,
          totalInterventions: 0,
          totalKm: 0,
          coutTransportTotal: 0,
          kmMoyenGlobal: 0,
          coutParInterventionMoyen: 0,
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllData();
  }, [periode]);

  // Filter clients by city
  const filteredClients = selectedVille === "toutes" 
    ? clientsRentabilite 
    : clientsRentabilite.filter(client => client.ville === selectedVille);

  // Ajouter score d'efficacité aux clients filtrés
  const clientsAvecScore = filteredClients.map(client => ({
    ...client,
    scoreEfficacite: calculerScoreEfficacite(client.kmMoyenParIntervention),
    categorie: getCategorieEfficacite(calculerScoreEfficacite(client.kmMoyenParIntervention))
  }));

  // Top 5 most efficient clients (par score)
  const top5Clients = [...clientsAvecScore]
    .sort((a: any, b: any) => b.scoreEfficacite - a.scoreEfficacite)
    .slice(0, 5);

  // Data for charts - Efficacité par Ville (basé sur km moyen)
  const efficaciteParVilleData = villesRentabilite
    .filter(v => v.nbClients > 0)
    .map(v => {
      const kmMoyen = v.nbInterventions > 0 ? v.totalKm / v.nbInterventions : 0;
      return {
        name: v.name,
        kmMoyen: Math.round(kmMoyen * 10) / 10,
        clients: v.nbClients,
        interventions: v.nbInterventions,
        totalKm: v.totalKm,
      };
    });

  // Data for evolution chart - Ajouter km moyen par mois
  const evolutionData = periodeStats.map(periode => {
    const kmMoyen = periode.nbInterventions > 0 ? periode.kmTotal / periode.nbInterventions : 0;
    return {
      mois: periode.mois.split("-")[0], // Juste le mois sans l'année
      interventions: periode.nbInterventions,
      kmTotal: periode.kmTotal,
      kmMoyen: Math.round(kmMoyen * 10) / 10,
      coutTransport: periode.coutTransport,
    };
  });

  // Scatter data: Interventions vs Score d'efficacité
  const scatterData = clientsAvecScore.map(client => ({
    x: client.nbInterventions,
    y: (client as any).scoreEfficacite,
    z: client.totalKm, // Taille de la bulle basée sur km totaux
    name: client.fullName,
    ville: client.ville,
    kmMoyen: client.kmMoyenParIntervention,
  }));

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
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 2,
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" color="textSecondary">
          Chargement des données d'efficacité...
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
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Analyse d'Efficacité des Clients
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Analyse basée sur les kilomètres parcourus et les coûts de transport
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography fontWeight="bold">Erreur:</Typography>
          <Typography>{error}</Typography>
        </Alert>
      )}

      {/* Filters */}
      <Paper elevation={2} sx={{ p: 2, mb: 4, bgcolor: colors.primary[400] }}>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Période</InputLabel>
            <Select
              value={periode}
              label="Période"
              onChange={(e) => setPeriode(e.target.value)}
            >
              <MenuItem value="mois">Ce mois</MenuItem>
              <MenuItem value="trimestre">Ce trimestre</MenuItem>
              <MenuItem value="annee">Cette année</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Ville</InputLabel>
            <Select
              value={selectedVille}
              label="Ville"
              onChange={(e) => setSelectedVille(e.target.value)}
            >
              <MenuItem value="toutes">Toutes les villes</MenuItem>
              {Array.from(new Set(clientsRentabilite.map(c => c.ville)))
                .filter(ville => ville && ville.trim() !== "")
                .map(ville => (
                  <MenuItem key={ville} value={ville}>{ville}</MenuItem>
                ))}
            </Select>
          </FormControl>

          <IconButton onClick={() => window.location.reload()} title="Rafraîchir">
            <Download />
          </IconButton>
        </Box>
      </Paper>

      {/* Global Stats Cards */}
      <Box
        sx={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          flexWrap: "wrap",
          gap: 3,
          mb: 4,
        }}
      >
        {/* Total Interventions Card */}
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
              <People sx={{ mr: 1, color: colors.blueAccent[400] }} />
              <Typography variant="h6" color="textSecondary">
                Interventions
              </Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              {statsGlobales.totalInterventions}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {statsGlobales.totalClients} clients
            </Typography>
            {statsGlobales.totalClients > 0 && (
              <Typography variant="body2" color="textSecondary">
                Moyenne: {(statsGlobales.totalInterventions / statsGlobales.totalClients).toFixed(1)} par client
              </Typography>
            )}
          </CardContent>
        </Card>

        {/* Transport Cost Card */}
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
            <Box sx={{ display: "flex", alignItems:"center", mb: 2 }}>
              <DirectionsCar sx={{ mr: 1, color: colors.primary[400] }} />
              <Typography variant="h6" color="textSecondary">
                Coût Transport
              </Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              {statsGlobales.coutTransportTotal.toLocaleString()} DH
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {statsGlobales.totalKm.toLocaleString()} km
            </Typography>
            {statsGlobales.totalInterventions > 0 && (
              <Typography variant="body2" color="textSecondary">
                Moyenne: {(statsGlobales.coutTransportTotal / statsGlobales.totalInterventions).toFixed(0)} DH/intervention
              </Typography>
            )}
          </CardContent>
        </Card>

        {/* Average Km Card */}
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
              <Timeline sx={{ mr: 1, color: colors.greenAccent[400] }} />
              <Typography variant="h6" color="textSecondary">
                Km Moyen
              </Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              {statsGlobales.kmMoyenGlobal.toFixed(1)} km
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Par intervention
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
              <LinearProgress 
                variant="determinate" 
                value={Math.min(100, statsGlobales.kmMoyenGlobal * 2)} // 50km = 100%
                sx={{ 
                  flexGrow: 1, 
                  mr: 1,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: colors.primary[300],
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: statsGlobales.kmMoyenGlobal <= 20 ? colors.greenAccent[400] : 
                                    statsGlobales.kmMoyenGlobal <= 30 ? colors.primary[400] : 
                                    colors.redAccent[400],
                  }
                }} 
              />
              <Chip 
                label={statsGlobales.kmMoyenGlobal <= 20 ? "Excellent" : 
                       statsGlobales.kmMoyenGlobal <= 30 ? "Bon" : "À améliorer"}
                size="small"
                sx={{
                  backgroundColor: statsGlobales.kmMoyenGlobal <= 20 ? colors.greenAccent[400] : 
                                  statsGlobales.kmMoyenGlobal <= 30 ? colors.primary[400] : 
                                  colors.redAccent[400],
                  color: 'white'
                }}
              />
            </Box>
          </CardContent>
        </Card>

        {/* Average Cost per Intervention Card */}
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
              <TrendingUp sx={{ mr: 1, color: colors.redAccent[400] }} />
              <Typography variant="h6" color="textSecondary">
                Coût Moyen/Interv
              </Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              {statsGlobales.coutParInterventionMoyen.toFixed(0)} DH
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Par intervention
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {statsGlobales.kmMoyenGlobal.toFixed(1)} km en moyenne
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Charts Section */}
      {villesRentabilite.length > 0 && (
        <Box
          sx={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            flexWrap: "wrap",
            gap: 3,
            mb: 4,
          }}
        >
          {/* Km Moyen par Ville Chart */}
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
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Kilométrage Moyen par Ville
            </Typography>
            
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={efficaciteParVilleData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.primary[300]} />
                  <XAxis dataKey="name" tick={{ fill: colors.primary[200] }} />
                  <YAxis 
                    tick={{ fill: colors.primary[200] }}
                    label={{ 
                      value: 'Km Moyen/Intervention', 
                      angle: -90, 
                      position: 'insideLeft',
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
                    formatter={(value: number, name: string) => {
                      switch (name) {
                        case 'kmMoyen': return [`${value} km`, 'Km Moyen'];
                        case 'interventions': return [value, 'Interventions'];
                        case 'clients': return [value, 'Clients'];
                        case 'totalKm': return [`${value} km`, 'Km Total'];
                        default: return [value, name];
                      }
                    }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="kmMoyen" 
                    name="Km Moyen/Intervention" 
                    fill={colors.blueAccent[400]} 
                    radius={[4, 4, 0, 0]}
                  />
                </RechartsBarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>

          {/* Évolution des Métriques */}
          {periodeStats.length > 0 && (
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
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Évolution Mensuelle
              </Typography>
              
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={evolutionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.primary[300]} />
                    <XAxis dataKey="mois" tick={{ fill: colors.primary[200] }} />
                    <YAxis 
                      yAxisId="left"
                      tick={{ fill: colors.primary[200] }}
                      label={{ 
                        value: 'Km Moyen', 
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
                      formatter={(value: number, name: string) => {
                        switch (name) {
                          case 'kmMoyen': return [`${value.toFixed(1)} km`, 'Km Moyen'];
                          case 'interventions': return [value, 'Interventions'];
                          case 'kmTotal': return [`${value} km`, 'Km Total'];
                          case 'coutTransport': return [`${value.toLocaleString()} DH`, 'Coût Transport'];
                          default: return [value, name];
                        }
                      }}
                    />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="kmMoyen"
                      stroke={colors.greenAccent[400]}
                      strokeWidth={2}
                      dot={{ r: 4, fill: colors.greenAccent[500] }}
                      activeDot={{ r: 6, fill: colors.greenAccent[800] }}
                      name="Km Moyen"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="interventions"
                      stroke={colors.blueAccent[400]}
                      strokeWidth={2}
                      dot={{ r: 4, fill: colors.blueAccent[500] }}
                      activeDot={{ r: 6, fill: colors.blueAccent[800] }}
                      name="Interventions"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          )}
        </Box>
      )}

      {/* Clients Efficiency Table */}
      {clientsAvecScore.length > 0 && (
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2, mb: 4, bgcolor: colors.primary[400] }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Efficacité par Client
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {clientsAvecScore.length} clients
            </Typography>
          </Box>

          <TableContainer sx={{ maxHeight: 400 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Client</TableCell>
                  <TableCell align="right">Ville</TableCell>
                  <TableCell align="right">Interventions</TableCell>
                  <TableCell align="right">Km Total</TableCell>
                  <TableCell align="right">Km Moyen</TableCell>
                  <TableCell align="right">Coût/Interv</TableCell>
                  <TableCell align="right">Score</TableCell>
                  <TableCell align="right">Statut</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {clientsAvecScore.map((client) => {
                  const score = (client as any).scoreEfficacite;
                  const categorie = (client as any).categorie;
                  return (
                    <TableRow key={client.cin} hover>
                      <TableCell>
                        <Typography fontWeight="500">{client.fullName}</Typography>
                        <Typography variant="body2" color="textSecondary">
                          {client.cin}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Chip 
                          label={client.ville || "Non spécifié"} 
                          size="small" 
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">{client.nbInterventions}</TableCell>
                      <TableCell align="right">{client.totalKm.toFixed(0)} km</TableCell>
                      <TableCell align="right">{client.kmMoyenParIntervention.toFixed(1)} km</TableCell>
                      <TableCell align="right">{client.coutParIntervention.toFixed(0)} DH</TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
                          <Typography sx={{ mr: 1, fontWeight: 500 }}>
                            {score.toFixed(1)}/100
                          </Typography>
                          {score >= 80 ? (
                            <TrendingUp fontSize="small" sx={{ color: colors.greenAccent[500] }} />
                          ) : score >= 60 ? (
                            <TrendingUp fontSize="small" sx={{ color: colors.primary[500] }} />
                          ) : (
                            <TrendingDown fontSize="small" sx={{ color: colors.redAccent[500] }} />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Chip 
                          label={categorie}
                          size="small"
                          sx={{
                            backgroundColor: getCategorieColor(score),
                            color: 'white',
                            fontWeight: 500
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Scatter Plot */}
      {scatterData.length > 0 && (
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2, mb: 4, bgcolor: colors.primary[400] }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
            Relation: Interventions vs Efficacité
          </Typography>
          
          <Box sx={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.primary[300]} />
                <XAxis 
                  type="number" 
                  dataKey="x" 
                  name="Interventions" 
                  tick={{ fill: colors.primary[200] }}
                  label={{ 
                    value: 'Nombre d\'Interventions', 
                    position: 'insideBottom', 
                    offset: -5,
                    fill: colors.primary[200]
                  }}
                />
                <YAxis 
                  type="number" 
                  dataKey="y" 
                  name="Score" 
                  tick={{ fill: colors.primary[200] }}
                  label={{ 
                    value: 'Score d\'Efficacité', 
                    angle: -90, 
                    position: 'insideLeft',
                    fill: colors.primary[200]
                  }}
                />
                <ZAxis type="number" dataKey="z" range={[50, 400]} name="Km Total" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    padding: "10px",
                  }}
                  formatter={(value: number, name: string) => {
                    if (name === 'x') return [`${value} interventions`, 'Interventions'];
                    if (name === 'y') return [`${value}/100`, 'Score d\'Efficacité'];
                    if (name === 'z') return [`${value} km`, 'Km Total'];
                    return [value, name];
                  }}
                  labelFormatter={(label, payload) => {
                    if (payload && payload[0]) {
                      const data = payload[0].payload;
                      return `${data.name} - ${data.ville} (${data.kmMoyen.toFixed(1)} km moyen)`;
                    }
                    return label;
                  }}
                />
                <Legend />
                <Scatter
                  name="Clients"
                  data={scatterData}
                  fill={colors.blueAccent[400]}
                  shape="circle"
                />
              </ScatterChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
      )}

      {/* Message si aucune donnée */}
      {clientsRentabilite.length === 0 && !error && !loading && (
        <Alert severity="info">
          <Typography>
            Aucune donnée disponible pour les critères sélectionnés. 
            Les données seront disponibles lorsque des interventions seront enregistrées.
          </Typography>
        </Alert>
      )}
    </Box>
  );
};

export default ClientRentabiliteDashboard;