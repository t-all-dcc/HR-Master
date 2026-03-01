import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Network, 
  GitBranch, 
  List, 
  Download, 
  PlusCircle, 
  Edit, 
  Trash2, 
  Search, 
  Layers, 
  Plus, 
  Minus, 
  Maximize, 
  X,
  Edit2,
  Users,
  FileSpreadsheet
} from 'lucide-react';
import BaseModal from '../components/BaseModal';
import Swal from 'sweetalert2';
import { exportToGoogleSheets } from '../utils/sheetHelper';

// --- Types ---
interface OrgNode {
  id: string;
  parentId: string | null;
  nameEN: string;
  nameTH: string;
  type: string;
  headName: string;
  color: string;
  headcount: number;
  costCenter?: string;
  children?: OrgNode[];
  level?: number;
}

// --- Mock Data ---
const MOCK_DATA: OrgNode[] = [
  { id: '1', parentId: null, nameEN: 'T All Intelligence', nameTH: 'ที ออล อินเทลลิเจนซ์', type: 'Company', headName: 'CEO', color: '#186B8C', headcount: 150 },
  { id: '2', parentId: '1', nameEN: 'Human Resources', nameTH: 'ทรัพยากรบุคคล', type: 'Division', headName: 'Jane Doe', color: '#D95032', headcount: 12 },
  { id: '3', parentId: '1', nameEN: 'Technology', nameTH: 'เทคโนโลยี', type: 'Division', headName: 'John Smith', color: '#4F868C', headcount: 45 },
  { id: '4', parentId: '1', nameEN: 'Production', nameTH: 'ฝ่ายผลิต', type: 'Division', headName: 'Somchai', color: '#F2B705', headcount: 80 },
  { id: '5', parentId: '2', nameEN: 'Recruitment', nameTH: 'สรรหา', type: 'Department', headName: 'Alice', color: '#D95032', headcount: 5 },
  { id: '6', parentId: '2', nameEN: 'Compensation', nameTH: 'ค่าตอบแทน', type: 'Department', headName: 'Bob', color: '#D95032', headcount: 4 },
  { id: '7', parentId: '3', nameEN: 'Software Dev', nameTH: 'พัฒนาซอฟต์แวร์', type: 'Department', headName: 'Charlie', color: '#4F868C', headcount: 30 },
  { id: '8', parentId: '3', nameEN: 'Infrastructure', nameTH: 'โครงสร้างพื้นฐาน', type: 'Department', headName: 'Dave', color: '#4F868C', headcount: 10 },
];

const COLORS = ['#4F868C', '#186B8C', '#D95032', '#F2B705', '#10B981', '#6366F1'];

// --- Recursive Tree Node Component ---
const TreeNode: React.FC<{ node: OrgNode; onEdit: (node: OrgNode) => void; onAdd: (node: OrgNode) => void; onDelete: (node: OrgNode) => void }> = ({ node, onEdit, onAdd, onDelete }) => {
  return (
    <li>
      <div 
        className="bg-white border border-gray-200 rounded-xl inline-block min-w-[200px] max-w-[240px] shadow-sm transition-all relative z-10 cursor-pointer hover:shadow-lg hover:-translate-y-1 hover:border-brandTeal group"
        onClick={(e) => { e.stopPropagation(); onEdit(node); }}
      >
        {/* Top Color Bar */}
        <div className="h-1.5 w-12 rounded-full mx-auto mt-3 mb-2" style={{ backgroundColor: node.color || '#CBD5E1' }}></div>
        
        <div className="px-4 pb-2">
            <div className="font-bold text-sm text-sidebarBg leading-tight">{node.nameEN}</div>
            <div className="text-[10px] text-gray-400 font-sans mt-0.5">{node.nameTH}</div>
        </div>
        
        <div className="mt-2 px-4 py-3 border-t border-gray-100 flex items-center justify-between bg-gray-50/50 rounded-b-xl">
            <div className="flex items-center gap-2">
                {node.headName ? (
                    <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-lg border border-gray-100 shadow-sm">
                        <div className="w-5 h-5 rounded-full bg-gray-200 overflow-hidden shrink-0">
                            <img src={`https://ui-avatars.com/api/?name=${node.headName}&background=random`} className="w-full h-full object-cover" alt="head" />
                        </div>
                        <span className="text-[10px] font-bold text-gray-600 truncate max-w-[60px]">{node.headName.split(' ')[0]}</span>
                    </div>
                ) : (
                    <div className="text-[9px] text-gray-300 italic px-2">No Head</div>
                )}
            </div>
            
            <div className="flex items-center gap-1 text-[10px] font-bold text-brandDeepBlue bg-brandDeepBlue/5 px-2 py-1 rounded-lg border border-brandDeepBlue/10">
                <Users className="w-3 h-3" /> {node.headcount || 0}
            </div>
        </div>

        {/* Hover Actions */}
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto scale-90 group-hover:scale-100">
            <button 
                className="w-7 h-7 rounded-full bg-brandBlue hover:bg-brandDeepBlue flex items-center justify-center text-white shadow-md transition-colors border-2 border-white" 
                onClick={(e) => { e.stopPropagation(); onAdd(node); }} 
                title="Add Child"
            >
                <Plus className="w-4 h-4" />
            </button>
            <button 
                className="w-7 h-7 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white shadow-md transition-colors border-2 border-white" 
                onClick={(e) => { e.stopPropagation(); onDelete(node); }} 
                title="Delete"
            >
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
      </div>
      
      {node.children && node.children.length > 0 && (
        <ul>
          {node.children.map(child => (
            <TreeNode 
                key={child.id} 
                node={child} 
                onEdit={onEdit} 
                onAdd={onAdd} 
                onDelete={onDelete} 
            />
          ))}
        </ul>
      )}
    </li>
  );
};

const OrgStructure = () => {
  const [currentView, setCurrentView] = useState<'chart' | 'list'>('chart');
  const [rawData, setRawData] = useState<OrgNode[]>(MOCK_DATA);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [parentNode, setParentNode] = useState<OrgNode | null>(null);
  const [form, setForm] = useState<OrgNode>({ id: '', parentId: null, nameEN: '', nameTH: '', type: 'Department', headName: '', costCenter: '', color: '#4F868C', headcount: 0 });

  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleWheel = (e: React.WheelEvent) => {
    if (currentView !== 'chart') return;
    // e.preventDefault(); // React synthetic events can't prevent default passive wheel
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale(prev => Math.min(Math.max(prev * delta, 0.3), 2));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (currentView !== 'chart') return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || currentView !== 'chart') return;
    setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // --- Data Processing ---
  const buildTree = (items: OrgNode[], parentId: string | null = null, level = 0): OrgNode[] => {
    return items
        .filter(item => item.parentId === parentId)
        .map(item => ({
            ...item,
            level: level,
            children: buildTree(items, item.id, level + 1)
        }));
  };

  const treeData = useMemo(() => {
    const tree = buildTree(rawData);
    return tree.length ? tree[0] : null;
  }, [rawData]);

  const flatList = useMemo(() => {
    let list = rawData.map(item => {
        let level = 0;
        let current = item;
        while(current.parentId) {
            level++;
            const parent = rawData.find(p => p.id === current.parentId);
            if(parent) current = parent;
            else break;
        }
        return { ...item, level };
    });

    if (searchQuery) {
        const q = searchQuery.toLowerCase();
        list = list.filter(i => i.nameEN.toLowerCase().includes(q) || i.nameTH.toLowerCase().includes(q));
    }
    return list;
  }, [rawData, searchQuery]);

  // --- Actions ---
  const openAddModal = (parent: OrgNode | null) => {
    setIsEditing(false);
    setParentNode(parent);
    setForm({ 
        id: Date.now().toString(), 
        parentId: parent ? parent.id : null, 
        nameEN: '', 
        nameTH: '', 
        type: 'Department', 
        headName: '', 
        costCenter: '', 
        color: parent ? parent.color : '#4F868C', 
        headcount: 0 
    });
    setShowModal(true);
  };

  const openEditModal = (node: OrgNode) => {
    setIsEditing(true);
    setParentNode(null);
    setForm({ ...node });
    setShowModal(true);
  };

  const saveNode = () => {
    if (!form.nameEN) {
        Swal.fire('Error', 'Name is required', 'error');
        return;
    }

    if (isEditing) {
        setRawData(prev => prev.map(n => n.id === form.id ? form : n));
    } else {
        setRawData(prev => [...prev, form]);
    }
    
    setShowModal(false);
    Swal.fire('Saved', 'Organization unit updated.', 'success');
  };

  const confirmDelete = (node: OrgNode) => {
    Swal.fire({
        title: 'Are you sure?',
        text: `Delete ${node.nameEN} and all sub-units?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#D91604'
    }).then((result) => {
        if (result.isConfirmed) {
            const idsToDelete = new Set<string>();
            const collectIds = (id: string) => {
                idsToDelete.add(id);
                rawData.filter(n => n.parentId === id).forEach(child => collectIds(child.id));
            };
            collectIds(node.id);
            setRawData(prev => prev.filter(n => !idsToDelete.has(n.id)));
            Swal.fire('Deleted!', 'Unit has been removed.', 'success');
        }
    });
  };

  const getTypeColor = (type: string) => {
    switch(type) {
        case 'Company': return 'bg-gray-100 text-gray-700';
        case 'Division': return 'bg-orange-100 text-orange-700';
        case 'Department': return 'bg-blue-100 text-blue-700';
        default: return 'bg-gray-50 text-gray-500';
    }
  };

  return (
    <div className="flex flex-col h-full bg-bgPage font-sans">
        {/* Header */}
        <header className="px-8 py-6 flex flex-col md:flex-row justify-between items-center shrink-0 z-20 gap-4">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-gradient-to-br from-sidebarBg to-brandDeepBlue text-brandGold shadow-lg">
                    <Network className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-sidebarBg tracking-tight">ORG STRUCTURE</h1>
                    <p className="text-brandTeal text-xs font-bold uppercase tracking-widest">Master Data Management</p>
                </div>
            </div>
            
            <div className="flex items-center gap-3">
                <nav className="flex bg-white border border-gray-100 p-1 rounded-lg shadow-sm">
                    <button 
                        onClick={() => setCurrentView('chart')} 
                        className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${currentView === 'chart' ? 'bg-sidebarBg text-brandGold shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        <GitBranch className="w-4 h-4" /> CHART
                    </button>
                    <button 
                        onClick={() => setCurrentView('list')} 
                        className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${currentView === 'list' ? 'bg-sidebarBg text-brandGold shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        <List className="w-4 h-4" /> LIST
                    </button>
                </nav>
                <div className="h-8 w-[1px] bg-gray-200 mx-2"></div>
                <button 
                    onClick={() => exportToGoogleSheets(flatList, 'OrgStructure')} 
                    className="bg-green-50 border border-green-200 text-green-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-100 flex items-center gap-2 transition-colors"
                >
                    <FileSpreadsheet className="w-4 h-4" /> Sync to Sheets
                </button>
                <button onClick={() => Swal.fire('Export', 'Exporting chart...', 'info')} className="bg-white border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-gray-50 flex items-center gap-2">
                    <Download className="w-4 h-4" /> Export
                </button>
            </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 relative overflow-hidden bg-[#F2F0EB]">
            {/* VIEW: CHART */}
            {currentView === 'chart' && (
                <div 
                    className="w-full h-full relative overflow-hidden cursor-grab active:cursor-grabbing"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onWheel={handleWheel}
                >
                    <div 
                        className="absolute top-0 left-0 min-w-full min-h-full flex justify-center pt-20 transition-transform duration-100 ease-out origin-top-left"
                        style={{ transform: `translate(${position.x}px, ${position.y}px) scale(${scale})` }}
                    >
                        <div className="org-tree">
                            {treeData ? (
                                <ul>
                                    <TreeNode 
                                        node={treeData} 
                                        onEdit={openEditModal} 
                                        onAdd={openAddModal} 
                                        onDelete={confirmDelete} 
                                    />
                                </ul>
                            ) : (
                                <div className="flex flex-col items-center justify-center mt-20 opacity-50">
                                    <Layers className="w-16 h-16 mb-4 text-gray-400" />
                                    <p className="text-gray-500 font-bold">No structure defined.</p>
                                    <button onClick={() => openAddModal(null)} className="mt-4 px-4 py-2 bg-brandDeepBlue text-white rounded-lg text-sm font-bold shadow hover:bg-brandBlue">Create Root Node</button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Zoom Controls */}
                    <div className="absolute bottom-5 right-5 bg-white p-1 rounded-lg shadow-lg flex flex-col gap-1 z-20">
                        <button onClick={() => setScale(s => Math.min(s * 1.1, 2))} className="p-2 hover:bg-gray-100 rounded text-gray-600"><Plus className="w-4 h-4" /></button>
                        <button onClick={() => setScale(s => Math.max(s * 0.9, 0.3))} className="p-2 hover:bg-gray-100 rounded text-gray-600"><Minus className="w-4 h-4" /></button>
                        <button onClick={() => { setScale(1); setPosition({x:0, y:0}); }} className="p-2 hover:bg-gray-100 rounded text-gray-600"><Maximize className="w-4 h-4" /></button>
                    </div>
                </div>
            )}

            {/* VIEW: LIST */}
            {currentView === 'list' && (
                <div className="p-8 h-full overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-white rounded-2xl shadow-soft border border-white overflow-hidden w-full">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-sidebarBg">Organization Units</h3>
                            <div className="relative w-64">
                                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                <input 
                                    type="text" 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search department..." 
                                    className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm w-full focus:outline-none focus:border-brandTeal"
                                />
                            </div>
                        </div>
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase w-20">Level</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Unit Name (EN/TH)</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Type</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Head of Unit</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase text-center">Headcount</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {flatList.map(node => (
                                    <tr key={node.id} className="hover:bg-gray-50">
                                        <td className="p-4 text-xs text-gray-400 font-mono">{node.level}</td>
                                        <td className="p-4">
                                            <div className="font-bold text-sm text-sidebarBg">{node.nameEN}</div>
                                            <div className="text-[10px] text-gray-400 font-sans">{node.nameTH}</div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getTypeColor(node.type)}`}>
                                                {node.type}
                                            </span>
                                        </td>
                                        <td className="p-4 flex items-center gap-2">
                                            {node.headName && (
                                                <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden shrink-0">
                                                    <img src={`https://ui-avatars.com/api/?name=${node.headName}&background=random`} className="w-full h-full object-cover" alt="head" />
                                                </div>
                                            )}
                                            <span className="text-xs text-gray-600">{node.headName || '-'}</span>
                                        </td>
                                        <td className="p-4 text-center text-xs font-bold text-brandDeepBlue">{node.headcount}</td>
                                        <td className="p-4 text-center">
                                            <button onClick={() => openEditModal(node)} className="text-gray-400 hover:text-brandBlue"><Edit2 className="w-4 h-4" /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </main>

        {/* MODAL */}
        <BaseModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            title={isEditing ? 'Edit Unit' : 'Add Sub-Unit'}
            icon={isEditing ? Edit : PlusCircle}
            size="md"
        >
            <div className="space-y-4">
                {parentNode && !isEditing && (
                    <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-700 mb-4">
                        Adding child to: <strong>{parentNode.nameEN}</strong>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Name (EN)</label>
                        <input type="text" value={form.nameEN} onChange={e => setForm({...form, nameEN: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-brandTeal outline-none" placeholder="e.g. Human Resources" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Name (TH)</label>
                        <input type="text" value={form.nameTH} onChange={e => setForm({...form, nameTH: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-brandTeal outline-none font-sans" placeholder="e.g. ฝ่ายบุคคล" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Unit Type</label>
                        <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-brandTeal outline-none">
                            <option value="Company">Company</option>
                            <option value="Division">Division</option>
                            <option value="Department">Department</option>
                            <option value="Section">Section</option>
                            <option value="Team">Team</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Color Code</label>
                        <div className="flex gap-2 mt-1">
                            {COLORS.map(color => (
                                <div 
                                    key={color} 
                                    onClick={() => setForm({...form, color})}
                                    className={`w-6 h-6 rounded-full cursor-pointer ring-2 ring-offset-2 ${form.color === color ? 'ring-gray-400' : 'ring-transparent'}`}
                                    style={{ backgroundColor: color }}
                                ></div>
                            ))}
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Head of Unit</label>
                    <input type="text" value={form.headName} onChange={e => setForm({...form, headName: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-brandTeal outline-none" placeholder="Employee Name" />
                </div>
                
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Cost Center Code</label>
                    <input type="text" value={form.costCenter} onChange={e => setForm({...form, costCenter: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-brandTeal outline-none font-mono" placeholder="CC-XXXX" />
                </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                <button onClick={() => setShowModal(false)} className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button onClick={saveNode} className="px-6 py-2 bg-brandDeepBlue text-white text-xs font-bold rounded-lg shadow hover:bg-brandBlue">Save</button>
            </div>
        </BaseModal>
    </div>
  );
};

export default OrgStructure;
