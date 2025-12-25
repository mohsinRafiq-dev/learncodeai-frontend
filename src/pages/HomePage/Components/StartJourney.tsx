import { useAuth } from "../../../hooks/useAuth";

export default function StartJourney() {
  const { isAuthenticated } = useAuth();
  return (
    <section className="bg-gradient-to-r from-blue-700 via-blue-900 to-blue-700 text-white py-20 text-center">
      <div className="container mx-auto px-4">
        <h1 className="text-5xl font-bold mb-4">Start your journey</h1>
        <p className="text-lg mb-8">
          join over 10 million people learning interactively
        </p>
        {isAuthenticated && (
          <a
            href="/editor"
            className="bg-yellow-500 text-white font-bold py-3 px-8 rounded-full text-lg hover:bg-yellow-600 transition duration-300 ease-in-out"
          >
            Go to Code Editor
          </a>
        )}
        {!isAuthenticated && (
          <button className="bg-yellow-500 text-white font-bold py-3 px-8 rounded-full text-lg hover:bg-yellow-600 transition duration-300 ease-in-out">
            Get Started
          </button>
        )}
      </div>
    </section>
  );
}

