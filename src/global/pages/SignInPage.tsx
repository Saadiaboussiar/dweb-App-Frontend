import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import CssBaseline from "@mui/material/CssBaseline";
import FormControlLabel from "@mui/material/FormControlLabel";
import Divider from "@mui/material/Divider";
import FormLabel from "@mui/material/FormLabel";
import FormControl from "@mui/material/FormControl";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import MuiCard from "@mui/material/Card";
import { styled } from "@mui/material/styles";
import ColorModeSelect from "../../shared-theme/ColorModeSelect";
import AppTheme from "../../shared-theme/AppTheme";
import ForgotPassword from "../../admin-ui/components/ForgotPassword";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useRoles } from "../../hooks/useRoles";
import type { AppDispatch, RootState } from "../../features/store";
import { extractRolesFromToken } from "../../utils/roleUtils";
import { setCredentials } from "../../features/slices/authSlice";
import { jwtDecode } from "jwt-decode";
import { authService } from "../../service/authService";
import { setUser } from "../../features/slices/userSlice";

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
      "hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px",
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
  email: string;
  password: string;
}

interface LoginResponse {
  "access-token": string;
  "refresh-token": string;
  passwordChangeRequired: boolean;
  role: string;
  userEmail:string;
}

export default function SignIn(props: { disableCustomTheme?: boolean }) {
  const [emailError, setEmailError] = React.useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = React.useState("");
  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const navigate = useNavigate();

  const dispatch = useDispatch<AppDispatch>();

  const validateInputs = () => {
    const email = document.getElementById("email") as HTMLInputElement;
    const password = document.getElementById("password") as HTMLInputElement;

    let isValid = true;

    if (!email.value || !/\S+@\S+\.\S+/.test(email.value)) {
      setEmailError(true);
      setEmailErrorMessage(
        "S'il vous plaît, entrez une adresse e-mail valide."
      );
      isValid = false;
    } else {
      setEmailError(false);
      setEmailErrorMessage("");
    }

    if (!password.value || password.value.length < 6) {
      setPasswordError(true);
      setPasswordErrorMessage(
        "Le mot de passe doit contenir au moins 6 caractères."
      );
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage("");
    }

    return isValid;
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    if (!validateInputs()) {
      setIsLoading(false);
      return;
    }

    const formData = new FormData(event.currentTarget);
    const data: FormValues = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    try {
      const response = await axios.post<LoginResponse>(
        "http://localhost:9090/login",
        data,
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }
      );

      const {
        "access-token": accessToken,
        "refresh-token": refreshToken,
        passwordChangeRequired: passwordChangeRequired,
        role: rolesList,
        userEmail:userEmail,
      } = response.data;

      const roles: string[] = extractRolesFromToken(accessToken);

      const isAdmin = rolesList.includes("ADMIN");

      dispatch(
        setCredentials({
          token: accessToken,
          refreshToken: refreshToken,
        })
      );

     
      dispatch(setUser({ 
        email:userEmail,
        role: response.data.role
      }));
    

      console.log("User logged in:", data.email);
      console.log("User roles:", roles);
      console.log("isAdmin: ", isAdmin);
      console.log("passwordChangeRequired",passwordChangeRequired)

      if (passwordChangeRequired && !isAdmin) {
        navigate("/change-password", { replace: true });
      } else {
        if (isAdmin) navigate("/dashboard", { replace: true });
        else navigate("/techDashboard", { replace: true });
      }

      if (response.status === 401) {
        setPasswordError(true);
        setPasswordErrorMessage("Le mot de passe est incorrect");
        
      } else if (response.status === 404) {
        setEmailError(true);
        setEmailErrorMessage("Utilisateur non trouvé");
      }
    } catch (error: any) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (error.response.status === 401) {
          setPasswordError(true);
          setPasswordErrorMessage("Le mot de passe est incorrect");
        } else if (error.response.status === 404) {
          setEmailError(true);
          setEmailErrorMessage("Utilisateur non trouvé");
        } else {
          // Handle other error statuses
          setPasswordError(true);
          setPasswordErrorMessage("Une erreur s'est produite lors de la connexion");
        }
      } else if (error.request) {
        // The request was made but no response was received
        setPasswordError(true);
        setPasswordErrorMessage("Impossible de se connecter au serveur");
      } else {
        // Something happened in setting up the request that triggered an Error
        setPasswordError(true);
        setPasswordErrorMessage("Une erreur inattendue s'est produite");
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
        <Card variant="outlined">
          <Typography
            component="h1"
            variant="h4"
            sx={{ width: "100%", fontSize: "clamp(2rem, 10vw, 2.15rem)" }}
          >
            Connexion
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            method="POST"
            sx={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              gap: 2,
            }}
          >
            <FormControl>
              <FormLabel htmlFor="email">Email</FormLabel>
              <TextField
                error={emailError}
                helperText={emailErrorMessage}
                id="email"
                type="email"
                name="email"
                placeholder="ton@email.com"
                autoComplete="email"
                autoFocus
                required
                fullWidth
                variant="outlined"
                color={emailError ? "error" : "primary"}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="password">Mot de passe</FormLabel>
              <TextField
                error={passwordError}
                helperText={passwordErrorMessage}
                name="password"
                placeholder="••••••"
                type="password"
                id="password"
                autoComplete="current-password"
                autoFocus
                required
                fullWidth
                variant="outlined"
                color={passwordError ? "error" : "primary"}
              />
            </FormControl>
            <FormControlLabel
              control={<Checkbox value="remember" color="primary" />}
              label="Remember me"
            />
            <ForgotPassword open={open} handleClose={handleClose} />
            <Button
              type="submit"
              fullWidth
              variant="contained"
            >
              Se connecter
            </Button>
            <Link
              component="button"
              type="button"
              onClick={handleClickOpen}
              variant="body2"
              sx={{ alignSelf: "center" }}
            >
              Mot de passe oublié?
            </Link>
          </Box>
          <Divider>ou</Divider>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography sx={{ textAlign: "center" }}>
              Vous n'avez pas de compte ?{" "}
              <Link href="/signup" variant="body2" sx={{ alignSelf: "center" }}>
                S'inscrire
              </Link>
            </Typography>
          </Box>
        </Card>
      </SignInContainer>
    </AppTheme>
  );
}
