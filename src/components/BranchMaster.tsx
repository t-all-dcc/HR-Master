import React, { useState } from 'react';
import { 
  MapPin, 
  Plus, 
  Edit2, 
  Trash2, 
  Search,
  Building2,
  Phone,
  Mail
} from 'lucide-react';
import Swal from 'sweetalert2';
import BaseModal from './BaseModal';

interface Branch {
  id: number;
  code: string;
  name: string;
  address: string;
  phone: string;
  manager: string;
  status: 'Active' | 'Inactive';
}

const MOCK_BRANCHES: Branch[] = [
  { id: 1, code: 'HQ-001', name: 'Head Office', address: '123 Silom Rd, Bangkok', phone: '02-123-4567', manager: 'Somchai CEO', status: 'Active' },
  { id: 2, code: 'FAC-001', name: 'Factory 1', address: '789 Amata Nakorn, Chonburi', phone: '038-111-222', manager: 'Wichai Factory Mgr', status: 'Active' },
];

const BranchMaster = () => {
  const [branches, setBranches] = useState<Branch[]>(MOCK_BRANCHES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentBranch, setCurrentBranch] = useState<Partial<Branch>>({});
  const [searchQuery, setSearchQuery] = useState('');

  const handleSave = () => {
    if (!currentBranch.name || !currentBranch.code) {
      Swal.fire('Error', 'Please fill in required fields', 'error');
      return;
    }

    if (currentBranch.id) {
      setBranches(branches.map(b => b.id === currentBranch.id ? { ...b, ...currentBranch } as Branch : b));
      Swal.fire('Updated', 'Branch updated successfully', 'success');
    } else {
      const newBranch: Branch = {
        id: Date.now(),
        status: 'Active',
        ...currentBranch
      } as Branch;
      setBranches([...branches, newBranch]);
      Swal.fire('Created', 'New branch added', 'success');
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: number) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        setBranches(branches.filter(b => b.id !== id));
        Swal.fire('Deleted!', 'Branch has been deleted.', 'success');
      }
    });
  };

  const filteredBranches = branches.filter(b => 
    b.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    b.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-bgPage font-sans">
      {/* Header */}
      <header className="px-8 py-6 flex justify-between items-center shrink-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-gradient-to-br from-sidebarBg to-brandDeepBlue text-brandGold shadow-lg">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-sidebarBg tracking-tight">BRANCH MASTER</h1>
            <p className="text-brandTeal text-[11px] font-bold uppercase tracking-widest">Organization Locations</p>
          </div>
        </div>
        <button 
          onClick={() => { setCurrentBranch({}); setIsModalOpen(true); }}
          className="px-4 py-2 bg-brandDeepBlue text-white text-xs font-bold rounded-lg shadow-md hover:bg-brandBlue transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Branch
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto custom-scrollbar px-8 py-6">
        <div className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
          {/* Toolbar */}
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search branches..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brandTeal w-64 shadow-sm" 
              />
            </div>
            <div className="text-xs text-gray-500 font-bold uppercase">
              Total: {filteredBranches.length} Locations
            </div>
          </div>

          {/* Table */}
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider pl-6">Code</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Branch Name</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Address</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Manager</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Status</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredBranches.map(branch => (
                <tr key={branch.id} className="hover:bg-brandTeal/5 transition-colors group">
                  <td className="p-4 pl-6 text-sm font-mono font-bold text-brandDeepBlue">{branch.code}</td>
                  <td className="p-4 text-sm font-bold text-sidebarBg">{branch.name}</td>
                  <td className="p-4 text-sm text-gray-600 max-w-xs truncate" title={branch.address}>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3 h-3 text-gray-400" /> {branch.address}
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-600">{branch.manager}</td>
                  <td className="p-4 text-center">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${
                      branch.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-600 border-gray-200'
                    }`}>
                      {branch.status}
                    </span>
                  </td>
                  <td className="p-4 text-center pr-6">
                    <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => { setCurrentBranch(branch); setIsModalOpen(true); }}
                        className="p-1.5 text-gray-400 hover:text-brandBlue hover:bg-brandBlue/10 rounded-lg transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(branch.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Modal */}
      <BaseModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentBranch.id ? 'Edit Branch' : 'Add New Branch'} icon={Building2}>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Branch Code</label>
              <input 
                type="text" 
                value={currentBranch.code || ''} 
                onChange={e => setCurrentBranch({...currentBranch, code: e.target.value})}
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-brandTeal outline-none"
                placeholder="e.g. HQ-001"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Branch Name</label>
              <input 
                type="text" 
                value={currentBranch.name || ''} 
                onChange={e => setCurrentBranch({...currentBranch, name: e.target.value})}
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-brandTeal outline-none"
                placeholder="e.g. Head Office"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Address</label>
            <textarea 
              value={currentBranch.address || ''} 
              onChange={e => setCurrentBranch({...currentBranch, address: e.target.value})}
              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-brandTeal outline-none h-24 resize-none"
              placeholder="Full address..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone</label>
              <input 
                type="text" 
                value={currentBranch.phone || ''} 
                onChange={e => setCurrentBranch({...currentBranch, phone: e.target.value})}
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-brandTeal outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Manager</label>
              <input 
                type="text" 
                value={currentBranch.manager || ''} 
                onChange={e => setCurrentBranch({...currentBranch, manager: e.target.value})}
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-brandTeal outline-none"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-50 rounded-lg">Cancel</button>
            <button onClick={handleSave} className="px-6 py-2 bg-brandDeepBlue text-white text-xs font-bold rounded-lg shadow-md hover:bg-brandBlue">Save Branch</button>
          </div>
        </div>
      </BaseModal>
    </div>
  );
};

export default BranchMaster;
