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
  deleteClient as deleteOne,
  getManyClients as getMany,
  getOneClient,
  getClientsStore,
  type ClientData,
} from "../../../data/clientsInfos";
import PageContainer from "../PageContainer";
import Header from "../../../global/components/Header";
import { frFR } from "@mui/x-data-grid/locales";
import { useSelector } from "react-redux";
import { selectIsCollapsed } from "../../../features/slices/layoutSlice";

const INITIAL_PAGE_SIZE = 10;

export default function ClientList() {
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isCollapsed = useSelector(selectIsCollapsed);
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
    rows: ClientData[];
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
      navigate(`${pathname}?${searchParams.toString()}`);
    },
    [navigate, pathname, searchParams]
  );

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
      navigate(`${pathname}?${searchParams.toString()}`);
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
      navigate(`${pathname}?${searchParams.toString()}`);
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
    if (!isLoading) loadData();
  }, [isLoading, loadData]);

  const handleRowClick = React.useCallback<GridEventListener<"rowClick">>(
    ({ row }) => navigate(`/clients/${row.cin}`),
    [navigate]
  );

  const handleCreateClick = React.useCallback(
    () => navigate("/clients/new"),
    [navigate]
  );

  const handleRowEdit = React.useCallback(
    (client: ClientData) => () => navigate(`/clients/${client.cin}/edit`),
    [navigate]
  );

  const handleRowDelete = React.useCallback(
    (client: ClientData) => async () => {
      const confirmed = await dialogs.confirm(
        `Souhaitez-vous supprimer ${client.fullName} ?`,
        {
          title: `Supprimer le client ?`,
          severity: "error",
          okText: "Supprimer",
          cancelText: "Annuler",
        }
      );

      if (confirmed) {
        setIsLoading(true);
        try {
          await deleteOne(String(client.cin));
          notifications.show("Client supprimé avec succès.", {
            severity: "success",
            autoHideDuration: 3000,
          });
          loadData();
        } catch (deleteError) {
          notifications.show(
            `Échec de la suppression du client. Raison : ${
              (deleteError as Error).message
            }`,
            { severity: "error", autoHideDuration: 3000 }
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
      {
        field: "cin",
        headerName: "CIN",
        width: 90,
        type: "string",
      },
      {
        field: "fullName",
        headerName: "Nom Complet",
        width: isCollapsed ? 150 : 140,
        type: "string",
      },
      {
        field: "reseauSocial",
        headerName: "Réseau Social",
        width: 140,
        type: "string",
      },
      {
        field: "contrat",
        headerName: "Contrat",
        width: isCollapsed ? 120 : 110,
        type: "string",
      },
      {
        field: "ville",
        headerName: "Ville",
        width: 100,
        type: "string",
      },
      {
        field: "adresse",
        headerName: "Adresse",
        width: isCollapsed ? 170 : 150,
      },

      {
        field: "phoneNumber",
        headerName: "Numéro de Téléphone",
        width: isCollapsed ? 150 : 150,
        type: "string",
      },
      {
        field: "email",
        headerName: "Email",
        width: isCollapsed ? 160 : 110,
        type: "string",
      },
      {
        field: "actions",
        type: "actions",
        flex: 1,
        align: "right",
        getActions: ({ row }) => [
          <GridActionsCellItem
            key="modifier-client"
            icon={<EditIcon />}
            label="Modifier"
            onClick={handleRowEdit(row)}
          />,
          <GridActionsCellItem
            key="supprimer-client"
            icon={<DeleteIcon />}
            label="Supprimer"
            onClick={handleRowDelete(row)}
          />,
        ],
      },
    ],
    [handleRowEdit, handleRowDelete, isCollapsed]
  );

  const pageTitle = "Clients";

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
  return (
    <>
      <Box m="20px">
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Header
            title="LES INFORMATIONS DES CLIENTS"
            subTitle="Gérez et consultez les informations de vos clients"
          />
        </Box>
      </Box>

      <PageContainer
        title={pageTitle}
        breadcrumbs={[{ title: pageTitle }]}
        actions={
          <Stack direction="row" alignItems="center" spacing={1}>
            <Tooltip
              title="Recharger les données"
              placement="right"
              enterDelay={1000}
            >
              <div>
                <IconButton
                  size="small"
                  aria-label="rafraîchir"
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
        <Box sx={{ flex: 1, width: isCollapsed ? "106%" : "110%" }}>
          {error ? (
            <Box sx={{ flexGrow: 1 }}>
              <Alert severity="error">{error.message}</Alert>
            </Box>
          ) : (
            <DataGrid
              rows={rowsState.rows}
              rowCount={rowsState.rowCount}
              columns={columns}
              getRowId={(row) => row.cin}
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
