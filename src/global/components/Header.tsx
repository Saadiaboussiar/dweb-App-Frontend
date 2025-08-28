import { Box, Typography, useTheme } from "@mui/material";
import { tokens } from "../../shared-theme/theme";
import { useSelector } from "react-redux";
import { selectIsCollapsed } from "../../features/slices/layoutSlice";

type hederProps = {
  title: string;
  subTitle: string;
};
const Header = ({ title, subTitle }: hederProps) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isCollapsed = useSelector(selectIsCollapsed);
  return (
    <Box
      sx={{
        ml: isCollapsed ? "130px" : "260px",
        transition: "margin-left 0.3s ease",
      }}
    >
      <Typography
        variant="h2"
        color={colors.grey[100]}
        fontWeight="bold"
        sx={{ mb: "5px" }}
      >
        {title}
      </Typography>
      <Typography variant="h5" color={colors.greenAccent[400]}>
        {subTitle}
      </Typography>
    </Box>
  );
};

export default Header;
