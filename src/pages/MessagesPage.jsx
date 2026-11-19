import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/axios";
import "./MessagesPage.css";

export default function MessagesPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // 'all' | 'new' | 'read'
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const load = () => {
    setLoading(true);
    api
      .get("/contact-messages")
      .then((res) => {
        setMessages(res.data?.data ?? []);
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Failed to load messages.");
        setMessages([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    let active = true;
    api
      .get("/contact-messages")
      .then((res) => {
        if (active) setMessages(res.data?.data ?? []);
      })
      .catch((err) => {
        if (active) {
          setError(err.response?.data?.message || "Failed to load messages.");
          setMessages([]);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleToggleRead = async (msg) => {
    const nextStatus = msg.status === "new" ? "read" : "new";
    try {
      await api.patch(`/contact-messages/${msg.id}`, { status: nextStatus });
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, status: nextStatus } : m)),
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this message?")) return;
    try {
      await api.delete(`/contact-messages/${id}`);
      setMessages((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete message.");
    }
  };

  const handleCreateStore = (msg) => {
    const storeMatch = msg.message?.match(/نام فروشگاه:\s*([^\n\r]+)/);
    const params = new URLSearchParams({
      owner: msg.name,
      phone: msg.contact,
      ...(storeMatch && storeMatch[1] ? { store: storeMatch[1].trim() } : {}),
    });
    navigate(`/tenants?${params.toString()}`);
  };

  const filtered = messages.filter((m) => {
    if (filter === "new") return m.status === "new";
    if (filter === "read") return m.status === "read";
    return true;
  });

  const newCount = messages.filter((m) => m.status === "new").length;

  return (
    <div className="admin-messages-page">
      <header className="admin-messages-header">
        <div>
          <h1>Account Creation Requests & Leads</h1>
          <p className="admin-messages-sub">
            Review incoming requests from the website contact form, contact
            prospective store owners, and provision stores directly.
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          className="admin-btn admin-btn--secondary"
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </header>

      {error && <div className="admin-error-box">{error}</div>}

      <div className="admin-messages-filters">
        <button
          type="button"
          className={`filter-tab ${filter === "all" ? "filter-tab--active" : ""}`}
          onClick={() => setFilter("all")}
        >
          All ({messages.length})
        </button>
        <button
          type="button"
          className={`filter-tab ${filter === "new" ? "filter-tab--active" : ""}`}
          onClick={() => setFilter("new")}
        >
          New ({newCount})
        </button>
        <button
          type="button"
          className={`filter-tab ${filter === "read" ? "filter-tab--active" : ""}`}
          onClick={() => setFilter("read")}
        >
          Read ({messages.length - newCount})
        </button>
      </div>

      {loading ? (
        <div className="admin-loading">Loading messages...</div>
      ) : filtered.length === 0 ? (
        <div className="admin-empty-card">
          <p>No messages found in this view.</p>
        </div>
      ) : (
        <div className="admin-messages-list">
          {filtered.map((msg) => (
            <article
              key={msg.id}
              className={`message-card ${msg.status === "new" ? "message-card--new" : ""}`}
            >
              <div className="message-card__top">
                <div className="message-card__meta">
                  <span
                    className={`status-badge status-badge--${msg.status}`}
                  >
                    {msg.status === "new" ? "NEW" : "READ"}
                  </span>
                  <span className="message-card__date">
                    {msg.created_at
                      ? new Date(msg.created_at).toLocaleString()
                      : "Recently"}
                  </span>
                </div>
                <div className="message-card__actions">
                  <button
                    type="button"
                    className="action-btn action-btn--primary"
                    onClick={() => handleCreateStore(msg)}
                    title="Open Store Creation with this lead's info"
                  >
                    + Create Store
                  </button>
                  <button
                    type="button"
                    className="action-btn action-btn--secondary"
                    onClick={() => handleToggleRead(msg)}
                  >
                    {msg.status === "new" ? "Mark Read" : "Mark New"}
                  </button>
                  <button
                    type="button"
                    className="action-btn action-btn--danger"
                    onClick={() => handleDelete(msg.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="message-card__body">
                <div className="message-card__sender">
                  <strong className="message-card__name">{msg.name}</strong>
                  <span className="message-card__contact">
                    Contact:{" "}
                    <a
                      href={
                        msg.contact.includes("@")
                          ? `mailto:${msg.contact}`
                          : `tel:${msg.contact}`
                      }
                      className="message-card__link"
                    >
                      {msg.contact}
                    </a>
                  </span>
                </div>
                <div className="message-card__content">
                  <p>{msg.message}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
