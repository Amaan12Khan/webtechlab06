import { useState } from "react";
import axios from "axios";

const API = "http://localhost:3000/api";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user") || "null"));
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "USER" });
  const [message, setMessage] = useState("");

  const headers = { Authorization: `Bearer ${token}` };

  const login = async () => {
    try {
      const { data } = await axios.post(`${API}/auth/login`, {
        email: form.email,
        password: form.password,
      });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      setMessage("Logged in as " + data.user.role);
    } catch (e) {
      setMessage(e.response?.data?.error || "Login failed");
    }
  };

  const register = async () => {
    try {
      await axios.post(`${API}/auth/register`, {
        name: form.name,
        email: form.email,
        password: form.password,
      });
      setMessage("Registered successfully! Now login.");
    } catch (e) {
      setMessage(e.response?.data?.error || "Register failed");
    }
  };

  const logout = () => {
    localStorage.clear();
    setToken(null);
    setUser(null);
    setUsers([]);
    setMessage("");
  };

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get(`${API}/users`, { headers });
      setUsers(data);
      setMessage("");
    } catch (e) {
      setMessage(e.response?.data?.error || "Forbidden");
    }
  };

  const deleteUser = async (id) => {
    try {
      await axios.delete(`${API}/users/${id}`, { headers });
      setUsers(users.filter((u) => u.id !== id));
      setMessage("User deleted!");
    } catch (e) {
      setMessage(e.response?.data?.error || "Forbidden");
    }
  };

  const changeRole = async (id, role) => {
    try {
      await axios.patch(`${API}/users/${id}/role`, { role }, { headers });
      setMessage("Role updated!");
      fetchUsers();
    } catch (e) {
      setMessage(e.response?.data?.error || "Forbidden");
    }
  };

  // LOGIN PAGE
  if (!token) return (
    <div style={{ maxWidth: 400, margin: "80px auto", fontFamily: "sans-serif", padding: 24, border: "1px solid #ddd", borderRadius: 8 }}>
      <h2 style={{ textAlign: "center" }}>🔐 Login / Register</h2>
      {message && <p style={{ color: "red", textAlign: "center" }}>{message}</p>}
      <input
        placeholder="Full Name (for register)"
        value={form.name}
        onChange={e => setForm({ ...form, name: e.target.value })}
        style={{ display: "block", width: "100%", marginBottom: 10, padding: 8, boxSizing: "border-box" }}
      />
      <input
        placeholder="Email"
        value={form.email}
        onChange={e => setForm({ ...form, email: e.target.value })}
        style={{ display: "block", width: "100%", marginBottom: 10, padding: 8, boxSizing: "border-box" }}
      />
      <input
        placeholder="Password"
        type="password"
        value={form.password}
        onChange={e => setForm({ ...form, password: e.target.value })}
        style={{ display: "block", width: "100%", marginBottom: 16, padding: 8, boxSizing: "border-box" }}
      />
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={login} style={{ flex: 1, padding: "10px", background: "#4CAF50", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }}>
          Login
        </button>
        <button onClick={register} style={{ flex: 1, padding: "10px", background: "#2196F3", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }}>
          Register
        </button>
      </div>
    </div>
  );

  // DASHBOARD
  return (
    <div style={{ maxWidth: 800, margin: "40px auto", fontFamily: "sans-serif", padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2>Dashboard — <span style={{ color: user?.role === "SUPER_ADMIN" ? "red" : user?.role === "ADMIN" ? "orange" : "green" }}>{user?.role}</span></h2>
        <button onClick={logout} style={{ padding: "8px 16px", background: "#f44336", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }}>
          Logout
        </button>
      </div>

      {message && <p style={{ color: message.includes("deleted") || message.includes("updated") || message.includes("Logged") ? "green" : "red" }}>{message}</p>}

      <p>👤 <strong>{user?.name}</strong> — {user?.email}</p>

      {/* USER ROLE - profile only */}
      {user?.role === "USER" && (
        <div style={{ padding: 16, background: "#f0f0f0", borderRadius: 8 }}>
          <p>You have <strong>User</strong> access — profile view only.</p>
          <p>No user management available for this role.</p>
        </div>
      )}

      {/* ADMIN AND SUPER_ADMIN */}
      {(user?.role === "ADMIN" || user?.role === "SUPER_ADMIN") && (
        <div>
          <button onClick={fetchUsers} style={{ padding: "10px 20px", background: "#2196F3", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", marginBottom: 16 }}>
            Load Users
          </button>

          {users.length > 0 && (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f5f5f5" }}>
                  <th style={{ padding: 10, border: "1px solid #ddd", textAlign: "left" }}>ID</th>
                  <th style={{ padding: 10, border: "1px solid #ddd", textAlign: "left" }}>Name</th>
                  <th style={{ padding: 10, border: "1px solid #ddd", textAlign: "left" }}>Email</th>
                  <th style={{ padding: 10, border: "1px solid #ddd", textAlign: "left" }}>Role</th>
                  <th style={{ padding: 10, border: "1px solid #ddd", textAlign: "left" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td style={{ padding: 10, border: "1px solid #ddd" }}>{u.id}</td>
                    <td style={{ padding: 10, border: "1px solid #ddd" }}>{u.name}</td>
                    <td style={{ padding: 10, border: "1px solid #ddd" }}>{u.email}</td>
                    <td style={{ padding: 10, border: "1px solid #ddd" }}>{u.role}</td>
                    <td style={{ padding: 10, border: "1px solid #ddd" }}>
                      <button onClick={() => deleteUser(u.id)} style={{ marginRight: 4, padding: "4px 8px", background: "#f44336", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }}>
                        Delete
                      </button>
                      {user.role === "SUPER_ADMIN" && (
                        <>
                          <button onClick={() => changeRole(u.id, "ADMIN")} style={{ marginRight: 4, padding: "4px 8px", background: "#FF9800", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }}>
                            →ADMIN
                          </button>
                          <button onClick={() => changeRole(u.id, "USER")} style={{ padding: "4px 8px", background: "#4CAF50", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }}>
                            →USER
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}