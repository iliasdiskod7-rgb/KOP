import { useEffect, useState, type ChangeEvent } from 'react';
import { fetchProsopikoRows } from './mockProsopikoApi';
import type { ProsopikoRow } from './types';

function formatDate(value: string) {
  if (!value) {
    return '';
  }

  return new Intl.DateTimeFormat('el-GR').format(new Date(value));
}

export default function ProsopikoForm() {
  const [rows, setRows] = useState<ProsopikoRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    fetchProsopikoRows().then((nextRows) => {
      if (!mounted) {
        return;
      }

      setRows(nextRows);
      setIsLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, []);


  const handleClassificationChange =
    (rowId: string) => (event: ChangeEvent<HTMLInputElement>) => {
      const nextValue = event.target.value;

      setRows((currentRows) =>
        currentRows.map((row) =>
          row.id === rowId
            ? {
                ...row,
                taxinomisiKodikaPinaka1Kai62: nextValue,
              }
            : row,
        ),
      );
    };

  const handleSave = () => {
    const payload = {
      rows: rows.map((row) => ({
        id: row.id,
        taxinomisiKodikaPinaka1Kai62: row.taxinomisiKodikaPinaka1Kai62,
      })),
    };

    // eslint-disable-next-line no-console
    console.log('Prosopiko save payload', payload);
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
        <p className="text-sm font-medium text-slate-600">Φόρτωση στοιχείων προσωπικού...</p>
      </div>
    );
  }

  return (
    <section className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-lg lg:p-6">
        <div className="mb-4 flex flex-col gap-3 lg:mb-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">ΠΡΟΣΩΠΙΚΟ</h1>
      
          </div>

          <div className="w-fit rounded-xl bg-slate-100 px-4 py-3 text-right text-xs font-semibold text-slate-600">
          </div>
        </div>

        <div className="rounded-xl border border-slate-300 bg-slate-50">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1280px] border-collapse text-[10px] text-slate-800 md:text-[11px] xl:min-w-0">
              <colgroup>
                <col className="w-[6%]" />
                <col className="w-[4.5%]" />
                <col className="w-[8%]" />
                <col className="w-[8%]" />
                <col className="w-[6%]" />
                <col className="w-[11%]" />
                <col className="w-[10%]" />
                <col className="w-[11%]" />
                <col className="w-[10%]" />
                <col className="w-[6.5%]" />
                <col className="w-[6.5%]" />
                <col className="w-[16%]" />
                <col className="w-[5.5%]" />
              </colgroup>

              <thead>
                <tr>
                  <th
                    colSpan={13}
                    className="border border-slate-400 bg-slate-200 px-3 py-3 text-center text-sm font-bold tracking-wide"
                  >
                    ΠΡΟΣΩΠΙΚΟ
                  </th>
                </tr>
                <tr className="bg-slate-100">
                  <th className="border border-slate-400 px-2 py-2.5 text-center font-bold leading-tight">
                    ΒΑΘΜΟΣ
                  </th>
                  <th className="border border-slate-400 px-2 py-2.5 text-center font-bold leading-tight">
                    ΕΙΔ
                  </th>
                  <th className="border border-slate-400 px-2 py-2.5 text-center font-bold leading-tight">
                    ΕΠΩΝΥΜΟ
                  </th>
                  <th className="border border-slate-400 px-2 py-2.5 text-center font-bold leading-tight">
                    ΟΝΟΜΑ
                  </th>
                  <th className="border border-slate-400 px-2 py-2.5 text-center font-bold leading-tight">
                    ΑΜΑ
                  </th>
                  <th className="border border-slate-400 px-2 py-2.5 text-center font-bold leading-tight">
                    ΕΠΙΤΕΛΕΙΟ/ΜΟΝΑΔΑ/ΥΠΗΡΕΣΙΑ
                  </th>
                  <th className="border border-slate-400 px-2 py-2.5 text-center font-bold leading-tight">
                    ΚΛΑΔΟΣ/ΜΟΙΡΑ ή άλλο
                  </th>
                  <th className="border border-slate-400 px-2 py-2.5 text-center font-bold leading-tight">
                    ΔΙΕΥΘΥΝΣΗ/ΕΠΙΣΤΑΣΙΑ ή άλλο
                  </th>
                  <th className="border border-slate-400 px-2 py-2.5 text-center font-bold leading-tight">
                    ΤΜΗΜΑ/ΓΡΑΦΕΙΟ ή άλλο
                  </th>
                  <th className="border border-slate-400 px-2 py-2.5 text-center font-bold leading-tight">
                    ΑΠΟ
                  </th>
                  <th className="border border-slate-400 px-2 py-2.5 text-center font-bold leading-tight">
                    ΕΩΣ
                  </th>
                  <th className="border border-slate-400 bg-amber-50 px-2 py-2.5 text-center font-bold leading-tight">
                    Ταξινόμηση κατά Κώδικα Πίνακα 1 και του Πίνακα 6.2
                  </th>
                  <th className="border border-slate-400 px-2 py-2.5 text-center font-bold leading-tight">
                    ΗΜΕΡΕΣ
                  </th>
                </tr>
              </thead>

              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="bg-white">
                    <td className="border border-slate-300 px-2 py-2 text-center align-middle">{row.vathmos}</td>
                    <td className="border border-slate-300 px-2 py-2 text-center align-middle">{row.eid}</td>
                    <td className="border border-slate-300 px-2 py-2 align-middle">{row.eponymo}</td>
                    <td className="border border-slate-300 px-2 py-2 align-middle">{row.onoma}</td>
                    <td className="border border-slate-300 px-2 py-2 text-center align-middle">{row.ama}</td>
                    <td className="border border-slate-300 bg-slate-50 px-2 py-2 align-middle">
                      {row.epiteleioMonadaYpiresia}
                    </td>
                    <td className="border border-slate-300 bg-slate-50 px-2 py-2 align-middle">
                      {row.kladosMoiraAllo}
                    </td>
                    <td className="border border-slate-300 bg-slate-50 px-2 py-2 align-middle">
                      {row.dieythynsiEpistasiaAllo}
                    </td>
                    <td className="border border-slate-300 bg-slate-50 px-2 py-2 align-middle">
                      {row.tmimaGrafeioAllo}
                    </td>
                    <td className="border border-slate-300 px-2 py-2 text-center align-middle">
                      {formatDate(row.apo)}
                    </td>
                    <td className="border border-slate-300 px-2 py-2 text-center align-middle">
                      {formatDate(row.eos)}
                    </td>
                    <td className="border border-slate-300 bg-amber-50 px-2 py-1.5 align-middle">
                      <input
                        type="text"
                        value={row.taxinomisiKodikaPinaka1Kai62}
                        onChange={handleClassificationChange(row.id)}
                        placeholder="Συμπλήρωση χρήστη"
                        className="w-full rounded bg-transparent px-2 py-1 text-[10px] outline-none ring-1 ring-transparent placeholder:text-slate-400 focus:bg-cyan-50 focus:ring-cyan-200 md:text-[11px]"
                      />
                    </td>
                    <td className="border border-slate-300 bg-sky-50 px-2 py-2 text-center font-semibold align-middle">
                      {row.imeres}
                    </td>
                  </tr>
                ))}

                
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition duration-200 ease-out hover:-translate-y-0.5 hover:scale-[1.02] hover:bg-emerald-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-1"
          >
            Αποθήκευση
          </button>
        </div>
      </div>
    </section>
  );
}
