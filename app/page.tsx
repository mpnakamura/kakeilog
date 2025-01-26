import Hero from "@/components/hero";

export default async function Home() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
      <div className="max-w-2xl w-full p-8 rounded-xl bg-gradient-to-br from-blue-500/5 to-purple-500/5 backdrop-blur-sm border border-white/10">
        <Hero />
      </div>
    </div>
  );
}
