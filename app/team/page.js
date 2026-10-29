
import Link from "next/link";
import connectDB from "@/lib/mongodb";
import Page from "@/models/Page";
import PageType from "@/models/PageType";
import { resolveImage } from "@/lib/imageResolver";
import RichTextContent from "@/app/components/RichTextContent";

export const metadata = {
  title: "Our Team | WildPath",
  description:
    "Meet the people behind WildPath and learn about the team supporting your adventures.",
};

async function getTeamMembers() {
  await connectDB();

  const teamType = await PageType.findOne({
    slug: "team",
    published: true,
  }).lean();

  if (!teamType) {
    return [];
  }

  const members = await Page.find({
    pageType: teamType._id,
    published: true,
  })
    .sort({ createdAt: -1 })
    .lean();

  return Promise.all(
    members.map(async (member) => {
      const profile = member.teamProfile || {};

      const photoUrl = await resolveImage({
        url: profile.photoUrl,
        storage: profile.photoStorage,
        key: profile.photoKey,
      });

      return {
        _id: member._id.toString(),
        slug: member.slug,
        name: profile.name || member.title || "Team Member",
        position: profile.position || "",
        photoUrl,
        biography: profile.biography || member.excerpt || "",
      };
    })
  );
}

export default async function TeamPage() {
  const members = await getTeamMembers();

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="bg-emerald-950 px-4 py-16 text-center text-white sm:py-20">
        <div className="mx-auto max-w-4xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">
            The People Behind WildPath
          </p>

          <h1 className="text-3xl font-bold sm:text-4xl lg:text-5xl">
            Meet Our Team
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-emerald-100 sm:text-lg">
            Meet the people who bring our adventures to life through
            their knowledge, dedication, and passion for travel.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        {members.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center">
            <h2 className="text-xl font-semibold text-gray-900">
              Our team profiles are coming soon
            </h2>
            <p className="mt-3 text-gray-600">
              Please check back soon to meet our team.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {members.map((member) => (
              <article
                key={member._id}
                className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <Link
                  href={`/team/${member.slug}`}
                  aria-label={`View ${member.name}'s profile`}
                >
                  <div className="aspect-[4/3] overflow-hidden bg-gray-200">
                    {member.photoUrl ? (
                      <img
                        src={member.photoUrl}
                        alt={member.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-500">
                        No photo available
                      </div>
                    )}
                  </div>
                </Link>

                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    <Link
                      href={`/team/${member.slug}`}
                      className="transition hover:text-emerald-700"
                    >
                      {member.name}
                    </Link>
                  </h2>

                  {member.position && (
                    <p className="mt-2 text-sm font-semibold text-emerald-700">
                      {member.position}
                    </p>
                  )}

                  {member.biography && (
                    <RichTextContent
                      content={member.biography}
                      className="mt-4 line-clamp-3 text-sm leading-6 text-gray-600 [&_h1]:text-base [&_h1]:font-bold [&_h2]:text-sm [&_h2]:font-bold [&_h3]:font-semibold [&_p]:mb-1 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_strong]:font-bold [&_em]:italic [&_a]:text-emerald-700 [&_a]:underline"
                    />
                  )}


                  <Link
                    href={`/team/${member.slug}`}
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
