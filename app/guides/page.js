
import Link from "next/link";
import connectDB from "@/lib/mongodb";
import Page from "@/models/Page";
import PageType from "@/models/PageType";

import { resolveImage } from "@/lib/imageResolver";
import RichTextContent from "@/app/components/RichTextContent";


export const metadata = {
  title: "Our Professional Guides | WildPath",
  description:
    "Meet WildPath's professional guides and discover the experience and expertise behind your next adventure.",
};

async function getGuides() {
  await connectDB();

  const guideType = await PageType.findOne({
    slug: "guide",
    published: true,
  }).lean();

  if (!guideType) {
    return [];
  }

  const guides = await Page.find({
    pageType: guideType._id,
    published: true,
  })
    .sort({ createdAt: -1 })
    .lean();


  return Promise.all(
    guides.map(async (guide) => {
      const profile = guide.professionalGuide || {};

      const photoUrl = await resolveImage({
        url: profile.photoUrl,
        storage: profile.photoStorage,
        key: profile.photoKey,
      });

      return {
        _id: guide._id.toString(),
        slug: guide.slug,
        name: profile.name || guide.title || "Professional Guide",
        photoUrl,
        qualifications: profile.qualifications || "",
        experienceYears: profile.experienceYears ?? "",
        specialties: Array.isArray(profile.specialties)
          ? profile.specialties
          : [],
        biography: profile.biography || guide.excerpt || "",
      };
    })
  );

}

export default async function GuidesPage() {
  const guides = await getGuides();

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="bg-emerald-950 px-4 py-16 text-center text-white sm:py-20">
        <div className="mx-auto max-w-4xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">
            Meet Our Team
          </p>

          <h1 className="text-3xl font-bold sm:text-4xl lg:text-5xl">
            Our Professional Guides
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-emerald-100 sm:text-lg">
            Meet the experienced people who help make every WildPath
            adventure memorable, safe, and meaningful.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        {guides.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center">
            <h2 className="text-xl font-semibold text-gray-900">
              Our guides are coming soon
            </h2>
            <p className="mt-3 text-gray-600">
              Please check back soon to meet our professional guides.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {guides.map((guide) => (
              <article
                key={guide._id}
                className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="aspect-[4/3] overflow-hidden bg-gray-200">
                  {guide.photoUrl ? (
                    <img
                      src={guide.photoUrl}
                      alt={guide.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-500">
                      No photo available
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    {guide.name}
                  </h2>

                  {guide.qualifications && (
                    <p className="mt-1 text-sm text-emerald-700">
                      {guide.qualifications}
                    </p>
                  )}

                  {guide.experienceYears !== "" && (
                    <p className="mt-3 text-sm font-medium text-gray-600">
                      {guide.experienceYears}{" "}
                      {Number(guide.experienceYears) === 1
                        ? "year"
                        : "years"}{" "}
                      of experience
                    </p>
                  )}

                  {guide.specialties.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {guide.specialties.slice(0, 4).map((specialty) => (
                        <span
                          key={specialty}
                          className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  )}

                  {guide.biography && (
                    <RichTextContent
                      content={guide.biography}
                      className="mt-4 line-clamp-3 text-sm leading-6 text-gray-600 [&_h1]:text-base [&_h1]:font-bold [&_h2]:text-sm [&_h2]:font-bold [&_h3]:font-semibold [&_p]:mb-1 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_strong]:font-bold [&_em]:italic [&_a]:text-emerald-700 [&_a]:underline"
                    />
                  )}


                  <Link
                    href={`/guides/${guide.slug}`}
                    className="mt-6 inline-flex items-center gap-2 font-semibold text-emerald-700 hover:text-emerald-900"
                  >
                    View Profile
                    <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
