import { useTheme } from "@mui/material/styles";
import React, { useState } from "react";
import { tokens } from "../../shared-theme/theme";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  CircularProgress,
} from "@mui/material";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";

type VoucherPhotoProps = {
  photo: string;
};

const VoucherPhoto = ({ photo }: VoucherPhotoProps) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [isOpen, setIsOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.2, 3));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.2, 0.5));

  const isValidImageUrl = (url: string) => {
    return url && (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/'));
  };

  return (
    <Box
      bgcolor={colors.primary[500]}
      maxWidth="360px"
      sx={{
        border: "2px solid ",
        borderColor: colors.blueAccent[800],
        borderRadius: "8px",
        p: 2,
      }}
    >
      <Typography variant="h2" fontWeight="500" color={colors.greenAccent[100]}>
        Voir la photo de bon d'intervention
      </Typography>

      <Button
        variant="outlined"
        onClick={() => setIsOpen(true)}
        sx={{
          bgcolor: colors.blueAccent[900],
          borderColor: colors.blueAccent[500],
          color: colors.blueAccent[500],
          "&:hover": {
            color: colors.blueAccent[200],
            fontWeight: "bold",
            backgroundColor: "transparent",
            bgcolor: colors.blueAccent[800],
          },
          mt: "10px",
        }}
      >
        <Typography fontWeight="bold">Ouvrir la photo</Typography>
      </Button>
      
      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        aria-labelledby="draggable-dialog-title"
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: colors.primary[400],
          }
        }}
      >
        <DialogTitle 
          id="draggable-dialog-title"
          sx={{ 
            cursor: "move",
            bgcolor: colors.primary[400],
            borderBottom: `1px solid ${colors.blueAccent[700]}`,
          }}
        >
          Consultez la photo du bon d'intervention
        </DialogTitle>
        
        <DialogContent sx={{ bgcolor: colors.primary[400], position: "relative" }}>
          {!isValidImageUrl(photo) ? (
            <Typography color="error" textAlign="center">
              URL d'image invalide
            </Typography>
          ) : imageError ? (
            <Typography color="error" textAlign="center">
              Impossible de charger l'image
            </Typography>
          ) : (
            <>
              {imageLoading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              )}
              
              <Box
                sx={{
                  position: "relative",
                  display: imageLoading ? 'none' : 'block',
                  width: "100%",
                  borderRadius: 2,
                  overflow: "hidden",
                }}
              >
                <Box
                  component="img"
                  src={photo}
                  alt="Bon d'intervention"
                  onLoad={() => setImageLoading(false)}
                  onError={() => setImageError(true)}
                  sx={{
                    width: "100%",
                    height: "auto",
                    objectFit: "contain",
                    transform: `scale(${zoom})`,
                    transition: "transform 0.3s ease",
                    display: "block",
                    maxHeight: "70vh",
                  }}
                />

                <Box
                  sx={{
                    position: "absolute",
                    bottom: 8,
                    right: 8,
                    display: "flex",
                    gap: 1,
                    bgcolor: "rgba(0,0,0,0.5)",
                    borderRadius: 1,
                    p: 0.5,
                  }}
                >
                  <IconButton
                    size="small"
                    onClick={handleZoomOut}
                    sx={{ color: "white" }}
                    disabled={zoom <= 0.5}
                  >
                    <ZoomOutIcon />
                  </IconButton>
                  
                  <Typography variant="body2" sx={{ color: "white", px: 1, display: "flex", alignItems: "center" }}>
                    {Math.round(zoom * 100)}%
                  </Typography>
                  
                  <IconButton
                    size="small"
                    onClick={handleZoomIn}
                    sx={{ color: "white" }}
                    disabled={zoom >= 3}
                  >
                    <ZoomInIcon />
                  </IconButton>
                </Box>
              </Box>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default VoucherPhoto;