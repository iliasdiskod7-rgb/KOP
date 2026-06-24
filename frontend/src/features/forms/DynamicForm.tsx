import Ypodeigma2Form from './ypodeigma2/Ypodeigma2Form';

interface DynamicFormProps {
  id: number;
}

export default function DynamicForm({ id }: DynamicFormProps) {
  if (id === 2) {
    return <Ypodeigma2Form />;
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-slate-100">
      <h1 className="text-2xl font-bold text-slate-800 mb-2">ΥΠΟΔΕΙΓΜΑ {id}</h1>
      <p className="text-slate-600">Η φόρμα για το Υπόδειγμα {id} είναι υπό κατασκευή.</p>
    </div>
  );
}
