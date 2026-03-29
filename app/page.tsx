import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlcoholTracker } from "@/components/alcohol/AlcoholTracker";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f8f9fc]">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div>
            <span className="text-sm font-semibold text-gray-900 tracking-tight">Health Monitor</span>
          </div>
          <span className="text-xs text-gray-400">Personal tracker</span>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-5">
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
