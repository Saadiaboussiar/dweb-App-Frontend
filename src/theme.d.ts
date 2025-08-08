// src/theme.d.ts
import "@mui/material/styles";

declare module "@mui/material/styles" {
  interface Palette {
    neutral: {
      dark: string;
      main: string;
      light: string;
    };
  }
  interface PaletteOptions {
    neutral?: {
      dark: string;
      main: string;
      light: string;
    };
  }
}
