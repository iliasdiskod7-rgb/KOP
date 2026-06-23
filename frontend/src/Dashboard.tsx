import { useState } from 'react';
import KOP from './assets/KOP.png';
import resultIcon from './assets/result.png';
import tableIcon from './assets/table.png';
import DynamicForm from './DynamicForm';
interface DashboardProps {
  username: string;
}

export default function Dashboard({ username }: DashboardProps) {
  // Κρατάμε σε state ποιο tab είναι ενεργό ("ypologismos" ή κάτι άλλο)
  const [activeTab, setActiveTab] = useState('ypologismos');

  return (
    <div className="flex-grow bg-slate-50">
      
      {/* ΚΕΝΤΡΙΚΟ NAVIGATION BAR */}
      <nav className="w-full bg-slate-850 text-white shadow-md px-6 py-4 flex items-center justify-between font-sans">
        
        {/* Αριστερά: Λογότυπο / ΚΩΠ */}
        <div className="flex items-center">
          <img src={KOP} alt="KOP Logo" className="w-12 h-12 object-contain" />
        </div>

        {/* Μέση: Επιλογές Μενού */}
        <div className="flex items-center space-x-8 h-full">
          
          {/* Επιλογή 1: Υπολ ΚΩΠ (Απλό Κουμπί) */}
          <button
            onClick={() => setActiveTab('ypologismos')}
            className="relative group flex flex-col items-center font-semibold tracking-wide text-black hover:text-cyan-500 transition-colors duration-300 pb-1 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-full after:h-[2px] after:bg-cyan-500 after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300 after:origin-left"
          >
            <img src={resultIcon} alt="Result Icon" className="w-6 h-6 mb-1 opacity-80 group-hover:opacity-100 transition-opacity" />
            <span>ΥΠΟΛ ΚΩΠ</span>
          </button>

          {/* Επιλογή 2: Εισ ΔεΔ (Με Dropdown στο Hover) */}
          <div className="relative group cursor-pointer py-2">
            <div className="relative flex flex-col items-center font-semibold tracking-wide text-black group-hover:text-cyan-500 transition-colors duration-300 pb-1 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-full after:h-[2px] after:bg-cyan-500 after:scale-x-0 group-hover:after:scale-x-100 after:transition-transform after:duration-300 after:origin-left">
              <img src={tableIcon} alt="Table Icon" className="w-6 h-6 mb-1 opacity-80 group-hover:opacity-100 transition-opacity" />
              <span>ΕΙΣ ΔΕΔ ▼</span>
            </div>

            {/* Η ΛΙΣΤΑ (Dropdown Menu) που εμφανίζεται στο HOVER */}
            <div className="absolute left-0 mt-2 w-48 max-h-64 overflow-y-auto bg-white text-slate-800 rounded-lg shadow-2xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-out z-50 transform origin-top -translate-y-3 group-hover:translate-y-0 scale-95 group-hover:scale-100 scroll-smooth scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
              <ul className="py-1">
                {/* Δημιουργία 21 επιλογών δυναμικά */}
                {Array.from({ length: 21 }, (_, i) => i + 1).map((num) => (
                  <li key={num}>
                    <button 
                      onClick={() => setActiveTab(`ypodeigma${num}`)}
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-cyan-100 hover:text-blue-700 transition-all duration-200 ease-in-out font-medium text-slate-700 hover:pl-5"
                    >
                      ΥΠΟΔΕΙΓΜΑ {num}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>

        {/* Δεξιά: Όνομα Χρήστη */}
        <div className="flex items-center space-x-2 bg-slate-800 px-4 py-2 rounded-lg border border-slate-700">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-bold tracking-wide text-slate-200">
            {username}
          </span>
        </div>

      </nav>

      {/* ΚΕΝΤΡΙΚΟ ΠΕΡΙΕΧΟΜΕΝΟ ΣΕΛΙΔΑΣ (Ανάλογα με το τι πατήσαμε) */}
    <main className="max-w-7xl mx-auto p-8">
  {activeTab === 'ypologismos' && (
    <div className="bg-white p-6 rounded-xl shadow-md border border-slate-100">
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Καρτέλα: Υπολ ΚΩΠ</h1>
    </div>
  )}

  {/* Καλείς το DynamicForm περνώντας του τον αριθμό ως Integer (με το Number()) */}
  {activeTab.startsWith('ypodeigma') && (
    <DynamicForm id={Number(activeTab.replace('ypodeigma', ''))} />
  )}
</main>
    </div>
  );
}