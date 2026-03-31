"use client";

import { useState } from "react";
import { useGroceryItems } from "@/lib/use-grocery-items";
import { useMasterList } from "@/lib/use-master-list";

type EditingItem = { catId: string; itemId: string; name: string; toCatId: string };

export function MasterList() {
  const { items: groceryItems, addItem: addToGrocery } = useGroceryItems();
  const { categories, deleteCategory, renameCategory, addItem, deleteItem, renameItem, moveItem } = useMasterList();

  const [added, setAdded] = useState<Set<string>>(new Set());
  const [editingItem, setEditingItem] = useState<EditingItem | null>(null);
  const [addingItemCatId, setAddingItemCatId] = useState<string | null>(null);
  const [newItemName, setNewItemName] = useState("");
  const [editingCat, setEditingCat] = useState<{ id: string; name: string } | null>(null);

  function handleAddToGrocery(name: string) {
    addToGrocery(name);
    setAdded((prev) => new Set(prev).add(name));
  }

  function isInList(name: string) {
    return added.has(name) || groceryItems.some((i) => i.name === name && !i.bought);
  }

  function startEditItem(catId: string, itemId: string, name: string) {
    setEditingItem({ catId, itemId, name, toCatId: catId });
    setAddingItemCatId(null);
    setEditingCat(null);
  }

  function saveEditItem() {
    if (!editingItem) return;
    const { catId, itemId, name, toCatId } = editingItem;
    if (name.trim()) renameItem(catId, itemId, name.trim());
    if (toCatId !== catId) moveItem(catId, itemId, toCatId);
    setEditingItem(null);
  }

  function confirmDeleteItem(catId: string, itemId: string) {
    deleteItem(catId, itemId);
    setEditingItem(null);
  }

  function saveNewItem(catId: string) {
    if (newItemName.trim()) {
      addItem(catId, newItemName.trim());
      setNewItemName("");
      setAddingItemCatId(null);
    }
  }


  return (
    <div className="flex flex-col gap-4 pb-4">
      {categories.map((cat) => (
        <div key={cat.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

          {/* Category header */}
          {editingCat?.id === cat.id ? (
            <div className="flex items-center gap-2 px-4 pt-3 pb-2">
              <input
                autoFocus
                value={editingCat.name}
                onChange={(e) => setEditingCat({ ...editingCat, name: e.target.value })}
                className="flex-1 text-xs font-medium bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 outline-none focus:border-emerald-400"
                style={{ fontSize: "16px" }}
              />
              <button onClick={() => { renameCategory(cat.id, editingCat.name); setEditingCat(null); }} className="text-xs text-emerald-600 font-semibold px-2">Save</button>
              <button onClick={() => { if (confirm(`Delete category "${cat.name}" and all its items?`)) deleteCategory(cat.id); setEditingCat(null); }} className="text-xs text-red-400 font-semibold px-2">Delete</button>
              <button onClick={() => setEditingCat(null)} className="text-xs text-gray-400 px-2">Cancel</button>
            </div>
          ) : (
            <div className="flex items-center justify-between px-4 pt-3 pb-2">
              <p className="text-xs text-gray-400 uppercase tracking-widest font-medium">{cat.name}</p>
              <button onClick={() => { setEditingCat({ id: cat.id, name: cat.name }); setEditingItem(null); }} className="text-gray-300 hover:text-gray-500 p-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828A2 2 0 0110 16H8v-2a2 2 0 01.586-1.414z" />
                </svg>
              </button>
            </div>
          )}

          {/* Items */}
          <ul className="divide-y divide-gray-50">
            {cat.items.map((item) => (
              <li key={item.id}>
                {editingItem?.itemId === item.id ? (
                  /* Edit mode */
                  <div className="px-4 py-3 flex flex-col gap-2 bg-gray-50">
                    <input
                      autoFocus
                      value={editingItem.name}
                      onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                      className="w-full text-sm bg-white border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-emerald-400"
                      style={{ fontSize: "16px" }}
                    />
                    <div className="flex items-center gap-2">
                      <select
                        value={editingItem.toCatId}
                        onChange={(e) => setEditingItem({ ...editingItem, toCatId: e.target.value })}
                        className="flex-1 text-xs bg-white border border-gray-200 rounded-lg px-2 py-1.5 outline-none"
                        style={{ fontSize: "16px" }}
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                      <button onClick={saveEditItem} className="text-xs bg-emerald-600 text-white rounded-lg px-3 py-1.5 font-medium">Save</button>
                      <button onClick={() => confirmDeleteItem(cat.id, item.id)} className="text-xs bg-red-50 text-red-500 rounded-lg px-3 py-1.5 font-medium">Delete</button>
                    </div>
                    <button onClick={() => setEditingItem(null)} className="text-xs text-gray-400 text-center">Cancel</button>
                  </div>
                ) : (
                  /* Normal mode */
                  <div className="flex items-center gap-3 px-4 py-3">
                    <span className="text-sm text-gray-700 flex-1">{item.name}</span>
                    <button
                      onClick={() => startEditItem(cat.id, item.id, item.name)}
                      className="text-gray-300 hover:text-gray-500 p-1 flex-shrink-0"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828A2 2 0 0110 16H8v-2a2 2 0 01.586-1.414z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleAddToGrocery(item.name)}
                      disabled={isInList(item.name)}
                      className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                        isInList(item.name) ? "bg-emerald-100 text-emerald-500 cursor-default" : "bg-emerald-600 text-white active:scale-90"
                      }`}
                    >
                      {isInList(item.name) ? (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 5v14M5 12h14" />
                        </svg>
                      )}
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>

          {/* Add item to category */}
          {addingItemCatId === cat.id ? (
            <div className="flex items-center gap-2 px-4 py-3 border-t border-gray-50">
              <input
                autoFocus
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveNewItem(cat.id)}
                placeholder="Item name..."
                className="flex-1 text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-emerald-400"
                style={{ fontSize: "16px" }}
              />
              <button onClick={() => saveNewItem(cat.id)} className="text-xs bg-emerald-600 text-white rounded-lg px-3 py-1.5 font-medium">Add</button>
              <button onClick={() => { setAddingItemCatId(null); setNewItemName(""); }} className="text-xs text-gray-400">Cancel</button>
            </div>
          ) : (
            <button
              onClick={() => { setAddingItemCatId(cat.id); setEditingItem(null); setNewItemName(""); }}
              className="w-full flex items-center gap-2 px-4 py-2.5 border-t border-gray-50 text-emerald-600 hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14M5 12h14" />
              </svg>
              <span className="text-xs font-medium">Add item</span>
            </button>
          )}
        </div>
      ))}

    </div>
  );
}
