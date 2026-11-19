import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Layout.css";

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__brand">Admin Panel</div>
        <nav className="admin-sidebar__nav">
          <NavLink
            to="/"
            className={({ isActive }) =>
              "admin-sidebar__link" + (isActive ? " active" : "")
            }
            end
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/tenants"
            className={({ isActive }) =>
              "admin-sidebar__link" + (isActive ? " active" : "")
            }
          >
            Tenants
          </NavLink>
          <NavLink
            to="/messages"
            className={({ isActive }) =>
              "admin-sidebar__link" + (isActive ? " active" : "")
            }
          >
            Account Requests
          </NavLink>
        </nav>
        <div className="admin-sidebar__footer">
          <span className="admin-sidebar__user">{user?.email}</span>
          <button
            type="button"
            onClick={handleLogout}
            className="admin-sidebar__logout"
          >
            Logout
          </button>
        </div>
      </aside>
      <main className="admin-main">{children}</main>
    </div>
  );
}
