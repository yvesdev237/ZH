import React from "react";
import { Link } from "react-router-dom";

const FAQ = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-4xl rounded-3xl bg-slate-900/90 border border-slate-700 p-8 shadow-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-white mb-3">
            Frequently Asked Questions
          </h1>
          <p className="text-slate-300 leading-relaxed">
            Find quick answers to common questions about using Zilo Home.
          </p>
        </div>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-2">
            How do I sign up?
          </h2>
          <p className="text-slate-300 leading-relaxed">
            Tap the "Let's get started" button on the landing page, then
            complete the registration form with your email and password.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-2">
            How do I save favorite properties?
          </h2>
          <p className="text-slate-300 leading-relaxed">
            While browsing properties, use the heart icon to add listings to
            your favorites. You can access saved properties from the Favorites
            tab.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-2">
            What if a property image doesn't load?
          </h2>
          <p className="text-slate-300 leading-relaxed">
            Some images may not load if the source is missing or incorrect. We
            are improving this experience to display fallback visuals for those
            listings.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-2">
            Can I update my profile?
          </h2>
          <p className="text-slate-300 leading-relaxed">
            Yes. Go to the Profile tab to update your details. Profile picture
            updates are planned as part of the next improvements.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-2">
            How do I contact support?
          </h2>
          <p className="text-slate-300 leading-relaxed">
            Use the app support information or contact the development team via
            the app's built-in contact method if available.
          </p>
        </section>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Link
            to="/privacy"
            className="inline-block rounded-2xl bg-blue-500 px-5 py-3 text-sm font-semibold text-white text-center transition hover:bg-blue-600"
          >
            View Privacy Policy
          </Link>
          <Link
            to="/"
            className="inline-block rounded-2xl border border-slate-600 px-5 py-3 text-sm font-semibold text-slate-200 text-center transition hover:border-slate-400"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
