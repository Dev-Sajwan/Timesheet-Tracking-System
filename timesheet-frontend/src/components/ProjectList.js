import React, { useEffect, useState } from "react";
import { getProjects, addProject, deleteProject, getClients, addClient } from "../Services/Api";
import { designSystem, globalStyles } from "../styles/designSystem";
import Button from "./Button";

export default function ProjectList() {
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProject, setSelectedProject] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [newProject, setNewProject] = useState({
    projectName: "",
    clientId: "",
    startDate: "",
    endDate: null
  });
  const [newClient, setNewClient] = useState({ clientName: "", description: "" });

  const projectsPerPage = 10;

  useEffect(() => {
    loadProjects();
    loadClients();
  }, []);

  const loadProjects = async () => {
    const res = await getProjects();
    setProjects(res.data);
  };

  const loadClients = async () => {
    const res = await getClients();
    setClients(res.data);
  };

  const handleAddProject = async () => {
    await addProject(newProject);
    setNewProject({ projectName: "", clientId: "", startDate: "", endDate: "" });
    setShowForm(false);
    loadProjects();
  };

  const handleAddClient = async () => {
    await addClient(newClient);
    setNewClient({ clientName: "", description: "" });
    await loadClients();
    setNewProject(prev => ({ ...prev, clientId: "" }));
  };

  const handleDelete = async (id) => {
    await deleteProject(id);
    loadProjects();
  };

  const getClientName = (clientId) => {
    const client = clients.find((c) => c.clientId === clientId);
    return client ? client.clientName : "Unknown Client";
  };

  const filteredProjects = projects.filter(
    (proj) =>
      proj.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getClientName(proj.clientId).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = filteredProjects.slice(indexOfFirstProject, indexOfLastProject);
  const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);

  const inputStyle = { ...globalStyles.input, marginBottom: designSystem.spacing.sm };
  const selectStyle = { ...inputStyle };

  return (
    <div style={{ padding: designSystem.spacing.lg, maxWidth: "1100px", margin: "0 auto", fontFamily: "Roboto, Arial, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: designSystem.spacing.md }}>
        <h2 style={{ margin: 0, ...designSystem.typography.h1, color: designSystem.colors.text }}>Projects</h2>
        <Button variant="primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ Add Project"}
        </Button>
      </div>

      {newProject.clientId === "add" && (
        <div style={{ ...globalStyles.card, marginBottom: designSystem.spacing.md, maxWidth: "500px" }}>
          <div style={{ display: "flex", gap: designSystem.spacing.sm, flexWrap: "wrap", alignItems: "flex-end" }}>
            <input placeholder="Client Name" value={newClient.clientName} onChange={(e) => setNewClient({ ...newClient, clientName: e.target.value })} style={inputStyle} />
            <input placeholder="Description" value={newClient.description} onChange={(e) => setNewClient({ ...newClient, description: e.target.value })} style={inputStyle} />
            <Button variant="primary" onClick={handleAddClient} style={{ marginRight: designSystem.spacing.sm }}>Save Client</Button>
            <Button variant="secondary" onClick={() => setNewProject({ ...newProject, clientId: "" })}>Cancel</Button>
          </div>
        </div>
      )}

      {showForm && (
        <div style={{ ...globalStyles.card, marginBottom: designSystem.spacing.md, maxWidth: "600px" }}>
          <div style={{ display: "flex", gap: designSystem.spacing.sm, flexWrap: "wrap", alignItems: "flex-end" }}>
            <input placeholder="Project Name" value={newProject.projectName} onChange={(e) => setNewProject({ ...newProject, projectName: e.target.value })} style={inputStyle} />
            <select value={newProject.clientId} onChange={(e) => setNewProject({ ...newProject, clientId: e.target.value })} style={selectStyle}>
              <option value="">Select Client</option>
              {clients.map((c) => (
                <option key={c.clientId} value={c.clientId}>{c.clientName}</option>
              ))}
              <option value="add">➕ Add New Client</option>
            </select>
            <input type="date" value={newProject.startDate} onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })} style={inputStyle} />
            <input type="date" value={newProject.endDate} onChange={(e) => setNewProject({ ...newProject, endDate: e.target.value })} style={inputStyle} />
            <Button variant="primary" onClick={handleAddProject}>Save Project</Button>
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </div>
      )}

      <div style={{ marginBottom: designSystem.spacing.md }}>
        <div style={{ display: "flex", gap: designSystem.spacing.sm, marginBottom: designSystem.spacing.md }}>
          <select
            value={searchTerm === "" ? "" : ""}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            style={{ ...selectStyle, marginRight: designSystem.spacing.sm }}
          >
            <option value="">Filter by project or client...</option>
          </select>
          <input
            type="text"
            placeholder="Search by project or client..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            style={{ ...inputStyle, width: "auto", maxWidth: "350px" }}
          />
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ ...globalStyles.table }}>
            <thead>
              <tr style={{ ...globalStyles.tableHeader }}>
                <th style={globalStyles.tableheadercell}>Project Name</th>
                <th style={globalStyles.tableheadercell}>Client</th>
                <th style={globalStyles.tableheadercell}>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentProjects.map((proj) => (
                <tr key={proj.projectId} style={{ ...globalStyles.tableRowEven }}>
                  <td style={{ ...globalStyles.tableCell }}>{proj.projectName}</td>
                  <td style={{ ...globalStyles.tableCell }}>{getClientName(proj.clientId)}</td>
                  <td style={{ ...globalStyles.tableCell }}>
                    <Button variant="secondary" size="small" onClick={() => setSelectedProject(proj)} style={{ marginRight: designSystem.spacing.xs }}>View</Button>
                    <Button variant="secondary" size="small" onClick={() => handleDelete(proj.projectId)}>Delete</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ marginTop: designSystem.spacing.md, display: "flex", gap: designSystem.spacing.sm, alignItems: "center" }}>
        <Button variant="secondary" size="small" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>Prev</Button>
        <span style={{ ...designSystem.typography.body }}>Page {currentPage} of {totalPages}</span>
        <Button variant="secondary" size="small" disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>Next</Button>
      </div>

      {selectedProject && (
        <div style={{ ...globalStyles.card, marginTop: designSystem.spacing.md, maxWidth: "500px" }}>
          <h3 style={{ ...designSystem.typography.h2, margin: `0 0 ${designSystem.spacing.sm} 0`, color: designSystem.colors.text }}>Project Details</h3>
          <div style={{ display: "flex", gap: designSystem.spacing.sm, marginBottom: designSystem.spacing.sm }}>
            <p><strong>Name:</strong> {selectedProject.projectName}</p>
            <p><strong>Client:</strong> {getClientName(selectedProject.clientId)}</p>
          </div>
          <p><strong>Start Date:</strong> {selectedProject.startDate}</p>
          <p><strong>End Date:</strong> {selectedProject.endDate || "N/A"}</p>
          <Button variant="secondary" onClick={() => setSelectedProject(null)}>Close</Button>
        </div>
      )}
    </div>
  );
}