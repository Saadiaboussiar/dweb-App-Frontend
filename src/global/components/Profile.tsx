import React, { useEffect, useRef, useState, type ChangeEvent } from "react";
import {
  Container,
  Paper,
  Avatar,
  Typography,
  TextField,
  Button,
  Grid,
  Box,
  Divider,
  Switch,
  FormControlLabel,
  InputAdornment,
  IconButton,
  DialogActions,
  Dialog,
  DialogContent,
  DialogTitle,
  useTheme,
} from "@mui/material";
import {
  Edit as EditIcon,
  Visibility,
  VisibilityOff,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Badge as BadgeIcon,
  Delete,
  PhotoCamera,
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

const Profile = () => {
  const [editing, setEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<profileDataType>({
    fullName: "",
    email: "",
    phoneNumber: "",
    cin: "",
    profileUrl: "",
    role: "",
  });
  const { isAdmin } = useRoles();
  const userEmail: string = sessionStorage.getItem("userEmail") ?? "";

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
        await uploadProfilePhoto(file, userEmail);
        console.log("Photo uploaded successfully");
      } catch (error) {
        console.error("Upload failed:", error);
      }
    }
  };

  // Handle delete photo
  const handleDeletePhoto = () => {
    setProfilePhoto(null);
    setPreviewUrl("");
    setIsDialogOpen(false);
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

        const data = await getProfileData(userEmail);
        if (data) {
          setProfileData({
            fullName: data.fullName ?? "",
            email: data.email ?? "",
            phoneNumber: data.phoneNumber ?? "",
            cin: data.cin ?? "",
            profileUrl: data.profileUrl ?? "",
            role: data.role ?? "",
          });
          setPreviewUrl(data.profileUrl);
        }
      } catch (err) {
        setError("Failed to load profile data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, [userEmail]);

  const handleInputChange = (field: string, value: string) => {
    setProfileData({
      ...profileData,
      [field]: value,
    });

    const updatedData = editProfileData(userEmail, profileData);
    console.log("profile data was apdated");
  };

  const handleSave = () => {
    setEditing(false);
    console.log("Saved data:", profileData);
  };

  const handleCancel = () => {
    setEditing(false);
  };

  return (
    <Container
      maxWidth="md"
      sx={{
        py: 4,
        height: "100hv",
        ml: {
          xs: "100px",
          sm: "105px",
          md: "110px",
          lg: !isCollapsed ? "360px" : "300px",
        },
      }}
    >
      <Paper
        elevation={2}
        sx={{
          p: 4,
          borderRadius: 2,
          bgcolor: colors.primary[400],
          boxShadow: 10,
        }}
      >
        {/* Header */}

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            mb: 4,
            flexDirection: { xs: "column", sm: "row" },
            textAlign: { xs: "center", sm: "left" },
          }}
        >
          <Box sx={{ position: "relative", mr: 3, mb: { xs: 2, sm: 0 } }}>
            <Avatar
              src={previewUrl}
              sx={{
                width: "200px",
                height: "200px",
                border: "2px solid #e0e0e0",
              }}
            >
              {!previewUrl && <PersonIcon sx={{ fontSize: 40 }} />}
            </Avatar>
            {editing && (
              <IconButton
                sx={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  bgcolor: "primary.main",
                  color: "white",
                  "&:hover": { bgcolor: colors.primary[900] },
                }}
                onClick={handleEditClick}
              >
                <EditIcon />
              </IconButton>
            )}
          </Box>

          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h2" component="h1" fontWeight="600">
              {profileData.fullName}
            </Typography>
          </Box>
          <Button
            variant={editing ? "outlined" : "contained"}
            startIcon={<EditIcon />}
            onClick={() => (editing ? handleSave() : setEditing(true))}
            sx={{
              mt: { xs: 2, sm: 1 },
              mr: "0px",
              width: "300px",
              height: "50px",
              borderBlockColor: colors.primary[800],
              "&:hover": {
                bgcolor: editing ? colors.primary[400] : colors.primary[900],
              },
            }}
          >
            {editing ? "Enregistrer les échanges" : "Modifier le Profile"}
          </Button>
        </Box>

        <Divider sx={{ mb: 4 }} />

        {/* Profile Form */}
        <Grid container spacing={3}>
          {/* Name Field */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Nom Complet"
              value={profileData.fullName}
              onChange={(e) => handleInputChange("fullName", e.target.value)}
              disabled={!editing}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
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
            />
          </Grid>

          {!isAdmin && (
            <>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Numéro de Téléhone"
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
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="CIN"
                  value={profileData.cin}
                  onChange={(e) => handleInputChange("cin", e.target.value)}
                  disabled={!editing}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BadgeIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </>
          )}
          {/* Password Change Section 
          <Grid size={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Changer mot de passe
            </Typography>
          </Grid>

          
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="New Password"
              type={showPassword ? "text" : "password"}
              disabled={!editing}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Confirm Password"
              type={showPassword ? "text" : "password"}
              disabled={!editing}
            />
          </Grid>

          <Grid size={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Preferences
            </Typography>
            <FormControlLabel
              control={<Switch defaultChecked />}
              label="Email Notifications"
              disabled={!editing}
            />
          </Grid>
         */}
        </Grid>

        <Dialog open={isDialogOpen} onClose={handleCloseDialog}>
          <DialogTitle>Photo de Profile</DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Choisissez une option pour mettre à jour votre photo de profile
            </Typography>
          </DialogContent>
          <DialogActions sx={{ flexDirection: "column", gap: 1, p: 2 }}>
            <Button
              variant="contained"
              component="label"
              fullWidth
              startIcon={<PhotoCamera />}
            >
              Upload New Photo
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                hidden
              />
            </Button>

            {previewUrl && (
              <Button
                variant="outlined"
                color="error"
                fullWidth
                startIcon={<Delete />}
                onClick={handleDeletePhoto}
              >
                Supprimer la Photo
              </Button>
            )}

            <Button variant="text" onClick={handleCloseDialog} fullWidth>
              Annuler
            </Button>
          </DialogActions>
        </Dialog>

        {/* Hidden file input */}
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          ref={fileInputRef}
          style={{ display: "none" }}
        />
        {/* Action Buttons when editing */}
        {editing && (
          <Box
            sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 4 }}
          >
            <Button
              variant="outlined"
              onClick={handleCancel}
              sx={{
                borderBlockColor: colors.primary[800],
                "&:hover": { bgcolor: colors.primary[400] },
              }}
            >
              <Typography color={colors.primary[300]}>Annuler</Typography>
            </Button>
            <Button variant="contained" onClick={handleSave}>
              Enregisterer les échanges
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default Profile;
