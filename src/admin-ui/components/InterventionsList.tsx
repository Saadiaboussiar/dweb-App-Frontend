import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { type Intervention, getInterventions } from "../../data/interventions";
import { visuallyHidden } from "@mui/utils";
import FilterListIcon from "@mui/icons-material/FilterList";
import ImageIcon from "@mui/icons-material/Image";
import { tokens } from "../../shared-theme/theme";
import { useSelector } from "react-redux";
import { selectIsCollapsed } from "../../comp_management/redux_slices/layoutSlice";
import { useRoles } from "../../hooks/useRoles";
import { selectTechnicianId } from "../../comp_management/redux_slices/technicianAuthSlice";

type Order = "asc" | "desc";

interface HeadCell {
  id: keyof Intervention | "technician" | "photo";
  label: string;
  filterable?: boolean;
  numeric?: boolean;
}

const baseHeadCells: readonly HeadCell[] = [
  { id: "interId", label: "ID", filterable: true, numeric: true },
  { id: "client", label: "Client", filterable: true },
  { id: "ville", label: "Ville", filterable: true },
  { id: "km", label: "KM", filterable: true, numeric: true },
  { id: "date", label: "Date", filterable: true },
  { id: "startTime", label: "Heure début", filterable: true },
  { id: "finishTime", label: "Heure fin", filterable: true },
  { id: "duration", label: "Durée", filterable: true },
  { id: "photo", label: "Photo" },
] as const;

const adminHeadCells: readonly HeadCell[] = [
  { id: "technician", label: "Technicien", filterable: true },
] as const;

interface EnhancedTableProps {
  onRequestSort: (property: keyof Intervention | "technician") => void;
  order: Order;
  orderBy: string;
  filters: Record<string, string>;
  onFilterChange: (id: string, value: string) => void;
}

function EnhancedTableHead(props: EnhancedTableProps) {
  const { order, orderBy, onRequestSort, filters, onFilterChange } = props;
  const { isAdmin } = useRoles();
  const createSortHandler =
    (property: keyof Intervention | "technician") => () => {
      onRequestSort(property);
    };

  const headCells = React.useMemo(
    () => [...baseHeadCells, ...(isAdmin ? adminHeadCells : [])],
    [isAdmin]
  );
  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? "right" : "left"}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            {headCell.id !== "photo" ? (
              <>
                <TableSortLabel
                  active={orderBy === headCell.id}
                  direction={orderBy === headCell.id ? order : "asc"}
                  onClick={createSortHandler(headCell.id)}
                >
                  {headCell.label}
                  {orderBy === headCell.id ? (
                    <Box component="span" sx={visuallyHidden}>
                      {order === "desc"
                        ? "sorted descending"
                        : "sorted ascending"}
                    </Box>
                  ) : null}
                </TableSortLabel>
                {headCell.filterable && (
                  <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                    <TextField
                      size="small"
                      variant="outlined"
                      placeholder={`Filter ${headCell.label}`}
                      value={filters[headCell.id] || ""}
                      onChange={(e) =>
                        onFilterChange(headCell.id, e.target.value)
                      }
                      InputProps={{
                        startAdornment: (
                          <FilterListIcon fontSize="small" sx={{ mr: 1 }} />
                        ),
                      }}
                      sx={{ width: "100%" }}
                    />
                  </Box>
                )}
              </>
            ) : (
              headCell.label
            )}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

const InterventionList = () => {
  const [order, setOrder] = useState<Order>("asc");
  const [orderBy, setOrderBy] = useState<keyof Intervention | "technician">(
    "interId"
  );
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [openImageDialog, setOpenImageDialog] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const isCollapsed = useSelector(selectIsCollapsed);
  const { isAdmin } = useRoles();

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const technicianId = useSelector(selectTechnicianId);

  console.log("technician id : ", technicianId);

  useEffect(() => {
    const fetchInterventions = async () => {
      try {
        setLoading(true);
        const data = await getInterventions(technicianId);
        setInterventions(data);
      } catch (err) {
        setError("Failed to load interventions");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInterventions();
  }, []);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Non spécifiée";
    try {
      const date = new Date(dateStr);
      return isNaN(date.getTime())
        ? "Non spécifiée"
        : date.toLocaleDateString("fr-FR");
    } catch {
      return "Non spécifiée";
    }
  };

  const formatTechnician = (techFN?: string, techLN?: string) => {
    return [techFN, techLN].filter(Boolean).join(" ") || "Non spécifiée";
  };

  const handleRequestSort = (property: keyof Intervention | "technician") => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleFilterChange = (id: string, value: string) => {
    setFilters((prev) => ({ ...prev, [id]: value }));
  };

  const handleOpenImageDialog = (imageUrl: string | null) => {
    setSelectedImage(imageUrl);
    setOpenImageDialog(true);
  };

  const handleCloseImageDialog = () => {
    setOpenImageDialog(false);
    setSelectedImage(null);
  };

  const parseDurationToMinutes = (duration: string): number => {
    if (!duration) return 0;

    // Handle formats like "2h30m", "1h", "45m"
    const hoursMatch = duration.match(/(\d+)h/);
    const minutesMatch = duration.match(/(\d+)m/);

    const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0;
    const minutes = minutesMatch ? parseInt(minutesMatch[1]) : 0;

    return hours * 60 + minutes;
  };
  const filteredAndSortedInterventions = (interventions || [])
    .filter((inter) => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value) return true;

        const filterValue = value.toLowerCase();

        if (key === "technician") {
          const technicianName = formatTechnician(
            inter.technicianFN,
            inter.technicianLN
          ).toLowerCase();
          return technicianName.includes(filterValue);
        }

        const cellValue = inter[key as keyof Intervention];
        if (cellValue === null || cellValue === undefined) return false;

        return String(cellValue).toLowerCase().includes(filterValue);
      });
    })
    .sort((a, b) => {
      let aValue, bValue;

      if (orderBy === "technician") {
        aValue = formatTechnician(a.technicianFN, a.technicianLN);
        bValue = formatTechnician(b.technicianFN, b.technicianLN);
      }
      // Special handling for duration
      else if (orderBy === "duration") {
        aValue = parseDurationToMinutes(a.duration);
        bValue = parseDurationToMinutes(b.duration);
      } else {
        aValue = a[orderBy as keyof Intervention];
        bValue = b[orderBy as keyof Intervention];
      }

      if (aValue === null || aValue === undefined)
        return order === "asc" ? -1 : 1;
      if (bValue === null || bValue === undefined)
        return order === "asc" ? 1 : -1;

      if (typeof aValue === "number" && typeof bValue === "number") {
        return order === "asc" ? aValue - bValue : bValue - aValue;
      }

      const stringA = String(aValue).toLowerCase();
      const stringB = String(bValue).toLowerCase();

      return order === "asc"
        ? stringA.localeCompare(stringB)
        : stringB.localeCompare(stringA);
    });

  return (
    <Box
      sx={{
        width: isCollapsed ? "90%" : "80%",
        ml: isCollapsed ? "100px" : "250px",
        mt: "30px",
        mb: "40px",
        transition: "margin-left 0.3s ease",
      }}
    >
      <Paper
        sx={{
          width: "100%",
          mb: 2,
          overflow: "hidden",
          bgcolor: colors.primary[400],
        }}
      >
        <TableContainer>
          <Table
            sx={{ minWidth: 750 }}
            aria-labelledby="tableTitle"
            size="medium"
          >
            <EnhancedTableHead
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
              filters={filters}
              onFilterChange={handleFilterChange}
            />
            <TableBody>
              {filteredAndSortedInterventions.map((inter) => (
                <TableRow
                  hover
                  key={inter.interId}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell align="right">{inter.interId}</TableCell>
                  <TableCell>{inter.client}</TableCell>
                  <TableCell>{inter.ville}</TableCell>
                  <TableCell align="right">{inter.km}</TableCell>
                  {isAdmin && (
                    <TableCell>
                      {formatTechnician(inter.technicianFN, inter.technicianLN)}
                    </TableCell>
                  )}

                  <TableCell>{formatDate(inter.date)}</TableCell>
                  <TableCell>{inter.startTime}</TableCell>
                  <TableCell>{inter.finishTime}</TableCell>
                  <TableCell>{inter.duration}</TableCell>
                  <TableCell>
                    {inter.interUrl && (
                      <IconButton
                        onClick={() => handleOpenImageDialog(inter.interUrl)}
                        color="primary"
                        aria-label="view photo"
                      >
                        <ImageIcon />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog
        open={openImageDialog}
        onClose={handleCloseImageDialog}
        maxWidth="md"
      >
        <DialogTitle sx={{ bgcolor: colors.primary[400] }}>
          Photo de l'intervention
        </DialogTitle>
        <DialogContent sx={{ bgcolor: colors.primary[400] }}>
          {selectedImage ? (
            <img
              src={selectedImage}
              alt="Intervention"
              style={{ maxWidth: "100%", height: "auto" }}
            />
          ) : (
            <Typography>Aucune photo disponible</Typography>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default InterventionList;
