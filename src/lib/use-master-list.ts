"use client";

import { useState, useEffect, useCallback } from "react";

export interface MasterCategory {
  id: string;
  name: string;
  items: { id: string; name: string }[];
}

const STORAGE_KEY = "miniapps-master-categories";

const DEFAULT_CATEGORIES: MasterCategory[] = [
  { id: "dals", name: "Dals & Legumes", items: ["Rajma","Chole","Chana Dal","Urad Dal - Black","Urad Dal - Green","Urad Dal - Brown","Urad Dal - White","Toor Dal","Masoor Dal","Pesera pappu","Putnala pappa","Groundnuts","Soya beans","Moong Dal"].map((n) => ({ id: crypto.randomUUID(), name: n })) },
  { id: "grains", name: "Grains & Flour", items: ["Aata","Rice","Raagi","Sooji","Idly Rava","Poha","Maida","Besan","Daliya","Sahana or Chakra Rice"].map((n) => ({ id: crypto.randomUUID(), name: n })) },
  { id: "oils", name: "Oils & Condiments", items: ["Coconut Oil","Vegetable Oil","Ghee","Honey","Olive Oil","Pasta Sauce","Vinegar","Ketchup","Soy Sauce","Hot Sauce","Sweet Sauce","Ginger Garlic Paste"].map((n) => ({ id: crypto.randomUUID(), name: n })) },
  { id: "spices", name: "Spices & Masalas", items: ["Hing","Jeera","Avalu (Mustard seeds)","Menthulu (Fenugreek seeds)","Karvepaku (Curry leaves)","Coriander","Dalchin chakka (Cinnamon)","Bay Leaves","Cardamom","Cloves","Star Anise","Sesame Seeds","Poppy Seeds","Salt","Sugar","Black Pepper","Bellam (Jaggery)","Red Mirchi","Garam Masala","Chat Masala","Chole Masala"].map((n) => ({ id: crypto.randomUUID(), name: n })) },
  { id: "veggies", name: "Veggies", items: ["Drumsticks","Green Leafy Veggies","Arbi","Dosakaya","Bhendi","Kundru","Lemon"].map((n) => ({ id: crypto.randomUUID(), name: n })) },
  { id: "instant", name: "Instant & Dry Foods", items: ["Maggi","Saboodaana","Pasta","Vermicelli"].map((n) => ({ id: crypto.randomUUID(), name: n })) },
  { id: "nuts", name: "Nuts & Dry Fruits", items: ["Badam","Pista","Kajup (Cashews)","Kishmish (Raisins)"].map((n) => ({ id: crypto.randomUUID(), name: n })) },
  { id: "frozen", name: "Frozen", items: ["Frozen Paneer","Frozen Chapatis","Frozen Peas","Frozen Corn"].map((n) => ({ id: crypto.randomUUID(), name: n })) },
  { id: "hygiene", name: "Soaps & Hygiene", items: ["Rin Soap","Bathing Soap","Toothbrush (Kids)","Toothbrush (Adults)","Toothpaste (Kids)","Toothpaste (Adults)","Comb","Hair Dye"].map((n) => ({ id: crypto.randomUUID(), name: n })) },
  { id: "other", name: "Other", items: ["Coconut Powder"].map((n) => ({ id: crypto.randomUUID(), name: n })) },
];

function load(): MasterCategory[] {
  if (typeof window === "undefined") return DEFAULT_CATEGORIES;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_CATEGORIES;
  } catch {
    return DEFAULT_CATEGORIES;
  }
}

function save(cats: MasterCategory[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cats));
}

export function useMasterList() {
  const [categories, setCategories] = useState<MasterCategory[]>([]);

  useEffect(() => { setCategories(load()); }, []);

  const update = useCallback((updater: (prev: MasterCategory[]) => MasterCategory[]) => {
    setCategories((prev) => {
      const next = updater(prev);
      save(next);
      return next;
    });
  }, []);

  const addCategory = useCallback((name: string) => {
    update((prev) => [...prev, { id: crypto.randomUUID(), name, items: [] }]);
  }, [update]);

  const deleteCategory = useCallback((catId: string) => {
    update((prev) => prev.filter((c) => c.id !== catId));
  }, [update]);

  const renameCategory = useCallback((catId: string, name: string) => {
    update((prev) => prev.map((c) => c.id === catId ? { ...c, name } : c));
  }, [update]);

  const addItem = useCallback((catId: string, name: string) => {
    update((prev) => prev.map((c) =>
      c.id === catId ? { ...c, items: [...c.items, { id: crypto.randomUUID(), name }] } : c
    ));
  }, [update]);

  const deleteItem = useCallback((catId: string, itemId: string) => {
    update((prev) => prev.map((c) =>
      c.id === catId ? { ...c, items: c.items.filter((i) => i.id !== itemId) } : c
    ));
  }, [update]);

  const renameItem = useCallback((catId: string, itemId: string, name: string) => {
    update((prev) => prev.map((c) =>
      c.id === catId ? { ...c, items: c.items.map((i) => i.id === itemId ? { ...i, name } : i) } : c
    ));
  }, [update]);

  const moveItem = useCallback((fromCatId: string, itemId: string, toCatId: string) => {
    update((prev) => {
      const item = prev.find((c) => c.id === fromCatId)?.items.find((i) => i.id === itemId);
      if (!item) return prev;
      return prev.map((c) => {
        if (c.id === fromCatId) return { ...c, items: c.items.filter((i) => i.id !== itemId) };
        if (c.id === toCatId) return { ...c, items: [...c.items, item] };
        return c;
      });
    });
  }, [update]);

  return { categories, addCategory, deleteCategory, renameCategory, addItem, deleteItem, renameItem, moveItem };
}
