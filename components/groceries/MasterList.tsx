"use client";

import { useState } from "react";
import { useGroceryItems } from "@/lib/use-grocery-items";

const MASTER_CATEGORIES: { category: string; items: string[] }[] = [
  {
    category: "Dals & Legumes",
    items: [
      "Rajma",
      "Chole",
      "Chana Dal",
      "Urad Dal - Black",
      "Urad Dal - Green",
      "Urad Dal - Brown",
      "Urad Dal - White",
      "Toor Dal",
      "Masoor Dal",
      "Pesera pappu",
      "Putnala pappa",
      "Groundnuts",
      "Soya beans",
      "Moong Dal",
    ],
  },
  {
    category: "Grains & Flour",
    items: [
      "Aata",
      "Rice",
      "Raagi",
      "Sooji",
      "Idly Rava",
      "Poha",
      "Maida",
      "Besan",
      "Daliya",
      "Sahana or Chakra Rice",
    ],
  },
  {
    category: "Oils & Condiments",
    items: [
      "Coconut Oil",
      "Vegetable Oil",
      "Ghee",
      "Honey",
      "Olive Oil",
      "Pasta Sauce",
      "Vinegar",
      "Ketchup",
      "Soy Sauce",
      "Hot Sauce",
      "Sweet Sauce",
      "Ginger Garlic Paste",
    ],
  },
  {
    category: "Spices & Masalas",
    items: [
      "Hing",
      "Jeera",
      "Avalu (Mustard seeds)",
      "Menthulu (Fenugreek seeds)",
      "Karvepaku (Curry leaves)",
      "Coriander",
      "Dalchin chakka (Cinnamon)",
      "Bay Leaves",
      "Cardamom",
      "Cloves",
      "Star Anise",
      "Sesame Seeds",
      "Poppy Seeds",
      "Salt",
      "Sugar",
      "Black Pepper",
      "Bellam (Jaggery)",
      "Red Mirchi",
      "Garam Masala",
      "Chat Masala",
      "Chole Masala",
    ],
  },
  {
    category: "Veggies",
    items: [
      "Drumsticks",
      "Green Leafy Veggies",
      "Arbi",
      "Dosakaya",
      "Bhendi",
      "Kundru",
      "Lemon",
    ],
  },
  {
    category: "Instant & Dry Foods",
    items: [
      "Maggi",
      "Saboodaana",
      "Pasta",
      "Vermicelli",
    ],
  },
  {
    category: "Nuts & Dry Fruits",
    items: [
      "Badam",
      "Pista",
      "Kajup (Cashews)",
      "Kishmish (Raisins)",
    ],
  },
  {
    category: "Frozen",
    items: [
      "Frozen Paneer",
      "Frozen Chapatis",
      "Frozen Peas",
      "Frozen Corn",
    ],
  },
  {
    category: "Soaps & Hygiene",
    items: [
      "Rin Soap",
      "Bathing Soap",
      "Toothbrush (Kids)",
      "Toothbrush (Adults)",
      "Toothpaste (Kids)",
      "Toothpaste (Adults)",
      "Comb",
      "Hair Dye",
    ],
  },
  {
    category: "Other",
    items: ["Coconut Powder"],
  },
];

export function MasterList() {
  const { items, addItem } = useGroceryItems();
  const [added, setAdded] = useState<Set<string>>(new Set());

  function handleAdd(name: string) {
    addItem(name);
    setAdded((prev) => new Set(prev).add(name));
  }

  function isInList(name: string) {
    return added.has(name) || items.some((i) => i.name === name && !i.bought);
  }

  return (
    <div className="flex flex-col gap-4">
      {MASTER_CATEGORIES.map(({ category, items: catItems }) => (
        <div key={category} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <p className="text-xs text-gray-400 uppercase tracking-widest font-medium px-4 pt-3 pb-2">
            {category}
          </p>
          <ul className="divide-y divide-gray-50">
            {catItems.map((item) => {
              const inList = isInList(item);
              return (
                <li key={item} className="flex items-center gap-3 px-4 py-3">
                  <span className="text-sm text-gray-700 flex-1">{item}</span>
                  <button
                    onClick={() => handleAdd(item)}
                    disabled={inList}
                    className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                      inList
                        ? "bg-emerald-100 text-emerald-500 cursor-default"
                        : "bg-emerald-600 text-white active:scale-90"
                    }`}
                  >
                    {inList ? (
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 5v14M5 12h14" />
                      </svg>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
