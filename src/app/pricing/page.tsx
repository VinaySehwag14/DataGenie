'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Check, X, Shield, Zap, Rocket, Loader2 } from 'lucide-react'
import Script from 'next/script'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

declare global {
    interface Window {
        Razorpay: any;
    }
}

export default function PricingPage() {
    const [loading, setLoading] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    const handleSubscribe = async (plan: string, price: number) => {
        try {
            setLoading(plan)

            // 1. Check if user is logged in
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                router.push('/login?redirect=/pricing')
                return
            }

            // 2. Create Order
            const response = await fetch('/api/payment/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: price,
                    currency: 'INR'
                })
            })

            const order = await response.json()

            if (!response.ok) {
                throw new Error(order.error || 'Failed to create order')
            }

            // 3. Open Razorpay
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: "DataGenie",
                description: `${plan} Subscription`,
                order_id: order.id,
                handler: async function (response: any) {
                    // 4. Verify Payment
                    const verifyRes = await fetch('/api/payment/verify', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            plan: plan.toLowerCase()
                        })
                    })

                    const verifyData = await verifyRes.json()

                    if (verifyData.message === 'success') {
                        alert('Payment Successful! Welcome to Pro.')
                        router.push('/dashboard')
                    } else {
                        alert('Payment Verification Failed')
                    }
                },
                prefill: {
                    name: user.user_metadata.full_name,
                    email: user.email,
                },
                theme: {
                    color: "#6366f1"
                }
            }

            const rzp1 = new window.Razorpay(options)
            rzp1.open()

        } catch (error) {
            console.error('Payment failed:', error)
            alert('Something went wrong. Please try again.')
        } finally {
            setLoading(null)
        }
    }

    return (
        <div className="min-h-screen bg-gray-950 text-white relative overflow-hidden selection:bg-indigo-500/30 pt-20">
            <Script
                id="razorpay-checkout-js"
                src="https://checkout.razorpay.com/v1/checkout.js"
            />

            {/* Background Effects */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(120,119,198,0.2),rgba(255,255,255,0))]"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] opacity-30 pulse-slow"></div>
            </div>

            {/* Hero */}
            <section className="relative z-10 py-20 px-6">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 text-indigo-300 text-sm font-medium mb-8 border border-indigo-500/20 backdrop-blur-sm animate-in fade-in zoom-in duration-500">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                        </span>
                        Simple, transparent pricing
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 animate-in slide-in-from-bottom-5 fade-in duration-700">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-indigo-400">
                            Choose Your Plan
                        </span>
                    </h1>

                    <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto animate-in slide-in-from-bottom-5 fade-in duration-700 delay-100">
                        Start free, upgrade in Rupees as you grow. All plans include core AI features.
                    </p>
                </div>

                {/* Pricing Cards */}
                <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8 px-4">
                    {/* Free Plan */}
                    <div className="relative group animate-in slide-in-from-bottom-10 fade-in duration-700 delay-200">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/5 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="relative h-full bg-gray-900/40 border border-white/10 rounded-3xl p-8 backdrop-blur-xl hover:border-indigo-500/30 transition-all duration-300 flex flex-col">
                            <div className="mb-6">
                                <div className="w-12 h-12 bg-gray-800 rounded-2xl flex items-center justify-center mb-4 text-gray-400">
                                    <Shield className="w-6 h-6" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">Free</h3>
                                <p className="text-gray-400">Perfect for trying out DataGenie</p>
                            </div>
                            <div className="mb-8">
                                <span className="text-5xl font-black text-white">₹0</span>
                                <span className="text-gray-500 text-lg">/month</span>
                            </div>

                            <ul className="space-y-4 mb-8 flex-1">
                                <li className="flex items-start gap-3 text-gray-300">
                                    <Check className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                                    <span>Up to 5 data sources</span>
                                </li>
                                <li className="flex items-start gap-3 text-gray-300">
                                    <Check className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                                    <span>1,000 rows per file</span>
                                </li>
                                <li className="flex items-start gap-3 text-gray-300">
                                    <Check className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                                    <span>Basic visualizations</span>
                                </li>
                                <li className="flex items-start gap-3 text-gray-300">
                                    <Check className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                                    <span>AI chat (10 queries/day)</span>
                                </li>
                                <li className="flex items-start gap-3 text-gray-600">
                                    <X className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                    <span>Export reports</span>
                                </li>
                            </ul>

                            <button
                                disabled={true}
                                className="block w-full py-4 rounded-xl font-bold text-center border border-white/10 bg-white/5 text-gray-400 cursor-not-allowed"
                            >
                                Current Plan
                            </button>
                        </div>
                    </div>

                    {/* Pro Plan - Featured */}
                    <div className="relative group animate-in slide-in-from-bottom-10 fade-in duration-700 delay-300">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-pink-500/20 rounded-3xl blur-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="relative h-full bg-gray-900/80 border border-indigo-500/50 rounded-3xl p-8 backdrop-blur-xl hover:border-indigo-400 transition-all duration-300 flex flex-col shadow-2xl shadow-indigo-500/10">
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-indigo-500 rounded-full text-xs font-bold text-white tracking-widest uppercase shadow-lg shadow-indigo-500/30">
                                Most Popular
                            </div>

                            <div className="mb-6">
                                <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center mb-4 text-indigo-400">
                                    <Zap className="w-6 h-6" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
                                <p className="text-gray-400">For professionals and teams</p>
                            </div>
                            <div className="mb-8">
                                <span className="text-5xl font-black text-white">₹2,499</span>
                                <span className="text-gray-500 text-lg">/month</span>
                            </div>

                            <ul className="space-y-4 mb-8 flex-1">
                                <li className="flex items-start gap-3 text-white">
                                    <div className="p-0.5 rounded-full bg-indigo-500/20">
                                        <Check className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                                    </div>
                                    <span>Unlimited data sources</span>
                                </li>
                                <li className="flex items-start gap-3 text-white">
                                    <div className="p-0.5 rounded-full bg-indigo-500/20">
                                        <Check className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                                    </div>
                                    <span>100,000 rows per file</span>
                                </li>
                                <li className="flex items-start gap-3 text-white">
                                    <div className="p-0.5 rounded-full bg-indigo-500/20">
                                        <Check className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                                    </div>
                                    <span>Advanced visualizations</span>
                                </li>
                                <li className="flex items-start gap-3 text-white">
                                    <div className="p-0.5 rounded-full bg-indigo-500/20">
                                        <Check className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                                    </div>
                                    <span>Unlimited AI chat</span>
                                </li>
                                <li className="flex items-start gap-3 text-white">
                                    <div className="p-0.5 rounded-full bg-indigo-500/20">
                                        <Check className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                                    </div>
                                    <span>PDF & CSV export</span>
                                </li>
                                <li className="flex items-start gap-3 text-white">
                                    <div className="p-0.5 rounded-full bg-indigo-500/20">
                                        <Check className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                                    </div>
                                    <span>Priority support</span>
                                </li>
                            </ul>

                            <button
                                onClick={() => handleSubscribe('Pro', 2499)}
                                disabled={!!loading}
                                className="block w-full py-4 rounded-xl font-bold text-center bg-white text-gray-950 hover:bg-gray-100 transition-all duration-300 shadow-lg shadow-white/10 transform hover:scale-[1.02] flex items-center justify-center gap-2"
                            >
                                {loading === 'Pro' ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        Get Pro Access
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Enterprise Plan */}
                    <div className="relative group animate-in slide-in-from-bottom-10 fade-in duration-700 delay-400">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/5 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="relative h-full bg-gray-900/40 border border-white/10 rounded-3xl p-8 backdrop-blur-xl hover:border-purple-500/30 transition-all duration-300 flex flex-col">
                            <div className="mb-6">
                                <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-4 text-purple-400">
                                    <Rocket className="w-6 h-6" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">Enterprise</h3>
                                <p className="text-gray-400">For large organizations</p>
                            </div>
                            <div className="mb-8">
                                <span className="text-5xl font-black text-white">Custom</span>
                            </div>

                            <ul className="space-y-4 mb-8 flex-1">
                                <li className="flex items-start gap-3 text-gray-300">
                                    <Check className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                                    <span>Everything in Pro</span>
                                </li>
                                <li className="flex items-start gap-3 text-gray-300">
                                    <Check className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                                    <span>Unlimited rows</span>
                                </li>
                                <li className="flex items-start gap-3 text-gray-300">
                                    <Check className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                                    <span>Custom integrations</span>
                                </li>
                                <li className="flex items-start gap-3 text-gray-300">
                                    <Check className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                                    <span>Dedicated support</span>
                                </li>
                                <li className="flex items-start gap-3 text-gray-300">
                                    <Check className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                                    <span>SLA guarantee</span>
                                </li>
                                <li className="flex items-start gap-3 text-gray-300">
                                    <Check className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                                    <span>On-premise option</span>
                                </li>
                            </ul>

                            <Link href="mailto:vinaysehwag14@gmail.com" className="block w-full py-4 rounded-xl font-bold text-center border border-white/10 hover:bg-white/5 transition-all duration-300 text-white">
                                Contact Sales
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="relative z-10 py-20 px-6 border-t border-white/5">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-4xl font-bold text-center mb-12 text-white">
                        Frequently Asked Questions
                    </h2>

                    <div className="grid gap-6">
                        {faqs.map((faq, idx) => (
                            <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm hover:bg-white/10 transition-colors">
                                <h3 className="text-lg font-bold text-white mb-2">{faq.question}</h3>
                                <p className="text-gray-400">{faq.answer}</p>
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
        answer: "We accept all major credit cards, debit cards, UPI, and Net Banking for our Indian customers."
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
