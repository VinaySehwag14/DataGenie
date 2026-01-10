import Link from "next/link";
import { ArrowRight, BarChart2, Upload, MessageSquare } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-neutral-950 text-neutral-50">

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-sm font-medium mb-8 border border-blue-500/20">
          <span className="relative flex h-2 w-2 mr-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          Next-Gen Contextual Analytics
        </div>

        <h1 className="text-7xl font-black tracking-tight mb-6 bg-gradient-to-b from-white to-neutral-400 bg-clip-text text-transparent">
          Your Data's Genie,<br /> At Your Command
        </h1>

        <p className="text-xl text-neutral-400 mb-10 max-w-2xl leading-relaxed">
          DataGenie transforms raw data into magical insights. Upload CSV files, visualize with stunning charts, and ask your AI-powered genie anything about your data.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/dashboard"
            className="inline-flex h-12 items-center justify-center rounded-xl btn-gradient-primary px-8 text-sm font-semibold text-white"
          >
            Get Started <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
          <Link
            href="/features"
            className="inline-flex h-12 items-center justify-center rounded-xl border-2 border-neutral-700 bg-neutral-900/50 px-8 text-sm font-medium text-neutral-300 transition-all hover:bg-neutral-800 hover:text-white hover:border-neutral-600"
          >
            Explore Features
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 max-w-6xl w-full text-left">
          <FeatureCard
            icon={<Upload className="w-6 h-6 text-blue-400" />}
            title="Instant Upload"
            description="Drag & drop CSV or JSON files. Our engine parses and visualizes your data instantly."
          />
          <FeatureCard
            icon={<BarChart2 className="w-6 h-6 text-purple-400" />}
            title="Interactive Charts"
            description="Dynamic charts that react to your filters. Zoom, pan, and explore your metrics."
          />
          <FeatureCard
            icon={<MessageSquare className="w-6 h-6 text-emerald-400" />}
            title="AI Data Chat"
            description="Ask questions in plain English. 'What was the highest sales month?' — Get answers."
          />
        </div>
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800 hover:border-neutral-700 transition-colors">
      <div className="mb-4 bg-neutral-800/50 w-12 h-12 rounded-lg flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-neutral-400 leading-relaxed">{description}</p>
    </div>
  );
}
