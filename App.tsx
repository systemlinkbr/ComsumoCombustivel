import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { FuelEntry, ViewState } from './types';
import { calculateStats, generateId } from './utils';
import { Dashboard } from './components/Dashboard';
import { AddEntryForm } from './components/AddEntryForm';
import { HistoryList } from './components/HistoryList';
import { LayoutGrid, Plus, History, Trash2 } from 'lucide-react';

const App: React.FC = () => {
  const [entries, setEntries] = useState<FuelEntry[]>([]);
  const [view, setView] = useState<ViewState>('dashboard');
  const [toast, setToast] = useState<string | null>(null);
  const [editingEntry, setEditingEntry] = useState<FuelEntry | null>(null);
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);

  // Load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('gastrack-entries');
    if (saved) {
      try {
        const parsedData = JSON.parse(saved);
        // Patch existing entries that might be missing IDs (legacy data support)
        const patchedData = parsedData.map((e: any) => ({
          ...e,
          id: e.id || generateId()
        }));
        setEntries(patchedData);
      } catch (e) {
        console.error("Failed to parse entries", e);
      }
    }
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem('gastrack-entries', JSON.stringify(entries));
  }, [entries]);

  const handleSaveEntry = (newEntry: Omit<FuelEntry, 'id'>) => {
    // Check if we are editing an existing entry
    if (editingEntry) {
      const updatedList = entries.map(entry => {
        if (entry.id === editingEntry.id) {
          return { ...newEntry, id: entry.id };
        }
        return entry;
      }).sort((a, b) => b.odometer - a.odometer);
      
      setEntries(updatedList);
      setEditingEntry(null);
      showToast('Registro atualizado com sucesso!');
    } else {
      // Creating new entry
      const entry: FuelEntry = {
        ...newEntry,
        id: generateId(),
      };
      // Prepend (or resort)
      const updated = [entry, ...entries].sort((a, b) => b.odometer - a.odometer);
      setEntries(updated);
      showToast('Abastecimento salvo com sucesso!');
    }
    
    setView('history');
  };

  const handleDeleteRequest = (id: string) => {
    setEntryToDelete(id);
  };

  const confirmDelete = () => {
    if (!entryToDelete) return;

    // Use String() comparison to be safe against any legacy data type mismatches
    setEntries(prevEntries => prevEntries.filter(e => String(e.id) !== String(entryToDelete)));
    
    // If we are currently editing the entry being deleted, clear the edit state
    if (editingEntry && String(editingEntry.id) === String(entryToDelete)) {
      setEditingEntry(null);
      if (view === 'edit') {
          setView('history');
      }
    }

    showToast('Registro excluído com sucesso.');
    setEntryToDelete(null);
  };

  const handleEditClick = (entry: FuelEntry) => {
    setEditingEntry(entry);
    setView('edit');
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Derived state
  const stats = calculateStats(entries);
  const lastOdometer = entries.length > 0 
    ? Math.max(...entries.map(e => e.odometer)) 
    : 0;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex justify-center">
      <div className="w-full max-w-md bg-slate-50 min-h-screen relative shadow-2xl flex flex-col">
        
        {/* Main Content Area */}
        <main className="flex-1 p-6 overflow-y-auto no-scrollbar">
          {view === 'dashboard' && <Dashboard stats={stats} />}
          {view === 'add' && <AddEntryForm onSave={handleSaveEntry} lastOdometer={lastOdometer} />}
          {view === 'edit' && <AddEntryForm onSave={handleSaveEntry} lastOdometer={lastOdometer} initialData={editingEntry} key="edit-form" />}
          {view === 'history' && <HistoryList entries={entries} onEdit={handleEditClick} onDelete={handleDeleteRequest} />}
        </main>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 w-full max-w-md bg-white/90 backdrop-blur-lg border-t border-slate-200 pb-safe pt-2 px-6 flex justify-between items-center z-50 h-20">
          
          <button 
            onClick={() => { setView('dashboard'); setEditingEntry(null); }}
            className={`flex flex-col items-center justify-center w-16 h-16 rounded-2xl transition-all duration-300 ${view === 'dashboard' ? 'text-brand-900 scale-105' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <LayoutGrid className={`w-6 h-6 mb-1 ${view === 'dashboard' ? 'fill-current' : ''}`} strokeWidth={view === 'dashboard' ? 0 : 2} />
            <span className="text-[10px] font-medium">Resumo</span>
          </button>

          <button 
            onClick={() => { setView('add'); setEditingEntry(null); }}
            className={`flex items-center justify-center w-14 h-14 rounded-full shadow-lg active:scale-95 transition-all -mt-8 border-4 border-slate-50 ${view === 'add' || view === 'edit' ? 'bg-brand-800 shadow-brand-900/40 text-white' : 'bg-brand-900 shadow-brand-900/30 text-white'}`}
          >
            <Plus className={`w-8 h-8 transition-transform duration-300 ${view === 'edit' ? 'rotate-45' : ''}`} />
          </button>

          <button 
            onClick={() => { setView('history'); setEditingEntry(null); }}
            className={`flex flex-col items-center justify-center w-16 h-16 rounded-2xl transition-all duration-300 ${view === 'history' ? 'text-brand-900 scale-105' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <History className={`w-6 h-6 mb-1 ${view === 'history' ? 'fill-current' : ''}`} strokeWidth={view === 'history' ? 0 : 2} />
            <span className="text-[10px] font-medium">Histórico</span>
          </button>
        </nav>

        {/* Toast Notification */}
        {toast && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full shadow-xl text-sm font-medium animate-in fade-in slide-in-from-top-4 z-[60]">
            {toast}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {entryToDelete && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xs p-6 animate-in zoom-in-95 duration-200 scale-100">
              <div className="text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                  <Trash2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Excluir registro?</h3>
                <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                  Tem certeza que deseja remover este abastecimento? Esta ação não pode ser desfeita.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setEntryToDelete(null)}
                    className="flex-1 px-4 py-3 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 transition-colors text-sm"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 shadow-lg shadow-red-200 transition-colors text-sm"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;