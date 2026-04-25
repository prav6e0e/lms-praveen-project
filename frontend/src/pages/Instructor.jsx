import { useEffect, useState } from "react";
import axios from "axios";
import "./instructor.css";

function Instructor() {
  const API = "http://127.0.0.1:8000";

  const [instructors, setInstructors] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // 🔥 FETCH
  const fetchInstructors = async () => {
    try {
      const res = await axios.get(`${API}/instructors`);
      setInstructors(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchInstructors();
  }, []);

  // ➕ CREATE
  const createInstructor = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(`${API}/instructors`, {
        name,
        email,
        permissions: {},
      });

      setInstructors((prev) => [...prev, res.data]);
      setName("");
      setEmail("");
    } catch (err) {
      console.error(err);
    }
  };

  // ❌ DELETE
  const deleteInstructor = async (id) => {
    if (!window.confirm("Delete instructor?")) return;

    try {
      await axios.delete(`${API}/instructors/${id}`);
      setInstructors((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // 🚫 BLOCK
  const blockInstructor = async (id) => {
    try {
      await axios.put(`${API}/instructors/block/${id}`);
      fetchInstructors();
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ UNBLOCK
  const unblockInstructor = async (id) => {
    try {
      await axios.put(`${API}/instructors/unblock/${id}`);
      fetchInstructors();
    } catch (err) {
      console.error(err);
    }
  };

  // 🔐 UPDATE PERMISSIONS (basic)
  const updatePermissions = async (id) => {
    const permissions = {
      canCreateCourses: true,
      canEditCourses: true,
    };

    try {
      await axios.put(`${API}/instructors/${id}/permissions`, {
        permissions,
      });

      fetchInstructors();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: "30px" }}>
      <h2>👨‍🏫 Instructor Management</h2>

      {/* CREATE FORM */}
      <form onSubmit={createInstructor} style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Instructor Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={{ marginRight: "10px" }}
        />

        <input
          type="email"
          placeholder="Instructor Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ marginRight: "10px" }}
        />

        <button type="submit">Add</button>
      </form>

      {/* LIST */}
      {instructors.length === 0 ? (
        <p>No instructors found</p>
      ) : (
        instructors.map((inst) => (
          <div
            key={inst.id}
            style={{
              border: "1px solid #ddd",
              padding: "15px",
              marginBottom: "10px",
              borderRadius: "8px",
            }}
          >
            <h4>{inst.name}</h4>
            <p>{inst.email}</p>
            <p>Status: {inst.is_active ? "Active" : "Blocked"}</p>

            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => blockInstructor(inst.id)}>
                🚫 Block
              </button>

              <button onClick={() => unblockInstructor(inst.id)}>
                ✅ Unblock
              </button>

              <button onClick={() => updatePermissions(inst.id)}>
                🔐 Permissions
              </button>

              <button onClick={() => deleteInstructor(inst.id)}>
                ❌ Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default Instructor;