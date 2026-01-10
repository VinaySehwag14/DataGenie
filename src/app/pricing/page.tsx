import Link from 'next/link'
import { ArrowRight, Check, X } from 'lucide-react'

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-neutral-950 text-neutral-50 pt-20">
            {/* Hero */}
            <section className="py-20 px-6">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 text-blue-400 text-sm font-medium mb-8 border border-blue-500/20">
                        Simple, transparent pricing
                    </div>

                    <h1 className="text-6xl font-black tracking-tight mb-6">
                        <span className="text-gradient-primary">Choose Your Plan</span>
                    </h1>

                    <p className="text-xl text-neutral-400 mb-12 max-w-2xl mx-auto">
                        Start free, upgrade as you grow. All plans include core features.
                    </p>
                </div>

                {/* Pricing Cards */}
                <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
                    {/* Free Plan */}
                    <div className="card-enhanced card-3d p-8">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Free</h3>
                        <div className="mb-6">
                            <span className="text-4xl font-black text-gray-900">$0</span>
                            <span className="text-gray-600">/month</span>
                        </div>
                        <p className="text-gray-600 mb-6">Perfect for trying out DataGenie</p>

                        <ul className="space-y-3 mb-8">
                            <li className="flex items-start gap-2"><Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" /> <span className="text-gray-700">Up to 5 data sources</span></li>
                            <li className="flex items-start gap-2"><Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" /> <span className="text-gray-700">1,000 rows per file</span></li>
                            <li className="flex items-start gap-2"><Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" /> <span className="text-gray-700">Basic visualizations</span></li>
                            <li className="flex items-start gap-2"><Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" /> <span className="text-gray-700">AI chat (10 queries/day)</span></li>
                            <li className="flex items-start gap-2"><X className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" /> <span className="text-gray-400">Export reports</span></li>
                        </ul>

                        <Link href="/dashboard" className="block w-full py-3 border-2 border-gray-300 rounded-lg text-center font-semibold hover:bg-gray-50 transition">
                            Get Started
                        </Link>
                    </div>

                    {/* Pro Plan - Featured */}
                    <div className="card-enhanced card-3d p-8 border-4 border-indigo-500 relative">
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 btn-gradient-primary rounded-full text-sm font-bold text-white">
                            POPULAR
                        </div>

                        <h3 className="text-lg font-bold text-gray-900 mb-2">Pro</h3>
                        <div className="mb-6">
                            <span className="text-4xl font-black text-gradient-primary">$29</span>
                            <span className="text-gray-600">/month</span>
                        </div>
                        <p className="text-gray-600 mb-6">For professionals and teams</p>

                        <ul className="space-y-3 mb-8">
                            <li className="flex items-start gap-2"><Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" /> <span className="text-gray-700">Unlimited data sources</span></li>
                            <li className="flex items-start gap-2"><Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" /> <span className="text-gray-700">100,000 rows per file</span></li>
                            <li className="flex items-start gap-2"><Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" /> <span className="text-gray-700">Advanced visualizations</span></li>
                            <li className="flex items-start gap-2"><Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" /> <span className="text-gray-700">Unlimited AI chat</span></li>
                            <li className="flex items-start gap-2"><Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" /> <span className="text-gray-700">PDF & CSV export</span></li>
                            <li className="flex items-start gap-2"><Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" /> <span className="text-gray-700">Priority support</span></li>
                        </ul>

                        <Link href="/dashboard" className="block w-full py-3 btn-gradient-primary rounded-lg text-center font-bold text-white hover:scale-105 transition-transform">
                            Start Pro Trial
                        </Link>
                    </div>

                    {/* Enterprise Plan */}
                    <div className="card-enhanced card-3d p-8">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Enterprise</h3>
                        <div className="mb-6">
                            <span className="text-4xl font-black text-gray-900">Custom</span>
                        </div>
                        <p className="text-gray-600 mb-6">For large organizations</p>

                        <ul className="space-y-3 mb-8">
                            <li className="flex items-start gap-2"><Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" /> <span className="text-gray-700">Everything in Pro</span></li>
                            <li className="flex items-start gap-2"><Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" /> <span className="text-gray-700">Unlimited rows</span></li>
                            <li className="flex items-start gap-2"><Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" /> <span className="text-gray-700">Custom integrations</span></li>
                            <li className="flex items-start gap-2"><Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" /> <span className="text-gray-700">Dedicated support</span></li>
                            <li className="flex items-start gap-2"><Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" /> <span className="text-gray-700">SLA guarantee</span></li>
                            <li className="flex items-start gap-2"><Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" /> <span className="text-gray-700">On-premise option</span></li>
                        </ul>

                        <Link href="/contact" className="block w-full py-3 btn-gradient-secondary rounded-lg text-center font-semibold text-white hover:scale-105 transition-transform">
                            Contact Sales
                        </Link>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-20 px-6 border-t border-neutral-800">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-4xl font-bold text-center mb-12">
                        <span className="text-gradient-primary">Frequently Asked Questions</span>
                    </h2>

                    <div className="space-y-6">
                        {faqs.map((faq, idx) => (
                            <div key={idx} className="card-enhanced p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-2">{faq.question}</h3>
                                <p className="text-gray-600">{faq.answer}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>


        </div>
    )
}

const faqs = [
    {
        question: "Can I change plans later?",
        answer: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately."
    },
    {
        question: "What payment methods do you accept?",
        answer: "We accept all major credit cards, debit cards, and PayPal for your convenience."
    },
    {
        question: "Is there a free trial for Pro?",
        answer: "Yes! We offer a 14-day free trial for the Pro plan. No credit card required."
    },
    {
        question: "What happens to my data if I downgrade?",
        answer: "Your data is always safe. If you downgrade, you'll keep access to all your historical data."
    },
    {
        question: "Do you offer refunds?",
        answer: "Yes, we offer a 30-day money-back guarantee if you're not satisfied."
    }
]
