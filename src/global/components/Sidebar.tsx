import { Box, IconButton, Typography, useTheme } from "@mui/material";
import Tooltip, {
  type TooltipProps,
  tooltipClasses,
} from "@mui/material/Tooltip";

import React, { useState } from "react";
import { tokens } from "../../shared-theme/theme";
import { Sidebar as ProSidebar, Menu, MenuItem } from "react-pro-sidebar";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import profile from "../../assets/saadia.jpeg";
import { Link } from "react-router-dom";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import ListAltOutlinedIcon from "@mui/icons-material/ListAltOutlined";
import EngineeringOutlinedIcon from "@mui/icons-material/EngineeringOutlined";
import BusinessCenterOutlinedIcon from "@mui/icons-material/BusinessCenterOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import MilitaryTechOutlinedIcon from "@mui/icons-material/MilitaryTechOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import styled from "@emotion/styled";
import { useDispatch, useSelector } from "react-redux";
import {
  selectIsCollapsed,
  toogleSidebar,
} from "../../features/slices/layoutSlice";
import type { RootState } from "features/store";
import { useRoles } from "../../hooks/useRoles";
import { selectRoles, selectUser } from "../../features/slices/authSlice";
const BigTooltip = styled(
  ({ className, ...props }: TooltipProps & { className?: string }) => (
    <Tooltip {...props} classes={{ popper: className }} />
  )
)(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    fontSize: "15px",
    padding: "8px 12px",
  },
}));

type ItemProps = {
  title: string;
  to: string;
  icon: React.ReactNode;
  selected: string;
  setSelected: React.Dispatch<React.SetStateAction<string>>;
  isCollapsed: boolean;
};

const Item = ({
  title,
  to,
  icon,
  selected,
  setSelected,
  isCollapsed,
}: ItemProps) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  return (
    <BigTooltip title={isCollapsed ? title : ""} placement="right" arrow>
      <div>
        <MenuItem
          active={selected === title}
          onClick={() => setSelected(title)}
          style={{ color: colors.grey[100] }}
          icon={icon}
        >
          {!isCollapsed && (
            <Link to={to} style={{ textDecoration: "none", color: "inherit" }}>
              <Typography>{title}</Typography>
            </Link>
          )}
        </MenuItem>
      </div>
    </BigTooltip>
  );
};

const Sidebar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isCollapsed = useSelector(selectIsCollapsed);
  const dispatch = useDispatch();
  const [selected, setSelected] = useState("Tableau de bord");
  console.log("isCollapsed: ", isCollapsed);

  const user = useSelector(selectUser);
  const roles = useSelector(selectRoles);

console.log("roles: ",roles);
console.log("user: ",user);
  const { isAdmin } = useRoles();
  
  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        height: "100vh",
        overflowY: "auto",
        zIndex: 1300,
      }}
    >
      <ProSidebar
        collapsed={isCollapsed}
        collapsedWidth="100px"
        rootStyles={{
          height: "100%",
          ".ps-sidebar-container": {
            backgroundColor: `${colors.primary[400]}`,
            borderRight: "none",
            boxShadow: "none",
            overflowY: "auto",
            msOverflowStyle: "none",
            scrollbarWidth: "none",
          },

          ".ps-menu-icon": {
            backgroundColor: "transparent",
            ...(isCollapsed && {
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginLeft: "10px",
              width: "100%",
              ...(!isAdmin && {
                flexDirection: "column",
              }),
            }),
          },
          ".ps-menu-button": {
            padding: "5px 35px 5px 20px",
            transition: "color 0.2s ease",
          },
          ".ps-menu-button:hover": {
            backgroundColor: "transparent !important",
            color: "#868dfb",
          },
          ".ps-menu-button:hover svg": {
            color: "#6870fb",
            fill: "#6870fb",
          },
          ".ps-active": {
            color: "#6870fb",
          },
          ".menu-toggle:hover svg": {
            color: "#6870fb",
          },

          ".ps-sidebar-container::-webkit-scrollbar": {
            display: "none", // Chrome/Safari/Edge
          },
          borderRight: "none",
        }}
      >
        <Menu>
          <MenuItem
            onClick={() => dispatch(toogleSidebar())}
            icon={
              isCollapsed ? <MenuOutlinedIcon fontSize="medium" /> : undefined
            }
            className={isCollapsed ? "menu-toggle" : ""}
            style={{
              margin: "10px 0 20px 0",
              color: colors.grey[100],
            }}
          >
            {!isCollapsed && (
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                ml={isAdmin ? "15px" : "0px"}
              >
                <Typography variant="h3">
                  {isAdmin ? "ADMIN" : "TECHNICIEN"}
                </Typography>
                <IconButton>
                  <MenuOutlinedIcon />
                </IconButton>
              </Box>
            )}
          </MenuItem>

          {!isCollapsed && (
            <Box mb="25px">
              <Box display="flex" justifyContent="center" alignItems="center">
                <img
                  alt="profile-user"
                  width="100px"
                  height="100px"
                  src={profile}
                  style={{ cursor: "pointer", borderRadius: "50%" }}
                />
              </Box>
              <Box textAlign="center">
                <Typography
                  variant="h5"
                  color={colors.grey[100]}
                  fontWeight="350"
                  sx={{ mt: "10px" }}
                >
                  {user?.sub}
                </Typography>
                <Typography variant="h5" color={colors.greenAccent[500]} sx={{mt:"5px"}}>
                  {isAdmin ? "Espace Administrateur" : "Espace Technicien "}
                </Typography>
              </Box>
            </Box>
          )}

          <Box paddingLeft={isCollapsed ? undefined : "10px"}>
            {isAdmin ? (
              <>
                <Item
                  title="Tableau de bord"
                  icon={<HomeOutlinedIcon />}
                  selected={selected}
                  setSelected={setSelected}
                  to="/dashboard"
                  isCollapsed={isCollapsed}
                />
                <Typography
                  variant="h6"
                  color={colors.grey[300]}
                  sx={{
                    m: "15px 0 5px 20px",
                    ml: isCollapsed ? "17px" : "20px",
                  }}
                >
                  Opérations
                </Typography>

                <Item
                  title="Vérifier les interventions"
                  icon={<AssignmentTurnedInOutlinedIcon />}
                  selected={selected}
                  setSelected={setSelected}
                  to="/interventions"
                  isCollapsed={isCollapsed}
                />

                <Item
                  title="Toutes les interventions"
                  icon={<ListAltOutlinedIcon />}
                  selected={selected}
                  setSelected={setSelected}
                  to="/allInterventions"
                  isCollapsed={isCollapsed}
                />
                <Item
                  title="Techniciens"
                  icon={<EngineeringOutlinedIcon />}
                  selected={selected}
                  setSelected={setSelected}
                  to="/technicians"
                  isCollapsed={isCollapsed}
                />
                <Item
                  title="Clients"
                  icon={<BusinessCenterOutlinedIcon />}
                  selected={selected}
                  setSelected={setSelected}
                  to="/clients"
                  isCollapsed={isCollapsed}
                />

                <Typography
                  variant="h6"
                  color={colors.grey[300]}
                  sx={{
                    m: "15px 0 5px 20px",
                    ml: isCollapsed ? "22px" : "20px",
                  }}
                >
                  Analyse & Rapports
                </Typography>
                <Item
                  title="Rentabilité par client "
                  icon={<TrendingUpOutlinedIcon />}
                  selected={selected}
                  setSelected={setSelected}
                  to="/clientAnalysis"
                  isCollapsed={isCollapsed}
                />
                <Item
                  title="Rapports"
                  icon={<BarChartOutlinedIcon />}
                  selected={selected}
                  setSelected={setSelected}
                  to="/clientReports"
                  isCollapsed={isCollapsed}
                />

                <Typography
                  variant="h6"
                  color={colors.grey[300]}
                  sx={{
                    m: "15px 0 5px 20px",
                    ml: isCollapsed ? "10px" : "20px",
                  }}
                >
                  {" "}
                  Configuration
                </Typography>
                <Item
                  title=" Gestion des bonus"
                  icon={<MilitaryTechOutlinedIcon />}
                  selected={selected}
                  setSelected={setSelected}
                  to="/bonus"
                  isCollapsed={isCollapsed}
                />
                <Item
                  title="Aide & Support"
                  icon={<HelpOutlineOutlinedIcon />}
                  selected={selected}
                  setSelected={setSelected}
                  to="/aide"
                  isCollapsed={isCollapsed}
                />
              </>
            ) : (
              <>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: isCollapsed ? "40px" : "20px",
                    mt: isCollapsed ? "40px" : "0px",
                  }}
                >
                  <Item
                    title="Tableau De Bord"
                    icon={<HomeOutlinedIcon />}
                    selected={selected}
                    setSelected={setSelected}
                    to="/techDashboard"
                    isCollapsed={isCollapsed}
                  />
                  <Item
                    title="Nouvelle Intervention"
                    icon={<AssignmentTurnedInOutlinedIcon />}
                    selected={selected}
                    setSelected={setSelected}
                    to="/newInterventions"
                    isCollapsed={isCollapsed}
                  />

                  <Item
                    title="Vos Interventions"
                    icon={<ListAltOutlinedIcon />}
                    selected={selected}
                    setSelected={setSelected}
                    to="/techInterventions"
                    isCollapsed={isCollapsed}
                  />
                  <Item
                    title="Vos Points"
                    icon={<MilitaryTechOutlinedIcon />}
                    selected={selected}
                    setSelected={setSelected}
                    to="/techPoints"
                    isCollapsed={isCollapsed}
                  />
                  <Item
                    title="Aide & Support"
                    icon={<HelpOutlineOutlinedIcon />}
                    selected={selected}
                    setSelected={setSelected}
                    to="/aide"
                    isCollapsed={isCollapsed}
                  />
                </Box>
              </>
            )}
          </Box>
        </Menu>
      </ProSidebar>
    </Box>
  );
};

export default Sidebar;
