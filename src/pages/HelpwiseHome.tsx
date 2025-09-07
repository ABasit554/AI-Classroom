import React from "react";
import { NavLink } from "react-router-dom";

type SideLinkProps = {
  to: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
};

function SideLink({ to, children, icon }: SideLinkProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }: { isActive: boolean }) =>
        [
          "flex items-center gap-3 rounded-lg px-3 py-2 text-slate-700 transition-colors",
          "hover:bg-blue-50 hover:text-blue-700",
          isActive ? "bg-blue-100 text-blue-800 font-semibold" : "",
        ].join(" ")
      }
    >
      {icon}
      <span>{children}</span>
    </NavLink>
  );
}

export default function HelpwiseHome() {
  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          <aside
            className="
              w-64 shrink-0
              bg-slate-50 border border-slate-200 rounded-2xl
              p-4
              md:sticky md:top-4 md:self-start
              h-fit
            "
          >
            <div className="flex items-center gap-3 mb-4">
              <img src="/logo.png" alt="Class Connect" className="w-8 h-8" />
              <div className="font-semibold">Class Connect</div>
            </div>

            <nav className="space-y-1">
              <SideLink to="/" icon={<span className="text-slate-500">🏠</span>}>
                Home
              </SideLink>
              <SideLink to="/calendar" icon={<span className="text-slate-500">🗓️</span>}>
                Calendar
              </SideLink>
              <SideLink to="/enrolled" icon={<span className="text-slate-500">📚</span>}>
                Enrolled
              </SideLink>
              <SideLink to="/helpwise" icon={<span className="text-slate-500">🤖</span>}>
                Helpwise
              </SideLink>
              <SideLink to="/todo" icon={<span className="text-slate-500">✅</span>}>
                To-do
              </SideLink>
            </nav>

            <div className="mt-6 text-xs tracking-wide text-slate-400">
              CLASSWORK TOPICS
            </div>
          </aside>

          <main className="flex-1">
            <section className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6">
              <div className="rounded-xl bg-slate-100 h-24 md:h-32 mb-6 flex items-center px-6">
                <div className="w-1.5 h-16 rounded-full bg-slate-300 mr-4 hidden sm:block" />
                <h1 className="text-2xl md:text-4xl font-extrabold text-slate-800">
                  Teaching learning assistance platform
                </h1>
                <div className="ml-auto hidden md:block">
                  <img src="/media/helpwise-hero.png" alt="" className="h-16 opacity-90" />
                </div>
              </div>

              <h2 className="text-lg md:text-xl font-semibold text-slate-800">
                Get start on generating content and resources with help from ChatGPT
              </h2>

              <div className="mt-4 flex flex-wrap gap-4">
                <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 shadow-sm hover:shadow transition">
                  <span>👥</span>
                  <span className="font-medium text-slate-800">
                    Communication &amp; collaboration
                  </span>
                </button>

                <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 shadow-sm hover:shadow transition">
                  <span>📊</span>
                  <span className="font-medium text-slate-800">
                    Progress &amp; self-Improvement
                  </span>
                </button>

                <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 shadow-sm hover:shadow transition">
                  <span>🤝</span>
                  <span className="font-medium text-slate-800">
                    Trust &amp; Transparency
                  </span>
                </button>
              </div>
            </section>

            <section className="mt-6 rounded-2xl bg-white border border-slate-200 shadow-sm p-6">
              <div className="text-slate-600">Build your first Helpwise tools here…</div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
