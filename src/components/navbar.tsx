'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LogIn, Menu, X, Rocket, User, LogOut } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { fadeIn, slideUp } from '@/lib/animations'

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20)
        }
        window.addEventListener('scroll', handleScroll)

        // Initial auth check
        checkUser()

        // Auth listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
            setLoading(false)
        })

        return () => {
            window.removeEventListener('scroll', handleScroll)
            subscription.unsubscribe()
        }
    }, [])

    async function checkUser() {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
        } catch (error) {
            console.error('Error checking user:', error)
        } finally {
            setLoading(false)
        }
    }

    const isActive = (path: string) => pathname === path

    const navLinks = [
        { name: 'Home', href: '/' },
        { name: 'Dashboard', href: '/dashboard' },
        { name: 'Pricing', href: '/pricing' },
        { name: 'About', href: '/about' },
    ]

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
        setUser(null)
    }

    const isHome = pathname === '/'
    const showBackground = scrolled || !isHome

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${showBackground ? 'bg-gray-950/80 backdrop-blur-xl border-b border-white/10 py-3' : 'bg-transparent py-5'
                }`}
        >
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="relative">
                        <div className="absolute inset-0 bg-indigo-500 blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-300 rounded-full" />
                        <div className="relative w-10 h-10 btn-gradient-primary rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300 shadow-lg shadow-indigo-500/20 border border-white/10">
                            {/* Replaced img with a cleaner icon composition if image fails, but using image as requested */}
                            <img src="/logo.png" alt="DataGenie" className="w-6 h-6 invert brightness-0" />
                        </div>
                    </div>
                    <span className="font-bold text-xl text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-400 group-hover:to-purple-400 transition-all duration-300">
                        DataGenie
                    </span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-1 bg-white/5 rounded-full p-1.5 border border-white/5 backdrop-blur-md">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${isActive(link.href)
                                ? 'bg-white/10 text-white shadow-sm'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {link.name}
                        </Link>
                    ))}
                </nav>

                {/* Auth Buttons */}
                <div className="hidden md:flex items-center gap-4">
                    {!loading && (
                        user ? (
                            <div className="flex items-center gap-4">
                                <Link href="/dashboard" className="flex items-center gap-2 group">
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-[1px]">
                                        <div className="w-full h-full rounded-full bg-gray-900 border border-transparent overflow-hidden relative">
                                            {user.user_metadata?.avatar_url || user.user_metadata?.picture ? (
                                                <img
                                                    src={user.user_metadata.avatar_url || user.user_metadata.picture}
                                                    alt="Profile"
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-white/10 text-white font-bold text-sm">
                                                    {(user.user_metadata?.full_name || user.email || 'U').charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="hidden lg:block text-left">
                                        <p className="text-sm font-bold text-white leading-none mb-0.5">
                                            {user.user_metadata?.full_name || user.user_metadata?.name || 'User'}
                                        </p>
                                        <p className="text-[10px] text-gray-400 leading-none">
                                            {user.email?.length > 20 ? `${user.email.substring(0, 20)}...` : user.email}
                                        </p>
                                    </div>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                                    title="Logout"
                                >
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
                                >
                                    Log in
                                </Link>
                                <Link
                                    href="/signup"
                                    className="px-5 py-2.5 btn-gradient-primary rounded-xl text-sm font-bold text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-105 transition-all duration-300"
                                >
                                    Get Started
                                </Link>
                            </>
                        )
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden p-2 text-gray-300 hover:text-white"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-gray-950 border-b border-white/10 overflow-hidden"
                    >
                        <div className="px-6 py-6 flex flex-col gap-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className={`text-lg font-medium ${isActive(link.href) ? 'text-indigo-400' : 'text-gray-400'}`}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <div className="h-px bg-white/10 my-2" />
                            {user ? (
                                <Link
                                    href="/dashboard"
                                    className="btn-gradient-primary py-3 rounded-xl text-center font-bold text-white"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Go to Dashboard
                                </Link>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    <Link
                                        href="/login"
                                        className="py-3 rounded-xl text-center font-medium text-white bg-white/5 border border-white/5"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Log in
                                    </Link>
                                    <Link
                                        href="/signup"
                                        className="btn-gradient-primary py-3 rounded-xl text-center font-bold text-white"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Get Started
                                    </Link>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    )
}
