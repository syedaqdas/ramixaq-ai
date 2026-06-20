import { Bell, CheckCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const NotificationCenter = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const navigate = useNavigate();

  const loadNotifications = () => {
    api.get("/notifications")
      .then(({ data }) => {
        setNotifications(data.notifications);
        setUnread(data.unread);
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadNotifications();
    const timer = window.setInterval(loadNotifications, 60000);
    return () => window.clearInterval(timer);
  }, []);

  const openNotification = async (notification) => {
    if (!notification.read) {
      await api.put(`/notifications/${notification._id}/read`);
      setNotifications((current) => current.map((item) => item._id === notification._id ? { ...item, read: true } : item));
      setUnread((current) => Math.max(0, current - 1));
    }
    setOpen(false);
    if (notification.link) navigate(notification.link);
  };

  const markAllRead = async () => {
    await api.put("/notifications/read-all");
    setNotifications((current) => current.map((item) => ({ ...item, read: true })));
    setUnread(0);
  };

  return (
    <div className="relative">
      <button className="btn-secondary relative px-3" onClick={() => setOpen((current) => !current)} aria-label="Notifications">
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="card absolute right-0 z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden">
          <div className="flex items-center justify-between border-b border-line p-3">
            <p className="font-semibold text-white">Notifications</p>
            <button className="text-xs font-semibold text-cyan" onClick={markAllRead}>
              <CheckCheck className="mr-1 inline" size={14} />
              Mark all read
            </button>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length ? notifications.map((notification) => (
              <button
                className={`block w-full border-b border-line p-3 text-left transition hover:bg-panelSoft ${notification.read ? "opacity-70" : ""}`}
                key={notification._id}
                onClick={() => openNotification(notification)}
              >
                <p className="text-sm font-semibold text-white">{notification.title}</p>
                <p className="mt-1 text-xs leading-5 text-zinc-400">{notification.message}</p>
                <p className="mt-2 text-[11px] text-zinc-500">{new Date(notification.createdAt).toLocaleString()}</p>
              </button>
            )) : (
              <p className="p-5 text-center text-sm text-zinc-500">No notifications yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
