import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api/axios";
import "./TenantDetailPage.css";

const TABS = ["branches", "inventory", "invoices", "customers"];

export default function TenantDetailPage() {
  const { id } = useParams();
  const [tenant, setTenant] = useState(null);
  const [tab, setTab] = useState("branches");
  const [branches, setBranches] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [branchModal, setBranchModal] = useState(null);
  const [branchForm, setBranchForm] = useState({
    name: "",
    location: "",
    phone: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get(`/tenants/${id}`)
      .then((res) => setTenant(res.data?.data))
      .catch(() => setTenant(null))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!tenant) return;
    if (tab === "branches") {
      api
        .get(`/tenants/${id}/branches`)
        .then((res) => setBranches(res.data?.data ?? []))
        .catch(() => setBranches([]));
    } else if (tab === "inventory") {
      api
        .get(`/tenants/${id}/inventory?limit=100`)
        .then((res) => setInventory(res.data?.data ?? []))
        .catch(() => setInventory([]));
    } else if (tab === "invoices") {
      api
        .get(`/tenants/${id}/invoices?limit=50`)
        .then((res) => setInvoices(res.data?.data ?? []))
        .catch(() => setInvoices([]));
    } else if (tab === "customers") {
      api
        .get(`/tenants/${id}/customers?limit=100`)
        .then((res) => setCustomers(res.data?.data ?? []))
        .catch(() => setCustomers([]));
    }
  }, [tenant, id, tab]);

  const openAddBranch = () => {
    setBranchForm({ name: "", location: "", phone: "" });
    setBranchModal("add");
  };
  const openEditBranch = (b) => {
    setBranchForm({
      id: b.id,
      name: b.name,
      location: b.location || "",
      phone: b.phone || "",
    });
    setBranchModal("edit");
  };
  const handleSaveBranch = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (branchModal === "add") {
        await api.post(`/tenants/${id}/branches`, branchForm);
      } else {
        await api.put(`/tenants/${id}/branches/${branchForm.id}`, branchForm);
      }
      setBranchModal(null);
      api
        .get(`/tenants/${id}/branches`)
        .then((res) => setBranches(res.data?.data ?? []));
    } catch (err) {
      alert(err.response?.data?.message || "Failed.");
    } finally {
      setSaving(false);
    }
  };
  const handleDeleteBranch = async (branchId) => {
    if (!window.confirm("Delete this branch?")) return;
    try {
      await api.delete(`/tenants/${id}/branches/${branchId}`);
      setBranches((prev) => prev.filter((b) => b.id !== branchId));
    } catch (err) {
      alert(
        err.response?.data?.message || "Cannot delete main branch or failed."
      );
    }
  };

  if (loading || !tenant) {
    return (
      <div className="tenant-detail">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="tenant-detail">
      <div className="tenant-detail__header">
        <Link to="/tenants" className="tenant-detail__back">
          ← Tenants
        </Link>
        <h1>
          {tenant.name} <small>({tenant.slug})</small>
        </h1>
        <p className="tenant-detail__meta">
          Owner: {tenant.owner_name} · Phone: {tenant.phone} · Status:{" "}
          {tenant.subscription_status}
        </p>
      </div>
      <div className="tenant-detail__tabs">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            className={`tenant-detail__tab ${
              tab === t ? "tenant-detail__tab--active" : ""
            }`}
            onClick={() => setTab(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>
      <div className="tenant-detail__content">
        {tab === "branches" && (
          <div>
            <button
              type="button"
              className="tenant-detail__add"
              onClick={openAddBranch}
            >
              + Add Branch
            </button>
            <table className="tenant-detail__table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Location</th>
                  <th>Phone</th>
                  <th>Main</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {branches.map((b) => (
                  <tr key={b.id}>
                    <td>{b.id}</td>
                    <td>{b.name}</td>
                    <td>{b.location || "—"}</td>
                    <td>{b.phone || "—"}</td>
                    <td>{b.is_main ? "Yes" : "No"}</td>
                    <td>
                      <button
                        type="button"
                        className="tenant-detail__btn"
                        onClick={() => openEditBranch(b)}
                      >
                        Edit
                      </button>
                      {!b.is_main && (
                        <button
                          type="button"
                          className="tenant-detail__btn tenant-detail__btn--danger"
                          onClick={() => handleDeleteBranch(b.id)}
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {tab === "inventory" && (
          <div className="tenant-detail__table-wrap">
            <table className="tenant-detail__table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Item</th>
                  <th>Fabric</th>
                  <th>Pattern</th>
                  <th>Meters</th>
                  <th>Quantity</th>
                  <th>Branch</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((i) => (
                  <tr key={i.id}>
                    <td>{i.id}</td>
                    <td>{i.item_name || i.item_name_ar || "—"}</td>
                    <td>{i.fabric_type || "—"}</td>
                    <td>{i.pattern || "—"}</td>
                    <td>{i.length_m ?? "—"}</td>
                    <td>{i.quantity}</td>
                    <td>{i.branch_id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {inventory.length === 0 && <p>No inventory items.</p>}
          </div>
        )}
        {tab === "invoices" && (
          <div className="tenant-detail__table-wrap">
            <table className="tenant-detail__table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Invoice #</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td>{inv.id}</td>
                    <td>{inv.invoice_number}</td>
                    <td>{inv.customer?.full_name || inv.customer_id}</td>
                    <td>{inv.total_amount} KWD</td>
                    <td>
                      {inv.createdAt
                        ? new Date(inv.createdAt).toLocaleDateString()
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {invoices.length === 0 && <p>No invoices.</p>}
          </div>
        )}
        {tab === "customers" && (
          <div className="tenant-detail__table-wrap">
            <table className="tenant-detail__table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id}>
                    <td>{c.id}</td>
                    <td>{c.full_name}</td>
                    <td>{c.phone}</td>
                    <td>{c.type || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {customers.length === 0 && <p>No customers.</p>}
          </div>
        )}
      </div>

      {branchModal && (
        <div className="tenants-modal" onClick={() => setBranchModal(null)}>
          <div
            className="tenants-modal__box"
            onClick={(e) => e.stopPropagation()}
          >
            <h2>{branchModal === "add" ? "Add Branch" : "Edit Branch"}</h2>
            <form onSubmit={handleSaveBranch}>
              <input
                required
                placeholder="Name"
                value={branchForm.name}
                onChange={(e) =>
                  setBranchForm((f) => ({ ...f, name: e.target.value }))
                }
              />
              <input
                placeholder="Location"
                value={branchForm.location}
                onChange={(e) =>
                  setBranchForm((f) => ({ ...f, location: e.target.value }))
                }
              />
              <input
                placeholder="Phone"
                value={branchForm.phone}
                onChange={(e) =>
                  setBranchForm((f) => ({ ...f, phone: e.target.value }))
                }
              />
              <div className="tenants-modal__actions">
                <button type="button" onClick={() => setBranchModal(null)}>
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
