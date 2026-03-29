"use client";

import { useState } from "react";
import { useGroceryItems } from "@/lib/use-grocery-items";

const MASTER_ITEMS = [
  "Dals - Rajma, Chole, Chana Dal, Urad Dal (Black, Green, Brown, White), Toor Dal, Masoor Dal, Pesera pappu, putnala pappa, groundnuts, soya beans, moong dal",
  "Aata, Rice and Raagi",
  "Soaps - Rin and bathing",
  "Oil - Coconut, Vegetable and Ghee, honey, olive oil, pasta sauce",
  "Tooth Brush and pastes (akkis and adults)",
  "Hair stuff - Combs and Dies",
  "Popu - Hing, Jeera, Avalu, Menthulu, Karvepaku, Coriander, Dalchin chakka, Bay leafs, Cardamom, Cloves, star shaped, sesame seeds, poppy seeds, ginger garlic paste",
  "Garam masalas, chat masala, chole masala",
  "Salt, Sugar, Black Pepper, bellam, red mirchi",
  "Veggies - Drumsticks and green leafy veggies, arbi, dosakaya, bhendi, kundru, lemon",
  "Maggi, saboodaana, pastas, vermicelli, Sooji, Idly Rava, poha, maida, besan, Daliya",
  "Vinegar, Ketchup, soy sauce, hot and sweet sauce",
  "Nuts - Badam, Pista, Kajup and kishmish",
  "Frozen - Paneer, chapatis, peas and Corn",
  "Coconut powder",
  "Sahana or Chakra Rice",
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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <ul className="divide-y divide-gray-50">
        {MASTER_ITEMS.map((item) => {
          const inList = isInList(item);
          return (
            <li key={item} className="flex items-start gap-3 px-4 py-3">
              <span className="text-sm text-gray-700 flex-1 leading-snug pt-0.5">{item}</span>
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
  );
}
