import { Box, IconButton, Typography, useTheme } from "@mui/material";
import React, { useState } from "react";
import { tokens } from "../../theme";
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
type ItemProps = {
  title: string;
  to: string;
  icon: React.ReactNode;
  selected: string;
  setSelected: React.Dispatch<React.SetStateAction<string>>;
};

const Item = ({ title, to, icon, selected, setSelected }: ItemProps) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  return (
    <MenuItem
      active={selected === title}
      onClick={() => setSelected(title)}
      style={{ color: colors.grey[100] }}
      icon={icon}
    >
      <Link to={to} style={{ textDecoration: "none", color: "inherit" }}>
        <Typography>{title}</Typography>
      </Link>
      
      
    </MenuItem>
  );
};

const Sidebar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selected, setSelected] = useState("Tableau de bord");

  return (
    <Box>
      <ProSidebar
        collapsed={isCollapsed}
        rootStyles={{
          height: "100vh",
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
            onClick={() => setIsCollapsed(!isCollapsed)}
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
                ml="15px"
              >
                <Typography variant="h3">ADMIN</Typography>
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
                  variant="h2"
                  color={colors.grey[100]}
                  fontWeight="bold"
                  sx={{ mt: "10px" }}
                >
                  Saadia Boussiar
                </Typography>
                <Typography variant="h5" color={colors.greenAccent[500]}>
                  VP Fancy Admin
                </Typography>
              </Box>
            </Box>
          )}

          <Box paddingLeft={isCollapsed ? undefined : "10px"}>
            <Item
              title="Tableau de bord"
              icon={<HomeOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
              to="/"
            />
            <Typography
              variant="h6"
              color={colors.grey[300]}
              sx={{ m: "15px 0 5px 20px" }}
            >
              Opérations
            </Typography>

            <Item
              title="Vérifier les interventions"
              icon={<AssignmentTurnedInOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
              to="/interventions"
            />
            <Item
              title="Toutes les interventions"
              icon={<ListAltOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
              to="/allInterventions"
            />
            <Item
              title="Techniciens"
              icon={<EngineeringOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
              to="/technicians"
            />
            <Item
              title="Clients"
              icon={<BusinessCenterOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
              to="/clients"
            />

            <Typography
              variant="h6"
              color={colors.grey[300]}
              sx={{ m: "15px 0 5px 20px" }}
            >
              Analyse & Rapports
            </Typography>
            <Item
              title="Rentabilité par client "
              icon={<TrendingUpOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
              to="/clientAnalysis"
            />
            <Item
              title="Rapports"
              icon={<BarChartOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
              to="/clientReports"
            />

            <Typography
              variant="h6"
              color={colors.grey[300]}
              sx={{ m: "15px 0 5px 20px" }}
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
            />
            <Item
              title="Aide & Support"
              icon={<HelpOutlineOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
              to="/aide"
            />
          </Box>
        </Menu>
      </ProSidebar>
    </Box>
  );
};

export default Sidebar;
