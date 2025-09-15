import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Divider,
  Badge,
  Paper,
  Switch,
  FormControlLabel,
  Button,
  Chip,
  useTheme,
} from "@mui/material";
import {
  Notifications as NotificationsIcon,
  Circle as UnreadIcon,
  CheckCircle as ReadIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Check as CheckIcon,
  AccountCircle as AccountIcon,
} from "@mui/icons-material";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
// Import your notification hooks
import useNotifications from "../../hooks/useNotifications/useNotifications";
import { tokens } from "../../shared-theme/theme";
import { useSelector } from "react-redux";
import * as layoutSlice from "../../features/slices/layoutSlice";
import {
  deleteAllNotifications,
  getNotifications,
  markNotificationAsRead,
  type NotificationResponse,
} from "../../data/notifications";
import { useNavigate } from "react-router-dom";


type isRead={
  notificationId:number,
  read:boolean,
}


const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationResponse[]>(
    []
  );
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const { show: showToast } = useNotifications();
  const isCollapsed = useSelector(layoutSlice.selectIsCollapsed);
  const [loading,setLoading]=useState(false)
  const [isRead,setIsRead]=useState<boolean>(false);

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const email=sessionStorage.getItem("userEmail");
  const navigate=useNavigate();

    useEffect(() => {
      const fetchProfileData = async () => {
        try {
          setLoading(true);
          const data = await getNotifications(email ?? "");
  
          if (data) {
            setNotifications(data);
          }
        } catch (err) {
          console.log("couldnt fetch notifications ",err);
        } finally {
          setLoading(false);
        }
      };
      fetchProfileData();
    }, [email,isRead]);

  const toggleShowUnreadOnly = () => {
    
    setShowUnreadOnly(!showUnreadOnly);
    showToast(
      showUnreadOnly
        ? "Showing all notifications"
        : "Showing only unread notifications",
      { severity: "info", autoHideDuration: 2000 }
    );

  };


  // Mark a notification as read
  const markAsRead = async (id: number) => {
    
    setNotifications(
      notifications.map((notification) =>
        notification?.id === id
          ? { ...notification, isRead: true }
          : notification
      )
    );
    
    const notification = notifications.find((n) => n.id === id);
    setIsRead(true);
    const response = await markNotificationAsRead(notification?.id ?? 0);

    if (response != null && response != undefined) {
      
      showToast(`Marked as read: ${notification?.title}`, {
        severity: "success",
        autoHideDuration: 2000,
      });

      if(notification?.type==="INTERVENTION_REJECTED"){
        const interventionId=notification.interventionId;
        
        navigate(`/correctIntervention/${interventionId}`)
      }

    }

  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(
      notifications.map((notification) => ({
        ...notification,
        isRead: true,
      }))
    );

    showToast("All notifications marked as read", {
      severity: "success",
      autoHideDuration: 2000,
    });
  };

  // Delete a notification
  const deleteNotification = async (id: number) => {

    const notification = notifications.find((n) => n.id === id);
    setNotifications(
      notifications.filter((notification) => notification.id !== id)
    );
    if (notification?.read ) {
      const response = await deleteNotification(id);
      console.log("delete response",response);
      if (response != undefined && response != null) {
        showToast(`Deleted notification: ${notification?.title}`, {
          severity: "info",
          autoHideDuration: 2000,
        });
      }
    }

  };

  // Clear all notifications
  const clearAllNotifications = async () => {
    if (notifications.length === 0) return;

    const response = await deleteAllNotifications();
    setNotifications([]);

    showToast("All notifications cleared", {
      severity: "info",
      autoHideDuration: 2000,
    });
  };

  // Get filtered notifications based on the filter setting
  const filteredNotifications = showUnreadOnly
    ? notifications.filter((notification) => !notification.read)
    : notifications;

  // Count unread notifications
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Get the appropriate icon based on notification type
  const getNotificationIcon = (type: NotificationResponse["type"]) => {
    switch (type) {
      case "INTERVENTION_REJECTED":
        return <CloseOutlinedIcon color="error" />;
      case "INTERVENTION_VALIDATED":
        return <CheckIcon color="success" />;
      default:
        return <InfoIcon color="info" />;
    }

  };

  console.log("notifications: ",notifications)
  notifications.map((notification)=>console.log("notif isRead",notification.read))
  return (
    <Container maxWidth="md" sx={{ py: 4, bgcolor: colors.primary[500] }}>
      <Box
        sx={{
          p: 3,
          borderRadius: 2,
          bgcolor: colors.primary[400],
          width: {
            xs: "85%",
            sm: "90%",
            md: "90%",
            lg: "100%",
          },
          ml: {
            xs: "90px",
            sm: "80px",
            md: "90px",
            lg: "30px",
          },
        }}
      >
        {/* Header */}
        <Box mb={3}>
          <Box
            sx={{
              ml: {
                xs: "150px",
                sm: "350px",
                md: "550px",
                lg: "600px",
              },
            }}
          >
            {notifications.length > 0 && (
              <Button
                onClick={clearAllNotifications}
                color="error"
                size="small"
                sx={{ fontSize: "13px" }}
                startIcon={<DeleteIcon />}
              >
                Supprimer tous
              </Button>
            )}
          </Box>
        </Box>

        {/* Filter toggle */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <FormControlLabel
            control={
              <Switch
                checked={showUnreadOnly}
                onChange={toggleShowUnreadOnly}
                color="primary"
              />
            }
            label="Afficher uniquement les non lues"
          />

          {/* Notification count */}
          <Chip
            label={`${filteredNotifications.length} notification${
              filteredNotifications.length !== 1 ? "s" : ""
            }`}
            variant="outlined"
            size="small"
          />
        </Box>

        {/* Notifications List */}
        <List sx={{ width: "100%" }}>
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification, index) => (
              <React.Fragment key={notification.id}>
                <ListItem alignItems="flex-start">
                  {/* Read status icon */}
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {notification.read ? (
                      <ReadIcon sx={{ color: colors.greenAccent[300] }} />
                    ) : (
                      <UnreadIcon sx={{ color: colors.redAccent[300] }} />
                    )}
                  </ListItemIcon>

                  {/* Notification type icon */}
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {getNotificationIcon(notification.type)}
                  </ListItemIcon>

                  {/* Notification content */}
                  <ListItemText
                    primary={
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: notification.read ? "normal" : "bold",
                        }}
                      >
                        {notification.title}
                      </Typography>
                    }
                    secondary={
                      <>
                        <Typography
                          variant="body2"
                          color="text.primary"
                          component="span"
                          display="block"
                          mb={0.5}
                        >
                          {notification.message}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {notification.timestamp}
                        </Typography>
                      </>
                    }
                  />

                  {/* Action buttons */}
                  <Box>
                    {!notification.read && (
                      <IconButton
                        edge="end"
                        aria-label="mark as read"
                        onClick={() => markAsRead(notification?.id ?? 0)}
                        sx={{ mr: 1 }}
                        title="Mark as read"
                      >
                        <ReadIcon />
                      </IconButton>
                    )}
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => deleteNotification(notification?.id ?? 0)}
                      title="Delete notification"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </ListItem>

                {/* Divider between notifications */}
                {index < filteredNotifications.length - 1 && (
                  <Divider variant="inset" component="li" />
                )}
              </React.Fragment>
            ))
          ) : (
            // Empty state
            <Box textAlign="center" py={4}>
              <NotificationsIcon
                sx={{ fontSize: 48, color: "text.secondary", mb: 1 }}
              />
              <Typography variant="h6" color="text.secondary">
                Aucun notifications
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {showUnreadOnly
                  ? "Vous n’avez aucune notification non lue."
                  : "Vous êtes à jour !!"}
              </Typography>
            </Box>
          )}
        </List>
      </Box>
    </Container>
  );
};

export default Notifications;
