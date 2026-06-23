import { useState } from 'react';
interface DynamicFormProps {
  id: number;
}
interface CostRow {
  kodikas: string;
  epipedoAnalysis: number; // 1 έως 6 (για το πού θα μπει το 'X')
  titlos: string;
  kostosMnm?: number;      // Προαιρετικά πεδία για τα ποσά
  kostosPmpa?: number;
  id?: string;
}

export default function DynamicForm({ id }: DynamicFormProps) {
  // ΔΕΔΟΜΕΝΑ ΓΙΑ ΤΟΝ ΠΙΝΑΚΑ 1Α (Πλέον είναι State για να είναι δυναμικά)
  const [rows1A, setRows1A] = useState<CostRow[]>([
    { id: '1a-1', kodikas: '1.1', epipedoAnalysis: 1, titlos: 'Πληρώματα Μοίρας Α/Φ-Ε/Π' },
    { id: '1a-2', kodikas: '1.2', epipedoAnalysis: 2, titlos: 'Προσωπικό Συντήρησης' },
    { id: '1a-3', kodikas: '1.2.1', epipedoAnalysis: 3, titlos: 'Προσωπικό Συντήρησης D-Level (Μοίρας Α/Φ-Ε/Π)' },
  ]);

  // ΔΕΔΟΜΕΝΑ ΓΙΑ ΤΟΝ ΠΙΝΑΚΑ 1Β (Πλέον είναι State)
  const [rows1B, setRows1B] = useState<CostRow[]>([
    { id: '1b-1', kodikas: '1.2.2', epipedoAnalysis: 3, titlos: 'Προσωπικό Συντήρησης Η-Επεξ (ΜΣΕ/ΜΕΑ)' },
    { id: '1b-2', kodikas: '1.3', epipedoAnalysis: 1, titlos: 'Προσωπικό Μονάδας για την υποστήριξη του Π.Ε.' },
    { id: '1b-3', kodikas: '1.3.1', epipedoAnalysis: 3, titlos: 'Προσκολλημένο Ιπτάμενο Προσωπικό Εντός Μονάδων' },
    { id: '1b-4', kodikas: '1.3.2', epipedoAnalysis: 3, titlos: 'ΑΕΠ' },
    { id: '1b-5', kodikas: '1.3.2.1', epipedoAnalysis: 4, titlos: 'Τμ. Επιχ. Σχεδίασης' },
  ]);

  // Αν δεν είναι το Υπόδειγμα 2, δείξε ένα απλό placeholder για τώρα
  if (id !== 2) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-md border border-slate-100">
        <h1 className="text-2xl font-bold text-slate-850 mb-2">ΥΠΟΔΕΙΓΜΑ {id}</h1>
        <p className="text-slate-650">Η φόρμα για το Υπόδειγμα {id} είναι υπό κατασκευή.</p>
      </div>
    );
  }

  // Συνάρτηση που σχεδιάζει έναν πίνακα (Reusable Table Generator)
  const renderTable = (title: string, subtitle: string, rows: CostRow[], setRows: React.Dispatch<React.SetStateAction<CostRow[]>>) => {
    
    const handleAddRow = () => {
      setRows([...rows, { id: Date.now().toString() + Math.random(), kodikas: '', epipedoAnalysis: 1, titlos: '' }]);
    };

    const handleRemoveRow = (index: number) => {
      const newRows = [...rows];
      newRows.splice(index, 1);
      setRows(newRows);
    };

    const updateRow = <K extends keyof CostRow>(index: number, field: K, value: CostRow[K]) => {
      const newRows = [...rows];
      newRows[index] = { ...newRows[index], [field]: value } as CostRow;
      setRows(newRows);
    };

    return (
      <div className="mb-8 overflow-x-auto shadow-sm rounded-xl border border-slate-200 bg-white">
      <div className="bg-cyan-100 text-blue-800 px-4 py-3 font-bold text-sm tracking-wide border-b border-cyan-200 uppercase">
        {title}: {subtitle}
      </div>
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
            <th className="p-3 border-r border-slate-200 w-16 text-center">ΚΩΔΙΚΑΣ</th>
            <th className="p-3 border-r border-slate-200 w-32 text-center">ΕΠΙΠΕΔΟ ΑΝΑΛΥΣΗΣ (1-6)</th>
            <th className="p-3 border-r border-slate-200">ΤΙΤΛΟΣ ΣΤΟΙΧΕΙΟΥ ΚΟΣΤΟΥΣ</th>
            <th className="p-3 border-r border-slate-200 w-32 text-center">ΚΟΣΤΟΣ (mnm / πχ 331)</th>
            <th className="p-3 border-r border-slate-200 w-32 text-center">ΚΟΣΤΟΣ (πμπα / πχ 332)</th>
            <th className="p-3 w-10 text-center"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row, idx) => (
            <tr key={row.id || idx} className="hover:bg-slate-50 transition-colors">
              {/* Κωδικός */}
              <td className="p-2.5 border-r border-slate-200 text-center font-mono font-bold text-slate-600">
                <input 
                  type="text" 
                  value={row.kodikas}
                  onChange={(e) => updateRow(idx, 'kodikas', e.target.value)}
                  className="w-full text-center bg-transparent focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-400 rounded px-1 py-1"
                  placeholder="Κωδ."
                />
              </td>
              
              {/* Επίπεδο Ανάλυσης (1-6 πλέγμα) */}
              <td className="p-1 border-r border-slate-200 cursor-pointer">
                <div className="grid grid-cols-6 text-center font-bold text-blue-600 h-full">
                  {Array.from({ length: 6 }, (_, colIdx) => colIdx + 1).map((num) => (
                    <div 
                      key={num} 
                      onClick={() => updateRow(idx, 'epipedoAnalysis', num)}
                      className={`py-1 hover:bg-blue-100 transition-colors ${num !== 6 ? 'border-r border-slate-150' : ''}`}
                    >
                      {row.epipedoAnalysis === num ? 'X' : ''}
                    </div>
                  ))}
                </div>
              </td>

              {/* Τίτλος (Με indentation/περιθώριο ανάλογα με το επίπεδο ανάλυσης για εφέ δέντρου) */}
              <td className="p-2.5 border-r border-slate-200 font-medium text-slate-800" style={{ paddingLeft: `${row.epipedoAnalysis * 12}px` }}>
                <input 
                  type="text" 
                  value={row.titlos}
                  onChange={(e) => updateRow(idx, 'titlos', e.target.value)}
                  className="w-full bg-transparent focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-400 rounded px-2 py-1"
                  placeholder="Πληκτρολογήστε τίτλο..."
                />
              </td>

              {/* Inputs για τα Κόστη */}
              <td className="p-1 border-r border-slate-200">
                <input 
                  type="number" 
                  value={row.kostosMnm || ''}
                  onChange={(e) => updateRow(idx, 'kostosMnm', e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder="0.00" 
                  className="w-full px-2 py-1.5 text-right bg-slate-50 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </td>
              <td className="p-1 border-r border-slate-200">
                <input 
                  type="number" 
                  value={row.kostosPmpa || ''}
                  onChange={(e) => updateRow(idx, 'kostosPmpa', e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder="0.00" 
                  className="w-full px-2 py-1.5 text-right bg-slate-50 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </td>
              {/* Κουμπί Διαγραφής */}
              <td className="p-1 text-center bg-slate-50">
                <button 
                  onClick={() => handleRemoveRow(idx)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-100 p-1.5 rounded transition-colors"
                  title="Διαγραφή Γραμμής"
                >
                  ✖
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Κουμπί Προσθήκης Γραμμής */}
      <div className="bg-slate-50 p-2 border-t border-slate-200 flex justify-center">
        <button 
          onClick={handleAddRow}
          className="flex items-center space-x-2 text-sm font-semibold text-blue-600 hover:text-blue-800 bg-blue-100 hover:bg-blue-200 px-4 py-1.5 rounded-lg transition-colors"
        >
          <span>+ Προσθήκη Γραμμής</span>
        </button>
      </div>
    </div>
    );
  };

  return (
    <div className="w-full bg-slate-50 p-6 rounded-2xl shadow-lg border border-slate-100 font-sans">
      
    

      {/* ΣΥΜΠΛΗΡΩΜΑΤΙΚΑ ΣΤΟΙΧΕΙΑ ΜΟΝΑΔΑΣ */}
    
      {/* ΠΙΝΑΚΕΣ */}
      {renderTable('1Α', 'Οδοιπορικά Έξοδα Μετακινήσεων Πληρωμάτων Α/Φ και Προσωπικού Συντήρησης Μοιρών Α/Φ', rows1A, setRows1A)}
      {renderTable('1Β', 'Οδοιπορικά Έξοδα Μετακινήσεων Λοιπών Μοιρών-Επιστασιών-Τμημάτων Άμεσης Υποστήριξης Πτητικού Έργου', rows1B, setRows1B)}

      {/* ΤΕΛΙΚΟ ΚΟΥΜΠΙ ΥΠΟΒΟΛΗΣ */}
      <div className="flex justify-end mt-6">
        <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all uppercase text-sm tracking-wider">
          Αποθηκευση Αναφορας
        </button>
      </div>

    </div>
  );
}