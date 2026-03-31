"use client";

import Link from "next/link";
import { useState } from "react";
import { MasterList } from "@/components/groceries/MasterList";
import { useMasterList } from "@/lib/use-master-list";

export default function MasterListPage() {
  const { addCategory } = useMasterList();
  const [adding, setAdding] = useState(false);
  const [newCatName, setNewCatName] = useState("");

  function save() {
    if (newCatName.trim()) {
      addCategory(newCatName.trim());
      setNewCatName("");
      setAdding(false);
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#f8f9fc] overflow-x-hidden">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-10 w-full" style={{ background: "#059669" }}>
        {adding ? (
          <div className="w-full px-3 h-14 flex items-center gap-2">
            <input
              autoFocus
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && save()}
              placeholder="Category name..."
              className="flex-1 text-sm bg-white/20 text-white placeholder:text-emerald-200 border border-white/30 rounded-xl px-3 py-1.5 outline-none focus:bg-white/30"
              style={{ fontSize: "16px" }}
            />
            <button onClick={save} className="text-sm font-semibold text-white bg-white/20 rounded-xl px-3 py-1.5">Add</button>
            <button onClick={() => { setAdding(false); setNewCatName(""); }} className="text-sm text-emerald-200 px-2">Cancel</button>
          </div>
        ) : (
          <div className="w-full px-2 h-14 flex items-center">
            <Link href="/groceries" className="flex items-center gap-3 text-white active:opacity-70 h-full px-3 py-2">
              <svg className="w-7 h-7 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-base font-semibold tracking-tight">Master List</span>
            </Link>
            <button
              onClick={() => setAdding(true)}
              className="ml-auto flex items-center gap-1.5 text-white bg-white/20 rounded-xl px-3 py-1.5 mr-3 active:opacity-70"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 5v14M5 12h14" />
              </svg>
              <span className="text-xs font-semibold">Category</span>
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="w-full px-4 pt-20 pb-8">
        <MasterList />
      </div>
    </div>
  );
}
