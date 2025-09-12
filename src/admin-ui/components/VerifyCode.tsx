import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import OutlinedInput from "@mui/material/OutlinedInput";
import { sendCode } from "../../data/forgoPassword";
import { useNavigate, useNavigation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { selectVerifyCode, setVerifyCode } from "../../features/slices/verifyCodeSlice";

interface verifyCode {
  open: boolean;
  handleClose: () => void;
}

export default function ForgotPassword() {

  const [code, setVerifyCode] = React.useState("");
  const navigate = useNavigate();
  const verifyCode=useSelector(selectVerifyCode);

  const handleContinue = async () => {    
    navigate("/change-password");
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };


  return (
    <Dialog
      open={open}
      onClose={handleClose}
      slotProps={{
        paper: {
          component: "form",
          onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
          },
          sx: { backgroundImage: "none" },
        },
      }}
    >
      <DialogTitle>Réinitialiser le mot de passe</DialogTitle>
      <DialogContent
        sx={{ display: "flex", flexDirection: "column", gap: 2, width: "100%" }}
      >
        <DialogContentText>
          Saisissez le code envoyé à votre adresse e-mail.
        </DialogContentText>
        <OutlinedInput
          autoFocus
          required
          margin="dense"
          id="email"
          name="email"
          label="Email address"
          placeholder="Email address"
          type="email"
          fullWidth
          onChange={handleChange}
        />
      </DialogContent>
      <DialogActions sx={{ pb: 3, px: 3 }}>
        <Button variant="contained" type="submit" onClick={handleContinue}>
          change password
        </Button>
      </DialogActions>
    </Dialog>
  );
}
