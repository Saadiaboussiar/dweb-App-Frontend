import React, { useContext } from "react";
import { useTheme } from "@mui/material/styles";
import { ColorModeContext, tokens } from "../../theme";
import Box from "@mui/material/Box";
import InputBase from "@mui/material/InputBase";
import SearchIcon from "@mui/icons-material/Search";
import IconButton from "@mui/material/IconButton";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";

const Topbar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(ColorModeContext);
  return (
    <>
      <Box display="flex" justifyContent="space-between" p={2}>
        <Box sx={{ display: "flex", backgroundColor: colors.primary[400], borderRadius:"3px"}}>
          <InputBase sx={{ ml: 2, flex: 1 }} placeholder="Search" />
          <IconButton type="button" sx={{ p: 1 }}>
            <SearchIcon />
          </IconButton>
        </Box>
        <Box display="flex">
            <IconButton onClick={colorMode.toggleColorMode}>
              {theme.palette.mode === "dark" ? (
                <LightModeOutlinedIcon />
              ) : (
                <DarkModeOutlinedIcon />
              )}
            </IconButton>
            <IconButton >
              <NotificationsOutlinedIcon />
            </IconButton>
            <IconButton >
              <SettingsOutlinedIcon />
            </IconButton>
            <IconButton >
              <PersonOutlineOutlinedIcon />
            </IconButton>
          </Box>
      </Box>
    </>
  );
};

export default Topbar;
