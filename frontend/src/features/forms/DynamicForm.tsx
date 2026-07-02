import ProsopikoForm from './prosopiko/ProsopikoForm';
import Ypodeigma3Form from './ypodeigma3/Ypodeigma3Form';
import Ypodeigma4Form from './ypodeigma4/Ypodeigma4Form';
import Ypodeigma2Form from './ypodeigma2/Ypodeigma2Form';

interface DynamicFormProps {
  id: number;
}

export default function DynamicForm({ id }: DynamicFormProps) {
  if (id === 2) {
    return <Ypodeigma2Form />;
  }

  if (id === 3) {
    return <Ypodeigma3Form />;
  }

  if (id === 4) {
    return <Ypodeigma4Form />;
  }

  if (id === 22) {
    return <ProsopikoForm />;
  }

  return (
    <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-md">
      <h1 className="mb-2 text-2xl font-bold text-slate-800">ΥΠΟΔΕΙΓΜΑ {id}</h1>
      <p className="text-slate-600">Η φόρμα για το Υπόδειγμα {id} είναι υπό κατασκευή.</p>
    </div>
  );
}
