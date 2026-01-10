export default function Footer() {
    return (
        <footer className="border-t border-neutral-800 py-8 bg-neutral-950 text-center text-neutral-500 text-sm">
            <div className="max-w-7xl mx-auto px-6">
                <p>&copy; {new Date().getFullYear()} DataGenie. Powered by AI. Built with ❤️</p>
            </div>
        </footer>
    )
}
