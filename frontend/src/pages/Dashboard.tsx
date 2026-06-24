import { Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import DynamicForm from '../features/forms/DynamicForm';

interface DashboardProps {
  onLogout: () => void;
  username: string;
}

function DashboardHome() {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-slate-100">
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Καρτέλα: ΥΠΟΛ ΚΩΠ</h1>
    </div>
  );
}

function DashboardFormRoute() {
  const { id } = useParams();
  const parsedId = Number(id);

  if (!Number.isInteger(parsedId) || parsedId < 1) {
    return <Navigate to="/dashboard/ypologismos" replace />;
  }

  return <DynamicForm id={parsedId} />;
}

export default function Dashboard({ onLogout, username }: DashboardProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const activeTab = location.pathname.startsWith('/dashboard/ypodeigma/')
    ? `ypodeigma${location.pathname.split('/').at(-1) ?? ''}`
    : 'ypologismos';

  const handleTabChange = (tab: string) => {
    if (tab === 'ypologismos') {
      navigate('/dashboard/ypologismos');
      return;
    }

    const id = tab.replace('ypodeigma', '');
    navigate(`/dashboard/ypodeigma/${id}`);
  };

  return (
    <div className="flex-grow bg-slate-50">
      <Navbar
        activeTab={activeTab}
        onLogout={onLogout}
        onTabChange={handleTabChange}
        username={username}
      />

      <main className="max-w-7xl mx-auto p-8">
        <Routes>
          <Route index element={<Navigate to="ypologismos" replace />} />
          <Route path="ypologismos" element={<DashboardHome />} />
          <Route path="ypodeigma/:id" element={<DashboardFormRoute />} />
          <Route path="*" element={<Navigate to="ypologismos" replace />} />
        </Routes>
      </main>
    </div>
  );
}
