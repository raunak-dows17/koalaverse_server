const cron = require("node-cron");
const Notification = require("../model/Notification");

const NotificationController = {
  createNotification: async (recipientId, type, message) => {
    try {
      const notification = new Notification({
        recipient: recipientId,
        type,
        message,
      });

      await notification.save();

      return notification;
    } catch (error) {
      console.error("Error creating notification:", error);
      throw error;
    }
  },

  getNotificationsForUser: async (userId) => {
    try {
      const notifications = await Notification.find({ recipient: userId })
        .sort({ createdAt: -1 })
        .populate("sender", "username");

      return notifications;
    } catch (error) {
      console.error("Error fetching notifications:", error);
      throw error;
    }
  },

  markNotificationAsRead: async (notificationId) => {
    try {
      await Notification.findByIdAndUpdate(notificationId, {
        status: "read",
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  },

  scheduleNotificationCleanup: () => {
    cron.schedule("0 0 1 * *", async () => {
      try {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

        await Notification.deleteMany({ createdAt: { $lt: oneMonthAgo } });

        console.log("Old notifications deleted successfully.");
      } catch (error) {
        console.error("Error deleting old notifications:", error);
      }
    });
  },
};

module.exports = NotificationController;
