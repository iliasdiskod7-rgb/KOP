import haf from '../assets/haf1.png';

export default function Footer() {
  return (
    <footer className="w-full bg-slate-800 text-slate-300 text-xs py-4 px-6 border-t border-slate-700 shadow-inner">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-3 text-center">
        <span>© 2026 ΓΕΝΙΚΟ ΕΠΙΤΕΛΕΙΟ ΑΕΡΟΠΟΡΙΑΣ - Κέντρο Μηχανογράφησης. All rights reserved.</span>
        <img src={haf} alt="Logo" className="w-7 h-7 object-contain" />
      </div>
    </footer>
  );
}
