import React, { useEffect, useState} from "react";
import { getProjects, addProject, deleteProject, getClients, addClient, getBusinessUnits, addBusinessUnit, updateProject} from "../Services/Api";
import { designSystem, globalStyles } from "../styles/designSystem";
import Button from "./Button";

const formatDate = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d)) return value;
  return d.toLocaleDateString("en-CA"); // YYYY-MM-DD locale-independent
};

export default function ProjectList() {
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [businessUnits, setBusinessUnits] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProject, setSelectedProject] = useState(null);
  const [editingProject, setEditingProject] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [sortColumn, setSortColumn] = useState("ProjectName");
  const [sortDirection, setSortDirection] = useState("asc");
  const [newProject, setNewProject] = useState({
    projectName: "",
    clientId: "",
    businessUnitId: "",
    startDate: "",
    endDate: null
  });
  const [newClient, setNewClient] = useState({ clientName: "", description: "" });
  const [newBUName, setNewBUName] = useState("");
  const [showAddBU, setShowAddBU] = useState(false);

  const projectsPerPage = 10;

  useEffect(() => {
    loadProjects();
    loadClients();
    loadBusinessUnits();
  }, []);

  const loadProjects = async () => {
    const res = await getProjects();
    setProjects(res.data);
  };

  const loadClients = async () => {
    const res = await getClients();
    setClients(res.data);
  };

  const loadBusinessUnits = async () => {
    const res = await getBusinessUnits();
    setBusinessUnits(res.data);
  };

  const handleAddProject = async () => {
    await addProject(newProject);
    setNewProject({ projectName: "", clientId: "", businessUnitId: "", startDate: "", endDate: "" });
    setShowForm(false);
    loadProjects();
  };

  const handleUpdateProject = async () => {
    if (!editingProject?.projectId) {
      console.error("Cannot update project: projectId is missing.");
      return;
    }

    const updateData = {
      projectId: editingProject.projectId,
      projectName: editingProject.projectName.trim(),
      clientId: Number(editingProject.clientId),
      businessUnitId: Number(editingProject.businessUnitId),
      startDate: editingProject.startDate || null,
      endDate: editingProject.endDate || null
    };

    try {
      await updateProject(editingProject.projectId, updateData);

      setEditingProject(null);
      setShowForm(false);

      await loadProjects();
    } catch (error) {
      console.error(
        "Error updating project:",
        error.response?.data || error.message
      );
    }
  };

  const handleAddClient = async () => {
    await addClient(newClient);
    setNewClient({ clientName: "", description: "" });
    await loadClients();
    setNewProject(prev => ({ ...prev, clientId: "" }));
  };

  const handleAddBusinessUnit = async () => {
    if (!newBUName.trim()) return;
    try {
      await addBusinessUnit({ name: newBUName });
      setNewBUName("");
      setShowAddBU(false);
      await loadBusinessUnits();
    } catch (error) {
      console.error("Error adding business unit:", error);
    }
  };

  const handleDelete = async (id) => {
    await deleteProject(id);
    loadProjects();
  };

  const getClientName = (clientId) => {
    const client = clients.find((c) => c.clientId === clientId);
    return client ? client.clientName : "Unknown Client";
  };

  // Filter clients based on selected Business Unit
  // const filteredClients = useMemo(() => {
  //   if (!newProject.businessUnitId) return clients;
  //   return clients.filter(c => c.businessUnitId === Number(newProject.businessUnitId));
  // }, [clients, newProject.businessUnitId]);

  const filteredProjects = projects.filter(
  (proj) =>
    proj.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getClientName(proj.clientId).toLowerCase().includes(searchTerm.toLowerCase())
);

const sortedProjects = [...filteredProjects].sort((a, b) => {
  let valA = sortColumn === "ProjectName" ? a.projectName : getClientName(a.clientId);
  let valB = sortColumn === "ProjectName" ? b.projectName : getClientName(b.clientId);

  return sortDirection === "asc"
    ? valA.localeCompare(valB)
    : valB.localeCompare(valA);
});

const indexOfLastProject = currentPage * projectsPerPage;
const indexOfFirstProject = indexOfLastProject - projectsPerPage;
const currentProjects = sortedProjects.slice(indexOfFirstProject, indexOfLastProject);
const totalPages = Math.ceil(sortedProjects.length / projectsPerPage);


  const inputStyle = { ...globalStyles.input, marginBottom: designSystem.spacing.sm };
  const selectStyle = { ...inputStyle };
  const labelStyle = { display: "block", marginBottom: designSystem.spacing.xs, color: designSystem.colors.text, ...designSystem.typography.bodyMedium };

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

      {(showForm || editingProject) && (
        <div style={{ ...globalStyles.card, marginBottom: designSystem.spacing.md, maxWidth: "600px" }}>
          <div style={{ display: "flex", gap: designSystem.spacing.sm, flexWrap: "wrap", alignItems: "flex-end" }}>
            <input
              placeholder="Project Name"
              value={editingProject
                ? editingProject.projectName
                : newProject.projectName}
              onChange={(e) => {
                const value = e.target.value;

                if (editingProject) {
                  setEditingProject({
                    ...editingProject,
                    projectName: value
                  });
                } else {
                  setNewProject({
                    ...newProject,
                    projectName: value
                  });
                }
              }}
              style={inputStyle}
            />
            
            {/* Business Unit */}
            <div>
              <label style={labelStyle}>Business Unit</label>
              <select
                value={
                  editingProject
                    ? editingProject.businessUnitId
                    : newProject.businessUnitId
                }
                onChange={(e) => {
                  const value = e.target.value;

                  if (editingProject) {
                    setEditingProject({
                      ...editingProject,
                      businessUnitId: value
                    });
                  } else {
                    setNewProject({
                      ...newProject,
                      businessUnitId: value
                    });
                  }

                  if (value === "add") {
                    setShowAddBU(true);
                    if (!editingProject) {
                      setNewProject({
                        ...newProject,
                        businessUnitId: ""
                      });
                    }
                  }
                }}
                style={selectStyle}
              >
                <option value="">Select Business Unit</option>

                {businessUnits.map((bu) => (
                  <option
                    key={bu.businessUnitId}
                    value={bu.businessUnitId}
                  >
                    {bu.name}
                  </option>
                ))}

                <option value="add">➕ Add New Business Unit</option>
              </select>
              {showAddBU && (
                <div style={{ marginTop: designSystem.spacing.sm, border: `1px solid ${designSystem.colors.primary}`, borderRadius: designSystem.radius, padding: designSystem.spacing.sm }}>
                  <div style={{ display: "flex", gap: designSystem.spacing.sm, flexWrap: "wrap", alignItems: "flex-end" }}>
                    <div style={{ flex: 1, minWidth: "200px" }}>
                      <label style={{ display: "block", marginBottom: designSystem.spacing.xs, ...designSystem.typography.bodyMedium }}>Business Unit Name</label>
                      <input
                        type="text"
                        placeholder="Enter Business Unit Name"
                        value={newBUName}
                        onChange={(e) => setNewBUName(e.target.value)}
                        style={inputStyle}
                      />
                    </div>
                    <Button variant="primary" onClick={handleAddBusinessUnit}>Save BU</Button>
                    <Button variant="secondary" onClick={() => { setShowAddBU(false); setNewBUName(""); }}>Cancel</Button>
                  </div>
                </div>
              )}
            </div>

            {/* Client */}
            <div>
              <label style={labelStyle}>Client</label>
              <select
                value={
                  editingProject
                    ? editingProject.clientId
                    : newProject.clientId
                }
                onChange={(e) => {
                  const value = e.target.value;

                  if (value === "add") {
                    setNewClient({ clientName: "", description: "" });
                  }

                  if (editingProject) {
                    setEditingProject({
                      ...editingProject,
                      clientId: value
                    });
                  } else {
                    setNewProject({
                      ...newProject,
                      clientId: value
                    });
                  }
                }}
                style={selectStyle}
              >
                <option value="">Select Client</option>

                {clients.map((c) => (
                  <option key={c.clientId} value={c.clientId}>
                    {c.clientName}
                  </option>
                ))}

                <option value="add">➕ Add New Client</option>
              </select>
              {newProject.clientId === "add" && (
                <div style={{ marginTop: designSystem.spacing.sm, border: `1px solid ${designSystem.colors.primary}`, borderRadius: designSystem.radius, padding: designSystem.spacing.sm }}>
                  <div style={{ display: "flex", gap: designSystem.spacing.sm, flexWrap: "wrap", alignItems: "flex-end" }}>
                    <input placeholder="Client Name" value={newClient.clientName} onChange={(e) => setNewClient({ ...newClient, clientName: e.target.value })} style={inputStyle} />
                    <input placeholder="Description" value={newClient.description} onChange={(e) => setNewClient({ ...newClient, description: e.target.value })} style={inputStyle} />
                    <Button variant="primary" onClick={handleAddClient} style={{ marginRight: designSystem.spacing.sm }}>Save Client</Button>
                    <Button variant="secondary" onClick={() => setNewProject({ ...newProject, clientId: "" })}>Cancel</Button>
                  </div>
                </div>
              )}
            </div>

            <input type="date" value={newProject.startDate} onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })} style={inputStyle} />
            <input type="date" value={newProject.endDate} onChange={(e) => setNewProject({ ...newProject, endDate: e.target.value })} style={inputStyle} />
            <Button variant="primary" onClick={editingProject ? handleUpdateProject : handleAddProject}>{editingProject ? "Update Project" : "Save Project"}</Button>
            <Button variant="secondary" onClick={() => {setShowForm(false); setEditingProject(null);}}>Cancel</Button>
          </div>
        </div>
      )}

      <div style={{ marginBottom: designSystem.spacing.md }}>
        <div style={{ display: "flex", gap: designSystem.spacing.sm, marginBottom: designSystem.spacing.md }}>
          <select
            value={sortColumn}
            onChange={(e) => {
              setSortColumn(e.target.value);
              setCurrentPage(1);
            }}
            style={{ ...inputStyle, width: "350px", maxWidth: "400px"  }}
          >
            <option value="ProjectName">Sort by Project Name</option>
            <option value="Client">Sort by Client</option>
          </select>

          <input
            type="text"
            placeholder="Search by project or client..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            style={{ ...inputStyle, width: "350px", maxWidth: "400px" }}
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
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={() => {
                        setEditingProject({
                          ...proj,
                          projectId: proj.projectId,
                          projectName: proj.projectName || "",
                          clientId: String(proj.clientId ?? ""),
                          businessUnitId: String(proj.businessUnitId ?? ""),
                          startDate: proj.startDate ? formatDate(proj.startDate) : "",
                          endDate: proj.endDate ? formatDate(proj.endDate) : ""
                        });
                        setShowForm(false);
                      }} style={{ marginRight: designSystem.spacing.xs }}
                    >
                      Edit
                    </Button>
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
          <p><strong>Start Date:</strong> {formatDate(selectedProject.startDate)}</p>
          <p><strong>End Date:</strong> {formatDate(selectedProject.endDate) || "N/A"}</p>
          <Button variant="secondary" onClick={() => setSelectedProject(null)}>Close</Button>
        </div>
      )}
    </div>
  );
}