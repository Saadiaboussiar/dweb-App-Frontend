import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import OutlinedInput from "@mui/material/OutlinedInput";
import { sendCode } from "../../data/forgoPassword";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setVerifyCode } from "../../features/slices/verifyCodeSlice";

interface ForgotPasswordProps {
  open: boolean;
  handleClose: () => void;
}

export default function ForgotPassword({
  open,
  handleClose,
}: ForgotPasswordProps) {
  const [email, setEmail] = React.useState("");
  const [codeSent, setCodeSent] = React.useState(false);
  const [verificationCode, setVerificationCode] = React.useState("");
  const [generatedCode, setGeneratedCode] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSendCode = async () => {
    setIsLoading(true);
    try {
      // Simulate API call to send code
      const code: string = await sendCode(email);
      setGeneratedCode(code);
      setCodeSent(true);
      sessionStorage.setItem("userEmail",email);

    } catch (error) {
      console.error("Error sending code:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = () => {
    if (String(verificationCode) === String(generatedCode)) {
      dispatch(setVerifyCode(verificationCode));
      navigate("/change-password");
    } else {
      alert("Code de vérification incorrect");
    }
  };

  console.log("generatedCode: ", generatedCode);
  console.log("verificationCode", verificationCode);

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const handleCodeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setVerificationCode(event.target.value);
  };

  const handleCloseDialog = () => {
    setCodeSent(false);
    setEmail("");
    setVerificationCode("");
    handleClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleCloseDialog}
      slotProps={{
        paper: {
          component: "form",
          onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            if (codeSent) {
              handleVerifyCode();
            } else {
              handleSendCode();
            }
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
          {codeSent
            ? "Un code de vérification a été envoyé à votre adresse e-mail. Veuillez le saisir ci-dessous."
            : "Saisissez l'adresse e-mail de votre compte et nous vous enverrons un code pour réinitialiser votre mot de passe."}
        </DialogContentText>

        {!codeSent ? (
          <OutlinedInput
            autoFocus
            required
            margin="dense"
            id="email"
            name="email"
            label="Adresse email"
            placeholder="ex@gmail.com"
            type="email"
            fullWidth
            value={email}
            onChange={handleEmailChange}
          />
        ) : (
          <OutlinedInput
            autoFocus
            required
            margin="dense"
            id="verificationCode"
            name="verificationCode"
            label="Code de vérification"
            placeholder="ex.7654"
            type="text"
            fullWidth
            value={verificationCode}
            onChange={handleCodeChange}
          />
        )}
      </DialogContent>
      <DialogActions sx={{ pb: 3, px: 3 }}>
        <Button onClick={handleCloseDialog}>Annuler</Button>
        <Button variant="contained" type="submit">
          {codeSent ? "Vérifier le code" : "Envoyer le code"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
