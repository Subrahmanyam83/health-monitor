"use client";

import { useState, useEffect, useCallback } from "react";

export interface GroceryItem {
  id: string;
  name: string;
  bought: boolean;
}

const STORAGE_KEY = "miniapps-grocery-items";

function loadItems(): GroceryItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveItems(items: GroceryItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function useGroceryItems() {
  const [items, setItems] = useState<GroceryItem[]>([]);

  useEffect(() => {
    setItems(loadItems());
    function onStorage(e: StorageEvent) {
      if (e.key === STORAGE_KEY) setItems(loadItems());
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const updateItems = useCallback((updater: (prev: GroceryItem[]) => GroceryItem[]) => {
    setItems((prev) => {
      const next = updater(prev);
      saveItems(next);
      return next;
    });
  }, []);

  const addItem = useCallback((name: string) => {
    updateItems((prev) => {
      if (prev.some((i) => i.name.toLowerCase() === name.toLowerCase() && !i.bought)) return prev;
      return [...prev, { id: crypto.randomUUID(), name, bought: false }];
    });
  }, [updateItems]);

  const toggleItem = useCallback((id: string) => {
    updateItems((prev) => prev.map((i) => i.id === id ? { ...i, bought: !i.bought } : i));
  }, [updateItems]);

  const clearBought = useCallback(() => {
    updateItems((prev) => prev.filter((i) => !i.bought));
  }, [updateItems]);

  return { items, addItem, toggleItem, clearBought };
}
