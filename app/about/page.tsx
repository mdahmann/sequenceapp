import Link from 'next/link';

export default function AboutPage() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-3xl mx-auto space-y-16">
        {/* Hero Section */}
        <section className="text-center space-y-6">
          <h1 className="text-5xl font-light tracking-wide">About Sequence</h1>
          <p className="text-xl text-gray-400 leading-relaxed">
            A mindful space for yoga, dance, and breathwork instructors to create 
            transformative experiences.
          </p>
        </section>

        {/* Mission Section */}
        <section className="space-y-8">
          <div className="prose prose-invert mx-auto">
            <p className="text-lg leading-relaxed text-gray-300">
              Sequence was born from a vision to blend ancient wisdom with modern technology. 
              We understand that each instructor brings their unique energy and teaching style 
              to their practice.
            </p>
            
            <p className="text-lg leading-relaxed text-gray-300">
              Our platform empowers you to create personalized class sequences that reflect 
              your authentic teaching style while maintaining the sacred traditions of movement 
              and breath.
            </p>
          </div>
        </section>

        {/* Features Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white/5 p-8 rounded-lg">
            <h3 className="text-xl font-medium mb-4">Personalized Sequences</h3>
            <p className="text-gray-400">
              Create custom class sequences that align with your teaching style and your students' needs.
            </p>
          </div>

          <div className="bg-white/5 p-8 rounded-lg">
            <h3 className="text-xl font-medium mb-4">Music Integration</h3>
            <p className="text-gray-400">
              Seamlessly integrate music with your sequences to create the perfect atmosphere.
            </p>
          </div>

          <div className="bg-white/5 p-8 rounded-lg">
            <h3 className="text-xl font-medium mb-4">Comprehensive Library</h3>
            <p className="text-gray-400">
              Access our extensive library of poses, complete with descriptions and benefits.
            </p>
          </div>

          <div className="bg-white/5 p-8 rounded-lg">
            <h3 className="text-xl font-medium mb-4">Intuitive Design</h3>
            <p className="text-gray-400">
              Experience a clean, minimalist interface that lets you focus on what matters most.
            </p>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center space-y-6">
          <h2 className="text-2xl font-light">Begin Your Journey</h2>
          <div className="flex gap-4 justify-center">
            <Link
              href="/poses"
              className="px-8 py-3 bg-white text-black rounded-full font-medium hover:bg-gray-100 transition-colors"
            >
              Explore Poses
            </Link>
            <Link
              href="/auth/signup"
              className="px-8 py-3 border border-white rounded-full font-medium hover:bg-white/10 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
} 