import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../api/axios";
import "./TenantsPage.css";

export default function TenantsPage() {
  const [searchParams] = useSearchParams();
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
  const [pwdModal, setPwdModal] = useState(null);

  const generateRandomPassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
    let pwd = "";
    for (let i = 0; i < 10; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pwd;
  };

  const openPasswordModal = (tenant) => {
    setPwdModal({
      tenant,
      password: "",
      saving: false,
      error: "",
      success: "",
    });
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!pwdModal?.password || pwdModal.password.length < 6) {
      setPwdModal((p) => ({
        ...p,
        error: "Password must be at least 6 characters.",
      }));
      return;
    }
    setPwdModal((p) => ({ ...p, saving: true, error: "", success: "" }));
    try {
      const res = await api.post(`/tenants/${pwdModal.tenant.id}/reset-password`, {
        password: pwdModal.password,
      });
      setPwdModal((p) => ({
        ...p,
        saving: false,
        success:
          res.data?.message ||
          `Password for ${res.data?.user?.username || "store owner"} successfully updated!`,
      }));
    } catch (err) {
      setPwdModal((p) => ({
        ...p,
        saving: false,
        error: err.response?.data?.message || "Failed to reset password.",
      }));
    }
  };

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

  useEffect(() => {
    const prefillOwner = searchParams.get("owner");
    const prefillPhone = searchParams.get("phone");
    const prefillStore = searchParams.get("store");
    if (prefillOwner || prefillPhone || prefillStore) {
      const sanitizedUsername = (prefillOwner || "owner")
        .toLowerCase()
        .replace(/[^a-z0-9_.-]/g, "")
        .slice(0, 30) || "storeowner";
      setForm({
        store_name: prefillStore || (prefillOwner ? `${prefillOwner} Fabrics` : ""),
        owner_name: prefillOwner || "",
        phone: prefillPhone || "",
        username: sanitizedUsername,
        password: "changeme123",
        subscription_status: "active",
        subscription_expires_at: getDefaultExpiryDate(),
      });
      setModal("add");
    }
  }, [searchParams]);

  const getDefaultExpiryDate = () => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().split("T")[0];
  };

  const openAdd = () => {
    setForm({
      store_name: "",
      owner_name: "",
      phone: "",
      username: "",
      password: "changeme123",
      subscription_status: "active",
      subscription_expires_at: getDefaultExpiryDate(),
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

    let sanitizedUsername = (form.username || "").trim().toLowerCase();
    if (!sanitizedUsername) {
      const asciiSlug = (form.store_name || "")
        .toLowerCase()
        .replace(/[^a-z0-9_.-]/g, "");
      sanitizedUsername =
        asciiSlug.length >= 2 ? asciiSlug : `store_${Date.now().toString(36)}`;
    }

    try {
      await api.post("/tenants", {
        store_name: form.store_name,
        owner_name: form.owner_name,
        phone: form.phone,
        username: sanitizedUsername,
        password: form.password,
        subscription_status: form.subscription_status || "active",
        subscription_expires_at: form.subscription_expires_at || null,
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
                  <td>
                    <div>{t.owner_name}</div>
                    {t.owner_username && (
                      <div style={{ fontSize: "0.8rem", color: "#666" }}>
                        username: <code>{t.owner_username}</code>
                      </div>
                    )}
                  </td>
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
                      className="tenants-table__btn tenants-table__btn--pwd"
                      onClick={() => openPasswordModal(t)}
                      title="Reset Store Password"
                    >
                      Password
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
              <input
                type="date"
                title="Subscription expires at"
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

      {pwdModal && (
        <div className="tenants-modal" onClick={() => setPwdModal(null)}>
          <div
            className="tenants-modal__box"
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Change Store Password</h2>
            <p
              style={{
                margin: "0 0 1rem",
                color: "#666",
                fontSize: "0.9rem",
              }}
            >
              Store: <strong>{pwdModal.tenant.name}</strong> (
              <code>{pwdModal.tenant.slug}</code>)
              {pwdModal.tenant.owner_name
                ? ` · Owner: ${pwdModal.tenant.owner_name}`
                : ""}
              {pwdModal.tenant.owner_username
                ? ` · Username: ${pwdModal.tenant.owner_username}`
                : ""}
            </p>
            {pwdModal.success ? (
              <div>
                <div
                  style={{
                    background: "#d4edda",
                    color: "#155724",
                    padding: "0.75rem",
                    borderRadius: "6px",
                    marginBottom: "1rem",
                    fontSize: "0.9rem",
                  }}
                >
                  ✓ {pwdModal.success}
                </div>
                <div className="tenants-modal__actions">
                  <button type="button" onClick={() => setPwdModal(null)}>
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleResetPassword}>
                <label style={{ fontSize: "0.85rem", color: "#555" }}>
                  New Password:
                </label>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <input
                    type="text"
                    required
                    minLength={6}
                    placeholder="Enter new password (min 6 chars)"
                    value={pwdModal.password}
                    onChange={(e) =>
                      setPwdModal((p) => ({
                        ...p,
                        password: e.target.value,
                        error: "",
                      }))
                    }
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setPwdModal((p) => ({
                        ...p,
                        password: generateRandomPassword(),
                        error: "",
                      }))
                    }
                    style={{
                      padding: "0.5rem 0.75rem",
                      fontSize: "0.85rem",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Generate
                  </button>
                </div>
                {pwdModal.error && (
                  <p className="tenants-modal__error">{pwdModal.error}</p>
                )}
                <div className="tenants-modal__actions">
                  <button type="button" onClick={() => setPwdModal(null)}>
                    Cancel
                  </button>
                  <button type="submit" disabled={pwdModal.saving}>
                    {pwdModal.saving ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
