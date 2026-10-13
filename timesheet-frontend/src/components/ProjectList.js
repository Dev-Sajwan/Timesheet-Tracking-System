
import React, { useEffect, useState } from "react";
import {
  getProjects,
  addProject,
  deleteProject,
  getClients,
  addClient,
  getBusinessUnits,
  addBusinessUnit,
  updateProject
} from "../Services/Api";
import { designSystem, globalStyles } from "../styles/designSystem";
import Button from "./Button";

// Format dates for HTML date inputs without timezone shifting.
const formatDate = (value) => {
  if (!value) return "";

  if (typeof value === "string") {
    const match = value.match(/^(\d{4}-\d{2}-\d{2})/);
    if (match) return match[1];
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const emptyProject = () => ({
  projectName: "",
  clientId: "",
  businessUnitId: "",
  startDate: "",
  endDate: ""
});

const modalOverlayStyle = {
  position: "fixed",
  inset: 0,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "20px",
  boxSizing: "border-box",
  zIndex: 1000
};

const modalContentStyle = {
  backgroundColor: "#fff",
  padding: "24px",
  borderRadius: "10px",
  width: "100%",
  maxWidth: "600px",
  maxHeight: "90vh",
  overflowY: "auto",
  boxShadow: "0 8px 30px rgba(0,0,0,0.2)",
  boxSizing: "border-box"
};

export default function ProjectList() {
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [businessUnits, setBusinessUnits] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProject, setSelectedProject] = useState(null);
  const [editingProject, setEditingProject] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState("ProjectName");
  const [sortDirection, setSortDirection] = useState("asc");

  const [newProject, setNewProject] = useState(emptyProject);
  const [newClient, setNewClient] = useState({
    clientName: "",
    description: ""
  });
  const [newBUName, setNewBUName] = useState("");

  const [showAddClient, setShowAddClient] = useState(false);
  const [showAddBU, setShowAddBU] = useState(false);

  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const projectsPerPage = 10;

  const inputStyle = {
    ...globalStyles.input,
    width: "100%",
    boxSizing: "border-box",
    marginBottom: designSystem.spacing.sm
  };

  const selectStyle = { ...inputStyle };

  const labelStyle = {
    display: "block",
    marginBottom: designSystem.spacing.xs,
    color: designSystem.colors.text,
    ...designSystem.typography.bodyMedium
  };

  const fieldContainerStyle = {
    marginBottom: designSystem.spacing.sm
  };

  const errorStyle = {
    color: "#c62828",
    fontSize: "13px",
    margin: "0 0 8px 0"
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      await Promise.all([
        loadProjects(),
        loadClients(),
        loadBusinessUnits()
      ]);
    } catch (error) {
      console.error("Error loading project data:", error);
    }
  };

  const loadProjects = async () => {
    const res = await getProjects();
    setProjects(Array.isArray(res.data) ? res.data : []);
  };

  const loadClients = async () => {
    const res = await getClients();
    setClients(Array.isArray(res.data) ? res.data : []);
  };

  const loadBusinessUnits = async () => {
    const res = await getBusinessUnits();
    setBusinessUnits(Array.isArray(res.data) ? res.data : []);
  };

  const getClientName = (clientId) => {
    const client = clients.find(
      (c) => Number(c.clientId) === Number(clientId)
    );

    return client ? client.clientName : "Unknown Client";
  };

  const getBusinessUnitName = (businessUnitId) => {
    const businessUnit = businessUnits.find(
      (bu) => Number(bu.businessUnitId) === Number(businessUnitId)
    );

    return businessUnit ? businessUnit.name : "N/A";
  };

  // Normalize API validation errors, including ASP.NET Core ModelState errors.
  const getApiErrors = (error, fallbackMessage) => {
    const data = error.response?.data;
    const result = {};

    if (data?.errors && typeof data.errors === "object") {
      Object.entries(data.errors).forEach(([key, messages]) => {
        const field = key.charAt(0).toLowerCase() + key.slice(1);
        result[field] = Array.isArray(messages)
          ? messages.join(" ")
          : String(messages);
      });
    }

    if (data?.errors && Object.keys(data.errors).length > 0) {
      result.api = "Please correct the validation errors below.";
    } else {
      result.api =
        data?.detail ||
        data?.message ||
        data?.title ||
        (typeof data === "string" ? data : "") ||
        fallbackMessage;
    }

    return result;
  };

  const validateProject = (project) => {
    const errors = {};

    if (!project.projectName?.trim()) {
      errors.projectName = "Project name is required.";
    } else if (project.projectName.trim().length > 150) {
      errors.projectName = "Project name cannot exceed 150 characters.";
    }

    if (!project.businessUnitId) {
      errors.businessUnitId = "Please select a business unit.";
    }

    if (!project.clientId) {
      errors.clientId = "Please select a client.";
    }

    if (!project.startDate) {
      errors.startDate = "Start date is required.";
    }

    if (
      project.startDate &&
      project.endDate &&
      project.endDate < project.startDate
    ) {
      errors.endDate = "End date cannot be before the start date.";
    }

    return errors;
  };

  const openAddPopup = () => {
    setNewProject(emptyProject());
    setEditingProject(null);
    setSelectedProject(null);
    setFormErrors({});
    setShowAddClient(false);
    setShowAddBU(false);
    setNewClient({ clientName: "", description: "" });
    setNewBUName("");
    setShowForm(true);
  };

  const openEditPopup = (project) => {
    setEditingProject({
      ...project,
      projectId: project.projectId,
      projectName: project.projectName || "",
      clientId: String(project.clientId ?? ""),
      businessUnitId: String(project.businessUnitId ?? ""),
      startDate: formatDate(project.startDate),
      endDate: formatDate(project.endDate)
    });

    setSelectedProject(null);
    setShowForm(false);
    setFormErrors({});
    setShowAddClient(false);
    setShowAddBU(false);
  };

  const closeFormPopup = () => {
    setShowForm(false);
    setEditingProject(null);
    setFormErrors({});
    setShowAddClient(false);
    setShowAddBU(false);
  };

  const updateFormField = (field, value) => {
    if (editingProject) {
      setEditingProject((previous) => ({
        ...previous,
        [field]: value
      }));
    } else {
      setNewProject((previous) => ({
        ...previous,
        [field]: value
      }));
    }

    setFormErrors((previous) => {
      const updated = { ...previous };
      delete updated[field];
      delete updated.api;
      return updated;
    });
  };

  const handleAddProject = async () => {
    const errors = validateProject(newProject);
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) return;

    setLoading(true);

    try {
      const payload = {
        projectName: newProject.projectName.trim(),
        clientId: Number(newProject.clientId),
        businessUnitId: Number(newProject.businessUnitId),
        startDate: newProject.startDate,
        endDate: newProject.endDate || null
      };

      await addProject(payload);
      await loadProjects();

      setCurrentPage(1);
      closeFormPopup();
      setNewProject(emptyProject());
    } catch (error) {
      console.error(
        "Error adding project:",
        error.response?.data || error.message
      );

      setFormErrors(
        getApiErrors(error, "Unable to create the project.")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProject = async () => {
    if (!editingProject?.projectId) {
      setFormErrors({
        api: "Cannot update project because its ID is missing."
      });
      return;
    }

    const errors = validateProject(editingProject);
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) return;

    setLoading(true);

    try {
      const payload = {
        projectId: editingProject.projectId,
        projectName: editingProject.projectName.trim(),
        clientId: Number(editingProject.clientId),
        businessUnitId: Number(editingProject.businessUnitId),
        startDate: editingProject.startDate || null,
        endDate: editingProject.endDate || null
      };

      await updateProject(editingProject.projectId, payload);
      await loadProjects();

      closeFormPopup();
    } catch (error) {
      console.error(
        "Error updating project:",
        error.response?.data || error.message
      );

      setFormErrors(
        getApiErrors(error, "Unable to update the project.")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const project = projects.find((p) => p.projectId === id);

    const confirmed = window.confirm(
      `Are you sure you want to delete project "${project?.projectName || ""}"?`
    );

    if (!confirmed) return;

    try {
      await deleteProject(id);

      const updatedProjects = projects.filter(
        (p) => p.projectId !== id
      );

      setProjects(updatedProjects);

      const remainingFiltered = updatedProjects.filter((proj) => {
        const name = (proj.projectName || "").toLowerCase();
        const client = getClientName(proj.clientId).toLowerCase();
        const term = searchTerm.toLowerCase();

        return name.includes(term) || client.includes(term);
      });

      const remainingSorted = [...remainingFiltered].sort((a, b) => {
        const valueA =
          sortColumn === "ProjectName"
            ? a.projectName || ""
            : getClientName(a.clientId);

        const valueB =
          sortColumn === "ProjectName"
            ? b.projectName || ""
            : getClientName(b.clientId);

        const comparison = valueA.localeCompare(valueB);

        return sortDirection === "asc" ? comparison : -comparison;
      });

      const lastPage = Math.max(
        1,
        Math.ceil(remainingSorted.length / projectsPerPage)
      );

      setCurrentPage((page) => Math.min(page, lastPage));
    } catch (error) {
      console.error(
        "Error deleting project:",
        error.response?.data || error.message
      );

      const data = error.response?.data;

      window.alert(
        data?.detail ||
          data?.message ||
          data?.title ||
          "Unable to delete this project. It may be referenced by other records."
      );
    }
  };

  const handleAddClient = async () => {
    if (!newClient.clientName.trim()) {
      setFormErrors((previous) => ({
        ...previous,
        clientName: "Client name is required."
      }));
      return;
    }

    setLoading(true);

    try {
      const response = await addClient({
        clientName: newClient.clientName.trim(),
        description: newClient.description.trim()
      });

      await loadClients();

      const createdClientId = response.data?.clientId;

      if (createdClientId != null) {
        updateFormField("clientId", String(createdClientId));
      }

      setNewClient({ clientName: "", description: "" });
      setShowAddClient(false);

      setFormErrors((previous) => {
        const updated = { ...previous };
        delete updated.clientName;
        return updated;
      });
    } catch (error) {
      console.error(
        "Error adding client:",
        error.response?.data || error.message
      );

      setFormErrors((previous) => ({
        ...previous,
        clientName:
          error.response?.data?.message ||
          error.response?.data?.title ||
          "Unable to create client."
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleAddBusinessUnit = async () => {
    if (!newBUName.trim()) {
      setFormErrors((previous) => ({
        ...previous,
        businessUnitName: "Business unit name is required."
      }));
      return;
    }

    setLoading(true);

    try {
      const response = await addBusinessUnit({
        name: newBUName.trim()
      });

      await loadBusinessUnits();

      const createdId = response.data?.businessUnitId;

      if (createdId != null) {
        updateFormField("businessUnitId", String(createdId));
      }

      setNewBUName("");
      setShowAddBU(false);

      setFormErrors((previous) => {
        const updated = { ...previous };
        delete updated.businessUnitName;
        return updated;
      });
    } catch (error) {
      console.error(
        "Error adding business unit:",
        error.response?.data || error.message
      );

      setFormErrors((previous) => ({
        ...previous,
        businessUnitName:
          error.response?.data?.message ||
          error.response?.data?.title ||
          "Unable to create business unit."
      }));
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter((project) => {
    const projectName = (project.projectName || "").toLowerCase();
    const clientName = getClientName(project.clientId).toLowerCase();
    const search = searchTerm.toLowerCase();

    return projectName.includes(search) || clientName.includes(search);
  });

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    const valueA =
      sortColumn === "ProjectName"
        ? a.projectName || ""
        : getClientName(a.clientId);

    const valueB =
      sortColumn === "ProjectName"
        ? b.projectName || ""
        : getClientName(b.clientId);

    const comparison = valueA.localeCompare(valueB);

    return sortDirection === "asc" ? comparison : -comparison;
  });

  const totalPages = Math.max(
    1,
    Math.ceil(sortedProjects.length / projectsPerPage)
  );

  const safePage = Math.min(currentPage, totalPages);
  const indexOfFirstProject = (safePage - 1) * projectsPerPage;

  const currentProjects = sortedProjects.slice(
    indexOfFirstProject,
    indexOfFirstProject + projectsPerPage
  );

  const isFormOpen = showForm || Boolean(editingProject);
  const formProject = editingProject || newProject;

  const renderFieldError = (field) =>
    formErrors[field] ? (
      <p style={errorStyle}>{formErrors[field]}</p>
    ) : null;

  return (
    <div
      style={{
        padding: designSystem.spacing.lg,
        maxWidth: "1100px",
        margin: "0 auto",
        fontFamily: "Roboto, Arial, sans-serif"
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: designSystem.spacing.sm,
          marginBottom: designSystem.spacing.md
        }}
      >
        <h2
          style={{
            margin: 0,
            ...designSystem.typography.h1,
            color: designSystem.colors.text
          }}
        >
          Projects
        </h2>

        <Button variant="primary" onClick={openAddPopup}>
          + Add Project
        </Button>
      </div>

      {/* Search and sorting */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: designSystem.spacing.sm,
          marginBottom: designSystem.spacing.md
        }}
      >
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
          aria-label="Search projects"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          style={{
            ...inputStyle,
            width: "300px",
            marginBottom: 0
          }}
        />
      </div>

      {/* Project table */}
      <div style={{ overflowX: "auto" }}>
        <table style={globalStyles.table}>
          <thead>
            <tr style={globalStyles.tableHeader}>
              <th style={globalStyles.tableheadercell}>Project Name</th>
              <th style={globalStyles.tableheadercell}>Client</th>
              <th style={globalStyles.tableheadercell}>Action</th>
            </tr>
          </thead>

          <tbody>
            {currentProjects.map((project) => (
              <tr
                key={project.projectId}
                style={globalStyles.tableRowEven}
              >
                <td style={globalStyles.tableCell}>
                  {project.projectName}
                </td>

                <td style={globalStyles.tableCell}>
                  {getClientName(project.clientId)}
                </td>

                <td
                  style={{
                    ...globalStyles.tableCell,
                    whiteSpace: "nowrap"
                  }}
                >
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={() => {
                      setSelectedProject(project);
                      setShowForm(false);
                      setEditingProject(null);
                    }}
                    style={{ marginRight: designSystem.spacing.xs }}
                  >
                    View
                  </Button>

                  <Button
                    variant="secondary"
                    size="small"
                    onClick={() => openEditPopup(project)}
                    style={{ marginRight: designSystem.spacing.xs }}
                  >
                    Edit
                  </Button>

                  <Button
                    variant="secondary"
                    size="small"
                    onClick={() => handleDelete(project.projectId)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}

            {currentProjects.length === 0 && (
              <tr>
                <td
                  colSpan={3}
                  style={{
                    ...globalStyles.tableCell,
                    textAlign: "center"
                  }}
                >
                  No projects found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div
        style={{
          marginTop: designSystem.spacing.md,
          display: "flex",
          flexWrap: "wrap",
          gap: designSystem.spacing.sm,
          alignItems: "center"
        }}
      >
        <Button
          variant="secondary"
          size="small"
          disabled={safePage <= 1}
          onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
        >
          Prev
        </Button>

        <span style={designSystem.typography.body}>
          Page {safePage} of {totalPages}
        </span>

        <Button
          variant="secondary"
          size="small"
          disabled={safePage >= totalPages}
          onClick={() =>
            setCurrentPage((page) => Math.min(totalPages, page + 1))
          }
        >
          Next
        </Button>
      </div>

      {/* Shared Add/Edit popup */}
      {isFormOpen && (
        <div
          style={modalOverlayStyle}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeFormPopup();
            }
          }}
        >
          <div
            style={modalContentStyle}
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-form-title"
          >
            <h2
              id="project-form-title"
              style={{
                ...designSystem.typography.h2,
                marginTop: 0,
                marginBottom: designSystem.spacing.md
              }}
            >
              {editingProject ? "Edit Project" : "Add Project"}
            </h2>

            {formErrors.api && (
              <div
                role="alert"
                style={{
                  color: "#b71c1c",
                  backgroundColor: "#ffebee",
                  padding: "10px",
                  borderRadius: "6px",
                  marginBottom: designSystem.spacing.md
                }}
              >
                {formErrors.api}
              </div>
            )}

            {/* Project Name */}
            <div style={fieldContainerStyle}>
              <label style={labelStyle}>Project Name *</label>
              <input
                type="text"
                maxLength={150}
                placeholder="Enter project name"
                value={formProject.projectName}
                onChange={(e) =>
                  updateFormField("projectName", e.target.value)
                }
                style={inputStyle}
              />
              {renderFieldError("projectName")}
            </div>

            {/* Business Unit */}
            <div style={fieldContainerStyle}>
              <label style={labelStyle}>Business Unit *</label>
              <select
                value={formProject.businessUnitId}
                onChange={(e) => {
                  const value = e.target.value;

                  if (value === "add") {
                    setShowAddBU(true);
                    return;
                  }

                  setShowAddBU(false);
                  updateFormField("businessUnitId", value);
                }}
                style={selectStyle}
              >
                <option value="">Select Business Unit</option>

                {businessUnits.map((bu) => (
                  <option
                    key={bu.businessUnitId}
                    value={String(bu.businessUnitId)}
                  >
                    {bu.name}
                  </option>
                ))}

                <option value="add">+ Add New Business Unit</option>
              </select>

              {renderFieldError("businessUnitId")}
              {renderFieldError("BusinessUnitId")}

              {showAddBU && (
                <div
                  style={{
                    border: `1px solid ${designSystem.colors.primary}`,
                    borderRadius: designSystem.radius,
                    padding: designSystem.spacing.sm,
                    marginBottom: designSystem.spacing.sm
                  }}
                >
                  <label style={labelStyle}>New Business Unit Name *</label>

                  <input
                    type="text"
                    placeholder="Enter business unit name"
                    value={newBUName}
                    onChange={(e) => {
                      setNewBUName(e.target.value);
                      setFormErrors((previous) => {
                        const updated = { ...previous };
                        delete updated.businessUnitName;
                        return updated;
                      });
                    }}
                    style={inputStyle}
                  />

                  {renderFieldError("businessUnitName")}

                  <div
                    style={{
                      display: "flex",
                      gap: designSystem.spacing.sm
                    }}
                  >
                    <Button
                      variant="primary"
                      onClick={handleAddBusinessUnit}
                      disabled={loading}
                    >
                      Save Business Unit
                    </Button>

                    <Button
                      variant="secondary"
                      onClick={() => {
                        setShowAddBU(false);
                        setNewBUName("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Client */}
            <div style={fieldContainerStyle}>
              <label style={labelStyle}>Client *</label>
              <select
                value={formProject.clientId}
                onChange={(e) => {
                  const value = e.target.value;

                  if (value === "add") {
                    setShowAddClient(true);
                    return;
                  }

                  setShowAddClient(false);
                  updateFormField("clientId", value);
                }}
                style={selectStyle}
              >
                <option value="">Select Client</option>

                {clients.map((client) => (
                  <option
                    key={client.clientId}
                    value={String(client.clientId)}
                  >
                    {client.clientName}
                  </option>
                ))}

                <option value="add">+ Add New Client</option>
              </select>

              {renderFieldError("clientId")}
              {renderFieldError("ClientId")}

              {showAddClient && (
                <div
                  style={{
                    border: `1px solid ${designSystem.colors.primary}`,
                    borderRadius: designSystem.radius,
                    padding: designSystem.spacing.sm,
                    marginBottom: designSystem.spacing.sm
                  }}
                >
                  <label style={labelStyle}>Client Name *</label>

                  <input
                    type="text"
                    placeholder="Enter client name"
                    value={newClient.clientName}
                    onChange={(e) => {
                      setNewClient((previous) => ({
                        ...previous,
                        clientName: e.target.value
                      }));
                      setFormErrors((previous) => {
                        const updated = { ...previous };
                        delete updated.clientName;
                        return updated;
                      });
                    }}
                    style={inputStyle}
                  />

                  {renderFieldError("clientName")}

                  <label style={labelStyle}>Description</label>

                  <input
                    type="text"
                    placeholder="Enter description (optional)"
                    value={newClient.description}
                    onChange={(e) =>
                      setNewClient((previous) => ({
                        ...previous,
                        description: e.target.value
                      }))
                    }
                    style={inputStyle}
                  />

                  <div
                    style={{
                      display: "flex",
                      gap: designSystem.spacing.sm
                    }}
                  >
                    <Button
                      variant="primary"
                      onClick={handleAddClient}
                      disabled={loading}
                    >
                      Save Client
                    </Button>

                    <Button
                      variant="secondary"
                      onClick={() => {
                        setShowAddClient(false);
                        setNewClient({
                          clientName: "",
                          description: ""
                        });
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Start Date */}
            <div style={fieldContainerStyle}>
              <label style={labelStyle}>Start Date *</label>
              <input
                type="date"
                value={formProject.startDate || ""}
                onChange={(e) =>
                  updateFormField("startDate", e.target.value)
                }
                style={inputStyle}
              />
              {renderFieldError("startDate")}
              {renderFieldError("StartDate")}
            </div>

            {/* End Date */}
            <div style={fieldContainerStyle}>
              <label style={labelStyle}>End Date</label>
              <input
                type="date"
                value={formProject.endDate || ""}
                onChange={(e) =>
                  updateFormField("endDate", e.target.value)
                }
                style={inputStyle}
              />
              {renderFieldError("endDate")}
              {renderFieldError("EndDate")}
            </div>

            {/* Popup buttons */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                flexWrap: "wrap",
                gap: designSystem.spacing.sm,
                marginTop: designSystem.spacing.md
              }}
            >
              <Button
                variant="secondary"
                onClick={closeFormPopup}
                disabled={loading}
              >
                Cancel
              </Button>

              <Button
                variant="primary"
                onClick={
                  editingProject
                    ? handleUpdateProject
                    : handleAddProject
                }
                disabled={loading}
              >
                {loading
                  ? "Saving..."
                  : editingProject
                    ? "Update Project"
                    : "Save Project"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* View popup */}
      {selectedProject && (
        <div
          style={modalOverlayStyle}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedProject(null);
            }
          }}
        >
          <div
            style={modalContentStyle}
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-details-title"
          >
            <h2
              id="project-details-title"
              style={{
                ...designSystem.typography.h2,
                marginTop: 0,
                marginBottom: designSystem.spacing.md
              }}
            >
              Project Details
            </h2>

            <p>
              <strong>Project ID:</strong> {selectedProject.projectId}
            </p>

            <p>
              <strong>Project Name:</strong>{" "}
              {selectedProject.projectName || "N/A"}
            </p>

            <p>
              <strong>Client:</strong>{" "}
              {getClientName(selectedProject.clientId)}
            </p>

            <p>
              <strong>Business Unit:</strong>{" "}
              {getBusinessUnitName(selectedProject.businessUnitId)}
            </p>

            <p>
              <strong>Start Date:</strong>{" "}
              {formatDate(selectedProject.startDate) || "N/A"}
            </p>

            <p>
              <strong>End Date:</strong>{" "}
              {formatDate(selectedProject.endDate) || "N/A"}
            </p>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: designSystem.spacing.sm,
                marginTop: designSystem.spacing.md
              }}
            >
              <Button
                variant="secondary"
                onClick={() => setSelectedProject(null)}
              >
                Close
              </Button>

              <Button
                variant="primary"
                onClick={() => openEditPopup(selectedProject)}
              >
                Edit Project
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
