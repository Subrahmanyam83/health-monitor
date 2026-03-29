import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlcoholTracker } from "@/components/alcohol/AlcoholTracker";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f8f9fc]">
      {/* Header */}
      <div className="sticky top-0 z-10" style={{background:"#4f46e5"}}>
        <div className="w-full max-w-md mx-auto px-4 h-14 flex items-center justify-between">
          <span className="text-sm font-semibold text-white tracking-tight">Health Monitor</span>
          <span className="text-xs text-indigo-200">Personal tracker</span>
        </div>
      </div>

      {/* Content */}
      <div className="w-full max-w-md mx-auto px-4 py-5">
        <Tabs defaultValue="alcohol">
          <TabsList className="mb-5 h-9 bg-gray-100 p-0.5 rounded-lg">
            <TabsTrigger value="alcohol" className="text-xs font-medium h-8 rounded-md px-4">
              Alcohol
            </TabsTrigger>
          </TabsList>

          <TabsContent value="alcohol" className="animate-fade-in">
            <AlcoholTracker />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
