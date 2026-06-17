'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Avatar } from '@/components/ui/Avatar';
import { RoleBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input, Select } from '@/components/ui/Input';
import { SkeletonRow } from '@/components/ui/Skeleton';
import { formatDate } from '@/lib/formatters';
import type { IUser, UserRole } from '@/types';

interface UserFormData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<UserRole | ''>('');
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<UserFormData>({ name: '', email: '', password: '', role: 'technician', phone: '' });

  const fetchUsers = () => {
    setLoading(true);
    fetch('/api/admin/users')
      .then((r) => r.json())
      .then((d) => { if (d.success) setUsers(d.data); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleCreate = async () => {
    if (!form.name || !form.email || !form.password) {
      toast.error('Please fill all required fields');
      return;
    }
    setCreating(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('User created!');
        setShowCreate(false);
        setForm({ name: '', email: '', password: '', role: 'technician', phone: '' });
        fetchUsers();
      } else {
        toast.error(data.error ?? 'Failed');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setCreating(false);
    }
  };

  const toggleActive = async (user: IUser) => {
    await fetch(`/api/admin/users/${user._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !user.isActive }),
    });
    setUsers((prev) => prev.map((u) => u._id === user._id ? { ...u, isActive: !u.isActive } : u));
    toast.success(`User ${user.isActive ? 'deactivated' : 'activated'}`);
  };

  const filtered = roleFilter ? users.filter((u) => u.role === roleFilter) : users;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-text-primary font-heading">User Management</h2>
          <p className="text-sm text-text-secondary mt-1">{users.length} total users</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>+ New User</Button>
      </div>

      {/* Role filter */}
      <div className="flex gap-2 flex-wrap">
        {(['', 'admin', 'dispatcher', 'technician'] as const).map((r) => (
          <button
            key={r || 'all'}
            onClick={() => setRoleFilter(r)}
            className={`px-3 py-1 rounded-full text-sm transition-all ${roleFilter === r ? 'bg-accent-blue text-white' : 'bg-bg-card text-text-secondary border border-border-dark hover:border-accent-blue/50'}`}
          >
            {r ? r.charAt(0).toUpperCase() + r.slice(1) : 'All'}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-bg-card border border-border-dark rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-dark">
                {['User', 'Role', 'Status', 'Joined', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-dark">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={5} className="px-4 py-2"><SkeletonRow /></td></tr>
                ))
              ) : filtered.map((user) => (
                <tr key={user._id} className={`hover:bg-bg-primary/50 transition-colors ${!user.isActive ? 'opacity-50' : ''}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={user.name} src={user.avatar} size="md" />
                      <div>
                        <p className="text-sm font-medium text-text-primary">{user.name}</p>
                        <p className="text-xs text-text-secondary">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><RoleBadge role={user.role} /></td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${user.isActive ? 'bg-accent-emerald/15 text-accent-emerald' : 'bg-accent-red/15 text-accent-red'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-text-secondary">{formatDate(user.createdAt)}</td>
                  <td className="px-4 py-3">
                    <Button
                      variant={user.isActive ? 'ghost' : 'secondary'}
                      size="sm"
                      onClick={() => toggleActive(user)}
                    >
                      {user.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create User">
        <div className="space-y-4">
          <Input label="Full Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Email *" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input label="Password *" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <Select label="Role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}>
            <option value="admin">Admin</option>
            <option value="dispatcher">Dispatcher</option>
            <option value="technician">Technician</option>
          </Select>
          <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Button className="w-full" onClick={handleCreate} loading={creating}>Create User</Button>
        </div>
      </Modal>
    </div>
  );
}
