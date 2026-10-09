import React, { useState, useEffect } from "react";
import { getRoles, getAllPermissions, getPermissionSets, createPermissionSet, updatePermissionSet, deletePermissionSet, getProfiles, getUsers, assignProfileToUser, getUserProfile, assignPermissionSetToRole, createProfile, updateProfile, deleteProfile } from "../Services/Api";
import { designSystem, globalStyles } from "../styles/designSystem";

const PermissionManager = () => {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [permissionSets, setPermissionSets] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [users, setUsers] = useState([]);

  const [newSetName, setNewSetName] = useState("");
  const [newSetDescription, setNewSetDescription] = useState("");
  const [selectedPerms, setSelectedPerms] = useState([]);
  const [editingSetId, setEditingSetId] = useState(null);
  const [editingSetName, setEditingSetName] = useState("");
  const [editingSetDescription, setEditingSetDescription] = useState("");

  const [editingProfileName, setEditingProfileName] = useState("");
  const [editingProfileDescription, setEditingProfileDescription] = useState("");
  const [editingIsSystemAdmin, setEditingIsSystemAdmin] = useState(false);
  const [editingProfileId, setEditingProfileId] = useState(null);

  const [newProfileName, setNewProfileName] = useState("");
  const [newProfileDescription, setNewProfileDescription] = useState("");
  const [newIsSystemAdmin, setNewIsSystemAdmin] = useState(false);
  const [assigningProfileToUser, setAssigningProfileToUser] = useState(null);
  const [userProfileMap, setUserProfileMap] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [pRes, psRes, rRes, profRes, uRes] = await Promise.all([
        getAllPermissions(),
        getPermissionSets(),
        getRoles(),
        getProfiles(),
        getUsers()
      ]);
      
      setPermissions(pRes.data);
      setPermissionSets(psRes.data);
      setRoles(rRes.data);
      setProfiles(profRes.data);
      setUsers(uRes.data);

      // Build user profile map
      const map = {};
      uRes.data.forEach(user => {
        map[user.id] = user.profileId;
      });
      setUserProfileMap(map);
    } catch(e) {
      console.error(e);
    }
  };

  // Group permissions by category
  const getPermissionGroups = () => {
    const groups = {};
    permissions.forEach(p => {
      const permName = p.name || p.Name || "";
      const category = permName.split('.')[0] || "General";
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(p);
    });
    return groups;
  };

  const handleCreateSet = async () => {
    if(!newSetName.trim() || selectedPerms.length === 0) return;
    try {
      await createPermissionSet({ 
        name: newSetName, 
        description: newSetDescription,
        permissionIds: selectedPerms 
      });
      setNewSetName("");
      setNewSetDescription("");
      setSelectedPerms([]);
      loadData();
    } catch(e) { console.error(e); }
  };

  const handleUpdateSet = async () => {
    if(!editingSetName.trim() || selectedPerms.length === 0) return;
    try {
      await updatePermissionSet(editingSetId, { 
        name: editingSetName, 
        description: editingSetDescription,
        permissionIds: selectedPerms 
      });
      setEditingSetId(null);
      setEditingSetName("");
      setEditingSetDescription("");
      setSelectedPerms([]);
      loadData();
    } catch(e) { console.error(e); }
  };

  const handleDeleteSet = async (id) => {
    try {
      await deletePermissionSet(id);
      loadData();
    } catch(e) { console.error(e); }
  };

  const handleAssign = async (roleId, permissionSetId) => {
    try {
      await assignPermissionSetToRole(roleId, permissionSetId);
      alert("Assigned successfully");
      loadData();
    } catch(e) { console.error(e); }
  };

  const handleEditSet = (set) => {
    setEditingSetId(set.id);
    setEditingSetName(set.name);
    setEditingSetDescription(set.description || "");
    
    // Pre-select the permissions
    const permIds = set.Permissions ? set.Permissions.map(p => p.id) : [];
    setSelectedPerms(permIds);
  };

  const handleCreateProfile = async () => {
    if(!newProfileName.trim()) return;
    try {
      await createProfile({ 
        name: newProfileName, 
        description: newProfileDescription,
        isSystemAdmin: newIsSystemAdmin 
      });
      setNewProfileName("");
      setNewProfileDescription("");
      setNewIsSystemAdmin(false);
      loadData();
    } catch(e) { console.error(e); }
  };

  const handleUpdateProfile = async () => {
    if(!editingProfileName.trim()) return;
    try {
      await updateProfile(editingProfileId, { 
        name: editingProfileName, 
        description: editingProfileDescription,
        isSystemAdmin: editingIsSystemAdmin 
      });
      setEditingProfileId(null);
      setEditingProfileName("");
      setEditingProfileDescription("");
      setEditingIsSystemAdmin(false);
      loadData();
    } catch(e) { console.error(e); }
  };

  const handleDeleteProfile = async (id) => {
    try {
      await deleteProfile(id);
      loadData();
    } catch(e) { console.error(e); }
  };

  const handleAssignProfileToUser = async (userId, profileId) => {
    try {
      setAssigningProfileToUser(userId);
      await assignProfileToUser(userId, profileId ? profileId : null);
      // Update the user profile map
      setUserProfileMap(prev => ({
        ...prev,
        [userId]: profileId ? profileId : null
      }));
      setAssigningProfileToUser(null);
    } catch(e) { console.error(e); }
  };

  return (
    <div>
      <h2 style={designSystem.typography.h2}>Permission Manager</h2>

      {/* Permission Sets Section */}
      <div style={{...globalStyles.card, marginBottom: designSystem.spacing.lg}}>
        <h3>Permission Sets</h3>
        
        {/* Create/Edit Permission Set Form */}
        <div style={{ display: 'flex', gap: designSystem.spacing.md, marginBottom: designSystem.spacing.md }}>
          {editingSetId ? (
            <>
              <input 
                style={globalStyles.input} 
                value={editingSetName} 
                onChange={e=>setEditingSetName(e.target.value)} 
                placeholder="Set Name" 
              />
              <input 
                style={globalStyles.input} 
                value={editingSetDescription} 
                onChange={e=>setEditingSetDescription(e.target.value)} 
                placeholder="Description" 
              />
              <button 
                style={globalStyles.button.primary} 
                onClick={handleUpdateSet}
              >
                Update Set
              </button>
              <button 
                style={{...globalStyles.button.secondary, marginLeft: designSystem.spacing.sm}} 
                onClick={() => {
                  setEditingSetId(null);
                  setEditingSetName("");
                  setEditingSetDescription("");
                  setSelectedPerms([]);
                }}
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <input 
                style={globalStyles.input} 
                value={newSetName} 
                onChange={e=>setNewSetName(e.target.value)} 
                placeholder="Set Name (e.g. L1 Access)" 
              />
              <input 
                style={globalStyles.input} 
                value={newSetDescription} 
                onChange={e=>setNewSetDescription(e.target.value)} 
                placeholder="Description" 
              />
              <button 
                style={globalStyles.button.primary} 
                onClick={handleCreateSet}
              >
                Create Set
              </button>
            </>
          )}
        </div>

        {/* Permission Checkboxes - Grouped */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: designSystem.spacing.md }}>
          {Object.entries(getPermissionGroups()).map(([category, perms]) => (
            <div key={category} style={{ border: `1px solid ${designSystem.colors.border}`, borderRadius: '4px', padding: designSystem.spacing.md }}>
              <h4 style={{ marginTop: 0, color: designSystem.colors.primary }}>{category}</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {perms.map(p => (
                  <label 
                    key={p.id} 
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <input 
                      type="checkbox" 
                      checked={selectedPerms.includes(p.id)} 
                      onChange={e => {
                        if(e.target.checked) 
                          setSelectedPerms([...selectedPerms, p.id]);
                        else 
                          setSelectedPerms(selectedPerms.filter(id => id !== p.id));
                      }} 
                    />
                    <span>{p.name}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Role Assignment Section */}
      <div style={{...globalStyles.card, marginBottom: designSystem.spacing.lg}}>
        <h3>Role Assignment</h3>
        <table style={{...globalStyles.table, width: '100%'}}>
          <thead>
            <tr>
              <th>Role</th>
              <th>Permission Set</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {roles.map(r => (
              <tr key={r.id}>
                <td>{r.name}</td>
                <td>
                  <select 
                    id={`role-select-${r.id}`} 
                    style={globalStyles.input}
                    onChange={(e) => {
                      // Optional: auto-assign when selected
                    }}
                  >
                    <option value="">-- Select Set --</option>
                    {permissionSets.map(ps => (
                      <option 
                        key={ps.id} 
                        value={ps.id}
                      >
                        {ps.name} {ps.description && `(${ps.description})`}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <button 
                    style={globalStyles.button.secondary} 
                    onClick={() => {
                      const val = document.getElementById(`role-select-${r.id}`).value;
                      if(val) handleAssign(r.id, val);
                    }}
                  >
                    Assign
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Profiles Section */}
      <div style={{...globalStyles.card, marginBottom: designSystem.spacing.lg}}>
        <h3>Profiles</h3>
        
        {/* Profile Form (simplified) */}
        <div style={{ display: 'flex', gap: designSystem.spacing.md, marginBottom: designSystem.spacing.md }}>
          {editingProfileId ? (
            <>
              <input 
                style={globalStyles.input} 
                value={editingProfileName} 
                onChange={e=>setEditingProfileName(e.target.value)} 
                placeholder="Profile Name" 
              />
              <input 
                style={globalStyles.input} 
                value={editingProfileDescription} 
                onChange={e=>setEditingProfileDescription(e.target.value)} 
                placeholder="Description" 
              />
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input 
                  type="checkbox" 
                  checked={editingIsSystemAdmin} 
                  onChange={e=>setEditingIsSystemAdmin(e.target.checked)} 
                />
                <span>Is System Administrator</span>
              </label>
              <button 
                style={globalStyles.button.primary} 
                onClick={handleUpdateProfile}
              >
                Update Profile
              </button>
              <button 
                style={{...globalStyles.button.secondary, marginLeft: designSystem.spacing.sm}} 
                onClick={() => {
                  setEditingProfileId(null);
                  setEditingProfileName("");
                  setEditingProfileDescription("");
                  setEditingIsSystemAdmin(false);
                }}
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <input 
                style={globalStyles.input} 
                value={newProfileName} 
                onChange={e=>setNewProfileName(e.target.value)} 
                placeholder="Profile Name" 
              />
              <input 
                style={globalStyles.input} 
                value={newProfileDescription} 
                onChange={e=>setNewProfileDescription(e.target.value)} 
                placeholder="Description" 
              />
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input 
                  type="checkbox" 
                  checked={newIsSystemAdmin} 
                  onChange={e=>setNewIsSystemAdmin(e.target.checked)} 
                />
                <span>Is System Administrator</span>
              </label>
              <button 
                style={globalStyles.button.primary} 
                onClick={handleCreateProfile}
              >
                Create Profile
              </button>
            </>
          )}
        </div>

        {/* Profiles List */}
        <div style={{ marginTop: designSystem.spacing.md }}>
          {profiles.map(p => (
            <div 
              key={p.profileId} 
              style={{ 
                border: `1px solid ${designSystem.colors.border}`, 
                borderRadius: '4px', 
                padding: designSystem.spacing.md,
                marginBottom: designSystem.spacing.sm
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: 0 }}>{p.name}</h4>
                  <p style={{ margin: '4px 0', color: designSystem.colors.textSecondary }}>{p.description}</p>
                  {p.isSystemAdmin && <span style={{ 
                    background: designSystem.colors.warning, 
                    color: 'white', 
                    padding: '2px 6px', 
                    borderRadius: '3px', 
                    fontSize: '0.8rem'
                  }}>System Admin</span>}
                </div>
                <div>
                  <button 
                    style={globalStyles.button.secondary} 
                    onClick={() => {
                      // Edit profile - simplified
                      setEditingProfileId(p.profileId);
                      setEditingProfileName(p.name);
                      setEditingProfileDescription(p.description || "");
                      setEditingIsSystemAdmin(p.isSystemAdmin);
                    }}
                  >
                    Edit
                  </button>
                  <button 
                    style={{...globalStyles.button.secondary, marginLeft: designSystem.spacing.sm, background: designSystem.colors.error}} 
                    onClick={() => handleDeleteProfile(p.profileId)}
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div style={{ marginTop: designSystem.spacing.sm, fontSize: '0.9rem' }}>
                <strong>Users:</strong> {p.userCount || 0}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User Profile Assignment Section */}
      <div style={{...globalStyles.card}}>
        <h3>User Profile Assignment</h3>
        <table style={{...globalStyles.table, width: '100%'}}>
          <thead>
            <tr>
              <th>User</th>
              <th>Current Profile</th>
              <th>Assign Profile</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>{u.fullName || u.userName || u.email}</td>
                <td>
                  {u.profileId ? 
                    (profiles.find(p => p.profileId === u.profileId)?.name || 'Unknown') : 
                    'None'
                  }
                </td>
                <td>
                  <select 
                    id={`user-profile-select-${u.id}`} 
                    style={globalStyles.input}
                  >
                    <option value="">-- None --</option>
                    {profiles.map(p => (
                      <option 
                        key={p.profileId} 
                        value={p.profileId}
                      >
                        {p.name} {p.isSystemAdmin && ` (System Admin)`}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <button 
                    style={globalStyles.button.secondary} 
                    onClick={() => {
                      const val = document.getElementById(`user-profile-select-${u.id}`).value;
                      handleAssignProfileToUser(u.id, val ? parseInt(val) : null);
                    }}
                    disabled={assigningProfileToUser === u.id}
                  >
                    {assigningProfileToUser === u.id ? 'Assigning...' : 'Assign'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PermissionManager;