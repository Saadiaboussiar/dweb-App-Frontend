import * as React from "react";
import { useTheme, useColorScheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { tokens } from "../../shared-theme/theme";

export default function ThemeSwitcher() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const preferredMode = prefersDarkMode ? "dark" : "light";

  const { mode, setMode } = useColorScheme();

  const paletteMode = !mode || mode === "system" ? preferredMode : mode;

  const toggleMode = React.useCallback(() => {
    setMode(paletteMode === "dark" ? "light" : "dark");
  }, [setMode, paletteMode]);

  return (
    <Tooltip
      title={`${paletteMode === "dark" ? "Light" : "Dark"} mode`}
      enterDelay={1000}
    >
      <div>
        <IconButton
          size="small"
          aria-label={`Switch to ${
            paletteMode === "dark" ? "light" : "dark"
          } mode`}
          onClick={toggleMode}
        >
          {colors.primary[200] ? (
            <React.Fragment>
              <LightModeIcon
                sx={{
                  display: "inline",
                  [colors.primary[700]]: {
                    display: "none",
                  },
                }}
              />
              <DarkModeIcon
                sx={{
                  display: "none",
                  [colors.primary[700]]: {
                    display: "inline",
                  },
                }}
              />
            </React.Fragment>
          ) : null}
        </IconButton>
      </div>
    </Tooltip>
  );
}
