import React, { useState, useEffect } from "react";
import { getProfiles, createProfile, updateProfile, deleteProfile, getUsers, assignProfileToUser } from "../Services/Api";
import { designSystem, globalStyles } from "../styles/designSystem";

export default function ProfilesSection() {
  const [profiles, setProfiles] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("profiles"); // 'profiles' | 'assignment'
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileDescription, setProfileDescription] = useState("");

  // Employee Assignment tab state
  const [assignUserId, setAssignUserId] = useState("");
  const [assignProfileId, setAssignProfileId] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [profilesRes, usersRes] = await Promise.all([
        getProfiles(),
        getUsers()
      ]);
      setProfiles(profilesRes.data);
      setUsers(usersRes.data);
    } catch (e) {
      setError("Failed to load profiles data: " + (e.response?.data?.message || e.message));
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => { setError(""); setSuccess(""); };

  const handleSave = async () => {
    clearMessages();
    if (!profileName.trim()) {
      setError("Profile name is required");
      return;
    }
    try {
      if (isCreating) {
        await createProfile({ name: profileName, description: profileDescription, isSystemAdmin: false });
        setSuccess("Profile created successfully");
      } else {
        const id = selectedProfile.profileId || selectedProfile.id;
        await updateProfile(id, { name: profileName, description: profileDescription, isSystemAdmin: selectedProfile.isSystemAdmin });
        setSuccess("Profile updated successfully");
      }
      setIsCreating(false);
      setIsEditing(false);
      setSelectedProfile(null);
      loadData();
    } catch (e) {
      setError("Failed to save profile: " + (e.response?.data?.message || e.message));
    }
  };

  const handleDelete = async (profileId, name) => {
    if (name.toLowerCase() === "system administrator") {
      setError("Cannot delete the system administrator profile.");
      return;
    }
    if (!window.confirm(`Are you sure you want to delete profile "${name}"?`)) return;
    clearMessages();
    try {
      await deleteProfile(profileId);
      setSuccess("Profile deleted successfully");
      loadData();
    } catch (e) {
      setError("Failed to delete profile: " + (e.response?.data?.message || e.message));
    }
  };

  const handleAssignProfile = async () => {
    clearMessages();
    if (!assignUserId) {
      setError("Please select a user");
      return;
    }
    if (!assignProfileId) {
      setError("Please select a profile");
      return;
    }
    try {
      await assignProfileToUser(assignUserId, Number(assignProfileId));
      setSuccess("Profile assigned to user successfully!");
      setAssignUserId("");
      setAssignProfileId("");
      loadData();
    } catch (e) {
      setError("Failed to assign profile: " + (e.response?.data?.message || e.message));
    }
  };

  return (
    <div style={{ padding: designSystem.spacing.lg, maxWidth: "1100px", margin: "0 auto", fontFamily: "Roboto, Arial, sans-serif" }}>
      <h2 style={{ ...designSystem.typography.h1, marginBottom: designSystem.spacing.md }}>Profiles Management</h2>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0", marginBottom: designSystem.spacing.lg, borderBottom: `2px solid ${designSystem.colors.divider}` }}>
        <button
          style={{
            ...globalStyles.button.subtle,
            padding: `${designSystem.spacing.sm} ${designSystem.spacing.lg}`,
            borderBottom: activeTab === "profiles" ? `2px solid ${designSystem.colors.primary}` : "2px solid transparent",
            borderRadius: 0,
            marginBottom: "-2px",
            fontWeight: activeTab === "profiles" ? 600 : 400,
            color: activeTab === "profiles" ? designSystem.colors.primary : designSystem.colors.textSecondary,
          }}
          onClick={() => { setActiveTab("profiles"); clearMessages(); }}
        >
          Profiles List
        </button>
        <button
          style={{
            ...globalStyles.button.subtle,
            padding: `${designSystem.spacing.sm} ${designSystem.spacing.lg}`,
            borderBottom: activeTab === "assignment" ? `2px solid ${designSystem.colors.primary}` : "2px solid transparent",
            borderRadius: 0,
            marginBottom: "-2px",
            fontWeight: activeTab === "assignment" ? 600 : 400,
            color: activeTab === "assignment" ? designSystem.colors.primary : designSystem.colors.textSecondary,
          }}
          onClick={() => { setActiveTab("assignment"); clearMessages(); }}
        >
          Employee Assignment
        </button>
      </div>

      {error && (
        <div style={{ ...globalStyles.card, background: designSystem.colors.errorLight, color: designSystem.colors.error, marginBottom: designSystem.spacing.md }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{ ...globalStyles.card, background: designSystem.colors.successLight, color: designSystem.colors.success, marginBottom: designSystem.spacing.md }}>
          {success}
        </div>
      )}

      {activeTab === "assignment" && (
        <div style={{ ...globalStyles.card, maxWidth: "600px" }}>
          <h3 style={{ ...designSystem.typography.h3, marginBottom: designSystem.spacing.md }}>Assign Profile to Employee / User</h3>
          
          <div style={{ display: "flex", flexDirection: "column", gap: designSystem.spacing.md }}>
            <div>
              <label style={{ display: "block", marginBottom: "4px", fontWeight: 500, fontSize: "13px" }}>Select User</label>
              <select
                value={assignUserId}
                onChange={e => setAssignUserId(e.target.value)}
                style={{ ...globalStyles.input }}
              >
                <option value="">-- Select User --</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.fullName || u.userName} ({u.email}) — Current Profile: {profiles.find(p => (p.profileId || p.id) === u.profileId)?.name || "None"}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "4px", fontWeight: 500, fontSize: "13px" }}>Select Profile</label>
              <select
                value={assignProfileId}
                onChange={e => setAssignProfileId(e.target.value)}
                style={{ ...globalStyles.input }}
              >
                <option value="">-- Select Profile --</option>
                {profiles.map(p => (
                  <option key={p.profileId || p.id} value={p.profileId || p.id}>
                    {p.name} {p.isSystemAdmin ? "(System Admin)" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <button style={globalStyles.button.primary} onClick={handleAssignProfile}>
                Assign Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "profiles" && !selectedProfile && !isCreating && (
        <div style={{ ...globalStyles.card }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: designSystem.spacing.md }}>
            <h3 style={{ margin: 0, ...designSystem.typography.h3 }}>All Profiles</h3>
            <button
              style={globalStyles.button.primary}
              onClick={() => {
                setProfileName("");
                setProfileDescription("");
                setIsCreating(true);
                setIsEditing(true);
                clearMessages();
              }}
            >
              + Create Profile
            </button>
          </div>

          {loading ? (
            <div>Loading profiles...</div>
          ) : (
            <table style={{ ...globalStyles.table, width: "100%" }}>
              <thead>
                <tr>
                  <th style={globalStyles.tableHeader}>Name</th>
                  <th style={globalStyles.tableHeader}>Description</th>
                  <th style={globalStyles.tableHeader}>Type</th>
                  <th style={{ ...globalStyles.tableHeader, width: "200px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map(p => {
                  const pid = p.profileId || p.id;
                  const isSys = p.isSystemAdmin || p.name?.toLowerCase() === "system administrator";
                  return (
                    <tr key={pid} style={globalStyles.tableRow}>
                      <td style={globalStyles.tableCell}><strong>{p.name}</strong></td>
                      <td style={globalStyles.tableCell}>{p.description || "—"}</td>
                      <td style={globalStyles.tableCell}>{isSys ? "System Admin" : "Standard"}</td>
                      <td style={globalStyles.tableCell}>
                        <div style={{ display: "flex", gap: designSystem.spacing.xs }}>
                          <button
                            style={{ ...globalStyles.button.secondary, fontSize: "12px", padding: "4px 8px" }}
                            onClick={() => {
                              setSelectedProfile(p);
                              setProfileName(p.name);
                              setProfileDescription(p.description || "");
                              setIsEditing(false);
                              clearMessages();
                            }}
                          >
                            View
                          </button>
                          {!isSys && (
                            <>
                              <button
                                style={{ ...globalStyles.button.secondary, fontSize: "12px", padding: "4px 8px" }}
                                onClick={() => {
                                  setSelectedProfile(p);
                                  setProfileName(p.name);
                                  setProfileDescription(p.description || "");
                                  setIsEditing(true);
                                  clearMessages();
                                }}
                              >
                                Edit
                              </button>
                              <button
                                style={{ ...globalStyles.button.danger, fontSize: "12px", padding: "4px 8px" }}
                                onClick={() => handleDelete(pid, p.name)}
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === "profiles" && (selectedProfile || isCreating) && (
        <div style={{ ...globalStyles.card }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: designSystem.spacing.md }}>
            <h3 style={{ margin: 0, ...designSystem.typography.h3 }}>
              {isCreating ? "Create New Profile" : (isEditing ? "Edit Profile" : "Profile Details")}
            </h3>
            <button
              style={globalStyles.button.secondary}
              onClick={() => {
                setSelectedProfile(null);
                setIsCreating(false);
                setIsEditing(false);
                clearMessages();
              }}
            >
              Back to List
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: designSystem.spacing.md, maxWidth: "500px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "4px", fontWeight: 500, fontSize: "13px" }}>Profile Name</label>
              <input
                type="text"
                value={profileName}
                onChange={e => setProfileName(e.target.value)}
                disabled={!isEditing}
                style={{ ...globalStyles.input }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "4px", fontWeight: 500, fontSize: "13px" }}>Description</label>
              <textarea
                value={profileDescription}
                onChange={e => setProfileDescription(e.target.value)}
                disabled={!isEditing}
                rows={3}
                style={{ ...globalStyles.input, height: "auto" }}
              />
            </div>

            {isEditing && (
              <div style={{ display: "flex", gap: designSystem.spacing.sm }}>
                <button style={globalStyles.button.primary} onClick={handleSave}>
                  Save Profile
                </button>
                <button
                  style={globalStyles.button.secondary}
                  onClick={() => {
                    if (isCreating) {
                      setSelectedProfile(null);
                      setIsCreating(false);
                    } else {
                      setIsEditing(false);
                    }
                    clearMessages();
                  }}
                >
                  Cancel
                </button>
              </div>
            )}

            {!isEditing && selectedProfile && (
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

          {!isCreating && selectedProfile && (
            <div style={{ marginTop: designSystem.spacing.lg }}>
              <h4 style={{ ...designSystem.typography.h3, marginBottom: designSystem.spacing.sm }}>Users Assigned to this Profile</h4>
              <table style={{ ...globalStyles.table, width: "100%" }}>
                <thead>
                  <tr>
                    <th style={globalStyles.tableHeader}>User Name</th>
                    <th style={globalStyles.tableHeader}>Email</th>
                  </tr>
                </thead>
                <tbody>
                  {users
                    .filter(u => u.profileId === (selectedProfile.profileId || selectedProfile.id))
                    .map(u => (
                      <tr key={u.id} style={globalStyles.tableRow}>
                        <td style={globalStyles.tableCell}><strong>{u.fullName || u.userName}</strong></td>
                        <td style={globalStyles.tableCell}>{u.email}</td>
                      </tr>
                    ))}
                  {users.filter(u => u.profileId === (selectedProfile.profileId || selectedProfile.id)).length === 0 && (
                    <tr>
                      <td colSpan={2} style={{ ...globalStyles.tableCell, textAlign: "center", color: designSystem.colors.textSecondary }}>
                        No users assigned to this profile
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
