import React, { useEffect, useRef, useState, type ChangeEvent } from "react";
import {
  Container,
  Paper,
  Avatar,
  Typography,
  TextField,
  Button,
  Box,
  Divider,
  InputAdornment,
  IconButton,
  Dialog,
  DialogContent,
  DialogTitle,
  useTheme,
  Card,
  CardContent,
  Alert,
  Chip,
  alpha,
} from "@mui/material";
import {
  Edit as EditIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Badge as BadgeIcon,
  DriveEta as DriveEtaIcon,
  PhotoCamera,
  VpnKey as KeyIcon,
  Logout as LogoutIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Lock as LockIcon,
} from "@mui/icons-material";
import { useRoles } from "../../hooks/useRoles";
import {
  editProfileData,
  getProfileData,
  uploadProfilePhoto,
  type profileDataType,
} from "../../data/profileData";
import { tokens } from "../../shared-theme/theme";
import { useSelector } from "react-redux";
import { selectIsCollapsed } from "../../features/slices/layoutSlice";
import { Link } from "react-router-dom";

interface ProfileProps {
  onLogout: () => void;
}

const Profile: React.FC<ProfileProps> = ({ onLogout }) => {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<profileDataType>({
    fullName: "",
    email: "",
    phoneNumber: "",
    cin: "",
    profileUrl: "",
    carMatricule: "",
    role: "",
  });
  const { isAdmin } = useRoles();
  const email = sessionStorage.getItem("userEmail");

  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isCollapsed = useSelector(selectIsCollapsed);

  // Handle file selection
  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      setProfilePhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setPreviewUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
      setIsDialogOpen(false);

      try {
        await uploadProfilePhoto(file, email ?? "");
        setSuccess("Photo de profil mise à jour avec succès");
        setTimeout(() => setSuccess(null), 3000);
      } catch (error) {
        setError("Échec du téléchargement de la photo");
        setTimeout(() => setError(null), 3000);
      }
    }
  };

  // Handle opening file dialog
  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  // Handle closing dialog
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  // Trigger file input click
  const handleEditClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const data = await getProfileData(email ?? "");

        if (data) {
          setProfileData({
            fullName: data.fullName ?? "",
            email: data.email ?? "",
            phoneNumber: data.phoneNumber ?? "",
            cin: data.cin ?? "",
            profileUrl: data.profileUrl ?? "",
            carMatricule: data.carMatricule ?? "",
            role: data.role ?? "",
          });
          setPreviewUrl(data.profileUrl);
        }
      } catch (err) {
        setError("Erreur lors du chargement des données du profil");
        setTimeout(() => setError(null), 3000);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, [email]);

  const handleInputChange = (field: string, value: string) => {
    setProfileData({
      ...profileData,
      [field]: value,
    });
  };

  const handleSave = async () => {
    try {
      await editProfileData(email ?? "", profileData);
      setEditing(false);
      setSuccess("Profil mis à jour avec succès");
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError("Erreur lors de la mise à jour du profil");
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    // Recharger les données originales
    const fetchOriginalData = async () => {
      const data = await getProfileData(email ?? "");
      if (data) {
        setProfileData({
          fullName: data.fullName ?? "",
          email: data.email ?? "",
          phoneNumber: data.phoneNumber ?? "",
          cin: data.cin ?? "",
          profileUrl: data.profileUrl ?? "",
          carMatricule: data.carMatricule ?? "",
          role: data.role ?? "",
        });
      }
    };
    fetchOriginalData();
  };

  return (
    <Container
      maxWidth="lg"
      sx={{
        py: 4,
        ml: {
          xs: "100px",
          sm: "105px",
          md: "110px",
          lg: !isCollapsed ? "360px" : "300px",
        },
        transition: "margin-left 0.3s ease",
      }}
    >
      {/* Notifications */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column" },
          justifyContent: "center",
          alignItems: "center",
          gap: 4,
        }}
      >
        <Box
          sx={{
            mr: {
              xs: "20",
              sm: "85px",
              md: "90px",
              lg: "300px",
            },
            width: {
              xs: "100%",
              sm: "80%",
              md: "70%",
              lg: "60%",
            },
          }}
        >
          <Card
            elevation={3}
            sx={{
              borderRadius: 3,
              overflow: "hidden",
              bgcolor: "background.paper",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                p: 4,
                background: `linear-gradient(135deg, ${colors.primary[500]} 0%, ${colors.primary[700]} 100%)`,
                color: "white",
              }}
            >
              <Box sx={{ position: "relative", mb: 2 }}>
                <Avatar
                  src={previewUrl}
                  sx={{
                    width: 120,
                    height: 120,
                    border: "4px solid white",
                    boxShadow: 3,
                  }}
                >
                  {!previewUrl && <PersonIcon sx={{ fontSize: 50 }} />}
                </Avatar>
                <IconButton
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    bgcolor: "primary.main",
                    color: "white",
                    "&:hover": { bgcolor: "primary.dark" },
                    boxShadow: 2,
                  }}
                  onClick={handleEditClick}
                >
                  <PhotoCamera />
                </IconButton>
              </Box>

              <Typography variant="h5" fontWeight="600" gutterBottom>
                {profileData.fullName}
              </Typography>
              <Chip
                label={profileData.role}
                size="small"
                sx={{
                  bgcolor: colors.greenAccent[800],
                  color: colors.greenAccent[500],
                  fontWeight: "medium",
                }}
              />
            </Box>

            <CardContent>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Button
                  variant={editing ? "contained" : "outlined"}
                  startIcon={
                    editing ? (
                      <SaveIcon sx={{ bgcolor: colors.greenAccent[500] }} />
                    ) : (
                      <EditIcon sx={{ color: colors.primary[300] }} />
                    )
                  }
                  onClick={editing ? handleSave : () => setEditing(true)}
                  fullWidth
                  sx={{
                    bgcolor: editing ? colors.greenAccent[500] : "primary",
                    borderColor: colors.primary[700],
                    color: colors.primary[300],
                    fontSize: "15px",
                  }}
                >
                  {editing ? "Sauvegarder" : "Modifier le profil"}
                </Button>

                {editing && (
                  <Button
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={handleCancel}
                    fullWidth
                    sx={{
                      bgcolor: colors.redAccent[500],
                    }}
                  >
                    Annuler
                  </Button>
                )}

                <Button
                  component={Link}
                  to="/change-password"
                  variant="outlined"
                  startIcon={<KeyIcon />}
                  fullWidth
                  sx={{
                    borderColor: colors.blueAccent[500],
                    color: colors.blueAccent[500],
                    fontSize: "15px",
                    "&:hover": {
                      borderColor: colors.blueAccent[700],
                      bgcolor: alpha(colors.blueAccent[500], 0.04),
                    },
                  }}
                >
                  Changer le mot de passe
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<LogoutIcon />}
                  onClick={onLogout}
                  fullWidth
                  sx={{
                    borderColor: colors.redAccent[500],
                    color: colors.redAccent[600],
                    fontSize: "15px",
                    "&:hover": {
                      borderColor: colors.redAccent[700],
                      bgcolor: alpha(colors.redAccent[500], 0.04),
                    },
                  }}
                >
                  Se déconnecter
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Colonne de droite - Détails du profil */}
        <Box
          sx={{
            width: {
              xs: "80%",
              sm: "100%",
              md: "90%",
              lg: "80%",
            },
            mr: {
              xs: "90px",
              sm: "8px",
              md: "90px",
              lg: "350px",
            },
          }}
        >
          <Card
            elevation={2}
            sx={{
              borderRadius: 3,
              overflow: "hidden",
              bgcolor: "background.paper",
            }}
          >
            <Box
              sx={{
                p: 3,
                bgcolor: "primary.main",
                color: "white",
              }}
            >
              <Typography variant="h6" fontWeight="600">
                Informations personnelles
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Gérez vos informations personnelles et vos préférences
              </Typography>
            </Box>

            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                <Box sx={{ width: { xs: "100%", sm: "45%" } }}>
                  <TextField
                    fullWidth
                    label="Nom Complet"
                    value={profileData.fullName}
                    onChange={(e) =>
                      handleInputChange("fullName", e.target.value)
                    }
                    disabled={!editing}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                    variant={editing ? "outlined" : "filled"}
                  />
                </Box>

                <Box sx={{ width: { xs: "100%", sm: "45%" } }}>
                  <TextField
                    fullWidth
                    label="Adresse e-mail"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    disabled={!editing}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                    variant={editing ? "outlined" : "filled"}
                  />
                </Box>

                {!isAdmin && (
                  <>
                    <Box sx={{ width: { xs: "100%", sm: "45%" } }}>
                      <TextField
                        fullWidth
                        label="Numéro de Téléphone"
                        value={profileData.phoneNumber}
                        onChange={(e) =>
                          handleInputChange("phoneNumber", e.target.value)
                        }
                        disabled={!editing}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PhoneIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                        variant={editing ? "outlined" : "filled"}
                      />
                    </Box>

                    <Box sx={{ width: { xs: "100%", sm: "45%" } }}>
                      <TextField
                        fullWidth
                        label="CIN"
                        value={profileData.cin}
                        onChange={(e) =>
                          handleInputChange("cin", e.target.value)
                        }
                        disabled={!editing}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <BadgeIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                        variant={editing ? "outlined" : "filled"}
                      />
                    </Box>

                    <Box sx={{ width: { xs: "100%", sm: "45%" } }}>
                      <TextField
                        fullWidth
                        label="Matricule de voiture"
                        value={profileData.carMatricule}
                        onChange={(e) =>
                          handleInputChange("carMatricule", e.target.value)
                        }
                        disabled={!editing}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <DriveEtaIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                        variant={editing ? "outlined" : "filled"}
                      />
                    </Box>

                    <Box sx={{ width: { xs: "100%", sm: "45%" } }}>
                      <TextField
                        fullWidth
                        label="Rôle"
                        value={profileData.role}
                        disabled
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LockIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                        variant="filled"
                      />
                    </Box>
                  </>
                )}
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Dialog pour la photo de profil */}
      <Dialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: "primary.main", color: "white" }}>
          Photo de profil
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Typography variant="body2" sx={{ mb: 3 }}>
            Choisissez une option pour mettre à jour votre photo de profil
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Button
              variant="contained"
              component="label"
              startIcon={<PhotoCamera />}
              fullWidth
            >
              Télécharger une nouvelle photo
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                hidden
              />
            </Button>
            <Button variant="outlined" onClick={handleCloseDialog} fullWidth>
              Annuler
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Hidden file input */}
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        ref={fileInputRef}
        style={{ display: "none" }}
      />
    </Container>
  );
};

export default Profile;
