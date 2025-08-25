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
  Paper,
  Typography,
  type PaperProps,
} from "@mui/material";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import Draggable from "react-draggable";
type VoucherPhotoProps = {
  photo: string;
};

const VoucherPhoto = ({ photo }: VoucherPhotoProps) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [isOpen, setIsOpen] = useState(false);
  const [zoom, setZoom] = useState(1);

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.2, 3));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.2, 0.5));
  return (
    <Box
      bgcolor={colors.primary[500]}
      maxWidth="360px"
      p="20px"
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
        <Typography fontWeight="bold">Ouverir la photo </Typography>
      </Button>
      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        PaperComponent={PaperComponent}
        aria-labelledby="draggable-dialog-title"
      >
        <DialogTitle
          sx={{ bgcolor: colors.primary[400] }}
          style={{ cursor: "move" }}
          id="draggable-dialog-title"
        >
          Consultez la photo du bon d'intervention
        </DialogTitle>
        <DialogContent sx={{ bgcolor: colors.primary[400] }}>
          <Box
            sx={{
              position: "relative",
              display: "inline-block",
              width: "100%",
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <Box
              component="img"
              src={photo}
              alt="Bon d'intervention"
              sx={{
                width: "100%",
                height: "auto",
                objectFit: "cover",
                transform: `scale(${zoom})`,
                transition: "transform 0.3s ease",
                display: "block",
              }}
            />

            {/* Zoom buttons positioned over image */}
            <Box
              sx={{
                position: "absolute",
                bottom: 8,
                right: 8,
                display: "flex",
                gap: 1,
                bgcolor: "rgba(0,0,0,0.3)",
                borderRadius: 1,
                p: 0.5,
              }}
            >
              <IconButton
                size="small"
                onClick={handleZoomOut}
                sx={{ color: "white" }}
              >
                <ZoomOutIcon />
              </IconButton>
              <IconButton
                size="small"
                onClick={handleZoomIn}
                sx={{ color: "white" }}
              >
                <ZoomInIcon />
              </IconButton>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default VoucherPhoto;

function PaperComponent(props: PaperProps) {
  return (
    <Draggable
      handle="#draggable-dialog-title"
      cancel={'[class*="MuiDialogContent-root"]'}
    >
      <Paper {...props} />
    </Draggable>
  );
}
