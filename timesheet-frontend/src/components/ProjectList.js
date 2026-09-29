import React, { useEffect, useState } from "react";
import { getProjects, addProject, deleteProject, getClients, addClient} from "../Services/Api";

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
    endDate: ""
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
    loadClients(); // refresh client list
  };


  const handleDelete = async (id) => {
    await deleteProject(id);
    loadProjects();
  };

  const getClientName = (clientId) => {
    const client = clients.find((c) => c.clientId === clientId);
    return client ? client.clientName : "Unknown Client";
  };

  // Filter projects by search term
  const filteredProjects = projects.filter(
    (proj) =>
      proj.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getClientName(proj.clientId).toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = filteredProjects.slice(indexOfFirstProject, indexOfLastProject);
  const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Projects</h2>

      {/* Add Client Inline Form */}
{newProject.clientId === "add" && (
  <div style={{ marginTop: "10px", border: "1px solid #ccc", padding: "10px" }}>
    <input
      placeholder="Client Name"
      value={newClient.clientName}
      onChange={(e) => setNewClient({ ...newClient, clientName: e.target.value })}
      style={{ marginRight: "5px" }}
    />
    <input
      placeholder="Description"
      value={newClient.description}
      onChange={(e) => setNewClient({ ...newClient, description: e.target.value })}
      style={{ marginRight: "5px" }}
    />
    <button onClick={handleAddClient} style={{ marginRight: "5px" }}>Save Client</button>
    <button onClick={() => setNewProject({ ...newProject, clientId: "" })}>Cancel</button>
  </div>
)}


      {/* Add Project Button */}
      <button onClick={() => setShowForm(!showForm)} padding="10px" style={{marginRight: "10px" }}>
        {showForm ? "Cancel" : "➕ Add Project"}
      </button>

      {/* Add Project Form */}
      {showForm && (
        <div style={{ marginTop: "15px", border: "1px solid #ccc", padding: "10px"}}>
          <input
            placeholder="Project Name"
            value={newProject.projectName}
            onChange={(e) => setNewProject({ ...newProject, projectName: e.target.value })}
            style={{ marginRight: "5px" }}
          />
          <select
            value={newProject.clientId}
            onChange={(e) => setNewProject({ ...newProject, clientId: e.target.value })}
            style={{ marginRight: "5px" }}
          >
            <option value="">Select Client</option>
            {clients.map((c) => (
              <option key={c.clientId} value={c.clientId}>
                {c.clientName}
              </option>
            ))}
            <option value="add">➕ Add New Client</option>
            
          </select>

          <input
            type="date"
            value={newProject.startDate}
            onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })}
            style={{ marginRight: "5px" }}
          />
          <input
            type="date"
            value={newProject.endDate}
            onChange={(e) => setNewProject({ ...newProject, endDate: e.target.value })}
            style={{ marginRight: "5px" }}
          />
          <button onClick={handleAddProject}>Save Project</button>
        </div>
      )}

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search by project or client..."
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setCurrentPage(1);
        }}
        style={{ width: "300px", padding: "8px", margin: "15px 0" }}
      />

      {/* Project Table */}
      <table border="1" width="100%" cellPadding="8">
        <thead>
          <tr>
            <th>Project Name</th>
            <th>Client</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {currentProjects.map((proj) => (
            <tr key={proj.projectId}>
              <td>{proj.projectName}</td>
              <td>{getClientName(proj.clientId)}</td>
              <td>
                <button onClick={() => setSelectedProject(proj)} style={{ marginRight: "5px" }}>View</button>
                <button onClick={() => handleDelete(proj.projectId)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div style={{ marginTop: "10px" }}>
        <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>
          Prev
        </button>
        <span> Page {currentPage} of {totalPages} </span>
        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>
          Next
        </button>
      </div>

      {/* Project Details */}
      {selectedProject && (
        <div style={{ marginTop: "20px", border: "1px solid #ccc", padding: "10px" }}>
          <h3>Project Details</h3>
          <p><strong>Name:</strong> {selectedProject.projectName}</p>
          <p><strong>Client:</strong> {getClientName(selectedProject.clientId)}</p>
          <p><strong>Start Date:</strong> {selectedProject.startDate}</p>
          <p><strong>End Date:</strong> {selectedProject.endDate}</p>
          <button onClick={() => setSelectedProject(null)}>Close</button>
        </div>
      )}
    </div>
  );
}
