import React, { useState, useEffect } from "react";
import { 
  getAllApis, 
  getAdminPermissionSets, 
  createAdminPermissionSet, 
  updateAdminPermissionSet, 
  deleteAdminPermissionSet,
  getUsers,
  getUserPermissionSets,
  assignPermissionSetToUser,
  unassignPermissionSetFromUser
} from "../Services/Api";
import { designSystem, globalStyles } from "../styles/designSystem";

const PermissionManager = () => {
  const [apis, setApis] = useState([]);
  const [permissionSets, setPermissionSets] = useState([]);
  const [users, setUsers] = useState([]);
  
  const [activeScreen, setActiveScreen] = useState('sets'); // 'sets', 'editor', 'assign'
  const [editingSet, setEditingSet] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userPermSets, setUserPermSets] = useState([]);
  
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formApiIds, setFormApiIds] = useState([]);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedController, setSelectedController] = useState("all");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [apisRes, setsRes, usersRes] = await Promise.all([
        getAllApis(),
        getAdminPermissionSets(),
        getUsers()
      ]);
      setApis(apisRes.data);
      setPermissionSets(setsRes.data);
      setUsers(usersRes.data);
    } catch (e) {
      setError("Failed to load data: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  const getApiGroups = () => {
    const filteredApis = apis.filter(api => {
      const matchesSearch = api.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           api.route.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesController = selectedController === "all" || api.controller === selectedController;
      return matchesSearch && matchesController;
    });

    const groups = {};
    filteredApis.forEach(api => {
      if (!groups[api.controller]) groups[api.controller] = [];
      groups[api.controller].push(api);
    });
    return groups;
  };

  const getControllers = () => {
    const controllers = [...new Set(apis.map(a => a.controller))].sort();
    return ["all", ...controllers];
  };

  const isAdminSet = (ps) => ps.isSystem === true;

  const openEditor = (ps) => {
    setEditingSet(ps);
    setFormName(ps.name);
    setFormDescription(ps.description || "");
    setFormApiIds((ps.apis || ps.permissionSetApis || []).map(a => a.api?.id || a.id) || []);
    setActiveScreen('editor');
  };

  const handleDeleteSet = async (id) => {
    const ps = permissionSets.find(s => s.id === id);
    if (isAdminSet(ps)) {
      setError("Cannot delete the system Admin permission set.");
      return;
    }
    if (!window.confirm('Are you sure you want to delete this permission set?')) return;
    clearMessages();
    try {
      await deleteAdminPermissionSet(id);
      setSuccess('Permission set deleted successfully');
      loadData();
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Delete failed');
    }
  };

  const handleApiToggle = (apiId) => {
    setFormApiIds(prev => 
      prev.includes(apiId) 
        ? prev.filter(id => id !== apiId)
        : [...prev, apiId]
    );
  };

  const handleSave = async () => {
    clearMessages();
    if (!formName.trim()) {
      setError("Set name is required");
      return;
    }

    const isAdmin = editingSet && isAdminSet(editingSet);
    if (isAdmin) {
      setError("Cannot modify the system Admin permission set");
      return;
    }

    if (formApiIds.length === 0) {
      setError("At least one API must be selected");
      return;
    }

    setLoading(true);
    try {
      if (editingSet) {
        await updateAdminPermissionSet(editingSet.id, {
          name: formName,
          description: formDescription,
          apiIds: formApiIds
        });
        setSuccess("Permission set updated successfully");
      } else {
        const result = await createAdminPermissionSet({
          name: formName,
          description: formDescription,
          apiIds: formApiIds
        });
        setSuccess("Permission set created successfully");
      }
      loadData();
      setActiveScreen('sets');
    } catch (e) {
      setError(e.response?.data?.message || e.message || "Save failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditingSet(null);
    setFormName("");
    setFormDescription("");
    setFormApiIds([]);
    setActiveScreen('sets');
  };

  // Screen 1: Permission Sets List
  const renderSetsList = () => (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: designSystem.spacing.lg }}>
        <h3 style={designSystem.typography.h3}>Permission Sets</h3>
        <button 
          style={globalStyles.button.primary} 
          onClick={() => {
            setEditingSet(null);
            setFormName("");
            setFormDescription("");
            setFormApiIds([]);
            setActiveScreen('editor');
          }}
        >
          + New Set
        </button>
      </div>

      {loading && <div>Loading...</div>}

      {permissionSets.length === 0 && !loading && (
        <div style={{ padding: designSystem.spacing.lg, textAlign: "center" }}>
          No permission sets found. Create a new one to get started.
        </div>
      )}

      {permissionSets.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <table style={{...globalStyles.table, width: "100%"}}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>API Count</th>
                <th>User Count</th>
                <th>System</th>
                <th>Assignable</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {permissionSets.map(ps => (
                <tr key={ps.id}>
                  <td>
                    {isAdminSet(ps) ? (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        🔒 <strong>{ps.name}</strong>
                      </span>
                    ) : (
                      ps.name
                    )}
                  </td>
                  <td>{ps.description || "-"}</td>
                  <td>{ps.apis?.length || ps.apiCount || 0}</td>
                  <td>{ps.userCount || 0}</td>
                  <td>{isAdminSet(ps) ? "Yes 🔒" : "No"}</td>
                  <td>{ps.isAssignable ? "Yes" : "No"}</td>
                  <td>
                    {!isAdminSet(ps) && (
                      <>
                        <button 
                          style={{...globalStyles.button.secondary, marginRight: designSystem.spacing.xs}}
                          onClick={() => openEditor(ps)}
                        >
                          Edit
                        </button>
                        <button 
                          style={{...globalStyles.button.secondary, background: designSystem.colors.error}}
                          onClick={() => handleDeleteSet(ps.id)}
                        >
                          Delete
                        </button>
                      </>
                    )}
                    {isAdminSet(ps) && (
                      <span style={{ color: designSystem.colors.textSecondary, fontSize: "0.85rem" }}>System set (read-only)</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  // Screen 2: Permission Set Editor
  const renderEditor = () => {
    const groups = getApiGroups();
    const isAdmin = editingSet && isAdminSet(editingSet);

    const handleApiToggleWrapper = (apiId) => {
      if (isAdmin) return;
      handleApiToggle(apiId);
    };

    return (
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: designSystem.spacing.lg }}>
          <h3 style={designSystem.typography.h3}>
            {editingSet ? `Edit: ${editingSet.name}` : "New Permission Set"}
            {isAdmin && <span style={{ marginLeft: designSystem.spacing.sm, color: designSystem.colors.warning }}>🔒 System Set</span>}
          </h3>
          <button style={globalStyles.button.secondary} onClick={handleCancel}>Back to List</button>
        </div>

        {error && <div style={{...globalStyles.card, background: "#fff5f5", color: designSystem.colors.error, marginBottom: designSystem.spacing.md}}>{error}</div>}
        {success && <div style={{...globalStyles.card, background: "#f5fff5", color: designSystem.colors.success, marginBottom: designSystem.spacing.md}}>{success}</div>}

        <div style={{...globalStyles.card, marginBottom: designSystem.spacing.lg}}>
          <div style={{ display: "flex", gap: designSystem.spacing.md, marginBottom: designSystem.spacing.md, flexWrap: "wrap" }}>
            <input 
              style={{...globalStyles.input, flex: 1, minWidth: "200px"}}
              value={formName}
              onChange={e => setFormName(e.target.value)}
              placeholder="Set Name"
              disabled={isAdmin}
            />
            <input 
              style={{...globalStyles.input, flex: 2, minWidth: "300px"}}
              value={formDescription}
              onChange={e => setFormDescription(e.target.value)}
              placeholder="Description"
              disabled={isAdmin}
            />
            {isAdmin && <span style={{ alignSelf: "center", color: designSystem.colors.warning }}>🔒 System set - name/description cannot be changed</span>}
          </div>
        </div>

        <div style={{...globalStyles.card, marginBottom: designSystem.spacing.lg}}>
          <div style={{ display: "flex", gap: designSystem.spacing.md, marginBottom: designSystem.spacing.md, flexWrap: "wrap", alignItems: "center" }}>
            <input
              style={{...globalStyles.input, width: "250px"}}
              type="search"
              placeholder="Search APIs by name or route..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <select style={globalStyles.input} value={selectedController} onChange={e => setSelectedController(e.target.value)}>
              {getControllers().map(c => (
                <option key={c} value={c}>{c === "all" ? "All Controllers" : c}</option>
              ))}
            </select>
          </div>

          <div style={{ maxHeight: "500px", overflowY: "auto" }}>
            {Object.entries(groups).map(([controller, controllerApis]) => (
              <div key={controller} style={{ marginBottom: designSystem.spacing.lg }}>
                <h4 style={{ marginBottom: designSystem.spacing.sm, color: designSystem.colors.primary, borderBottom: `1px solid ${designSystem.colors.border}`, paddingBottom: "4px" }}>
                  {controller} ({controllerApis.length} APIs)
                </h4>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: designSystem.spacing.sm }}>
                  {controllerApis.map(api => {
                    const isSelected = formApiIds.includes(api.id);
                    const isSensitive = api.isSensitive;

                    return (
                      <label 
                        key={api.id} 
                        style={{ 
                          display: "flex", 
                          alignItems: "center", 
                          gap: "10px",
                          padding: "8px 12px",
                          border: `1px solid ${designSystem.colors.border}`,
                          borderRadius: "4px",
                          background: isSensitive ? "#fff8f0" : "transparent",
                          opacity: (isSensitive || isAdmin) && !isSelected ? 0.6 : 1,
                          cursor: (isSensitive || isAdmin) && !isSelected ? "not-allowed" : "pointer"
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleApiToggleWrapper(api.id)}
                          disabled={isSensitive || isAdmin}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <span style={{ fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {api.name}
                            </span>
                            {isSensitive && (
                              <span 
                                style={{ 
                                  background: designSystem.colors.warning, 
                                  color: "white", 
                                  padding: "1px 6px", 
                                  borderRadius: "3px", 
                                  fontSize: "0.7rem",
                                  cursor: "help"
                                }}
                                title="Sensitive API: Only accessible by Admin users or users with System Administrator profile"
                              >
                                🔒 Sensitive
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: "0.8rem", color: designSystem.colors.textSecondary }}>
                            <code>{api.httpMethod}</code> {api.route}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: designSystem.spacing.md, justifyContent: "flex-end" }}>
          <button style={globalStyles.button.secondary} onClick={handleCancel}>Cancel</button>
          <button style={globalStyles.button.primary} onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : (editingSet ? "Update" : "Create")}
          </button>
        </div>
      </div>
    );
  };

  // Screen 3: User Assignment
  const loadUserPermSets = async (userId) => {
    try {
      const res = await getUserPermissionSets(userId);
      setUserPermSets(res.data);
      setSelectedUser(userId);
    } catch (e) {
      setError("Failed to load user permission sets: " + e.message);
    }
  };

  const handleToggleAssign = async (permissionSetId, currentlyAssigned) => {
    clearMessages();
    try {
      if (currentlyAssigned) {
        await unassignPermissionSetFromUser(selectedUser, permissionSetId);
        setSuccess("Permission set unassigned");
      } else {
        await assignPermissionSetToUser(selectedUser, permissionSetId);
        setSuccess("Permission set assigned");
      }
      loadUserPermSets(selectedUser);
    } catch (e) {
      setError(e.response?.data?.message || e.message || "Assignment failed");
    }
  };

  const renderUserAssignment = () => (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: designSystem.spacing.lg }}>
        <h3 style={designSystem.typography.h3}>User Permission Set Assignment</h3>
      </div>

      {error && <div style={{...globalStyles.card, background: "#fff5f5", color: designSystem.colors.error, marginBottom: designSystem.spacing.md}}>{error}</div>}
      {success && <div style={{...globalStyles.card, background: "#f5fff5", color: designSystem.colors.success, marginBottom: designSystem.spacing.md}}>{success}</div>}

      <div style={{...globalStyles.card, marginBottom: designSystem.spacing.lg}}>
        <h4>Select User</h4>
        <div style={{ display: "flex", flexWrap: "wrap", gap: designSystem.spacing.sm }}>
          {users.map(u => (
            <button
              key={u.id}
              style={{
                ...globalStyles.button.secondary,
                background: selectedUser === u.id ? designSystem.colors.primary : globalStyles.button.secondary.background,
                color: selectedUser === u.id ? "white" : globalStyles.button.secondary.color,
              }}
              onClick={() => loadUserPermSets(u.id)}
            >
              {u.fullName || u.userName || u.email}
            </button>
          ))}
        </div>
      </div>

      {selectedUser && (
        <div style={{...globalStyles.card}}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: designSystem.spacing.md }}>
            <h4>Assigning to: {users.find(u => u.id === selectedUser)?.fullName || users.find(u => u.id === selectedUser)?.userName}</h4>
            <button style={globalStyles.button.secondary} onClick={() => setSelectedUser(null)}>Change User</button>
          </div>

          <table style={{...globalStyles.table, width: "100%"}}>
            <thead>
              <tr>
                <th>Permission Set</th>
                <th>Description</th>
                <th>System</th>
                <th>Current</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {permissionSets.map(ps => {
                const isAssigned = userPermSets.some(ups => ups.permissionSetId === ps.id);
                const isAdmin = isAdminSet(ps);
                
                return (
                  <tr key={ps.id} style={{ opacity: isAdmin && !isAssigned ? 0.5 : 1 }}>
                    <td>
                      {isAdmin ? <span>🔒 <strong>{ps.name}</strong></span> : ps.name}
                    </td>
                    <td>{ps.description || "-"}</td>
                    <td>{isAdmin ? "Yes 🔒" : "No"}</td>
                    <td>{isAssigned ? "✅ Assigned" : "Not assigned"}</td>
                    <td>
                      {isAdmin && !isAssigned ? (
                        <span style={{ color: designSystem.colors.textSecondary, fontSize: "0.85rem" }}>System set - auto-assigned to admins</span>
                      ) : (
                        <button
                          style={{
                            ...globalStyles.button.secondary,
                            background: isAssigned ? designSystem.colors.error : globalStyles.button.secondary.background,
                          }}
                          onClick={() => handleToggleAssign(ps.id, isAssigned)}
                          disabled={isAdmin && !isAssigned}
                        >
                          {isAssigned ? "Remove" : "Assign"}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  return (
    <div>
      <h2 style={designSystem.typography.h2}>Permission Management</h2>

      {/* Navigation Tabs */}
      <div style={{ display: "flex", gap: designSystem.spacing.sm, marginBottom: designSystem.spacing.lg, borderBottom: `1px solid ${designSystem.colors.border}`, paddingBottom: "4px" }}>
        <button
          style={{
            ...globalStyles.button.secondary,
            background: activeScreen === 'sets' ? designSystem.colors.primary : "transparent",
            color: activeScreen === 'sets' ? "white" : "inherit",
            borderColor: activeScreen === 'sets' ? designSystem.colors.primary : "transparent",
          }}
          onClick={() => { setActiveScreen('sets'); clearMessages(); }}
        >
          📋 Permission Sets
        </button>
        <button
          style={{
            ...globalStyles.button.secondary,
            background: activeScreen === 'assign' ? designSystem.colors.primary : "transparent",
            color: activeScreen === 'assign' ? "white" : "inherit",
            borderColor: activeScreen === 'assign' ? designSystem.colors.primary : "transparent",
          }}
          onClick={() => { setActiveScreen('assign'); clearMessages(); }}
        >
          👥 User Assignment
        </button>
      </div>

      {error && <div style={{...globalStyles.card, background: "#fff5f5", color: designSystem.colors.error, marginBottom: designSystem.spacing.md}}>{error}</div>}
      {success && <div style={{...globalStyles.card, background: "#f5fff5", color: designSystem.colors.success, marginBottom: designSystem.spacing.md}}>{success}</div>}

      {activeScreen === 'sets' && renderSetsList()}
      {activeScreen === 'editor' && renderEditor()}
      {activeScreen === 'assign' && renderUserAssignment()}
    </div>
  );
};

export default PermissionManager;