import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const { user, logout, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      await updateProfile(name);
      setEditing(false);
      setSuccess("Name updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Update failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        {/* Header */}
        <div style={styles.header}>
          <div style={styles.avatar}>{getInitials(user?.name)}</div>
          <h2 style={styles.title}>My Profile</h2>
          <p style={styles.subtitle}>Manage your account details</p>
        </div>

        {/* Info or Edit Form */}
        {!editing ? (
          <div style={styles.infoBox}>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Name</span>
              <span style={styles.infoValue}>{user?.name}</span>
            </div>
            <div style={styles.divider} />
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Email</span>
              <span style={styles.infoValue}>{user?.email}</span>
            </div>

            {success && <p style={styles.success}>{success}</p>}

            <button
              onClick={() => setEditing(true)}
              style={styles.primaryBtn}
            >
              ✏️ Edit Name
            </button>
          </div>
        ) : (
          <form onSubmit={handleUpdate} style={styles.form}>
            <div style={styles.field}>
              <label style={styles.label}>New Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {error && <p style={styles.error}>{error}</p>}

            <div style={styles.btnRow}>
              <button type="submit" disabled={submitting} style={styles.primaryBtn}>
                {submitting ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={() => { setEditing(false); setName(user?.name); }}
                style={styles.secondaryBtn}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div style={styles.divider} />

        <button onClick={handleLogout} style={styles.logoutBtn}>
          🚪 Log Out
        </button>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
  },
  card: {
    background: "#fff",
    borderRadius: "16px",
    padding: "40px",
    width: "100%",
    maxWidth: "460px",
    boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
  },
  header: {
    textAlign: "center",
    marginBottom: "28px",
  },
  avatar: {
    width: "64px",
    height: "64px",
    borderRadius: "50%",
    background: "#4f46e5",
    color: "#fff",
    fontSize: "22px",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 14px",
  },
  title: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#111",
    marginBottom: "4px",
  },
  subtitle: {
    fontSize: "14px",
    color: "#6b7280",
  },
  infoBox: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 0",
  },
  infoLabel: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  infoValue: {
    fontSize: "15px",
    color: "#111",
    fontWeight: "500",
  },
  divider: {
    borderTop: "1px solid #f3f4f6",
    margin: "8px 0",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "4px",
  },
  error: {
    color: "#dc2626",
    fontSize: "13px",
    background: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "8px",
    padding: "10px 14px",
  },
  success: {
    color: "#16a34a",
    fontSize: "13px",
    background: "#f0fdf4",
    border: "1px solid #bbf7d0",
    borderRadius: "8px",
    padding: "10px 14px",
  },
  btnRow: {
    display: "flex",
    gap: "10px",
  },
  primaryBtn: {
    flex: 1,
    background: "#4f46e5",
    color: "#fff",
    padding: "12px",
    fontSize: "14px",
    borderRadius: "8px",
  },
  secondaryBtn: {
    flex: 1,
    background: "#f3f4f6",
    color: "#374151",
    padding: "12px",
    fontSize: "14px",
    borderRadius: "8px",
  },
  logoutBtn: {
    width: "100%",
    background: "#fef2f2",
    color: "#dc2626",
    padding: "12px",
    fontSize: "14px",
    borderRadius: "8px",
    marginTop: "8px",
  },
};

export default Dashboard;