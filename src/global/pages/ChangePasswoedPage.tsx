import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import FormLabel from "@mui/material/FormLabel";
import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import MuiCard from "@mui/material/Card";
import { styled } from "@mui/material/styles";
import ColorModeSelect from "../../shared-theme/ColorModeSelect";
import AppTheme from "../../shared-theme/AppTheme";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { extractRolesFromToken } from "../../utils/roleUtils";
import { setCredentials } from "../../features/slices/authSlice";
import { authService } from "../../service/authService";

const Card = styled(MuiCard)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignSelf: "center",
  width: "100%",
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: "auto",
  [theme.breakpoints.up("sm")]: {
    maxWidth: "450px",
  },
  boxShadow:
    "hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px",
  ...theme.applyStyles("dark", {
    boxShadow:
      "hsla(220, 30%, 5%, 0.5) 0px 5px15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px",
  }),
}));

const SignInContainer = styled(Stack)(({ theme }) => ({
  height: "calc((1 - var(--template-frame-height, 0)) * 100dvh)",
  minHeight: "100%",
  padding: theme.spacing(2),
  [theme.breakpoints.up("sm")]: {
    padding: theme.spacing(4),
  },
  "&::before": {
    content: '""',
    display: "block",
    position: "absolute",
    zIndex: -1,
    inset: 0,
    backgroundImage:
      "radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))",
    backgroundRepeat: "no-repeat",
    ...theme.applyStyles("dark", {
      backgroundImage:
        "radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))",
    }),
  },
}));

interface FormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ChangePasswordResponse {
  technicianId: number;
  accessToken: string;
  refreshToken: string;
  message: string;
  success: boolean;
}

export default function ChangePasswordPage(props: {
  disableCustomTheme?: boolean;
}) {
  const [currentPasswordError, setCurrentPasswordError] = React.useState(false);
  const [currentPasswordErrorMessage, setCurrentPasswordErrorMessage] = React.useState("");
  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState("");
  const [confirmPasswordError, setConfirmPasswordError] = React.useState(false);
  const [confirmPasswordErrorMessage, setConfirmPasswordErrorMessage] = React.useState("");
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [successMessage, setSuccessMessage] = React.useState("");

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const validateInputs = () => {
    const currentPassword = document.getElementById(
      "current-password"
    ) as HTMLInputElement;
    const newPassword = document.getElementById(
      "new-password"
    ) as HTMLInputElement;
    const confirmPassword = document.getElementById(
      "confirm-password"
    ) as HTMLInputElement;

    let isValid = true;

    if (!currentPassword.value) {
      setCurrentPasswordError(true);
      setCurrentPasswordErrorMessage("Le mot de passe actuel est requis.");
      isValid = false;
    } else {
      setCurrentPasswordError(false);
      setCurrentPasswordErrorMessage("");
    }

    if (!newPassword.value || newPassword.value.length < 6) {
      setPasswordError(true);
      setPasswordErrorMessage(
        "Le mot de passe doit contenir au moins 6 caractères."
      );
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage("");
    }

    if (confirmPassword.value !== newPassword.value || !confirmPassword.value) {
      setConfirmPasswordError(true);
      setConfirmPasswordErrorMessage(
        "Les deux mots de passe ne sont pas identiques."
      );
      isValid = false;
    } else {
      setConfirmPasswordError(false);
      setConfirmPasswordErrorMessage("");
    }

    return isValid;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setSuccessMessage("");

    if (!validateInputs()) {
      setIsLoading(false);
      return;
    }

    const formData = new FormData(event.currentTarget);

    const data: FormValues = {
      currentPassword: formData.get("currentPassword") as string,
      newPassword: formData.get("newPassword") as string,
      confirmPassword: formData.get("confirmPassword") as string,
    };

    try {
      const token = sessionStorage.getItem("access_token");

      const response = await axios.post<ChangePasswordResponse>(
        "http://localhost:9090/auth/change-password",
        data, 
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const responseData: ChangePasswordResponse = response.data;

      if (responseData.success) {
        setSuccessMessage(responseData.message || "Mot de passe changé avec succès!");

        // Store technicianId if available
        if (responseData.technicianId) {
          sessionStorage.setItem("technicianId", responseData.technicianId.toString());
        }

        // Update tokens if provided
        if (responseData.accessToken && responseData.refreshToken) {
          const roles: string[] = extractRolesFromToken(responseData.accessToken);
          
          authService.removeTokens();
          
          dispatch(
            setCredentials({
              token: responseData.accessToken,
              refreshToken: responseData.refreshToken,
            })
          );

          console.log("User roles:", roles);
        }

        // Navigate after a short delay to show success message
        setTimeout(() => {
          navigate("/dashboard", { replace: true });
        }, 2000);
      }
    } catch (error: any) {
      if (error.response) {
        if (error.response.status === 401) {
          setCurrentPasswordError(true);
          setCurrentPasswordErrorMessage("Le mot de passe actuel est incorrect.");
        } else if (error.response.status === 400) {
          setPasswordError(true);
          setPasswordErrorMessage(error.response.data.message || "Erreur de validation.");
        } else {
          setPasswordError(true);
          setPasswordErrorMessage("Une erreur s'est produite. Veuillez réessayer.");
        }
      } else {
        setPasswordError(true);
        setPasswordErrorMessage("Erreur de connexion. Veuillez vérifier votre connexion.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <SignInContainer direction="column" justifyContent="space-between">
        <ColorModeSelect
          sx={{ position: "fixed", top: "1rem", right: "1rem" }}
        />
        <Card variant="outlined" sx={{ height: "100%" }}>
          <Typography
            variant="h4"
            sx={{ width: "100%", fontWeight: "bold", textAlign: "center", mb: 2 }}
          >
            Changer votre Mot de Passe
          </Typography>
          
          {successMessage && (
            <Typography color="success.main" sx={{ mb: 2 }}>
              {successMessage}
            </Typography>
          )}
          
          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              gap: 2,
            }}
          >
            <FormControl>
              <FormLabel htmlFor="current-password">Mot de passe actuel</FormLabel>
              <TextField
                error={currentPasswordError}
                helperText={currentPasswordErrorMessage}
                name="currentPassword"
                placeholder="••••••"
                type="password"
                id="current-password"
                autoComplete="current-password"
                required
                fullWidth
                variant="outlined"
              />
            </FormControl>
            
            <FormControl>
              <FormLabel htmlFor="new-password">Nouveau mot de passe</FormLabel>
              <TextField
                error={passwordError}
                helperText={passwordErrorMessage}
                id="new-password"
                type="password"
                name="newPassword"
                placeholder="••••••"
                autoComplete="new-password"
                required
                fullWidth
                variant="outlined"
              />
            </FormControl>
            
            <FormControl>
              <FormLabel htmlFor="confirm-password">Confirmer mot de passe</FormLabel>
              <TextField
                error={confirmPasswordError}
                helperText={confirmPasswordErrorMessage}
                id="confirm-password"
                type="password"
                name="confirmPassword"
                placeholder="••••••"
                autoComplete="confirm-password"
                required
                fullWidth
                variant="outlined"
              />
            </FormControl>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: "20px" }}
              disabled={isLoading}
            >
              {isLoading ? "Changement en cours..." : "Changer le mot de passe"}
            </Button>
          </Box>
        </Card>
      </SignInContainer>
    </AppTheme>
  );
}