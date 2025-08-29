import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useAuth } from '../../hooks/useAuth';
import { useAppData } from '../../hooks/useAppData';
import { UserRole } from '../../types';

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InviteUserModal({ isOpen, onClose }: InviteUserModalProps) {
  const { auth } = useAuth();
  const { sendInvitation, organizations } = useAppData();
  
  const [formData, setFormData] = useState({
    email: '',
    role: 'employee' as UserRole,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const userOrganization = organizations.find(org => org.id === auth.user?.organizationId);

  const roleOptions: { value: UserRole; label: string; description: string }[] = [
    { value: 'ceo', label: 'CEO', description: 'Chief Executive Officer - Full access' },
    { value: 'director', label: 'Director', description: 'Senior leadership role' },
    { value: 'manager', label: 'Manager', description: 'Team management responsibilities' },
    { value: 'sales', label: 'Sales', description: 'Sales team member' },
    { value: 'purchase', label: 'Purchase', description: 'Procurement team member' },
    { value: 'accountant', label: 'Accountant', description: 'Finance team member' },
    { value: 'employee', label: 'Employee', description: 'General team member' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!auth.user || !userOrganization) {
      setError('Authentication or organization error');
      return;
    }

    if (!formData.email.trim()) {
      setError('Email address is required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await sendInvitation(
        userOrganization.id,
        formData.email.trim(),
        formData.role,
        auth.user.name
      );

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setFormData({ email: '', role: 'employee' });
        onClose();
      }, 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send invitation';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleClose = () => {
    if (!isSubmitting && !success) {
      setFormData({ email: '', role: 'employee' });
      setError('');
      onClose();
    }
  };

  if (success) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} title="Invitation Sent">
        <div className="text-center py-4">
          <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Invitation Sent Successfully!</h3>
          <p className="text-gray-600">
            An invitation has been sent to <strong>{formData.email}</strong> to join {userOrganization?.name} as a {formData.role}.
          </p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Invite Team Member">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            value={formData.email}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="colleague@example.com"
          />
        </div>

        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
            Role *
          </label>
          <select
            id="role"
            name="role"
            required
            value={formData.role}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {roleOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label} - {option.description}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <p className="text-sm text-blue-800">
            The invited user will receive an email invitation to join <strong>{userOrganization?.name}</strong> with the <strong>{formData.role}</strong> role.
          </p>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button 
            type="button" 
            variant="secondary" 
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Sending...' : 'Send Invitation'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}