import Link from 'next/link';

export default function Navigation() {
  return (
    <nav className="bg-gray-900 border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center h-16">
          <Link href="/" className="text-xl font-bold">
            Yoga App
          </Link>
          
          <div className="ml-8 space-x-6">
            <Link href="/poses" className="hover:text-white/80">
              Poses
            </Link>
            <Link href="/sequences" className="hover:text-white/80">
              Sequences
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
} 