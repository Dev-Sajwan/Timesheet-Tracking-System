import React, { useState, useEffect } from "react";
import {
  getAllApis,
  getAllPermissions,
  createPermission,
  updatePermission,
  deletePermission,
  getPermissionSets,
  createPermissionSet,
  updatePermissionSet,
  deletePermissionSet,
  getUsers,
  getUserPermissions,
  assignPermissionToUser,
  unassignPermissionFromUser,
  getUserPermissionSets,
  assignPermissionSetToUser,
  unassignPermissionSetFromUser,
  getProfiles,
  createProfile,
  updateProfile,
  deleteProfile,
  getUserProfile
} from "../Services/Api";
import { designSystem, globalStyles } from "../styles/designSystem";
import { jwtDecode } from "jwt-decode";

const PermissionManager = () => {
  // Data
  const [apis, setApis] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [permissionSets, setPermissionSets] = useState([]);
  const [users, setUsers] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [profileName, setProfileName] = useState("");
  const [profileDescription, setProfileDescription] = useState("");

  const [isSystemAdmin, setIsSystemAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    let adminFound = false;
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const sysAdminClaim = decoded["IsSystemAdmin"] === "true" || decoded["isSystemAdmin"] === true;
        const profileClaim = (decoded["ProfileName"] || decoded["profileName"] || "").toLowerCase();
        if (sysAdminClaim || profileClaim.includes("system administrator") || profileClaim.includes("admin")) {
          adminFound = true;
        }
      } catch (e) {
        // ignore
      }
    }
    const currentProfileName = (localStorage.getItem("profileName") || "").toLowerCase();
    if (currentProfileName.includes("system administrator") || currentProfileName.includes("admin")) {
      adminFound = true;
    }

    const empId = localStorage.getItem("employeeId");
    if (empId) {
      getUserProfile(empId).then(res => {
        if (res.data && (res.data.isSystemAdmin === true || (res.data.name || "").toLowerCase().includes("system administrator"))) {
          setIsSystemAdmin(true);
        } else if (adminFound) {
          setIsSystemAdmin(true);
        }
      }).catch(() => {
        setIsSystemAdmin(adminFound);
      });
    } else {
      setIsSystemAdmin(adminFound);
    }
  }, []);




  // Navigation
  const [activeTab, setActiveTab] = useState("permissions"); // 'permissions' | 'sets'
  const [activeView, setActiveView] = useState("list"); // 'list' | 'detail'

  // Detail/Edit state
  const [selectedItem, setSelectedItem] = useState(null); // the permission or set being viewed
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Permission form
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formApiIds, setFormApiIds] = useState([]);
  const [formIsSensitive, setFormIsSensitive] = useState(false);

  // Permission Set form
  const [formPermissionIds, setFormPermissionIds] = useState([]);

  // User assignment state
  const [assignedUsers, setAssignedUsers] = useState([]);
  const [userSearchTerm, setUserSearchTerm] = useState("");

  // Search/filter
  const [searchTerm, setSearchTerm] = useState("");
  const [apiSearchTerm, setApiSearchTerm] = useState("");
  const [permSearchTerm, setPermSearchTerm] = useState("");

  // Status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [apisRes, permsRes, setsRes, usersRes, profilesRes] = await Promise.all([
        getAllApis(),
        getAllPermissions(),
        getPermissionSets(),
        getUsers(),
        getProfiles()
      ]);
      setApis(apisRes.data);
      setPermissions(permsRes.data);
      setPermissionSets(setsRes.data);
      setUsers(usersRes.data);
      setProfiles(profilesRes.data);
    } catch (e) {
      setError("Failed to load data: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => { setError(""); setSuccess(""); };

  const resetForm = () => {
    setFormName("");
    setFormDescription("");
    setFormApiIds([]);
    setFormIsSensitive(false);
    setFormPermissionIds([]);
    setIsEditing(false);
    setIsCreating(false);
  };

  const goBackToList = () => {
    setActiveView("list");
    setSelectedItem(null);
    resetForm();
    setAssignedUsers([]);
    setUserSearchTerm("");
    clearMessages();
  };

  // ============================
  // USER ASSIGNMENT LOGIC
  // ============================
  const loadAssignedUsers = async (itemId, type) => {
    try {
      const assignmentPromises = users.map(async (user) => {
        try {
          if (type === "permission") {
            const res = await getUserPermissions(user.id);
            const isAssigned = res.data.some(p => p.id === itemId);
            return { userId: user.id, assigned: isAssigned };
          } else {
            const res = await getUserPermissionSets(user.id);
            const isAssigned = res.data.some(ps => ps.id === itemId);
            return { userId: user.id, assigned: isAssigned };
          }
        } catch {
          return { userId: user.id, assigned: false };
        }
      });
      const results = await Promise.all(assignmentPromises);
      setAssignedUsers(results);
    } catch (e) {
      setError("Failed to load assignments: " + e.message);
    }
  };

  const handleToggleUserAssignment = async (userId, isCurrentlyAssigned) => {
    clearMessages();
    const type = activeTab === "permissions" ? "permission" : "set";
    const itemId = selectedItem.id;
    try {
      if (type === "permission") {
        if (isCurrentlyAssigned) {
          await unassignPermissionFromUser(userId, itemId);
        } else {
          await assignPermissionToUser(userId, itemId);
        }
      } else {
        if (isCurrentlyAssigned) {
          await unassignPermissionSetFromUser(userId, itemId);
        } else {
          await assignPermissionSetToUser(userId, itemId);
        }
      }
      setSuccess(isCurrentlyAssigned ? "Unassigned successfully" : "Assigned successfully");
      await loadAssignedUsers(itemId, type);
    } catch (e) {
      setError(e.response?.data?.message || e.message || "Assignment failed");
    }
  };

  // ============================
  // PERMISSION CRUD
  // ============================
  const openPermissionDetail = async (perm) => {
    clearMessages();
    setSelectedItem(perm);
    setFormName(perm.name);
    setFormDescription(perm.description || "");
    setFormApiIds((perm.apis || []).map(a => a.id));
    setFormIsSensitive(perm.isSensitive || false);
    setIsEditing(false);
    setIsCreating(false);
    setActiveView("detail");
    setUserSearchTerm("");
    await loadAssignedUsers(perm.id, "permission");
  };

  const openCreatePermission = () => {
    clearMessages();
    resetForm();
    setSelectedItem(null);
    setIsCreating(true);
    setIsEditing(true);
    setActiveView("detail");
    setAssignedUsers([]);
  };

  const handleApiToggle = (apiId) => {
    setFormApiIds(prev =>
      prev.includes(apiId) ? prev.filter(id => id !== apiId) : [...prev, apiId]
    );
  };

  const handleSavePermission = async () => {
    clearMessages();
    if (!formName.trim()) { setError("Name is required"); return; }
    if (formApiIds.length === 0) { setError("At least one API must be selected"); return; }

    setLoading(true);
    try {
      const payload = { name: formName, description: formDescription, apiIds: formApiIds, isSensitive: formIsSensitive };
      if (isCreating) {
        await createPermission(payload);
        setSuccess("Permission created");
        await loadData();
        const updatedPerms = (await getAllPermissions()).data;
        const created = updatedPerms.find(p => p.name === formName) || updatedPerms[updatedPerms.length - 1];
        if (created) {
          setPermissions(updatedPerms);
          openPermissionDetail(created);
        } else {
          goBackToList();
        }
      } else {
        await updatePermission(selectedItem.id, payload);
        setSuccess("Permission updated");
        await loadData();
        const updatedPerms = (await getAllPermissions()).data;
        const updated = updatedPerms.find(p => p.id === selectedItem.id);
        if (updated) {
          setPermissions(updatedPerms);
          setSelectedItem(updated);
          setFormApiIds((updated.apis || []).map(a => a.id));
          setIsEditing(false);
        }
      }
    } catch (e) {
      setError(e.response?.data?.message || e.message || "Save failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePermission = async (id) => {
    if (!window.confirm("Are you sure you want to delete this permission?")) return;
    clearMessages();
    try {
      await deletePermission(id);
      setSuccess("Permission deleted");
      await loadData();
      goBackToList();
    } catch (e) {
      setError(e.response?.data?.message || e.message || "Delete failed");
    }
  };

  // ============================
  // PERMISSION SET CRUD
  // ============================
  const openSetDetail = async (ps) => {
    clearMessages();
    setSelectedItem(ps);
    setFormName(ps.name);
    setFormDescription(ps.description || "");
    setFormPermissionIds((ps.permissions || []).map(p => p.id));
    setIsEditing(false);
    setIsCreating(false);
    setActiveView("detail");
    setUserSearchTerm("");
    await loadAssignedUsers(ps.id, "set");
  };

  const openCreateSet = () => {
    clearMessages();
    resetForm();
    setSelectedItem(null);
    setIsCreating(true);
    setIsEditing(true);
    setActiveView("detail");
    setAssignedUsers([]);
  };

  const handleSaveSet = async () => {
    clearMessages();
    if (!formName.trim()) { setError("Name is required"); return; }
    if (formPermissionIds.length === 0) { setError("At least one permission must be selected"); return; }

    setLoading(true);
    try {
      const payload = { name: formName, description: formDescription, permissionIds: formPermissionIds };
      if (isCreating) {
        await createPermissionSet(payload);
        setSuccess("Permission set created");
        await loadData();
        const updatedSets = (await getPermissionSets()).data;
        const created = updatedSets.find(s => s.name === formName) || updatedSets[updatedSets.length - 1];
        if (created) {
          setPermissionSets(updatedSets);
          openSetDetail(created);
        } else {
          goBackToList();
        }
      } else {
        await updatePermissionSet(selectedItem.id, payload);
        setSuccess("Permission set updated");
        await loadData();
        const updatedSets = (await getPermissionSets()).data;
        const updated = updatedSets.find(s => s.id === selectedItem.id);
        if (updated) {
          setPermissionSets(updatedSets);
          setSelectedItem(updated);
          setFormPermissionIds((updated.permissions || []).map(p => p.id));
          setIsEditing(false);
        }
      }
    } catch (e) {
      setError(e.response?.data?.message || e.message || "Save failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSet = async (id) => {
    const ps = permissionSets.find(s => s.id === id);
    if (ps?.isSystem) { setError("Cannot delete the system Admin permission set."); return; }
    if (!window.confirm("Are you sure you want to delete this permission set?")) return;
    clearMessages();
    try {
      await deletePermissionSet(id);
      setSuccess("Permission set deleted");
      await loadData();
      goBackToList();
    } catch (e) {
      setError(e.response?.data?.message || e.message || "Delete failed");
    }
  };

  const handlePermissionToggle = (permId) => {
    setFormPermissionIds(prev =>
      prev.includes(permId) ? prev.filter(id => id !== permId) : [...prev, permId]
    );
  };

  // ============================
  // FILTERED LISTS
  // ============================
  const filteredPermissions = permissions.filter(p =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Permission Sets tab should only list user-created sets (not system Admin set)
  const userCreatedSets = permissionSets.filter(ps => !ps.isSystem);
  const filteredSets = userCreatedSets.filter(ps =>
    ps.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ps.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = users.filter(u => {
    const term = userSearchTerm.toLowerCase();
    return (u.fullName || "").toLowerCase().includes(term) ||
           (u.userName || "").toLowerCase().includes(term) ||
           (u.email || "").toLowerCase().includes(term);
  });

  const filteredApisForEditor = apis.filter(a =>
    a.name?.toLowerCase().includes(apiSearchTerm.toLowerCase()) ||
    a.route?.toLowerCase().includes(apiSearchTerm.toLowerCase()) ||
    a.controller?.toLowerCase().includes(apiSearchTerm.toLowerCase())
  );

  const filteredPermsForSetEditor = permissions.filter(p =>
    p.name?.toLowerCase().includes(permSearchTerm.toLowerCase()) ||
    p.description?.toLowerCase().includes(permSearchTerm.toLowerCase())
  );

  // ============================
  // RENDER: MESSAGE BAR
  // ============================
  const renderMessages = () => (
    <>
      {error && (
        <div style={{ ...globalStyles.card, background: designSystem.colors.errorLight, color: designSystem.colors.error, marginBottom: designSystem.spacing.md, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>{error}</span>
          <button style={{ ...globalStyles.button.subtle, color: designSystem.colors.error }} onClick={() => setError("")}>X</button>
        </div>
      )}
      {success && (
        <div style={{ ...globalStyles.card, background: designSystem.colors.successLight, color: designSystem.colors.success, marginBottom: designSystem.spacing.md, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>{success}</span>
          <button style={{ ...globalStyles.button.subtle, color: designSystem.colors.success }} onClick={() => setSuccess("")}>X</button>
        </div>
      )}
    </>
  );

  // ============================
  // RENDER: MANAGE ASSIGNMENTS PANEL
  // ============================
  const renderManageAssignments = () => {
    const assignedCount = assignedUsers.filter(a => a.assigned).length;

    return (
      <div style={{ ...globalStyles.card, marginTop: designSystem.spacing.lg }}>
        <div style={{ ...globalStyles.flexBetween, marginBottom: designSystem.spacing.md }}>
          <h4 style={designSystem.typography.h3}>Manage Assignments ({assignedCount} users assigned)</h4>
        </div>

        <input
          style={{ ...globalStyles.input, marginBottom: designSystem.spacing.md }}
          type="search"
          placeholder="Search users by name or email..."
          value={userSearchTerm}
          onChange={e => setUserSearchTerm(e.target.value)}
        />

        <div style={{ maxHeight: "400px", overflowY: "auto" }}>
          <table style={{ ...globalStyles.table, width: "100%" }}>
            <thead>
              <tr>
                <th style={globalStyles.tableHeader}>User</th>
                <th style={globalStyles.tableHeader}>Email</th>
                <th style={{ ...globalStyles.tableHeader, width: "100px", textAlign: "center" }}>Status</th>
                <th style={{ ...globalStyles.tableHeader, width: "120px", textAlign: "center" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => {
                const assignment = assignedUsers.find(a => a.userId === user.id);
                const isAssigned = assignment?.assigned || false;

                return (
                  <tr key={user.id} style={globalStyles.tableRow}>
                    <td style={globalStyles.tableCell}>
                      <strong>{user.fullName || user.userName}</strong>
                    </td>
                    <td style={globalStyles.tableCell}>
                      <span style={{ color: designSystem.colors.textSecondary }}>{user.email}</span>
                    </td>
                    <td style={{ ...globalStyles.tableCell, textAlign: "center" }}>
                      {isAssigned ? (
                        <span style={{ color: designSystem.colors.success, fontWeight: 500 }}>Assigned</span>
                      ) : (
                        <span style={{ color: designSystem.colors.textDisabled }}>Not assigned</span>
                      )}
                    </td>
                    <td style={{ ...globalStyles.tableCell, textAlign: "center" }}>
                      <button
                        style={{
                          ...(isAssigned ? globalStyles.button.danger : globalStyles.button.primary),
                          padding: `${designSystem.spacing.xs} ${designSystem.spacing.md}`,
                          minHeight: "30px",
                          fontSize: "12px",
                        }}
                        onClick={() => handleToggleUserAssignment(user.id, isAssigned)}
                      >
                        {isAssigned ? "Remove" : "Assign"}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ ...globalStyles.tableCell, textAlign: "center", color: designSystem.colors.textSecondary }}>
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // ============================
  // RENDER: PERMISSIONS LIST
  // ============================
  const renderPermissionsList = () => (
    <div>
      <div style={{ ...globalStyles.flexBetween, marginBottom: designSystem.spacing.md }}>
        <input
          style={{ ...globalStyles.input, maxWidth: "350px" }}
          type="search"
          placeholder="Search permissions..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <button style={globalStyles.button.primary} onClick={openCreatePermission}>
          + New Permission
        </button>
      </div>

      {loading && <div style={{ padding: designSystem.spacing.lg, textAlign: "center" }}>Loading...</div>}

      {!loading && filteredPermissions.length === 0 && (
        <div style={{ ...globalStyles.card, textAlign: "center", color: designSystem.colors.textSecondary }}>
          No permissions found. Create a new permission to group APIs.
        </div>
      )}

      {filteredPermissions.length > 0 && (
        <div style={globalStyles.tableWrapper}>
          <table style={globalStyles.table}>
            <thead>
              <tr>
                <th style={globalStyles.tableHeader}>Name</th>
                <th style={globalStyles.tableHeader}>Description</th>
                <th style={globalStyles.tableHeader}>Linked APIs Count</th>
                <th style={globalStyles.tableHeader}>Sensitive</th>
                <th style={{ ...globalStyles.tableHeader, width: "180px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPermissions.map(perm => (
                <tr
                  key={perm.id}
                  style={{ ...globalStyles.tableRow, cursor: "pointer" }}
                  onClick={() => openPermissionDetail(perm)}
                >
                  <td style={globalStyles.tableCell}>
                    <strong>{perm.name}</strong>
                  </td>
                  <td style={globalStyles.tableCell}>{perm.description || "-"}</td>
                  <td style={globalStyles.tableCell}>
                    <span style={{
                      background: designSystem.colors.backgroundAlt,
                      padding: "2px 8px",
                      borderRadius: designSystem.radius.sm,
                      fontSize: "12px",
                      fontWeight: 600,
                    }}>
                      {perm.apis?.length || 0} APIs
                    </span>
                  </td>
                  <td style={globalStyles.tableCell}>
                    {perm.isSensitive ? (
                      <span style={{ color: designSystem.colors.warning, fontWeight: 500 }}>Yes</span>
                    ) : "No"}
                  </td>
                  <td style={globalStyles.tableCell} onClick={e => e.stopPropagation()}>
                    <div style={{ display: "flex", gap: designSystem.spacing.xs }}>
                      <button
                        style={{ ...globalStyles.button.secondary, padding: `${designSystem.spacing.xs} ${designSystem.spacing.sm}`, minHeight: "28px", fontSize: "12px" }}
                        onClick={() => openPermissionDetail(perm)}
                      >
                        View / Assign
                      </button>
                      <button
                        style={{ ...globalStyles.button.danger, padding: `${designSystem.spacing.xs} ${designSystem.spacing.sm}`, minHeight: "28px", fontSize: "12px" }}
                        onClick={() => handleDeletePermission(perm.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  // ============================
  // RENDER: PERMISSION DETAIL (Edit + Manage Assignments)
  // ============================
  const renderPermissionDetail = () => {
    const isNew = isCreating;

    return (
      <div>
        <div style={{ ...globalStyles.flexBetween, marginBottom: designSystem.spacing.md }}>
          <h3 style={designSystem.typography.h3}>
            {isNew ? "New Permission" : selectedItem?.name}
          </h3>
          <button style={globalStyles.button.secondary} onClick={goBackToList}>Back to List</button>
        </div>

        {renderMessages()}

        {/* Permission Form */}
        <div style={{ ...globalStyles.card, marginBottom: designSystem.spacing.lg }}>
          <div style={{ ...globalStyles.flexBetween, marginBottom: designSystem.spacing.md }}>
            <h4 style={designSystem.typography.h3}>Details & APIs</h4>
            {!isNew && !isEditing && (
              <button style={globalStyles.button.secondary} onClick={() => setIsEditing(true)}>Edit</button>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: designSystem.spacing.md, marginBottom: designSystem.spacing.md }}>
            <div>
              <label style={{ ...designSystem.typography.captionStrong, display: "block", marginBottom: designSystem.spacing.xs }}>Permission Name</label>
              {isEditing ? (
                <input style={globalStyles.input} value={formName} onChange={e => setFormName(e.target.value)} placeholder="e.g. Employee Manager" />
              ) : (
                <div style={designSystem.typography.body}>{selectedItem?.name}</div>
              )}
            </div>
            <div>
              <label style={{ ...designSystem.typography.captionStrong, display: "block", marginBottom: designSystem.spacing.xs }}>Description</label>
              {isEditing ? (
                <input style={globalStyles.input} value={formDescription} onChange={e => setFormDescription(e.target.value)} placeholder="Description" />
              ) : (
                <div style={designSystem.typography.body}>{selectedItem?.description || "-"}</div>
              )}
            </div>
          </div>

          <div style={{ marginBottom: designSystem.spacing.md }}>
            <label style={{ ...designSystem.typography.captionStrong, display: "block", marginBottom: designSystem.spacing.xs }}>Sensitive</label>
            {isEditing ? (
              <label style={{ display: "flex", alignItems: "center", gap: designSystem.spacing.sm, cursor: "pointer" }}>
                <input type="checkbox" checked={formIsSensitive} onChange={e => setFormIsSensitive(e.target.checked)} />
                <span>Mark as sensitive</span>
              </label>
            ) : (
              <div style={designSystem.typography.body}>{selectedItem?.isSensitive ? "Yes" : "No"}</div>
            )}
          </div>

          {/* APIs Checkbox List */}
          <div>
            <label style={{ ...designSystem.typography.captionStrong, display: "block", marginBottom: designSystem.spacing.sm }}>
              Select APIs ({isEditing ? formApiIds.length : (selectedItem?.apis?.length || 0)} selected)
            </label>

            {isEditing && (
              <input
                style={{ ...globalStyles.input, marginBottom: designSystem.spacing.sm }}
                type="search"
                placeholder="Search APIs by name, route, or controller..."
                value={apiSearchTerm}
                onChange={e => setApiSearchTerm(e.target.value)}
              />
            )}

            <div style={{ maxHeight: "400px", overflowY: "auto", border: `1px solid ${designSystem.colors.divider}`, borderRadius: designSystem.radius.md, padding: designSystem.spacing.sm }}>
              {isEditing ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: designSystem.spacing.xs }}>
                  {filteredApisForEditor.map(api => {
                    const isSelected = formApiIds.includes(api.id);
                    return (
                      <label
                        key={api.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: designSystem.spacing.sm,
                          padding: `${designSystem.spacing.xs} ${designSystem.spacing.sm}`,
                          borderRadius: designSystem.radius.sm,
                          background: isSelected ? "rgba(0,120,212,0.06)" : "transparent",
                          cursor: "pointer",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleApiToggle(api.id)}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 500, fontSize: "13px" }}>{api.name}</div>
                          <div style={{ fontSize: "11px", color: designSystem.colors.textSecondary }}>
                            <code>{api.httpMethod}</code> {api.route} ({api.controller})
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: designSystem.spacing.xs }}>
                  {(selectedItem?.apis || []).map(api => (
                    <div
                      key={api.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: designSystem.spacing.sm,
                        padding: `${designSystem.spacing.xs} ${designSystem.spacing.sm}`,
                        borderRadius: designSystem.radius.sm,
                        background: "rgba(0,120,212,0.04)",
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 500, fontSize: "13px" }}>{api.name}</div>
                        <div style={{ fontSize: "11px", color: designSystem.colors.textSecondary }}>
                          <code>{api.httpMethod}</code> {api.route} ({api.controller})
                        </div>
                      </div>
                    </div>
                  ))}
                  {(selectedItem?.apis || []).length === 0 && (
                    <div style={{ color: designSystem.colors.textSecondary, padding: designSystem.spacing.md, textAlign: "center" }}>
                      No APIs linked to this permission
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {isEditing && (
            <div style={{ display: "flex", gap: designSystem.spacing.sm, marginTop: designSystem.spacing.lg, justifyContent: "flex-end" }}>
              <button style={globalStyles.button.secondary} onClick={() => {
                if (isCreating) goBackToList();
                else {
                  setIsEditing(false);
                  setFormName(selectedItem.name);
                  setFormDescription(selectedItem.description || "");
                  setFormApiIds((selectedItem.apis || []).map(a => a.id));
                  setFormIsSensitive(selectedItem.isSensitive || false);
                }
              }}>
                Cancel
              </button>
              <button style={globalStyles.button.primary} onClick={handleSavePermission} disabled={loading}>
                {loading ? "Saving..." : (isCreating ? "Create" : "Save")}
              </button>
            </div>
          )}
        </div>

        {/* Manage Assignments - only show for existing permissions */}
        {!isNew && renderManageAssignments()}
      </div>
    );
  };

  // ============================
  // RENDER: PROFILES LIST & DETAIL
  // ============================
  
  const renderProfilesList = () => {
    const isProtectedProfile = (profile) =>
      (profile?.name || "").trim().toLowerCase() ===
      "system administrator";

    return (
      <div style={{ ...globalStyles.card }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: designSystem.spacing.md,
          }}
        >
          <h3 style={{ margin: 0, ...designSystem.typography.h3 }}>
            Profiles Management
          </h3>

          {isSystemAdmin && (
            <button
              style={globalStyles.button.primary}
              onClick={() => {
                setSelectedItem(null);
                setProfileName("");
                setProfileDescription("");
                setIsCreating(true);
                setIsEditing(true);
                setActiveView("detail");
              }}
            >
              + Create Profile
            </button>
          )}
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ ...globalStyles.table, width: "100%" }}>
            <thead>
              <tr style={{ ...globalStyles.tableHeader }}>
                <th style={globalStyles.tableHeader}>
                  Profile Name
                </th>
                <th style={globalStyles.tableHeader}>
                  Description
                </th>
                <th style={globalStyles.tableHeader}>
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {profiles.map((p) => {
                const protectedProfile = isProtectedProfile(p);
                const profileId = p.id || p.profileId;

                return (
                  <tr
                    key={profileId}
                    style={{ ...globalStyles.tableRow }}
                  >
                    <td
                      style={{
                        ...globalStyles.tableCell,
                        fontWeight: 500,
                      }}
                    >
                      {p.name}
                      {protectedProfile && (
                        <span
                          style={{
                            marginLeft: "8px",
                            fontSize: "11px",
                            color: designSystem.colors.textSecondary,
                          }}
                        >
                          (Protected)
                        </span>
                      )}
                    </td>

                    <td style={{ ...globalStyles.tableCell }}>
                      {p.description || "—"}
                    </td>

                    <td style={{ ...globalStyles.tableCell }}>
                      {protectedProfile ? (
                        <span
                          style={{
                            color: designSystem.colors.textSecondary,
                            fontSize: "12px",
                          }}
                        >
                          Read-only — Cannot edit or delete
                        </span>
                      ) : isSystemAdmin ? (
                        <div
                          style={{
                            display: "flex",
                            gap: designSystem.spacing.sm,
                            alignItems: "center",
                          }}
                        >
                          <button
                            type="button"
                            style={globalStyles.button.secondary}
                            onClick={() => {
                              setSelectedItem(p);
                              setProfileName(p.name);
                              setProfileDescription(
                                p.description || ""
                              );
                              setIsCreating(false);
                              setIsEditing(true);
                              setActiveView("detail");
                            }}
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            style={globalStyles.button.danger}
                            onClick={async () => {
                              if (
                                !window.confirm(
                                  `Delete profile "${p.name}"?`
                                )
                              ) {
                                return;
                              }

                              try {
                                await deleteProfile(profileId);
                                setSuccess(
                                  "Profile deleted successfully."
                                );
                                loadData();
                              } catch (e) {
                                setError(
                                  "Failed to delete profile: " +
                                    (e.response?.data?.message ||
                                      e.message)
                                );
                              }
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      ) : (
                        <span
                          style={{
                            color: designSystem.colors.textSecondary,
                            fontSize: "12px",
                          }}
                        >
                          Read-only — System Administrator only
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderProfileDetail = () => {
    const isNew = isCreating;
    return (
      <div style={{ ...globalStyles.card }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: designSystem.spacing.md }}>
          <h3 style={{ margin: 0, ...designSystem.typography.h3 }}>
            {isNew ? "Create Profile" : (isEditing ? "Edit Profile" : "Profile Details")}
          </h3>
          <button style={globalStyles.button.secondary} onClick={goBackToList}>
            Back to List
          </button>
        </div>

        {renderMessages()}

        <div style={{ display: "flex", flexDirection: "column", gap: designSystem.spacing.md, maxWidth: "500px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "4px", fontWeight: 500, fontSize: "13px" }}>Profile Name</label>
            <input
              type="text"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              disabled={!isEditing || !isSystemAdmin}
              style={{ ...globalStyles.input }}
            />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "4px", fontWeight: 500, fontSize: "13px" }}>Description</label>
            <textarea
              value={profileDescription}
              onChange={(e) => setProfileDescription(e.target.value)}
              disabled={!isEditing || !isSystemAdmin}
              rows={3}
              style={{ ...globalStyles.input, height: "auto" }}
            />
          </div>

          {isEditing && isSystemAdmin && (
            <div style={{ display: "flex", gap: designSystem.spacing.sm, marginTop: designSystem.spacing.md }}>
              <button
                style={globalStyles.button.primary}
                onClick={async () => {
                  try {
                    clearMessages();
                    if (isNew) {
                      await createProfile({ name: profileName, description: profileDescription });
                      setSuccess("Profile created successfully.");
                    } else {
                      await updateProfile(selectedItem.id || selectedItem.profileId, { name: profileName, description: profileDescription });
                      setSuccess("Profile updated successfully.");
                    }
                    loadData();
                    goBackToList();
                  } catch (e) {
                    setError("Failed to save profile: " + (e.response?.data?.message || e.message));
                  }
                }}
              >
                Save Profile
              </button>
              <button style={globalStyles.button.secondary} onClick={goBackToList}>
                Cancel
              </button>
            </div>
          )}

          {!isEditing && isSystemAdmin && (
            <div>
              <button
                style={globalStyles.button.primary}
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ============================
  // RENDER: PERMISSION SETS LIST
  // ============================
  const renderSetsList = () => (
    <div>
      <div style={{ ...globalStyles.flexBetween, marginBottom: designSystem.spacing.md }}>
        <input
          style={{ ...globalStyles.input, maxWidth: "350px" }}
          type="search"
          placeholder="Search permission sets..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <button style={globalStyles.button.primary} onClick={openCreateSet}>
          + New Permission Set
        </button>
      </div>

      {loading && <div style={{ padding: designSystem.spacing.lg, textAlign: "center" }}>Loading...</div>}

      {!loading && filteredSets.length === 0 && (
        <div style={{ ...globalStyles.card, textAlign: "center", color: designSystem.colors.textSecondary }}>
          No permission sets found. Create a new permission set to group permissions.
        </div>
      )}

      {filteredSets.length > 0 && (
        <div style={globalStyles.tableWrapper}>
          <table style={globalStyles.table}>
            <thead>
              <tr>
                <th style={globalStyles.tableHeader}>Name</th>
                <th style={globalStyles.tableHeader}>Description</th>
                <th style={globalStyles.tableHeader}>Permissions Count</th>
                <th style={{ ...globalStyles.tableHeader, width: "180px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSets.map(ps => (
                <tr
                  key={ps.id}
                  style={{ ...globalStyles.tableRow, cursor: "pointer" }}
                  onClick={() => openSetDetail(ps)}
                >
                  <td style={globalStyles.tableCell}>
                    <strong>{ps.name}</strong>
                  </td>
                  <td style={globalStyles.tableCell}>{ps.description || "-"}</td>
                  <td style={globalStyles.tableCell}>
                    <span style={{
                      background: designSystem.colors.backgroundAlt,
                      padding: "2px 8px",
                      borderRadius: designSystem.radius.sm,
                      fontSize: "12px",
                      fontWeight: 600,
                    }}>
                      {ps.permissions?.length || 0} Permissions
                    </span>
                  </td>
                  <td style={globalStyles.tableCell} onClick={e => e.stopPropagation()}>
                    <div style={{ display: "flex", gap: designSystem.spacing.xs }}>
                      <button
                        style={{ ...globalStyles.button.secondary, padding: `${designSystem.spacing.xs} ${designSystem.spacing.sm}`, minHeight: "28px", fontSize: "12px" }}
                        onClick={() => openSetDetail(ps)}
                      >
                        View / Assign
                      </button>
                      <button
                        style={{ ...globalStyles.button.danger, padding: `${designSystem.spacing.xs} ${designSystem.spacing.sm}`, minHeight: "28px", fontSize: "12px" }}
                        onClick={() => handleDeleteSet(ps.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  // ============================
  // RENDER: PERMISSION SET DETAIL (Edit + Manage Assignments)
  // ============================
  const renderSetDetail = () => {
    const isNew = isCreating;

    return (
      <div>
        <div style={{ ...globalStyles.flexBetween, marginBottom: designSystem.spacing.md }}>
          <h3 style={designSystem.typography.h3}>
            {isNew ? "New Permission Set" : selectedItem?.name}
          </h3>
          <button style={globalStyles.button.secondary} onClick={goBackToList}>Back to List</button>
        </div>

        {renderMessages()}

        {/* Permission Set Form */}
        <div style={{ ...globalStyles.card, marginBottom: designSystem.spacing.lg }}>
          <div style={{ ...globalStyles.flexBetween, marginBottom: designSystem.spacing.md }}>
            <h4 style={designSystem.typography.h3}>Details & Permissions</h4>
            {!isNew && !isEditing && (
              <button style={globalStyles.button.secondary} onClick={() => setIsEditing(true)}>Edit</button>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: designSystem.spacing.md, marginBottom: designSystem.spacing.md }}>
            <div>
              <label style={{ ...designSystem.typography.captionStrong, display: "block", marginBottom: designSystem.spacing.xs }}>Set Name</label>
              {isEditing ? (
                <input style={globalStyles.input} value={formName} onChange={e => setFormName(e.target.value)} placeholder="e.g. Project Manager Set" />
              ) : (
                <div style={designSystem.typography.body}>{selectedItem?.name}</div>
              )}
            </div>
            <div>
              <label style={{ ...designSystem.typography.captionStrong, display: "block", marginBottom: designSystem.spacing.xs }}>Description</label>
              {isEditing ? (
                <input style={globalStyles.input} value={formDescription} onChange={e => setFormDescription(e.target.value)} placeholder="Description" />
              ) : (
                <div style={designSystem.typography.body}>{selectedItem?.description || "-"}</div>
              )}
            </div>
          </div>

          {/* Permissions Checkbox List */}
          <div>
            <label style={{ ...designSystem.typography.captionStrong, display: "block", marginBottom: designSystem.spacing.sm }}>
              Select Permissions ({isEditing ? formPermissionIds.length : (selectedItem?.permissions?.length || 0)} selected)
            </label>

            {isEditing && (
              <input
                style={{ ...globalStyles.input, marginBottom: designSystem.spacing.sm }}
                type="search"
                placeholder="Search permissions..."
                value={permSearchTerm}
                onChange={e => setPermSearchTerm(e.target.value)}
              />
            )}

            <div style={{ maxHeight: "350px", overflowY: "auto", border: `1px solid ${designSystem.colors.divider}`, borderRadius: designSystem.radius.md, padding: designSystem.spacing.sm }}>
              {isEditing ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: designSystem.spacing.xs }}>
                  {filteredPermsForSetEditor.map(perm => {
                    const isSelected = formPermissionIds.includes(perm.id);
                    return (
                      <label
                        key={perm.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: designSystem.spacing.sm,
                          padding: `${designSystem.spacing.xs} ${designSystem.spacing.sm}`,
                          borderRadius: designSystem.radius.sm,
                          background: isSelected ? "rgba(0,120,212,0.06)" : "transparent",
                          cursor: "pointer",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handlePermissionToggle(perm.id)}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 500, fontSize: "13px" }}>{perm.name}</div>
                          <div style={{ fontSize: "11px", color: designSystem.colors.textSecondary }}>
                            {perm.apis?.length || 0} APIs linked
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: designSystem.spacing.xs }}>
                  {(selectedItem?.permissions || []).map(perm => (
                    <div
                      key={perm.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: designSystem.spacing.sm,
                        padding: `${designSystem.spacing.xs} ${designSystem.spacing.sm}`,
                        borderRadius: designSystem.radius.sm,
                        background: "rgba(0,120,212,0.04)",
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 500, fontSize: "13px" }}>{perm.name}</div>
                        <div style={{ fontSize: "11px", color: designSystem.colors.textSecondary }}>
                          {perm.apis?.length || 0} APIs linked
                        </div>
                      </div>
                    </div>
                  ))}
                  {(selectedItem?.permissions || []).length === 0 && (
                    <div style={{ color: designSystem.colors.textSecondary, padding: designSystem.spacing.md, textAlign: "center" }}>
                      No permissions assigned to this set
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {isEditing && (
            <div style={{ display: "flex", gap: designSystem.spacing.sm, marginTop: designSystem.spacing.lg, justifyContent: "flex-end" }}>
              <button style={globalStyles.button.secondary} onClick={() => {
                if (isCreating) goBackToList();
                else {
                  setIsEditing(false);
                  setFormName(selectedItem.name);
                  setFormDescription(selectedItem.description || "");
                  setFormPermissionIds((selectedItem.permissions || []).map(p => p.id));
                }
              }}>
                Cancel
              </button>
              <button style={globalStyles.button.primary} onClick={handleSaveSet} disabled={loading}>
                {loading ? "Saving..." : (isCreating ? "Create" : "Save")}
              </button>
            </div>
          )}
        </div>

        {/* Manage Assignments - only for existing sets */}
        {!isNew && renderManageAssignments()}
      </div>
    );
  };

  // ============================
  // MAIN RENDER
  // ============================
  return (
    <div>
      <h2 style={designSystem.typography.h2}>Permission Management</h2>

      {/* Tabs - only show when in list view */}
      {activeView === "list" && (
        <div style={{ display: "flex", gap: "0", marginBottom: designSystem.spacing.lg, borderBottom: `2px solid ${designSystem.colors.divider}` }}>
          <button
            style={{
              ...globalStyles.button.subtle,
              padding: `${designSystem.spacing.sm} ${designSystem.spacing.lg}`,
              borderBottom: activeTab === "permissions" ? `2px solid ${designSystem.colors.primary}` : "2px solid transparent",
              borderRadius: 0,
              marginBottom: "-2px",
              fontWeight: activeTab === "permissions" ? 600 : 400,
              color: activeTab === "permissions" ? designSystem.colors.primary : designSystem.colors.textSecondary,
            }}
            onClick={() => { setActiveTab("permissions"); setSearchTerm(""); clearMessages(); }}
          >
            Permissions
          </button>
          <button
            style={{
              ...globalStyles.button.subtle,
              padding: `${designSystem.spacing.sm} ${designSystem.spacing.lg}`,
              borderBottom: activeTab === "sets" ? `2px solid ${designSystem.colors.primary}` : "2px solid transparent",
              borderRadius: 0,
              marginBottom: "-2px",
              fontWeight: activeTab === "sets" ? 600 : 400,
              color: activeTab === "sets" ? designSystem.colors.primary : designSystem.colors.textSecondary,
            }}
            onClick={() => { setActiveTab("sets"); setSearchTerm(""); clearMessages(); }}
          >
            Permission Sets
          </button>
          {/* Profiles tab removed in favor of standalone ProfilesSection */}
        </div>
      )}

      {activeView === "list" && renderMessages()}

      {/* Content */}
      {activeView === "list" && activeTab === "permissions" && renderPermissionsList()}
      {activeView === "list" && activeTab === "sets" && renderSetsList()}
      {activeView === "detail" && activeTab === "permissions" && renderPermissionDetail()}
      {activeView === "detail" && activeTab === "sets" && renderSetDetail()}
    </div>
  );
};

export default PermissionManager;
