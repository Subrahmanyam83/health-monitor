"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useGroceryItems } from "@/lib/use-grocery-items";

export function GroceryList() {
  const { items, addItem, toggleItem, clearBought } = useGroceryItems();
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function handleAdd() {
    const name = input.trim();
    if (!name) return;
    addItem(name);
    setInput("");
    inputRef.current?.focus();
  }

  const pending = items.filter((i) => !i.bought);
  const bought = items.filter((i) => i.bought);

  return (
    <div className="flex flex-col gap-4">
      {/* Add item */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="Add an item..."
            className="flex-1 text-sm bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all placeholder:text-gray-300"
            style={{ fontSize: "16px" }}
          />
          <button
            onClick={handleAdd}
            disabled={!input.trim()}
            className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-transform"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 5v14M5 12h14" />
            </svg>
          </button>
        </div>
      </div>

      {/* Master List link */}
      <Link href="/groceries/master">
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">📋</span>
            <span className="text-sm font-medium text-emerald-700">Master List</span>
          </div>
          <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </Link>

      {/* Pending items */}
      {pending.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <p className="text-xs text-gray-400 uppercase tracking-widest font-medium px-4 pt-3 pb-2">
            To buy · {pending.length}
          </p>
          <ul className="divide-y divide-gray-50">
            {pending.map((item) => (
              <li key={item.id} className="flex items-center gap-3 px-4 py-3">
                <button
                  onClick={() => toggleItem(item.id)}
                  className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0 hover:border-emerald-500 transition-colors"
                />
                <span className="text-sm text-gray-700">{item.name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Bought items */}
      {bought.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-4 pt-3 pb-2">
            <p className="text-xs text-gray-400 uppercase tracking-widest font-medium">
              Bought · {bought.length}
            </p>
            <button
              onClick={clearBought}
              className="text-xs text-red-400 hover:text-red-600 font-medium transition-colors"
            >
              Clear
            </button>
          </div>
          <ul className="divide-y divide-gray-50">
            {bought.map((item) => (
              <li key={item.id} className="flex items-center gap-3 px-4 py-3">
                <button
                  onClick={() => toggleItem(item.id)}
                  className="w-5 h-5 rounded-full border-2 border-emerald-500 bg-emerald-500 flex-shrink-0 flex items-center justify-center transition-colors"
                >
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </button>
                <span className="text-sm text-gray-400 line-through">{item.name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {items.length === 0 && (
        <div className="text-center py-12 text-gray-300">
          <svg className="w-10 h-10 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="text-sm">Your list is empty</p>
          <p className="text-xs mt-1">Add items above or pick from the Master List</p>
        </div>
      )}
    </div>
  );
}
