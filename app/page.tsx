import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlcoholTracker } from "@/components/alcohol/AlcoholTracker";

export default function Home() {
  return (
    <main className="min-h-screen" style={{ background: "linear-gradient(135deg, #e8eaf6 0%, #ede9f6 40%, #e3f2fd 100%)" }}>
      {/* Header */}
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #2563eb 100%)" }}>
        {/* Decorative blobs */}
        <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full opacity-20" style={{ background: "radial-gradient(circle, #a78bfa, transparent)" }} />
        <div className="absolute -bottom-8 -left-8 w-48 h-48 rounded-full opacity-15" style={{ background: "radial-gradient(circle, #60a5fa, transparent)" }} />

        <div className="relative max-w-3xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3 animate-fade-in-up">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl shadow-lg" style={{ background: "rgba(255,255,255,0.2)" }}>
              💊
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Health Monitor</h1>
              <p className="text-sm text-indigo-200 mt-0.5">Track. Analyze. Improve.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        <Tabs defaultValue="alcohol">
          <TabsList className="mb-6 glass shadow-sm animate-fade-in-up stagger-1">
            <TabsTrigger value="alcohol" className="gap-1.5">
              🍺 Alcohol
            </TabsTrigger>
          </TabsList>

          <TabsContent value="alcohol" className="animate-fade-in-up stagger-2">
            <AlcoholTracker />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
