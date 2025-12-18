// components/admin/ClientReportsDashboard.tsx
import React, { useState, useEffect, useRef } from "react";
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
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
  PictureAsPdf,
  Print,
  Email,
  FilterList,
  Search,
  CalendarMonth,
  BarChart,
} from "@mui/icons-material";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  type PieLabelRenderProps,
} from "recharts";
import { tokens } from "../../../shared-theme/theme";
import { useSelector } from "react-redux";
import { selectIsCollapsed } from "../../../features/slices/layoutSlice";
import api from "../../../Interceptors/api";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

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

interface InterventionDetail {
  id: number;
  date: string;
  distanceKm: number;
  technicianName: string;
  status: string;
}

interface ClientReportData {
  clientInfo: ClientRentabilityDTO;
  interventions: InterventionDetail[];
  statsByMonth: Array<{
    mois: string;
    interventions: number;
    totalKm: number;
    coutTransport: number;
  }>;
  efficiencyScore: number;
  category: string;
}

interface ClientStatistics {
  totalClients: number;
  totalInterventions: number;
  totalKm: number;
  coutTransportTotal: number;
  averageEfficiencyScore: number;
}

interface CategoryData {
  name: string;
  value: number;
}

const ClientReportsDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [loading, setLoading] = useState(true);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState<ClientRentabilityDTO | null>(null);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportData, setReportData] = useState<ClientReportData | null>(null);
  const [periode, setPeriode] = useState<string>("annee");
  
  const isCollapsed = useSelector(selectIsCollapsed);
  const colors = tokens(theme.palette.mode);
  const reportRef = useRef<HTMLDivElement>(null);
  
  // États pour les données
  const [clientsRentabilite, setClientsRentabilite] = useState<ClientRentabilityDTO[]>([]);
  const [filteredClients, setFilteredClients] = useState<ClientRentabilityDTO[]>([]);
  const [statsGlobales, setStatsGlobales] = useState<ClientStatistics>({
    totalClients: 0,
    totalInterventions: 0,
    totalKm: 0,
    coutTransportTotal: 0,
    averageEfficiencyScore: 0,
  });

  // Fonction pour calculer le score d'efficacité (0-100)
  const calculerScoreEfficacite = (kmMoyen: number): number => {
    if (kmMoyen <= 0) return 0;
    const facteurPenalite = 2.0;
    const score = Math.max(0, 100 - (kmMoyen * facteurPenalite));
    return Math.round(score * 10) / 10;
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
    if (score >= 40) return colors.redAccent[700];
    return colors.redAccent[500];
  };

  // Fonction pour la couleur des catégories dans le pie chart
  const getCategoryColorByName = (categoryName: string): string => {
    switch(categoryName) {
      case "Très Efficace": return colors.greenAccent[500];
      case "Efficace": return colors.primary[500];
      case "Acceptable": return colors.redAccent[500];
      case "Peu Efficace": return colors.redAccent[500];
      default: return colors.primary[300];
    }
  };

  // Fonction pour personnaliser le label du pie chart (version simple)
  const renderCustomizedLabel = (props: PieLabelRenderProps) => {
    const { percent, name } = props;
    
    if (percent === undefined) return null;
    
    return (
      <text 
        x={0} 
        y={0} 
        dy={8} 
        textAnchor="middle" 
        fill="white"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Fonction pour obtenir les statistiques mensuelles (simulation de l'API)
  const getMonthlyStatsFromInterventions = (interventions: InterventionDetail[]): Array<{
    mois: string;
    interventions: number;
    totalKm: number;
    coutTransport: number;
  }> => {
    if (!interventions || interventions.length === 0) return [];
    
    // Grouper les interventions par mois
    const interventionsParMois: Record<string, {
      interventions: number;
      totalKm: number;
      coutTransport: number;
      mois:string;
    }> = {};
    
    interventions.forEach(intervention => {
      const date = new Date(intervention.date);
      const moisKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      const moisLabel = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
      
      if (!interventionsParMois[moisKey]) {
        interventionsParMois[moisKey] = {
          interventions: 0,
          totalKm: 0,
          coutTransport: 0,
          mois: moisLabel
        };
      }
      
      // Coût estimé : 3 DH par km (à adapter selon ta logique)
      const coutTransport = intervention.distanceKm * 3;
      
      interventionsParMois[moisKey].interventions += 1;
      interventionsParMois[moisKey].totalKm += intervention.distanceKm;
      interventionsParMois[moisKey].coutTransport += coutTransport;
    });
    
    // Trier par mois (du plus ancien au plus récent)
    return Object.entries(interventionsParMois)
      .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
      .map(([_, data]) => data);
  };

  // Fetch des données clients
  const fetchClientsData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get(`/admin/clients-rentability/${periode}`);
      const clientsData: ClientRentabilityDTO[] = response.data;
      
      setClientsRentabilite(clientsData);
      setFilteredClients(clientsData);
      
      // Calculer les stats globales
      if (clientsData.length > 0) {
        let totalScore = 0;
        const totalStats = clientsData.reduce((acc, client) => {
          const score = calculerScoreEfficacite(client.kmMoyenParIntervention);
          totalScore += score;
          
          return {
            totalClients: acc.totalClients + 1,
            totalInterventions: acc.totalInterventions + client.nbInterventions,
            totalKm: acc.totalKm + client.totalKm,
            coutTransportTotal: acc.coutTransportTotal + client.coutTransport,
            averageEfficiencyScore: totalScore,
          };
        }, {
          totalClients: 0,
          totalInterventions: 0,
          totalKm: 0,
          coutTransportTotal: 0,
          averageEfficiencyScore: 0,
        });
        
        // Calculer la moyenne des scores
        totalStats.averageEfficiencyScore = totalScore / clientsData.length;
        
        setStatsGlobales(totalStats);
      }
      
    } catch (err: any) {
      console.error("Erreur lors de la récupération des données:", err);
      setError(err.response?.data?.message || err.message || "Erreur de chargement des données");
      setClientsRentabilite([]);
      setFilteredClients([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch des données du rapport client
  const fetchClientReportData = async (client: ClientRentabilityDTO) => {
    setGeneratingReport(true);
    setSelectedClient(client);
    
    try {
      // Récupérer les interventions du client
      const interventionsResponse = await api.get(`/admin/client-interventions/${client.cin}/${periode}`);
      const interventionsData: InterventionDetail[] = interventionsResponse.data;
      
      // Calculer les statistiques mensuelles à partir des interventions
      const monthlyStats = getMonthlyStatsFromInterventions(interventionsData);
      
      // Calculer le score d'efficacité
      const score = calculerScoreEfficacite(client.kmMoyenParIntervention);
      const category = getCategorieEfficacite(score);
      
      setReportData({
        clientInfo: client,
        interventions: interventionsData,
        statsByMonth: monthlyStats,
        efficiencyScore: score,
        category: category,
      });
      
      setReportDialogOpen(true);
    } catch (err: any) {
      console.error("Erreur lors de la récupération du rapport client:", err);
      setError(err.response?.data?.message || err.message || "Erreur lors de la génération du rapport détaillé");
    } finally {
      setGeneratingReport(false);
    }
  };

  // Récupérer les données globales des clients
  useEffect(() => {
    fetchClientsData();
  }, [periode]);

  // Filtre de recherche
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredClients(clientsRentabilite);
    } else {
      const filtered = clientsRentabilite.filter(client =>
        client.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.cin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (client.ville && client.ville.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredClients(filtered);
    }
  }, [searchTerm, clientsRentabilite]);

  // Générer un rapport pour un client
  const genererRapportClient = async (client: ClientRentabilityDTO) => {
    await fetchClientReportData(client);
  };

  // Télécharger le rapport en PDF
  const telechargerRapportPDF = async () => {
    if (!reportRef.current || !reportData) return;
    
    setGeneratingReport(true);
    
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Rapport_${reportData.clientInfo.cin}_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error("Erreur lors de la génération du PDF:", err);
      setError("Erreur lors de la génération du PDF");
    } finally {
      setGeneratingReport(false);
    }
  };

  // Exporter les données en CSV
  const exporterCSV = () => {
    if (!reportData) return;
    
    const headers = ["Date", "Description", "Distance (km)", "Technicien", "Statut"];
    const csvRows = [
      headers.join(","),
      ...reportData.interventions.map(int => 
        [
          int.date,
          int.distanceKm,
          `"${int.technicianName}"`,
          int.status
        ].join(",")
      )
    ];
    
    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `Interventions_${reportData.clientInfo.cin}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Exporter tous les clients en CSV
  const exporterTousClientsCSV = () => {
    const headers = ["CIN", "Nom Complet", "Ville", "Interventions", "Km Total", "Km Moyen", "Coût Transport", "Coût/Intervention", "Score Efficacité", "Catégorie"];
    
    const csvRows = [
      headers.join(","),
      ...clientsRentabilite.map(client => {
        const score = calculerScoreEfficacite(client.kmMoyenParIntervention);
        const categorie = getCategorieEfficacite(score);
        
        return [
          client.cin,
          `"${client.fullName}"`,
          `"${client.ville || ""}"`,
          client.nbInterventions,
          client.totalKm.toFixed(2),
          client.kmMoyenParIntervention.toFixed(2),
          client.coutTransport.toFixed(2),
          client.coutParIntervention.toFixed(2),
          score.toFixed(2),
          `"${categorie}"`
        ].join(",");
      })
    ];
    
    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `Tous_Clients_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Top 5 clients les plus efficaces
  const top5Clients = [...clientsRentabilite]
    .map(client => ({
      ...client,
      scoreEfficacite: calculerScoreEfficacite(client.kmMoyenParIntervention),
      categorie: getCategorieEfficacite(calculerScoreEfficacite(client.kmMoyenParIntervention))
    }))
    .sort((a: any, b: any) => b.scoreEfficacite - a.scoreEfficacite)
    .slice(0, 5);

  // Data pour le graphique des top clients
  const topClientsData = top5Clients.map((client: any) => ({
    name: client.fullName.substring(0, 15) + (client.fullName.length > 15 ? "..." : ""),
    score: client.scoreEfficacite,
    interventions: client.nbInterventions,
    kmMoyen: client.kmMoyenParIntervention,
    color: getCategorieColor(client.scoreEfficacite)
  }));

  // Data pour le graphique de répartition par catégorie
  const categoriesData: CategoryData[] = clientsRentabilite.reduce((acc, client) => {
    const score = calculerScoreEfficacite(client.kmMoyenParIntervention);
    const categorie = getCategorieEfficacite(score);
    
    const existing = acc.find(item => item.name === categorie);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: categorie, value: 1 });
    }
    
    return acc;
  }, [] as CategoryData[]);

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
          Chargement des rapports...
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
      

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography fontWeight="bold">Erreur:</Typography>
          <Typography>{error}</Typography>
        </Alert>
      )}

      {/* Filters et Recherche */}
      <Paper elevation={2} sx={{ p: 2, mb: 4, bgcolor: colors.primary[400] }}>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, flex: 1 }}>
            {/* Période Select */}
            <Box sx={{ flex: isMobile ? "1 1 100%" : "1 1 200px", minWidth: 200 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Période d'analyse</InputLabel>
                <Select
                  value={periode}
                  label="Période d'analyse"
                  onChange={(e) => setPeriode(e.target.value)}
                >
                  <MenuItem value="mois">Ce mois</MenuItem>
                  <MenuItem value="trimestre">Ce trimestre</MenuItem>
                  <MenuItem value="annee">Cette année</MenuItem>
                </Select>
              </FormControl>
            </Box>
            
            {/* Search Field */}
            <Box sx={{ flex: isMobile ? "1 1 100%" : "2 1 300px", minWidth: 250 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Rechercher par nom, CIN ou ville..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: colors.primary[200] }} />,
                }}
              />
            </Box>
          </Box>
          
          {/* Export Button */}
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={exporterTousClientsCSV}
            sx={{
              backgroundColor: colors.greenAccent[400],
              '&:hover': {
                backgroundColor: colors.greenAccent[500],
              },
            }}
          >
            Exporter CSV
          </Button>
        </Box>
      </Paper>

      {/* Stats Globales */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Vue d'ensemble
        </Typography>
        <Box sx={{ 
          display: "flex", 
          flexWrap: "wrap", 
          gap: 2,
          '& > *': {
            flex: isMobile ? '1 1 100%' : '1 1 calc(25% - 16px)',
            minWidth: isMobile ? '100%' : 200
          }
        }}>
          {/* Clients Actifs Card */}
          <Card sx={{ bgcolor: colors.primary[400] }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <People sx={{ color: colors.blueAccent[400] }} />
                <Typography color="textSecondary" variant="body2">
                  Clients Actifs
                </Typography>
              </Box>
              <Typography variant="h5" fontWeight={700}>
                {statsGlobales.totalClients}
              </Typography>
            </CardContent>
          </Card>
          
          {/* Interventions Total Card */}
          <Card sx={{ bgcolor: colors.primary[400] }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Timeline sx={{ color: colors.greenAccent[400] }} />
                <Typography color="textSecondary" variant="body2">
                  Interventions Total
                </Typography>
              </Box>
              <Typography variant="h5" fontWeight={700}>
                {statsGlobales.totalInterventions}
              </Typography>
            </CardContent>
          </Card>
          
          {/* Score Moyen Card */}
          <Card sx={{ bgcolor: colors.primary[400] }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <TrendingUp sx={{ color: colors.greenAccent[400] }} />
                <Typography color="textSecondary" variant="body2">
                  Score Moyen d'Efficacité
                </Typography>
              </Box>
              <Typography variant="h5" fontWeight={700}>
                {statsGlobales.averageEfficiencyScore.toFixed(1)}/100
              </Typography>
            </CardContent>
          </Card>
          
          {/* Coût Transport Card */}
          <Card sx={{ bgcolor: colors.primary[400] }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <DirectionsCar sx={{ color: colors.redAccent[400] }} />
                <Typography color="textSecondary" variant="body2">
                  Coût Transport
                </Typography>
              </Box>
              <Typography variant="h5" fontWeight={700}>
                {statsGlobales.coutTransportTotal.toLocaleString()} DH
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Graphiques */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 4 }}>
        {/* Top 5 Clients */}
        {top5Clients.length > 0 && (
          <Paper elevation={3} sx={{ 
            p: 3, 
            flex: isMobile ? '1 1 100%' : '1 1 calc(60% - 12px)',
            minWidth: isMobile ? '100%' : 300,
            bgcolor: colors.primary[400] 
          }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Top 5 Clients les Plus Efficaces
            </Typography>
            
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={topClientsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.primary[300]} />
                  <XAxis dataKey="name" tick={{ fill: colors.primary[200] }} />
                  <YAxis 
                    tick={{ fill: colors.primary[200] }}
                    label={{ 
                      value: 'Score d\'Efficacité', 
                      angle: -90, 
                      position: 'insideLeft',
                      fill: colors.primary[200]
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: colors.primary[400],
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                      padding: "10px",
                    }}
                    formatter={(value: number, name: string) => {
                      switch (name) {
                        case 'score': return [`${value}/100`, 'Score'];
                        case 'interventions': return [value, 'Interventions'];
                        case 'kmMoyen': return [`${value.toFixed(1)} km`, 'Km Moyen'];
                        default: return [value, name];
                      }
                    }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="score" 
                    name="Score d'Efficacité" 
                    fill={colors.blueAccent[400]} 
                    radius={[4, 4, 0, 0]}
                  />
                </RechartsBarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        )}

        {/* Répartition par Catégorie */}
        {categoriesData.length > 0 && (
          <Paper elevation={3} sx={{ 
            p: 3, 
            flex: isMobile ? '1 1 100%' : '1 1 calc(40% - 12px)',
            minWidth: isMobile ? '100%' : 300,
            bgcolor: colors.primary[400] 
          }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Répartition par Catégorie
            </Typography>
            
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoriesData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoriesData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={getCategoryColorByName(entry.name)} 
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => {
                      const total = categoriesData.reduce((sum, item) => sum + item.value, 0);
                      const percentage = ((value / total) * 100).toFixed(1);
                      return [`${value} clients (${percentage}%)`, 'Nombre'];
                    }}
                    labelFormatter={(name) => `Catégorie: ${name}`}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        )}
      </Box>

      {/* Liste des Clients */}
      <Paper elevation={3} sx={{ mb: 4, bgcolor: colors.primary[400] }}>
        <Box sx={{ p: 3, borderBottom: `1px solid ${colors.primary[300]}` }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Liste des Clients ({filteredClients.length})
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Cliquez sur un client pour générer un rapport détaillé
          </Typography>
        </Box>

        <TableContainer sx={{ maxHeight: 500 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Client</TableCell>
                <TableCell align="right">Ville</TableCell>
                <TableCell align="right">Interventions</TableCell>
                <TableCell align="right">Km Total</TableCell>
                <TableCell align="right">Km Moyen</TableCell>
                <TableCell align="right">Score</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredClients.map((client) => {
                const score = calculerScoreEfficacite(client.kmMoyenParIntervention);
                const categorie = getCategorieEfficacite(score);
                
                return (
                  <TableRow key={client.cin} hover>
                    <TableCell>
                      <Box>
                        <Typography fontWeight="500">{client.fullName}</Typography>
                        <Typography variant="body2" color="textSecondary">
                          CIN: {client.cin}
                        </Typography>
                      </Box>
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
                    <TableCell align="right">
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
                        <Typography sx={{ mr: 1, fontWeight: 500 }}>
                          {score.toFixed(1)}/100
                        </Typography>
                        <Chip 
                          label={categorie}
                          size="small"
                          sx={{
                            backgroundColor: getCategorieColor(score),
                            color: 'white',
                            minWidth: 100
                          }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<BarChart />}
                          onClick={() => genererRapportClient(client)}
                          disabled={generatingReport}
                          sx={{
                            borderColor: colors.blueAccent[400],
                            color: colors.blueAccent[400]
                          }}
                        >
                          Rapport
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {filteredClients.length === 0 && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="textSecondary">
              {searchTerm ? "Aucun client ne correspond à votre recherche" : "Aucun client disponible"}
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Dialog pour le Rapport */}
      <Dialog
        open={reportDialogOpen}
        onClose={() => setReportDialogOpen(false)}
        maxWidth="lg"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">
              Rapport Client: {reportData?.clientInfo.fullName}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton onClick={telechargerRapportPDF} disabled={generatingReport}>
                {generatingReport ? <CircularProgress size={24} /> : <PictureAsPdf />}
              </IconButton>
              <IconButton onClick={exporterCSV}>
                <Download />
              </IconButton>
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent dividers>
          {reportData && (
            <Box ref={reportRef} sx={{ p: 2 }}>
              {/* En-tête du Rapport */}
              <Box sx={{ mb: 4, borderBottom: `2px solid ${colors.primary[300]}`, pb: 2 }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                  Rapport d'Efficacité Client
                </Typography>
                <Box sx={{ 
                  display: "flex", 
                  flexWrap: "wrap", 
                  gap: 3,
                  '& > *': {
                    flex: isMobile ? '1 1 100%' : '1 1 calc(50% - 12px)'
                  }
                }}>
                  <Box>
                    <Typography variant="body1">
                      <strong>Client:</strong> {reportData.clientInfo.fullName}
                    </Typography>
                    <Typography variant="body1">
                      <strong>CIN:</strong> {reportData.clientInfo.cin}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Ville:</strong> {reportData.clientInfo.ville || "Non spécifié"}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body1">
                      <strong>Période d'analyse:</strong> {periode === "mois" ? "Ce mois" : 
                                                          periode === "trimestre" ? "Ce trimestre" : 
                                                          "Cette année"}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Date de génération:</strong> {new Date().toLocaleDateString('fr-FR')}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Résumé des Métriques */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  Résumé des Performances
                </Typography>
                <Box sx={{ 
                  display: "flex", 
                  flexWrap: "wrap", 
                  gap: 2,
                  '& > *': {
                    flex: isMobile ? '1 1 100%' : '1 1 calc(25% - 8px)',
                    minWidth: isMobile ? '100%' : 150
                  }
                }}>
                  <Card sx={{ bgcolor: colors.primary[400], p: 2 }}>
                    <Typography color="textSecondary" variant="body2">
                      Interventions
                    </Typography>
                    <Typography variant="h4" fontWeight={700}>
                      {reportData.clientInfo.nbInterventions}
                    </Typography>
                  </Card>
                  
                  <Card sx={{ bgcolor: colors.primary[400], p: 2 }}>
                    <Typography color="textSecondary" variant="body2">
                      Km Parcourus
                    </Typography>
                    <Typography variant="h4" fontWeight={700}>
                      {reportData.clientInfo.totalKm.toFixed(0)} km
                    </Typography>
                  </Card>
                  
                  <Card sx={{ bgcolor: colors.primary[400], p: 2 }}>
                    <Typography color="textSecondary" variant="body2">
                      Coût Transport
                    </Typography>
                    <Typography variant="h4" fontWeight={700}>
                      {reportData.clientInfo.coutTransport.toLocaleString()} DH
                    </Typography>
                  </Card>
                  
                  <Card sx={{ 
                    bgcolor: getCategorieColor(reportData.efficiencyScore) + '20', 
                    p: 2,
                    border: `2px solid ${getCategorieColor(reportData.efficiencyScore)}`
                  }}>
                    <Typography color="textSecondary" variant="body2">
                      Score d'Efficacité
                    </Typography>
                    <Typography variant="h4" fontWeight={700}>
                      {reportData.efficiencyScore.toFixed(1)}/100
                    </Typography>
                    <Chip 
                      label={reportData.category}
                      size="small"
                      sx={{
                        backgroundColor: getCategorieColor(reportData.efficiencyScore),
                        color: 'white',
                        mt: 1
                      }}
                    />
                  </Card>
                </Box>
              </Box>

              {/* Graphiques */}
              {reportData.statsByMonth && reportData.statsByMonth.length > 0 && (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    Analyse Détaillée
                  </Typography>
                  
                  <Box sx={{ 
                    display: "flex", 
                    flexWrap: "wrap", 
                    gap: 3,
                    '& > *': {
                      flex: isMobile ? '1 1 100%' : '1 1 calc(50% - 12px)',
                      minWidth: isMobile ? '100%' : 300
                    }
                  }}>
                    <Paper sx={{ p: 2, height: 300 }}>
                      <Typography variant="h6" gutterBottom>
                        Évolution Mensuelle
                      </Typography>
                      <ResponsiveContainer width="100%" height="85%">
                        <LineChart data={reportData.statsByMonth}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="mois" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="interventions"
                            stroke={colors.blueAccent[400]}
                            name="Interventions"
                          />
                          <Line
                            type="monotone"
                            dataKey="totalKm"
                            stroke={colors.greenAccent[400]}
                            name="Km Totaux"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </Paper>
                    
                    <Paper sx={{ p: 2, height: 300 }}>
                      <Typography variant="h6" gutterBottom>
                        Répartition des Coûts
                      </Typography>
                      <ResponsiveContainer width="100%" height="85%">
                        <RechartsBarChart data={[
                          { name: 'Coût Transport', value: reportData.clientInfo.coutTransport },
                          { name: 'Km Moyen/Interv', value: reportData.clientInfo.kmMoyenParIntervention },
                          { name: 'Coût/Interv', value: reportData.clientInfo.coutParIntervention },
                        ]}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="value" fill={colors.redAccent[400]} />
                        </RechartsBarChart>
                      </ResponsiveContainer>
                    </Paper>
                  </Box>
                </Box>
              )}

              {/* Détails des Interventions */}
              {reportData.interventions && reportData.interventions.length > 0 && (
                <Box>
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    Détails des Interventions ({reportData.interventions.length})
                  </Typography>
                  
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Date</TableCell>
                          <TableCell>Description</TableCell>
                          <TableCell align="right">Distance (km)</TableCell>
                          <TableCell>Technicien</TableCell>
                          <TableCell>Statut</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {reportData.interventions.map((intervention, index) => (
                          <TableRow key={index}>
                            <TableCell>{new Date(intervention.date).toLocaleDateString('fr-FR')}</TableCell>
                            <TableCell align="right">{intervention.distanceKm}</TableCell>
                            <TableCell>{intervention.technicianName}</TableCell>
                            <TableCell>
                              <Chip 
                                label={intervention.status} 
                                size="small"
                                color={intervention.status === "VALIDATED" ? "success" : 
                                       intervention.status === "REJECTED" ? "error" : "warning"}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}

              {/* Recommandations */}
              <Box sx={{ mt: 4, p: 3, bgcolor: colors.primary[400], borderRadius: 1 }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  Recommandations
                </Typography>
                <Typography variant="body1">
                  {reportData.efficiencyScore >= 80 
                    ? "Excellent travail! Le client présente une très bonne efficacité. Continuez à maintenir ce niveau de service."
                    : reportData.efficiencyScore >= 60
                    ? "Performance satisfaisante. Pensez à optimiser les trajets pour réduire les kilomètres parcourus."
                    : "Des améliorations sont nécessaires. Considérez la possibilité de regrouper les interventions ou de revoir la localisation des services."
                  }
                </Typography>
                <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic' }}>
                  Km moyen recommandé: &lt; 20 km/intervention
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setReportDialogOpen(false)}>
            Fermer
          </Button>
          <Button 
            onClick={telechargerRapportPDF} 
            variant="contained"
            startIcon={<PictureAsPdf />}
            disabled={generatingReport}
          >
            {generatingReport ? "Génération..." : "Télécharger PDF"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Message si aucune donnée */}
      {clientsRentabilite.length === 0 && !error && !loading && (
        <Alert severity="info">
          <Typography>
            Aucune donnée client disponible. Les rapports seront générables lorsque des interventions seront enregistrées.
          </Typography>
        </Alert>
      )}
    </Box>
  );
};

export default ClientReportsDashboard;