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
} from "@mui/material";
import {
  FilterList,
  Search,
  Edit,
  Visibility,
  TrendingUp,
  AccountCircle,
} from "@mui/icons-material";
import { useSelector } from "react-redux";
import { selectIsCollapsed } from "../../features/slices/layoutSlice";
import { tokens } from "../../shared-theme/theme";
import useNotifications from "../../hooks/useNotifications/useNotifications";

// Types and mock data remain the same as previous example
// ... (keep your existing types and mock data)

interface Technician {
  id: string;
  name: string;
  email: string;
  currentPoints: number;
  currentTier: string;
  totalRewards: number;
  performanceScore: number;
  status: "active" | "inactive";
}

interface BonusTier {
  points: number;
  reward: number;
  label: string;
  color: string;
}

interface Intervention {
  id: string;
  technicianId: string;
  date: string;
  client: string;
  type: string;
  points: number;
  status: "completed" | "pending" | "rejected";
}

// Mock data
const techniciansData: Technician[] = [
  {
    id: "1",
    name: "Jean Dupont",
    email: "jean.dupont@email.com",
    currentPoints: 3200,
    currentTier: "Gold",
    totalRewards: 850,
    performanceScore: 92,
    status: "active",
  },
  {
    id: "2",
    name: "Marie Lambert",
    email: "marie.lambert@email.com",
    currentPoints: 2850,
    currentTier: "Silver",
    totalRewards: 720,
    performanceScore: 88,
    status: "active",
  },
  {
    id: "3",
    name: "Pierre Moreau",
    email: "pierre.moreau@email.com",
    currentPoints: 4200,
    currentTier: "Platinum",
    totalRewards: 1200,
    performanceScore: 96,
    status: "active",
  },
];

const bonusTiers: BonusTier[] = [
  { points: 1000, reward: 100, label: "Bronze", color: "#cd7f32" },
  { points: 2000, reward: 250, label: "Silver", color: "#8f8d8dff" },
  { points: 3000, reward: 500, label: "Gold", color: "#ffd700" },
  { points: 4000, reward: 800, label: "Platinum", color: "#b1a99bff" },
];

const interventionsData: Intervention[] = [
  {
    id: "101",
    technicianId: "1",
    date: "2023-10-15",
    client: "Client A",
    type: "Installation",
    points: 150,
    status: "completed",
  },
  {
    id: "102",
    technicianId: "1",
    date: "2023-10-16",
    client: "Client B",
    type: "Repair",
    points: 200,
    status: "completed",
  },
];

const AdminTechnicianBonusDashboard: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [technicians, setTechnicians] = useState<Technician[]>(techniciansData);
  const [filteredTechnicians, setFilteredTechnicians] =
    useState<Technician[]>(techniciansData);
  const [selectedTechnician, setSelectedTechnician] =
    useState<Technician | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const isCollapsed = useSelector(selectIsCollapsed);
  const colors = tokens(theme.palette.mode);
  const notifications = useNotifications();

  useEffect(() => {
    let result = technicians;

    if (searchTerm) {
      result = result.filter(
        (tech) =>
          tech.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tech.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((tech) => tech.status === statusFilter);
    }

    setFilteredTechnicians(result);
  }, [searchTerm, statusFilter, technicians]);

  const handleViewDetails = (technician: Technician) => {
    setSelectedTechnician(technician);
    setViewDialogOpen(true);
  };

  const handleEditPoints = (technician: Technician) => {
    setSelectedTechnician(technician);
    setEditDialogOpen(true);
  };

  const handleUpdatePoints = (newPoints: number) => {
    if (selectedTechnician) {
      setTechnicians((prev) =>
        prev.map((tech) =>
          tech.id === selectedTechnician.id
            ? { ...tech, currentPoints: newPoints }
            : tech
        )
      );
      setEditDialogOpen(false);
    }
  };

  const getTierInfo = (points: number) => {
    return (
      bonusTiers
        .slice()
        .reverse()
        .find((tier) => points >= tier.points) || bonusTiers[0]
    );
  };

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
      <Paper sx={{ p: 3, mb: 3, bgcolor: colors.primary[400] }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            gap: 3,
            alignItems: "center",
          }}
        >
          <Box sx={{ flex: 1 }}>
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
          </Box>
          <Box sx={{ width: isMobile ? "100%" : "200px" }}>
            <TextField
              fullWidth
              select
              label="Statut"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">Tous</MenuItem>
              <MenuItem value="active">Actif</MenuItem>
              <MenuItem value="inactive">Inactif</MenuItem>
            </TextField>
          </Box>
          <Box sx={{ width: isMobile ? "100%" : "200px" }}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<FilterList />}
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
              }}
            >
              Réinitialiser
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Statistics Cards - Using Flexbox instead of Grid */}
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
            <Typography color="textSecondary" gutterBottom>
              Total Techniciens
            </Typography>
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
            <Typography color="textSecondary" gutterBottom>
              Points Moyens
            </Typography>
            <Typography variant="h4" component="div">
              {Math.round(
                technicians.reduce((sum, tech) => sum + tech.currentPoints, 0) /
                  technicians.length
              )}
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
            <Typography color="textSecondary" gutterBottom>
              Bonus Total
            </Typography>
            <Typography variant="h4" component="div">
              {technicians.reduce((sum, tech) => sum + tech.totalRewards, 0)}€
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
            <Typography color="textSecondary" gutterBottom>
              Performance Moyenne
            </Typography>
            <Typography variant="h4" component="div">
              {Math.round(
                technicians.reduce(
                  (sum, tech) => sum + tech.performanceScore,
                  0
                ) / technicians.length
              )}
              %
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
                <TableCell>Points</TableCell>
                <TableCell>Niveau</TableCell>
                <TableCell>Bonus Total</TableCell>
                <TableCell>Performance</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTechnicians.map((technician) => {
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
                    <TableCell>
                      <Typography fontWeight="bold">
                        {technician.currentPoints}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={tier.label}
                        sx={{ backgroundColor: tier.color, color: "white" }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography
                        fontWeight="bold"
                        color={colors.greenAccent[600]}
                      >
                        {technician.totalRewards}€
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <TrendingUp
                          sx={{ mr: 1, color: colors.greenAccent[600] }}
                        />
                        <Typography>{technician.performanceScore}%</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={
                          technician.status === "active" ? "Actif" : "Inactif"
                        }
                        sx={{
                          color:
                            technician.status === "active"
                              ? colors.greenAccent[600]
                              : "#9e9e9e",
                          borderColor:
                            technician.status === "active"
                              ? colors.greenAccent[600]
                              : "#9e9e9e",
                          backgroundColor:
                            technician.status === "active"
                              ? "#e8f5e9"
                              : "#f5f5f5",
                        }}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleViewDetails(technician)}>
                        <Visibility />
                      </IconButton>
                      <IconButton onClick={() => handleEditPoints(technician)}>
                        <Edit />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
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
      >
        <DialogTitle>Détails du Technicien</DialogTitle>
        <DialogContent>
          {selectedTechnician && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedTechnician.name}
              </Typography>
              {/* Add detailed view here */}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Fermer</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Points Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Modifier les Points</DialogTitle>
        <DialogContent>
          {selectedTechnician && (
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                type="number"
                label="Nouveau total de points"
                defaultValue={selectedTechnician.currentPoints}
                onChange={(e) => handleUpdatePoints(Number(e.target.value))}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Annuler</Button>
          <Button
            variant="contained"
            onClick={() =>
              handleUpdatePoints(selectedTechnician?.currentPoints || 0)
            }
          >
            Sauvegarder
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminTechnicianBonusDashboard;
