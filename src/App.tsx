import React from "react";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "./shared-theme/theme";
import { Route, Routes } from "react-router-dom";
import MainLayout from "./MainLayout";
import SignUp from "./global/pages/SignUpPage";
import SignIn from "./global/pages/SignInPage";
import ChangePassword from "./global/pages/ChangePasswoedPage";
import ProfilePage from "./global/pages/ProfilePage";
import Aide from "./global/pages/Aide&Support";
const App: React.FC = () => {
  const [theme, colorMode] = useMode();

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Routes>
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<SignIn />} />
          <Route path="/" element={<SignIn />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/*" element={<MainLayout />} />
        </Routes>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};

export default App;
