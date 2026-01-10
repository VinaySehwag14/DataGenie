'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, BarChart3, Bot, FileText, Layout, Lock, Share2, Sparkles, Zap, Database, Wand2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { fadeIn, slideUp, staggerContainer } from '@/lib/animations'

export default function FeaturesPage() {
    const router = useRouter()

    return (
        <div className="min-h-screen bg-neutral-950 text-neutral-50 selection:bg-indigo-500/30 overflow-hidden">
            {/* Background Effects */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
            </div>

            <main className="relative z-10 pt-32 pb-20 px-6">
                {/* Hero */}
                <motion.div
                    initial="hidden"
                    animate="show"
                    variants={staggerContainer}
                    className="max-w-4xl mx-auto text-center mb-24"
                >
                    <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-sm font-medium mb-6 border border-indigo-500/20">
                        <Sparkles className="w-4 h-4" />
                        <span>Powered by Advanced AI</span>
                    </motion.div>

                    <motion.h1 variants={slideUp} className="text-5xl md:text-7xl font-black tracking-tight mb-8">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-gray-400">Powerful Features</span><br />
                        <span className="text-gradient-primary">for Modern Teams.</span>
                    </motion.h1>

                    <motion.p variants={fadeIn} className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                        Everything you need to transform raw data into actionable business intelligence. No coding required.
                    </motion.p>
                </motion.div>

                {/* Main Features Grid */}
                <motion.div
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={staggerContainer}
                    className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24"
                >
                    {features.map((feature, idx) => (
                        <motion.div
                            key={idx}
                            variants={fadeIn}
                            className="bg-white/5 border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-all duration-300 group card-3d hover:-translate-y-2"
                        >
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-gradient-to-br ${feature.gradient} group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                                <feature.icon className="w-7 h-7 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3 group-hover:text-gradient-primary transition-colors">{feature.title}</h3>
                            <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Deep Dive Section */}
                <div className="max-w-7xl mx-auto mb-24">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-white/10 rounded-3xl p-8 md:p-12 backdrop-blur-sm overflow-hidden relative"
                    >
                        <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
                            <Bot className="w-96 h-96 text-indigo-500" />
                        </div>

                        <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
                            <div>
                                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                                    Meet Your AI Data Analyst
                                </h2>
                                <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                                    Imagine having a data scientist available 24/7. Our AI assistant analyzes your data, finds hidden patterns, and answers your questions in plain English.
                                </p>
                                <ul className="space-y-4 mb-8">
                                    {[
                                        "Ask questions like 'What is the top selling product?'",
                                        "Get automated insights and trend detection",
                                        "Generate explains for anomalies in your data",
                                        "Recommendations based on historical performance"
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-center gap-3 text-gray-300">
                                            <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                                                <Wand2 className="w-3.5 h-3.5 text-green-400" />
                                            </div>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                                <button onClick={() => router.push('/dashboard')} className="btn-gradient-primary px-8 py-3 rounded-xl font-bold text-white shadow-lg hover:shadow-indigo-500/25 transition-all hover:scale-105">
                                    Try AI Analysis Now
                                </button>
                            </div>
                            <div className="relative perspective-1000">
                                <motion.div
                                    animate={{ rotateY: [-5, 5, -5], rotateX: [2, -2, 2] }}
                                    transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
                                    className="bg-gray-900 border border-white/10 rounded-xl p-6 shadow-2xl"
                                >
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
                                            <Bot className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="bg-white/10 rounded-2xl rounded-tl-none p-4">
                                            <p className="text-sm text-gray-200">
                                                Based on your Q3 sales data, <strong>Electronics</strong> is your top category, growing 24% month-over-month. I recommend increasing stock levels for the upcoming holiday season.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                        <span className="text-xs text-gray-500">AI is online and analyzing</span>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="max-w-4xl mx-auto text-center"
                >
                    <h2 className="text-4xl font-bold mb-6">
                        Ready to empower your team?
                    </h2>
                    <p className="text-xl text-gray-400 mb-8">
                        Join thousands of users who are making better decisions with DataGenie.
                    </p>
                    <button onClick={() => router.push('/dashboard')} className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-950 rounded-xl font-bold text-lg hover:bg-gray-100 transition-colors hover:scale-105">
                        Start for Free <ArrowRight className="w-5 h-5" />
                    </button>
                </motion.div>
            </main>
        </div>
    )
}

const features = [
    {
        title: "Smart CSV/Excel Upload",
        description: "Drag and drop your files. We handle the parsing, cleaning, and type detection automatically so you can get straight to analysis.",
        icon: FileText,
        gradient: "from-blue-500 to-cyan-500"
    },
    {
        title: "Automated Visualization",
        description: "Our AI analyzes your data structure and automatically suggests the most impactful charts and graphs to visualize your trends.",
        icon: BarChart3,
        gradient: "from-purple-500 to-pink-500"
    },
    {
        title: "AI Chat Assistant",
        description: "Don't know SQL? No problem. Ask questions about your data in plain English and get instant, accurate answers.",
        icon: Bot,
        gradient: "from-indigo-500 to-violet-500"
    },
    {
        title: "Instant Insights",
        description: "DataGenie automatically highlights key trends, anomalies, and opportunities in your data without you even asking.",
        icon: Zap,
        gradient: "from-amber-500 to-orange-500"
    },
    {
        title: "Enterprise Security",
        description: "Your data is encrypted at rest and in transit. We prioritize security and privacy for all your sensitive business information.",
        icon: Lock,
        gradient: "from-emerald-500 to-teal-500"
    },
    {
        title: "Export & Share",
        description: "Generate professional PDF reports or export clean data with a single click to share findings with your stakeholders.",
        icon: Share2,
        gradient: "from-rose-500 to-red-500"
    }
]
