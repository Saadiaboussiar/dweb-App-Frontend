import * as React from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import {
  DataGrid,
  GridActionsCellItem,
  type GridColDef,
  type GridFilterModel,
  type GridPaginationModel,
  type GridSortModel,
  type GridEventListener,
  gridClasses,
  GridToolbar,
} from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useLocation, useNavigate, useSearchParams } from "react-router";
import { useDialogs } from "../../../hooks/useDialogs/useDialogs";
import useNotifications from "../../../hooks/useNotifications/useNotifications";
import {
  deleteTechnician as deleteOne,
  getManyTechnicians as getMany,
  getOneTechnician,
  getTechniciansStore,
  type TechnicianData,
} from "../../../data/technicianInfos";
import PageContainer from "../PageContainer";
import type { technicianData } from "data/technicians";
import Header from "../../../global/components/Header";
import { frFR } from "@mui/x-data-grid/locales";
import { useSelector } from "react-redux";
import { selectIsCollapsed } from "../../../features/slices/layoutSlice";

const INITIAL_PAGE_SIZE = 10;

export default function TechnicianList() {
  const isCollapsed = useSelector(selectIsCollapsed);
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const dialogs = useDialogs();
  const notifications = useNotifications();

  const [paginationModel, setPaginationModel] =
    React.useState<GridPaginationModel>({
      page: searchParams.get("page") ? Number(searchParams.get("page")) : 0,
      pageSize: searchParams.get("pageSize")
        ? Number(searchParams.get("pageSize"))
        : INITIAL_PAGE_SIZE,
    });
  const [filterModel, setFilterModel] = React.useState<GridFilterModel>(
    searchParams.get("filter")
      ? JSON.parse(searchParams.get("filter") ?? "")
      : { items: [] }
  );
  const [sortModel, setSortModel] = React.useState<GridSortModel>(
    searchParams.get("sort") ? JSON.parse(searchParams.get("sort") ?? "") : []
  );

  const [rowsState, setRowsState] = React.useState<{
    rows: TechnicianData[];
    rowCount: number;
  }>({
    rows: [],
    rowCount: 0,
  });

  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  const handlePaginationModelChange = React.useCallback(
    (model: GridPaginationModel) => {
      setPaginationModel(model);

      searchParams.set("page", String(model.page));
      searchParams.set("pageSize", String(model.pageSize));

      const newSearchParamsString = searchParams.toString();

      navigate(
        `${pathname}${newSearchParamsString ? "?" : ""}${newSearchParamsString}`
      );
    },
    [navigate, pathname, searchParams]
  );

  const customFrenchLocale = {
    ...frFR.components.MuiDataGrid.defaultProps.localeText,
    toolbarQuickFilterPlaceholder: "Rechercher techniciens...",
    toolbarFiltersTooltipHide: "Masquer les filtres",
    toolbarFiltersTooltipShow: "Afficher les filtres",
    columnMenuFilter: "Filtrer",
    columnMenuSortAsc: "Trier (A-Z)",
    columnMenuSortDesc: "Trier (Z-A)",
    filterPanelAddFilter: "Ajouter filtre",
    filterPanelDeleteIconLabel: "Supprimer",
    filterPanelOperators: "Opérateurs",
  };
  const handleFilterModelChange = React.useCallback(
    (model: GridFilterModel) => {
      setFilterModel(model);

      if (
        model.items.length > 0 ||
        (model.quickFilterValues && model.quickFilterValues.length > 0)
      ) {
        searchParams.set("filter", JSON.stringify(model));
      } else {
        searchParams.delete("filter");
      }

      const newSearchParamsString = searchParams.toString();

      navigate(
        `${pathname}${newSearchParamsString ? "?" : ""}${newSearchParamsString}`
      );
    },
    [navigate, pathname, searchParams]
  );

  const handleSortModelChange = React.useCallback(
    (model: GridSortModel) => {
      setSortModel(model);

      if (model.length > 0) {
        searchParams.set("sort", JSON.stringify(model));
      } else {
        searchParams.delete("sort");
      }

      const newSearchParamsString = searchParams.toString();

      navigate(
        `${pathname}${newSearchParamsString ? "?" : ""}${newSearchParamsString}`
      );
    },
    [navigate, pathname, searchParams]
  );

  const loadData = React.useCallback(async () => {
    setError(null);
    setIsLoading(true);

    try {
      const listData = await getMany({
        paginationModel,
        sortModel,
        filterModel,
      });

      setRowsState({
        rows: listData.items,
        rowCount: listData.itemCount,
      });
    } catch (listDataError) {
      setError(listDataError as Error);
    }

    setIsLoading(false);
  }, [paginationModel, sortModel, filterModel]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = React.useCallback(() => {
    if (!isLoading) {
      loadData();
    }
  }, [isLoading, loadData]);

  const handleRowClick = React.useCallback<GridEventListener<"rowClick">>(
    ({ row }) => {
      navigate(`/technicians/${row.id}`);
    },
    [navigate]
  );

  const handleCreateClick = React.useCallback(() => {
    navigate("/technicians/new");
  }, [navigate]);

  const handleRowEdit = React.useCallback(
    (technician: technicianData) => () => {
      navigate(`/technicians/${technician.id}/edit`);
    },
    [navigate]
  );

  const handleRowDelete = React.useCallback(
    (technician: technicianData) => async () => {
      const confirmed = await dialogs.confirm(
        `Souhaitez-vous supprimer ${technician.firstName} ${technician.lastName}?`,
        {
          title: `Supprimer technicien?`,
          severity: "error",
          okText: "Supprimer",
          cancelText: "Annuler",
        }
      );

      if (confirmed) {
        setIsLoading(true);
        try {
          await deleteOne(Number(technician.id));

          notifications.show("Technicien supprimé avec succès.", {
            severity: "success",
            autoHideDuration: 3000,
          });
          loadData();
        } catch (deleteError) {
          notifications.show(
            `Échec de la suppression du technicien. Raison:' ${
              (deleteError as Error).message
            }`,
            {
              severity: "error",
              autoHideDuration: 3000,
            }
          );
        }
        setIsLoading(false);
      }
    },
    [dialogs, notifications, loadData]
  );

  const initialState = React.useMemo(
    () => ({
      pagination: { paginationModel: { pageSize: INITIAL_PAGE_SIZE } },
    }),
    []
  );

  const columns = React.useMemo<GridColDef[]>(
    () => [
      { field: "id", headerName: "ID", type: "number", width: 60 },
      {
        field: "firstName",
        headerName: "Prénom",
        width: isCollapsed ? 150 : 140,
        type: "string",
      },
      {
        field: "lastName",
        headerName: "Nom",
        width: isCollapsed ? 150 : 140,
        type: "string",
      },
      {
        field: "email",
        headerName: "E-mail",
        width: isCollapsed ? 200 : 160,
        type: "string",
      },

      {
        field: "phoneNumber",
        headerName: "Numéro de téléphone",
        width: isCollapsed ? 180 : 150,
        type: "string",
      },
      {
        field: "cin",
        headerName: "CIN",
        width: isCollapsed ? 110 : 100,
        type: "string",
      },
      {
        field: "cnss",
        headerName: "CNSS",
        width: isCollapsed ? 110 : 100,
        type: "string",
      },
      {
        field: "actions",
        type: "actions",
        flex: 1, // Add explicit width
        getActions: ({ row }) => [
          <GridActionsCellItem
            icon={<EditIcon fontSize={isCollapsed ? "small" : "medium"} />}
            label="Modifier"
            onClick={handleRowEdit(row)}
          />,
          <GridActionsCellItem
            icon={<DeleteIcon fontSize={isCollapsed ? "small" : "medium"} />}
            label="Supprimer"
            onClick={handleRowDelete(row)}
          />,
        ],
      },
    ],
    [handleRowEdit, handleRowDelete, isCollapsed]
  );

  const pageTitle = "Techniciens";
  console.log("isCollapsed: ", isCollapsed);
  return (
    <>
      <Box m="20px">
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Header
            title="LES INFORMATIONS DES TECHNICIENS"
            subTitle="Consultez et mettez à jour les données de vos techniciens"
          />
        </Box>
      </Box>

      <PageContainer
        title={pageTitle}
        breadcrumbs={[{ title: pageTitle }]}
        actions={
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{ transition: "margin-left 0.3s ease" }}
          >
            <Tooltip
              title="Recharger les données"
              placement="right"
              enterDelay={1000}
            >
              <div>
                <IconButton
                  size="small"
                  aria-label="refresh"
                  onClick={handleRefresh}
                >
                  <RefreshIcon />
                </IconButton>
              </div>
            </Tooltip>
            <Button
              variant="contained"
              onClick={handleCreateClick}
              startIcon={<AddIcon />}
            >
              Ajouter
            </Button>
          </Stack>
        }
      >
        <Box sx={{ flex: 1, width: "100%" }}>
          {error ? (
            <Box sx={{ flexGrow: 1 }}>
              <Alert severity="error">{error.message}</Alert>
            </Box>
          ) : (
            <DataGrid
              rows={rowsState.rows}
              rowCount={rowsState.rowCount}
              columns={columns}
              pagination
              sortingMode="server"
              filterMode="server"
              paginationMode="server"
              paginationModel={paginationModel}
              onPaginationModelChange={handlePaginationModelChange}
              sortModel={sortModel}
              onSortModelChange={handleSortModelChange}
              filterModel={filterModel}
              onFilterModelChange={handleFilterModelChange}
              disableRowSelectionOnClick
              onRowClick={handleRowClick}
              loading={isLoading}
              localeText={customFrenchLocale}
              initialState={initialState}
              slots={{
                toolbar: GridToolbar,
              }}
              slotProps={{
                toolbar: {
                  showQuickFilter: true,
                  printOptions: { disableToolbarButton: true },
                  csvOptions: { disableToolbarButton: true },
                },
                loadingOverlay: {
                  variant: "circular-progress",
                  noRowsVariant: "circular-progress",
                },
                baseIconButton: {
                  size: "small",
                },
              }}
              pageSizeOptions={[5, INITIAL_PAGE_SIZE, 25]}
              sx={{
                [`& .${gridClasses.columnHeader}, & .${gridClasses.cell}`]: {
                  outline: "transparent",
                },
                [`& .${gridClasses.columnHeader}:focus-within, & .${gridClasses.cell}:focus-within`]:
                  {
                    outline: "none",
                  },
                [`& .${gridClasses.row}:hover`]: {
                  cursor: "pointer",
                },
                "& .MuiDataGrid-columnHeaderTitle": {
                  fontWeight: "bold",
                },
              }}
            />
          )}
        </Box>
      </PageContainer>
    </>
  );
}
