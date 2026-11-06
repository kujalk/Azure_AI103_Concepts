import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import modules, { pathFor } from '../data/modules';
import domains from '../data/domains';

const linkCls = ({ isActive }) => `flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm ${isActive ? 'bg-azure-500 font-medium text-white' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`;

export default function Layout() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <div className="min-h-screen">
      <button type="button" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => setOpen(!open)}
        className="fixed left-3 top-3 z-50 rounded-lg bg-azure-900 px-3 py-2 text-sm font-semibold text-white shadow lg:hidden">
        {open ? 'Close' : 'Menu'}
      </button>
      <aside className={`fixed left-0 top-0 z-40 h-full w-72 overflow-y-auto bg-azure-900 pb-8 transition-transform lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <Link to="/" onClick={close} className="block px-4 pb-3 pt-14 lg:pt-5">
          <div className="text-lg font-bold text-white">AI-103 Study Guide</div>
          <div className="text-xs text-slate-300">Azure AI Apps and Agents Developer</div>
        </Link>
        <nav className="space-y-4 px-2" aria-label="Study modules">
          <div className="space-y-0.5">
            <NavLink end to="/" onClick={close} className={linkCls}><span aria-hidden="true">🏠</span>Home</NavLink>
            <NavLink to="/exam-guide" onClick={close} className={linkCls}><span aria-hidden="true">🗺️</span>Exam map & checklist</NavLink>
            <NavLink to="/mock-exam" onClick={close} className={linkCls}><span aria-hidden="true">📝</span>Practice exam</NavLink>
          </div>
          {domains.map(d => (
            <div key={d.id}>
              <div className="mb-1 flex items-baseline justify-between px-2.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                <span>{d.short}</span><span className="font-normal normal-case">{d.weight}</span>
              </div>
              <div className="space-y-0.5">
                {modules.filter(m => m.domain === d.id).map(m => (
                  <NavLink key={m.id} to={pathFor(m.id)} onClick={close} className={linkCls}>
                    <span aria-hidden="true">{m.icon}</span><span>{m.title}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>
      {open && <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={close} aria-hidden="true" />}
      <main className="min-h-screen lg:ml-72"><Outlet /></main>
    </div>
  );
}
