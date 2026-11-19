import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { api } from "../api/axios";
import { useState, useEffect } from "react";
import "./DashboardPage.css";

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ tenants: 0, messages: 0, newMessages: 0 });

  useEffect(() => {
    Promise.allSettled([
      api.get("/tenants"),
      api.get("/contact-messages"),
    ]).then(([tenantsRes, messagesRes]) => {
      const tenantList =
        tenantsRes.status === "fulfilled" ? tenantsRes.value.data?.data ?? [] : [];
      const messageList =
        messagesRes.status === "fulfilled" ? messagesRes.value.data?.data ?? [] : [];
      const newCount = messageList.filter((m) => m.status === "new").length;
      setStats({
        tenants: tenantList.length,
        messages: messageList.length,
        newMessages: newCount,
      });
    });
  }, []);

  return (
    <div className="admin-dashboard">
      <h1>Dashboard</h1>
      <p className="admin-dashboard__welcome">
        Welcome, {user?.full_name || user?.email}.
      </p>
      <div className="admin-dashboard__cards">
        <Link to="/tenants" className="admin-dashboard__card">
          <span className="admin-dashboard__card__number">{stats.tenants}</span>
          <span className="admin-dashboard__card__label">Tenants</span>
        </Link>
        <Link to="/messages" className="admin-dashboard__card">
          <span className="admin-dashboard__card__number">{stats.newMessages}</span>
          <span className="admin-dashboard__card__label">
            New Account Requests {stats.messages > 0 ? `(${stats.messages} total)` : ""}
          </span>
        </Link>
      </div>
    </div>
  );
}
