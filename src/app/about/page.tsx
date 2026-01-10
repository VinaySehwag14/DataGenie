import Link from 'next/link'
import { ArrowRight, Rocket, Target, Users, TrendingUp } from 'lucide-react'
import Navbar from '@/components/navbar'

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-neutral-950 text-neutral-50 pt-20">

            {/* Hero */}
            <section className="py-20 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-400 text-sm font-medium mb-8 border border-green-500/20">
                        <Rocket className="w-4 h-4" /> MVP Release
                    </div>

                    <h1 className="text-6xl font-black tracking-tight mb-6">
                        <span className="text-gradient-primary">Making Data</span><br />
                        <span className="bg-gradient-to-b from-white to-neutral-400 bg-clip-text text-transparent">Accessible to Everyone</span>
                    </h1>

                    <p className="text-xl text-neutral-400 max-w-2xl mx-auto leading-relaxed">
                        DataGenie is an AI-powered analytics platform that transforms raw data into actionable insights. No technical skills required.
                    </p>
                </div>
            </section>

            {/* Mission */}
            <section className="py-20 px-6 border-t border-neutral-800">
                <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="text-4xl font-bold mb-6">
                            <span className="text-gradient-primary">Our Mission</span>
                        </h2>
                        <p className="text-lg text-neutral-300 mb-4 leading-relaxed">
                            We believe everyone should be able to understand their data, not just data scientists. That's why we built DataGenie.
                        </p>
                        <p className="text-neutral-400 leading-relaxed">
                            Upload your CSV or Excel files, ask questions in plain English, and get instant visualizations and insights powered by AI.
                        </p>
                    </div>
                    <div className="card-enhanced card-3d p-8">
                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 btn-gradient-primary rounded-xl flex items-center justify-center flex-shrink-0">
                                    <Target className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900 mb-1">Simple & Intuitive</h3>
                                    <p className="text-gray-600">No complex setup. Drop your files and start analyzing immediately.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 btn-gradient-secondary rounded-xl flex items-center justify-center flex-shrink-0">
                                    <Users className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900 mb-1">For Everyone</h3>
                                    <p className="text-gray-600">From startups to enterprises, anyone can use DataGenie.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* MVP Status & Roadmap */}
            <section className="py-20 px-6 border-t border-neutral-800">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold mb-4">
                            <span className="text-gradient-primary">Product Roadmap</span>
                        </h2>
                        <p className="text-neutral-400 text-lg">We're just getting started. Here's what's coming next.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Current Features */}
                        <div className="card-enhanced p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-3 h-3 bg-green-500 rounded-full glow-animation"></div>
                                <h3 className="text-2xl font-bold text-gray-900">MVP - Available Now</h3>
                            </div>
                            <ul className="space-y-3">
                                {currentFeatures.map((feature, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-gray-700">
                                        <TrendingUp className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Future Plans */}
                        <div className="card-enhanced p-8 border-2 border-dashed border-indigo-300">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-3 h-3 bg-indigo-500 rounded-full float-animation"></div>
                                <h3 className="text-2xl font-bold text-gray-900">Coming Soon</h3>
                            </div>
                            <ul className="space-y-3">
                                {futurePlans.map((plan, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-gray-600">
                                        <Rocket className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                                        <span>{plan}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl font-bold mb-6">
                        <span className="text-gradient-primary">Ready to Get Started?</span>
                    </h2>
                    <p className="text-xl text-neutral-400 mb-8">
                        Join early users and transform your data into insights today.
                    </p>
                    <Link href="/dashboard" className="inline-flex items-center gap-2 px-8 py-4 btn-gradient-primary rounded-xl font-bold text-white text-lg hover:scale-105 transition-transform">
                        Start Free <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </section>

            {/* Footer */}
        </div>
    )
}

const currentFeatures = [
    "CSV & Excel file upload",
    "AI-powered auto-insights",
    "Interactive visualizations",
    "Chat with your data (AI assistant)",
    "PDF report generation",
    "Export & share capabilities",
    "Real-time data preview"
]

const futurePlans = [
    "Google Sheets integration",
    "Database connections (PostgreSQL, MySQL)",
    "Team collaboration features",
    "Custom dashboards builder",
    "Scheduled reports",
    "Advanced ML predictions",
    "API access",
    "Mobile apps (iOS & Android)"
]
