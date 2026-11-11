import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/axios";
import "./TenantsPage.css";

export default function TenantsPage() {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({
    store_name: "",
    owner_name: "",
    phone: "",
    username: "",
    password: "",
    subscription_status: "active",
    subscription_expires_at: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    api
      .get("/tenants")
      .then((res) => {
        setTenants(res.data?.data ?? []);
      })
      .catch(() => setTenants([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => load(), []);

  const openAdd = () => {
    setForm({
      store_name: "",
      owner_name: "",
      phone: "",
      username: "",
      password: "changeme123",
      subscription_status: "active",
      subscription_expires_at: "",
    });
    setModal("add");
    setError("");
  };

  const openEdit = (t) => {
    setForm({
      id: t.id,
      name: t.name,
      owner_name: t.owner_name,
      phone: t.phone,
      subscription_status: t.subscription_status,
      subscription_expires_at: t.subscription_expires_at
        ? t.subscription_expires_at.slice(0, 10)
        : "",
    });
    setModal("edit");
    setError("");
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.post("/tenants", {
        store_name: form.store_name,
        owner_name: form.owner_name,
        phone: form.phone,
        username:
          form.username || form.store_name?.toLowerCase().replace(/\s+/g, "-"),
        password: form.password,
      });
      setModal(null);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create tenant.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.put(`/tenants/${form.id}`, {
        name: form.name,
        owner_name: form.owner_name,
        phone: form.phone,
        subscription_status: form.subscription_status,
        subscription_expires_at: form.subscription_expires_at || null,
      });
      setModal(null);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update tenant.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this tenant? This cannot be undone.")) return;
    try {
      await api.delete(`/tenants/${id}`);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete.");
    }
  };

  const toggleStatus = async (t) => {
    const next = t.subscription_status === "active" ? "inactive" : "active";
    try {
      await api.put(`/tenants/${t.id}`, { subscription_status: next });
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update.");
    }
  };

  return (
    <div className="tenants-page">
      <div className="tenants-page__header">
        <h1>Tenants</h1>
        <button type="button" className="tenants-page__add" onClick={openAdd}>
          + Add Tenant
        </button>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="tenants-table-wrap">
          <table className="tenants-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Slug</th>
                <th>Owner</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Expires</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((t) => (
                <tr key={t.id}>
                  <td>{t.id}</td>
                  <td>{t.name}</td>
                  <td>
                    <code>{t.slug}</code>
                  </td>
                  <td>{t.owner_name}</td>
                  <td>{t.phone}</td>
                  <td>
                    <span
                      className={`tenants-table__status tenants-table__status--${t.subscription_status}`}
                    >
                      {t.subscription_status}
                    </span>
                  </td>
                  <td>
                    {t.subscription_expires_at
                      ? new Date(t.subscription_expires_at).toLocaleDateString()
                      : "—"}
                  </td>
                  <td>
                    <Link
                      to={`/tenants/${t.id}`}
                      className="tenants-table__link"
                    >
                      View
                    </Link>{" "}
                    <button
                      type="button"
                      className="tenants-table__btn"
                      onClick={() => openEdit(t)}
                    >
                      Edit
                    </button>{" "}
                    <button
                      type="button"
                      className="tenants-table__btn tenants-table__btn--danger"
                      onClick={() => handleDelete(t.id)}
                    >
                      Delete
                    </button>{" "}
                    <button
                      type="button"
                      className="tenants-table__btn"
                      onClick={() => toggleStatus(t)}
                    >
                      {t.subscription_status === "active"
                        ? "Deactivate"
                        : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal === "add" && (
        <div className="tenants-modal" onClick={() => setModal(null)}>
          <div
            className="tenants-modal__box"
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Add Tenant</h2>
            <form onSubmit={handleAdd}>
              <input
                required
                placeholder="Store name"
                value={form.store_name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, store_name: e.target.value }))
                }
              />
              <input
                placeholder="Owner name"
                value={form.owner_name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, owner_name: e.target.value }))
                }
              />
              <input
                placeholder="Phone"
                value={form.phone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, phone: e.target.value }))
                }
              />
              <input
                placeholder="Username (owner login)"
                value={form.username}
                onChange={(e) =>
                  setForm((f) => ({ ...f, username: e.target.value }))
                }
              />
              <input
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={(e) =>
                  setForm((f) => ({ ...f, password: e.target.value }))
                }
              />
              {error && <p className="tenants-modal__error">{error}</p>}
              <div className="tenants-modal__actions">
                <button type="button" onClick={() => setModal(null)}>
                  Cancel
                </button>
                <button type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modal === "edit" && (
        <div className="tenants-modal" onClick={() => setModal(null)}>
          <div
            className="tenants-modal__box"
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Edit Tenant</h2>
            <form onSubmit={handleEdit}>
              <input
                required
                placeholder="Name"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
              />
              <input
                placeholder="Owner name"
                value={form.owner_name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, owner_name: e.target.value }))
                }
              />
              <input
                placeholder="Phone"
                value={form.phone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, phone: e.target.value }))
                }
              />
              <select
                value={form.subscription_status}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    subscription_status: e.target.value,
                  }))
                }
              >
                <option value="active">active</option>
                <option value="inactive">inactive</option>
                <option value="suspended">suspended</option>
              </select>
              <input
                type="date"
                placeholder="Subscription expires"
                value={form.subscription_expires_at}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    subscription_expires_at: e.target.value,
                  }))
                }
              />
              {error && <p className="tenants-modal__error">{error}</p>}
              <div className="tenants-modal__actions">
                <button type="button" onClick={() => setModal(null)}>
                  Cancel
                </button>
                <button type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
