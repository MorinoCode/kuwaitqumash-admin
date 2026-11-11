import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { api } from "../api/axios";
import { useState, useEffect } from "react";
import "./DashboardPage.css";

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ tenants: 0 });

  useEffect(() => {
    api
      .get("/tenants")
      .then((res) => {
        const list = res.data?.data ?? [];
        setStats({ tenants: list.length });
      })
      .catch(() => {});
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
      </div>
    </div>
  );
}
