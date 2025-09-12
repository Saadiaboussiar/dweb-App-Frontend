import React, { useState } from "react";
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

// Define the Notification type
interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  type: "info" | "warning" | "success" | "mention";
}

// Mock notification data
const initialNotifications: AppNotification[] = [
  {
    id: "1",
    title: "System Update",
    message: "A new system update is available. Please update your app.",
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    isRead: false,
    type: "info",
  },
  {
    id: "2",
    title: "Security Alert",
    message: "Unusual login attempt detected from a new device.",
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    isRead: false,
    type: "warning",
  },
  {
    id: "3",
    title: "Message Received",
    message: "You have a new message from Sarah Johnson.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    isRead: true,
    type: "info",
  },
  {
    id: "4",
    title: "Task Completed",
    message: "Your weekly report has been successfully generated.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
    isRead: true,
    type: "success",
  },
  {
    id: "5",
    title: "You were mentioned",
    message: "John mentioned you in a comment on the project dashboard.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    isRead: false,
    type: "mention",
  },
];

const Notifications: React.FC = () => {
  const [notifications, setNotifications] =
    useState<AppNotification[]>(initialNotifications);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const { show: showToast } = useNotifications();
  const isCollapsed = useSelector(layoutSlice.selectIsCollapsed);

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

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
  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map((notification) =>
        notification.id === id
          ? { ...notification, isRead: true }
          : notification
      )
    );

    const notification = notifications.find((n) => n.id === id);
    if (notification) {
      showToast(`Marked as read: ${notification.title}`, {
        severity: "success",
        autoHideDuration: 2000,
      });
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
  const deleteNotification = (id: string) => {
    const notification = notifications.find((n) => n.id === id);
    setNotifications(
      notifications.filter((notification) => notification.id !== id)
    );

    if (notification) {
      showToast(`Deleted notification: ${notification.title}`, {
        severity: "info",
        autoHideDuration: 2000,
      });
    }
  };

  // Clear all notifications
  const clearAllNotifications = () => {
    if (notifications.length === 0) return;

    setNotifications([]);
    showToast("All notifications cleared", {
      severity: "info",
      autoHideDuration: 2000,
    });
  };

  // Get filtered notifications based on the filter setting
  const filteredNotifications = showUnreadOnly
    ? notifications.filter((notification) => !notification.isRead)
    : notifications;

  // Count unread notifications
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Get the appropriate icon based on notification type
  const getNotificationIcon = (type: AppNotification["type"]) => {
    switch (type) {
      case "warning":
        return <CloseOutlinedIcon color="error" />;
      case "success":
        return <CheckIcon color="success" />;
      case "mention":
        return <AccountIcon color="primary" />;
      default:
        return <InfoIcon color="info" />;
    }
  };

  // Format the timestamp to a readable format
  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

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
                    {notification.isRead ? (
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
                          fontWeight: notification.isRead ? "normal" : "bold",
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
                          {formatTime(notification.timestamp)}
                        </Typography>
                      </>
                    }
                  />

                  {/* Action buttons */}
                  <Box>
                    {!notification.isRead && (
                      <IconButton
                        edge="end"
                        aria-label="mark as read"
                        onClick={() => markAsRead(notification.id)}
                        sx={{ mr: 1 }}
                        title="Mark as read"
                      >
                        <ReadIcon />
                      </IconButton>
                    )}
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => deleteNotification(notification.id)}
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
                No notifications
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {showUnreadOnly
                  ? "You don't have any unread notifications"
                  : "You're all caught up!"}
              </Typography>
            </Box>
          )}
        </List>
      </Box>
    </Container>
  );
};

export default Notifications;
