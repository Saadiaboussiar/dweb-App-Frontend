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
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  TrendingUp,
  AccountBalance,
  People,
  LocationCity,
  DirectionsCar,
  AttachMoney,
  TrendingDown,
  CalendarMonth,
  FilterList,
  Download,
  BarChart,
  PieChart,
  Timeline,
} from "@mui/icons-material";
import {
  LineChart,
  Line,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
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

// Types
interface ClientRentabilite {
  cin: string;
  fullName: string;
  ville: string;
  nbInterventions: number;
  totalKm: number;
  coutTransport: number;
  revenuTotal: number;
  tauxRentabilite: number; // %
  rentabiliteAbsolue: number; // DH
  kmMoyenParIntervention: number;
}

interface VilleRentabilite {
  name: string;
  nbClients: number;
  nbInterventions: number;
  totalKm: number;
  revenuTotal: number;
  tauxRentabiliteMoyen: number;
}

interface PeriodeStats {
  mois: string;
  revenuTotal: number;
  coutTransport: number;
  rentabilite: number;
  nbInterventions: number;
}

const ClientRentabiliteDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [periode, setPeriode] = useState<"mois" | "trimestre" | "annee">("mois");
  const [selectedVille, setSelectedVille] = useState<string>("toutes");
  
  const isCollapsed = useSelector(selectIsCollapsed);
  const colors = tokens(theme.palette.mode);
  
  // États pour les données
  const [clientsRentabilite, setClientsRentabilite] = useState<ClientRentabilite[]>([]);
  const [villesRentabilite, setVillesRentabilite] = useState<VilleRentabilite[]>([]);
  const [periodeStats, setPeriodeStats] = useState<PeriodeStats[]>([]);
  const [statsGlobales, setStatsGlobales] = useState({
    totalClients: 0,
    totalInterventions: 0,
    totalKm: 0,
    revenuTotal: 0,
    coutTransportTotal: 0,
    rentabiliteMoyenne: 0,
  });

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch clients rentability
        const clientsResponse = await api.get(`/admin/clients-rentabilite/${periode}`);
        setClientsRentabilite(clientsResponse.data);
        
        // Fetch cities rentability
        const villesResponse = await api.get(`/admin/villes-rentabilite?periode=${periode}`);
        setVillesRentabilite(villesResponse.data);
        
        // Fetch period stats
        const periodeResponse = await api.get(`/admin/periodes-rentabilite?periode=${periode}`);
        setPeriodeStats(periodeResponse.data);
        
        // Calculate global stats
        if (clientsResponse.data.length > 0) {
          const totalStats = clientsResponse.data.reduce((acc: any, client: ClientRentabilite) => ({
            totalClients: acc.totalClients + 1,
            totalInterventions: acc.totalInterventions + client.nbInterventions,
            totalKm: acc.totalKm + client.totalKm,
            revenuTotal: acc.revenuTotal + client.revenuTotal,
            coutTransportTotal: acc.coutTransportTotal + client.coutTransport,
            rentabiliteMoyenne: acc.rentabiliteMoyenne + client.tauxRentabilite,
          }), {
            totalClients: 0,
            totalInterventions: 0,
            totalKm: 0,
            revenuTotal: 0,
            coutTransportTotal: 0,
            rentabiliteMoyenne: 0,
          });
          
          totalStats.rentabiliteMoyenne = totalStats.rentabiliteMoyenne / clientsResponse.data.length;
          setStatsGlobales(totalStats);
        }
        
        setError(null);
      } catch (err: any) {
        console.error("Error fetching rentability data:", err);
        setError("Erreur de chargement des données de rentabilité");
        
        // Mock data for development
        const mockClients: ClientRentabilite[] = [
          {
            cin: "AB123456",
            fullName: "Client Premium SARL",
            ville: "Casablanca",
            nbInterventions: 15,
            totalKm: 450,
            coutTransport: 1350, // 450km × 3 DH/km
            revenuTotal: 15000,
            tauxRentabilite: 91, // ((15000-1350)/15000)*100
            rentabiliteAbsolue: 13650,
            kmMoyenParIntervention: 30,
          },
          {
            cin: "CD789012",
            fullName: "Entreprise Solutions",
            ville: "Rabat",
            nbInterventions: 8,
            totalKm: 320,
            coutTransport: 960,
            revenuTotal: 8000,
            tauxRentabilite: 88,
            rentabiliteAbsolue: 7040,
            kmMoyenParIntervention: 40,
          },
          {
            cin: "EF345678",
            fullName: "Shop Maroc",
            ville: "Casablanca",
            nbInterventions: 5,
            totalKm: 100,
            coutTransport: 300,
            revenuTotal: 2500,
            tauxRentabilite: 88,
            rentabiliteAbsolue: 2200,
            kmMoyenParIntervention: 20,
          },
        ];
        
        const mockVilles: VilleRentabilite[] = [
          { name: "Casablanca", nbClients: 2, nbInterventions: 20, totalKm: 550, revenuTotal: 17500, tauxRentabiliteMoyen: 89.5 },
          { name: "Rabat", nbClients: 1, nbInterventions: 8, totalKm: 320, revenuTotal: 8000, tauxRentabiliteMoyen: 88 },
          { name: "Marrakech", nbClients: 0, nbInterventions: 0, totalKm: 0, revenuTotal: 0, tauxRentabiliteMoyen: 0 },
        ];
        
        const mockPeriodes: PeriodeStats[] = [
          { mois: "Jan", revenuTotal: 15000, coutTransport: 1350, rentabilite: 91, nbInterventions: 15 },
          { mois: "Fév", revenuTotal: 14000, coutTransport: 1300, rentabilite: 90.7, nbInterventions: 14 },
          { mois: "Mar", revenuTotal: 16000, coutTransport: 1450, rentabilite: 90.9, nbInterventions: 16 },
          { mois: "Avr", revenuTotal: 17000, coutTransport: 1550, rentabilite: 90.9, nbInterventions: 17 },
          { mois: "Mai", revenuTotal: 18000, coutTransport: 1650, rentabilite: 90.8, nbInterventions: 18 },
          { mois: "Juin", revenuTotal: 17500, coutTransport: 1600, rentabilite: 90.9, nbInterventions: 17 },
        ];
        
        setClientsRentabilite(mockClients);
        setVillesRentabilite(mockVilles);
        setPeriodeStats(mockPeriodes);
        setStatsGlobales({
          totalClients: 3,
          totalInterventions: 28,
          totalKm: 870,
          revenuTotal: 25500,
          coutTransportTotal: 2610,
          rentabiliteMoyenne: 89,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [periode]);

  // Filter clients by city
  const filteredClients = selectedVille === "toutes" 
    ? clientsRentabilite 
    : clientsRentabilite.filter(client => client.ville === selectedVille);

  // Top 5 most profitable clients
  const top5Clients = [...filteredClients]
    .sort((a, b) => b.tauxRentabilite - a.tauxRentabilite)
    .slice(0, 5);

  // Data for charts
  const rentabiliteParVilleData = villesRentabilite
    .filter(v => v.nbClients > 0)
    .map(v => ({
      name: v.name,
      rentabilite: v.tauxRentabiliteMoyen,
      clients: v.nbClients,
      interventions: v.nbInterventions,
    }));

  const evolutionRentabiliteData = periodeStats;

  const scatterData = filteredClients.map(client => ({
    x: client.nbInterventions,
    y: client.tauxRentabilite,
    z: client.revenuTotal / 1000, // Scale down for bubble size
    name: client.fullName,
    ville: client.ville,
  }));

  // Helper functions
  const getRentabiliteColor = (taux: number) => {
    if (taux >= 90) return colors.greenAccent[500];
    if (taux >= 80) return colors.yellowAccent[500];
    return colors.redAccent[500];
  };

  const getRentabiliteLabel = (taux: number) => {
    if (taux >= 90) return "Très Rentable";
    if (taux >= 80) return "Rentable";
    if (taux >= 70) return "Acceptable";
    return "Peu Rentable";
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
          Chargement des données de rentabilité...
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
          Rentabilité des Clients
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Analyse de la rentabilité par client, ville et période
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Paper elevation={2} sx={{ p: 2, mb: 4, bgcolor: colors.primary[400] }}>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Période</InputLabel>
            <Select
              value={periode}
              label="Période"
              onChange={(e) => setPeriode(e.target.value as any)}
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
              {Array.from(new Set(clientsRentabilite.map(c => c.ville))).map(ville => (
                <MenuItem key={ville} value={ville}>{ville}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <IconButton>
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
        {/* Total Revenue Card */}
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
              <AttachMoney sx={{ mr: 1, color: colors.greenAccent[400] }} />
              <Typography variant="h6" color="textSecondary">
                Revenu Total
              </Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              {statsGlobales.revenuTotal.toLocaleString()} DH
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {statsGlobales.totalClients} clients
            </Typography>
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
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <DirectionsCar sx={{ mr: 1, color: colors.blueAccent[400] }} />
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
          </CardContent>
        </Card>

        {/* Average Profitability Card */}
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
              <TrendingUp sx={{ mr: 1, color: colors.yellowAccent[400] }} />
              <Typography variant="h6" color="textSecondary">
                Rentabilité Moyenne
              </Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              {statsGlobales.rentabiliteMoyenne.toFixed(1)}%
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
              <LinearProgress 
                variant="determinate" 
                value={statsGlobales.rentabiliteMoyenne} 
                sx={{ 
                  flexGrow: 1, 
                  mr: 1,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: colors.primary[300],
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: getRentabiliteColor(statsGlobales.rentabiliteMoyenne),
                  }
                }} 
              />
              <Chip 
                label={getRentabiliteLabel(statsGlobales.rentabiliteMoyenne)}
                size="small"
                sx={{
                  backgroundColor: getRentabiliteColor(statsGlobales.rentabiliteMoyenne),
                  color: 'white'
                }}
              />
            </Box>
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
              <People sx={{ mr: 1, color: colors.purpleAccent[400] }} />
              <Typography variant="h6" color="textSecondary">
                Interventions
              </Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              {statsGlobales.totalInterventions}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Moyenne: {(statsGlobales.totalInterventions / statsGlobales.totalClients).toFixed(1)} par client
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
        {/* Profitability by City Chart */}
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
            Rentabilité par Ville
          </Typography>
          
          <Box sx={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart data={rentabiliteParVilleData}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.primary[300]} />
                <XAxis dataKey="name" tick={{ fill: colors.primary[200] }} />
                <YAxis 
                  tick={{ fill: colors.primary[200] }}
                  label={{ 
                    value: 'Rentabilité (%)', 
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
                  formatter={(value: number, name: string) => [
                    name === 'rentabilite' ? `${value}%` : value.toString(),
                    name === 'rentabilite' ? 'Rentabilité' : name === 'clients' ? 'Clients' : 'Interventions'
                  ]}
                />
                <Legend />
                <Bar 
                  dataKey="rentabilite" 
                  name="Rentabilité (%)" 
                  fill={colors.blueAccent[400]} 
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="interventions" 
                  name="Interventions" 
                  fill={colors.greenAccent[400]} 
                  radius={[4, 4, 0, 0]}
                />
              </RechartsBarChart>
            </ResponsiveContainer>
          </Box>
        </Paper>

        {/* Profitability Trend Chart */}
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
            Évolution de la Rentabilité
          </Typography>
          
          <Box sx={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={evolutionRentabiliteData}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.primary[300]} />
                <XAxis dataKey="mois" tick={{ fill: colors.primary[200] }} />
                <YAxis 
                  tick={{ fill: colors.primary[200] }}
                  label={{ 
                    value: 'Rentabilité (%)', 
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
                  formatter={(value: number, name: string) => [
                    name === 'rentabilite' ? `${value}%` : 
                    name === 'revenuTotal' ? `${value} DH` : 
                    value.toString(),
                    name === 'rentabilite' ? 'Rentabilité' : 
                    name === 'revenuTotal' ? 'Revenu' : 'Interventions'
                  ]}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="rentabilite"
                  stroke={colors.greenAccent[400]}
                  strokeWidth={2}
                  dot={{ r: 4, fill: colors.greenAccent[500] }}
                  activeDot={{ r: 6, fill: colors.greenAccent[800] }}
                  name="Rentabilité (%)"
                />
                <Line
                  type="monotone"
                  dataKey="revenuTotal"
                  stroke={colors.blueAccent[400]}
                  strokeWidth={2}
                  dot={{ r: 4, fill: colors.blueAccent[500] }}
                  activeDot={{ r: 6, fill: colors.blueAccent[800] }}
                  name="Revenu (DH)"
                  yAxisId="right"
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
      </Box>

      {/* Clients Profitability Table */}
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2, mb: 4, bgcolor: colors.primary[400] }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Rentabilité par Client
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {filteredClients.length} clients
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
                <TableCell align="right">Revenu (DH)</TableCell>
                <TableCell align="right">Rentabilité</TableCell>
                <TableCell align="right">Statut</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredClients.map((client) => (
                <TableRow key={client.cin} hover>
                  <TableCell>
                    <Typography fontWeight="500">{client.fullName}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {client.cin}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Chip 
                      label={client.ville} 
                      size="small" 
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">{client.nbInterventions}</TableCell>
                  <TableCell align="right">{client.totalKm.toFixed(0)} km</TableCell>
                  <TableCell align="right">{client.revenuTotal.toLocaleString()} DH</TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
                      <Typography sx={{ mr: 1, fontWeight: 500 }}>
                        {client.tauxRentabilite.toFixed(1)}%
                      </Typography>
                      {client.tauxRentabilite >= 90 ? (
                        <TrendingUp fontSize="small" color="success" />
                      ) : client.tauxRentabilite >= 80 ? (
                        <TrendingUp fontSize="small" sx={{ color: colors.yellowAccent[500] }} />
                      ) : (
                        <TrendingDown fontSize="small" color="error" />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Chip 
                      label={getRentabiliteLabel(client.tauxRentabilite)}
                      size="small"
                      sx={{
                        backgroundColor: getRentabiliteColor(client.tauxRentabilite),
                        color: 'white',
                        fontWeight: 500
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Scatter Plot: Interventions vs Profitability */}
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2, mb: 4, bgcolor: colors.primary[400] }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
          Relation: Interventions vs Rentabilité
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
                name="Rentabilité" 
                tick={{ fill: colors.primary[200] }}
                label={{ 
                  value: 'Rentabilité (%)', 
                  angle: -90, 
                  position: 'insideLeft',
                  fill: colors.primary[200]
                }}
              />
              <ZAxis type="number" dataKey="z" range={[50, 400]} name="Revenu" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  padding: "10px",
                }}
                formatter={(value: number, name: string, props: any) => {
                  if (name === 'x') return [`${value} interventions`, 'Interventions'];
                  if (name === 'y') return [`${value}%`, 'Rentabilité'];
                  if (name === 'z') return [`${(value * 1000).toLocaleString()} DH`, 'Revenu'];
                  return [value, name];
                }}
                labelFormatter={(label, payload) => {
                  if (payload && payload[0]) {
                    return `${payload[0].payload.name} - ${payload[0].payload.ville}`;
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
    </Box>
  );
};

export default ClientRentabiliteDashboard;