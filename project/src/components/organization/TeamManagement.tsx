import React, { useState, useMemo } from 'react';
import { Users, Mail, UserPlus, Crown, Shield, Building } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useAppData } from '../../hooks/useAppData';
import { CreateOrganizationModal } from './CreateOrganizationModal';
import { InviteUserModal } from './InviteUserModal';
import { Button } from '../common/Button';
import { UserRole } from '../../types';

export function TeamManagement() {
  const { auth } = useAuth();
  const { organizations, users, invitations, updateUserRole } = useAppData();
  const [showCreateOrg, setShowCreateOrg] = useState(false);
  const [showInviteUser, setShowInviteUser] = useState(false);

  const userOrganization = useMemo(() => 
    organizations.find(org => org.id === auth.user?.organizationId),
    [organizations, auth.user?.organizationId]
  );

  const organizationMembers = useMemo(() =>
    users.filter(user => user.organizationId === auth.user?.organizationId),
    [users, auth.user?.organizationId]
  );

  const pendingInvitations = useMemo(() =>
    invitations.filter(inv => 
      inv.organizationId === auth.user?.organizationId && 
      inv.status === 'pending'
    ),
    [invitations, auth.user?.organizationId]
  );

  const canManageTeam = auth.user?.role === 'owner' || 
                       auth.user?.role === 'ceo' || 
                       auth.user?.role === 'director' || 
                       auth.user?.role === 'manager';

  const canManageRoles = auth.user?.role === 'owner' || auth.user?.role === 'ceo';

  const roleHierarchy: UserRole[] = ['owner', 'ceo', 'director', 'manager', 'sales', 'purchase', 'accountant', 'employee'];

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'owner':
        return <Crown className="w-4 h-4 text-yellow-600" />;
      case 'ceo':
        return <Shield className="w-4 h-4 text-purple-600" />;
      case 'director':
        return <Building className="w-4 h-4 text-blue-600" />;
      default:
        return <Users className="w-4 h-4 text-gray-600" />;
    }
  };

  const getRoleColor = (role: UserRole) => {
    const colors = {
      owner: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      ceo: 'bg-purple-100 text-purple-800 border-purple-300',
      director: 'bg-blue-100 text-blue-800 border-blue-300',
      manager: 'bg-green-100 text-green-800 border-green-300',
      sales: 'bg-orange-100 text-orange-800 border-orange-300',
      purchase: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      accountant: 'bg-pink-100 text-pink-800 border-pink-300',
      employee: 'bg-gray-100 text-gray-800 border-gray-300',
    };
    return colors[role] || colors.employee;
  };

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    try {
      updateUserRole(userId, newRole);
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  if (!userOrganization) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <Building className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Create Your Organization</h2>
          <p className="text-gray-600 mb-6">
            Start by creating an organization to manage your team and collaborate on tasks.
          </p>
          <Button onClick={() => setShowCreateOrg(true)}>
            <Building className="w-4 h-4 mr-2" />
            Create Organization
          </Button>
        </div>

        <CreateOrganizationModal
          isOpen={showCreateOrg}
          onClose={() => setShowCreateOrg(false)}
          onSuccess={() => setShowCreateOrg(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Organization Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
              <Building className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{userOrganization.name}</h1>
              <p className="text-gray-600">{userOrganization.description}</p>
              <div className="mt-1">
                <span className="text-sm text-gray-500">
                  Created {new Date(userOrganization.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          
          {canManageTeam && (
            <Button onClick={() => setShowInviteUser(true)}>
              <UserPlus className="w-4 h-4 mr-2" />
              Invite Member
            </Button>
          )}
        </div>
      </div>

      {/* Team Members */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Team Members ({organizationMembers.length})
          </h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {organizationMembers.length > 0 ? (
            organizationMembers.map(member => (
              <div key={member.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-medium">
                        {member.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center">
                        <h3 className="text-sm font-medium text-gray-900">{member.name}</h3>
                        {member.id === userOrganization.ownerId && (
                          <span className="ml-2 text-xs text-gray-500">(Owner)</span>
                        )}
                        {member.id === auth.user?.id && (
                          <span className="ml-2 text-xs text-blue-600">(You)</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{member.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="flex items-center">
                      {getRoleIcon(member.role)}
                      <span className={`ml-2 px-3 py-1 rounded-full text-xs font-medium border ${getRoleColor(member.role)}`}>
                        {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                      </span>
                    </div>

                    {canManageRoles && member.id !== auth.user?.id && member.role !== 'owner' && (
                      <select
                        value={member.role}
                        onChange={(e) => handleRoleChange(member.id, e.target.value as UserRole)}
                        className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {roleHierarchy.filter(role => role !== 'owner').map(role => (
                          <option key={role} value={role}>
                            {role.charAt(0).toUpperCase() + role.slice(1)}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-8 text-center">
              <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No team members yet</h3>
              <p className="text-gray-600">Start building your team by inviting members.</p>
            </div>
          )}
        </div>
      </div>

      {/* Pending Invitations */}
      {pendingInvitations.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Pending Invitations ({pendingInvitations.length})
            </h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {pendingInvitations.map(invitation => (
              <div key={invitation.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <Mail className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-gray-900">{invitation.email}</h3>
                      <p className="text-sm text-gray-500">
                        Invited by {invitation.inviterName} on {new Date(invitation.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getRoleColor(invitation.role)}`}>
                    {invitation.role.charAt(0).toUpperCase() + invitation.role.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <InviteUserModal
        isOpen={showInviteUser}
        onClose={() => setShowInviteUser(false)}
      />

      <CreateOrganizationModal
        isOpen={showCreateOrg}
        onClose={() => setShowCreateOrg(false)}
        onSuccess={() => setShowCreateOrg(false)}
      />
    </div>
  );
}
</parameter>