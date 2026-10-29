import { notFound } from "next/navigation";
import Link from "next/link";

import connectDB from "@/lib/mongodb";
import Page from "@/models/Page";
import PageType from "@/models/PageType";
import { resolveImage } from "@/lib/imageResolver";
import RichTextContent from "@/app/components/RichTextContent";

async function getGuide(slug) {
  await connectDB();

  // Find the published Guide page type
  const guideType = await PageType.findOne({
    slug: "guide",
    published: true,
  }).lean();

  if (!guideType) {
    return null;
  }

  // Find the published guide by slug
  const guide = await Page.findOne({
    slug: slug.toLowerCase(),
    pageType: guideType._id,
    published: true,
  })
    .populate("pageType")
    .lean();

  if (!guide) {
    return null;
  }

  // Resolve the guide profile photo
  const profile = guide.professionalGuide || {};

  if (profile.photoUrl) {
    profile.photoUrl = await resolveImage({
      url: profile.photoUrl,
      storage: profile.photoStorage,
      key: profile.photoKey,
    });
  }

  guide.professionalGuide = profile;

  return guide;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const guide = await getGuide(slug);

  if (!guide) {
    return {
      title: "Guide Not Found",
    };
  }

  const profile = guide.professionalGuide || {};

  return {
    title: `${profile.name || guide.title} | Our Guides`,
    description:
      profile.biography ||
      guide.description ||
      `Learn more about ${profile.name || guide.title}.`,
  };
}

export default async function GuideProfilePage({ params }) {
  const { slug } = await params;
  const guide = await getGuide(slug);

  if (!guide) {
    notFound();
  }

  const profile = guide.professionalGuide || {};

  const name = profile.name || guide.title;
  const photo = profile.photoUrl || guide.imageUrl;

  const languages = Array.isArray(profile.languages)
    ? profile.languages
    : [];

  const specialties = Array.isArray(profile.specialties)
    ? profile.specialties
    : [];

  const socialLinks = profile.socialLinks || {};

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero section */}
      <section className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-800 px-4 py-12 text-white sm:py-16 lg:py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-2">
          <div>
            <Link
              href="/guides"
              className="mb-6 inline-flex items-center text-sm text-emerald-100 transition hover:text-white"
            >
              ← Back to Our Guides
            </Link>

            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">
              Meet Your Guide
            </p>

            <h1 className="text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
              {name}
            </h1>

            {profile.qualifications && (
              <p className="mt-4 text-lg text-emerald-100">
                {profile.qualifications}
              </p>
            )}

            {Number(profile.experienceYears) > 0 && (
              <div className="mt-6 inline-flex rounded-full border border-white/20 bg-white/10 px-5 py-3">
                <span className="font-semibold">
                  {profile.experienceYears}{" "}
                  {Number(profile.experienceYears) === 1
                    ? "year"
                    : "years"}{" "}
                  of experience
                </span>
              </div>
            )}

            {guide.description && (
              <p className="mt-6 max-w-xl leading-7 text-emerald-50">
                {guide.description}
              </p>
            )}
          </div>

          {/* Profile photo */}
          <div className="mx-auto w-full max-w-sm">
            <div className="overflow-hidden rounded-3xl border border-white/20 bg-white/10 p-3 shadow-2xl">
              {photo ? (
                <img
                  src={photo}
                  alt={name}
                  className="h-80 w-full rounded-2xl object-cover sm:h-96"
                />
              ) : (
                <div className="flex h-80 items-center justify-center rounded-2xl bg-white/10 text-7xl font-bold text-white sm:h-96">
                  {name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Profile details */}
      <section className="px-4 py-12 sm:py-16">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-3">
          {/* Biography */}
          <article className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8 lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900">
              About {name}
            </h2>


            {profile.biography ? (
              <RichTextContent
                content={profile.biography}
                className="mt-5 leading-8 text-gray-600 [&_h1]:mb-4 [&_h1]:mt-6 [&_h1]:text-3xl [&_h1]:font-bold [&_h2]:mb-3 [&_h2]:mt-5 [&_h2]:text-2xl [&_h2]:font-bold [&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:text-xl [&_h3]:font-semibold [&_p]:mb-4 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-1 [&_a]:text-emerald-700 [&_a]:underline [&_strong]:font-bold [&_em]:italic"
              />
            ) : (
              <div className="mt-5 whitespace-pre-line leading-8 text-gray-600">
                {guide.content ||
                  guide.description ||
                  "More information about this guide will be available soon."}
              </div>
            )}

          </article>

          {/* Quick information */}
          <aside className="space-y-6">
            {profile.qualifications && (
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900">
                  Qualifications
                </h2>

                <p className="mt-3 leading-7 text-gray-600">
                  {profile.qualifications}
                </p>
              </div>
            )}

            {profile.certifications && (
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900">
                  Certifications
                </h2>

                <RichTextContent
                  content={profile.certifications}
                  className="mt-3 leading-7 text-gray-600 [&_h1]:mb-3 [&_h1]:mt-4 [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:mb-2 [&_h2]:mt-3 [&_h2]:text-xl [&_h2]:font-bold [&_p]:mb-3 [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-1 [&_a]:text-emerald-700 [&_a]:underline [&_strong]:font-bold [&_em]:italic"
                />
              </div>
            )}

          </aside>

          {/* Languages */}
          {languages.length > 0 && (
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900">
                Languages
              </h2>

              <div className="mt-4 flex flex-wrap gap-2">
                {languages.map((language, index) => (
                  <span
                    key={`${language}-${index}`}
                    className="rounded-full bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800"
                  >
                    {language}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Specialties */}
          {specialties.length > 0 && (
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900">
                Areas of Expertise
              </h2>

              <div className="mt-4 flex flex-wrap gap-2">
                {specialties.map((specialty, index) => (
                  <span
                    key={`${specialty}-${index}`}
                    className="rounded-full bg-teal-50 px-3 py-2 text-sm font-medium text-teal-800"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Social links */}
          {Object.entries(socialLinks).some(
            ([, url]) => typeof url === "string" && url.trim()
          ) && (
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900">
                  Connect With {name}
                </h2>

                <div className="mt-4 flex flex-wrap gap-3">
                  {Object.entries(socialLinks).map(([platform, url]) => {
                    if (typeof url !== "string" || !url.trim()) {
                      return null;
                    }

                    return (
                      <a
                        key={platform}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium capitalize text-gray-700 transition hover:bg-emerald-100 hover:text-emerald-800"
                      >
                        {platform}
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
        </div>
      </section>

      {/* Contact call to action */}
      <section className="px-4 pb-16">
        <div className="mx-auto max-w-6xl rounded-2xl bg-emerald-900 px-6 py-10 text-center text-white sm:px-10 sm:py-12">
          <h2 className="text-2xl font-bold sm:text-3xl">
            Ready for Your Next Adventure?
          </h2>

          <p className="mx-auto mt-3 max-w-2xl leading-7 text-emerald-100">
            Explore our trekking and travel experiences with knowledgeable
            local guides.
          </p>

          <Link
            href="/contact"
            className="mt-6 inline-flex rounded-lg bg-white px-6 py-3 font-semibold text-emerald-900 transition hover:bg-emerald-50"
          >
            Contact Us
          </Link>
        </div>
      </section>
    </main>
  );
}