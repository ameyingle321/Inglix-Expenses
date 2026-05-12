import React, { useEffect, useState } from 'react';
import { contactService } from '../../services/contactService';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { useToast } from '../../context/ToastContext';
import { Users, Plus, Trash2, Mail, User } from 'lucide-react';

const ContactsPage = () => {
  const toast = useToast();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchContacts = async () => {
    try {
      const data = await contactService.getContacts();
      setContacts(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchContacts(); }, []);

  const handleAddContact = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await contactService.createContact({ name, email });
      setName(''); setEmail(''); setShowAddForm(false);
      toast.success('Contact added successfully!');
      await fetchContacts();
    } catch (err) { toast.error(err.message); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this contact?')) return;
    try {
      await contactService.deleteContact(id);
      setContacts(contacts.filter(c => c.id !== id));
      toast.success('Contact deleted');
    } catch (err) { toast.error(err.message); }
  };

  if (loading) return <div className="p-8"><LoadingSkeleton type="full" /></div>;

  return (
    <div className="animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark">Contacts</h1>
          <p className="text-slate-500 mt-1">Manage people you split expenses with.</p>
        </div>
        <button onClick={() => setShowAddForm(!showAddForm)} className="flex items-center gap-2 bg-brand-dark text-white px-5 py-2.5 rounded-full font-medium hover:bg-slate-800 transition-all shadow-md w-fit">
          <Plus className="w-5 h-5" />
          {showAddForm ? 'Cancel' : 'Add Contact'}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-8 animate-fade-in-up">
          <h2 className="text-lg font-semibold text-brand-dark mb-4">Add New Contact</h2>
          <form onSubmit={handleAddContact} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Name *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-accent transition-all" placeholder="John Doe" />
              </div>
            </div>
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email (Optional)</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-accent transition-all" placeholder="john@example.com" />
              </div>
            </div>
            <button type="submit" disabled={submitting} className="w-full md:w-auto bg-brand-accent text-white px-6 py-2.5 rounded-xl font-medium hover:bg-emerald-600 transition-colors disabled:opacity-70">
              {submitting ? 'Saving...' : 'Save'}
            </button>
          </form>
        </div>
      )}

      {error ? (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100">{error}</div>
      ) : contacts.length === 0 ? (
        <EmptyState icon={<Users className="w-8 h-8" />} title="No contacts yet" description="Add friends, family, or colleagues so you can start splitting expenses with them." actionText="+ Add your first contact" onAction={() => setShowAddForm(true)} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contacts.map((contact) => (
            <div key={contact.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-xl font-semibold text-slate-600 uppercase">{contact.name.charAt(0)}</div>
                <div>
                  <h3 className="font-semibold text-brand-dark">{contact.name}</h3>
                  {contact.email && <p className="text-sm text-slate-500">{contact.email}</p>}
                  {contact.linked_user_id && (<span className="inline-flex mt-1 items-center px-2 py-0.5 rounded text-xs font-medium bg-brand-accent/10 text-brand-accent">Linked Account</span>)}
                </div>
              </div>
              <button onClick={() => handleDelete(contact.id)} className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-2" title="Delete contact">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContactsPage;
