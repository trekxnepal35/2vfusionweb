
import { notFound } from "next/navigation";
import connectDB from "@/lib/mongodb";
import Page from "@/models/Page";
import PageType from "@/models/PageType";
import { resolveImage } from "@/lib/imageResolver";
import RichTextContent from "@/app/components/RichTextContent";

async function getTeamMember(slug) {
  await connectDB();

  const teamType = await PageType.findOne({
    slug: "team",
    published: true,
  }).lean();

  if (!teamType) {
    return null;
  }

  const member = await Page.findOne({
    slug: slug.toLowerCase(),
    pageType: teamType._id,
    published: true,
  }).lean();

  if (!member) {
    return null;
  }

  const profile = member.teamProfile || {};

  const photoUrl = await resolveImage({
    url: profile.photoUrl,
    storage: profile.photoStorage,
    key: profile.photoKey,
  });

  return {
    slug: member.slug,
    name: profile.name || member.title || "Team Member",
    position: profile.position || "",
    photoUrl,
    biography: profile.biography || "",
    socialLinks: profile.socialLinks || {},
  };
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const member = await getTeamMember(slug);

  if (!member) {
    return {
      title: "Team Member Not Found | WildPath",
    };
  }

  return {
    title: `${member.name}${member.position ? ` | ${member.position}` : ""} | WildPath`,
    description:
      member.biography?.slice(0, 155) ||
      `Meet ${member.name}, a member of the WildPath team.`,
  };
}

export default async function TeamMemberPage({ params }) {
  const { slug } = await params;
  const member = await getTeamMember(slug);

  if (!member) {
    notFound();
  }

  const socialProfiles = [
    ["linkedin", "LinkedIn"],
    ["instagram", "Instagram"],
    ["facebook", "Facebook"],
    ["website", "Website"],
  ]
    .map(([key, label]) => ({
      key,
      label,
      url: member.socialLinks[key],
    }))
    .filter(
      ({ url }) => typeof url === "string" && url.trim()
    );

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="bg-emerald-950 px-4 py-12 text-white sm:py-16 lg:py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-8 md:grid-cols-[300px_1fr] lg:gap-12">
          <div className="mx-auto aspect-[3/4] w-full max-w-[300px] overflow-hidden rounded-2xl bg-emerald-900 shadow-xl">
            {member.photoUrl ? (
              <img
                src={member.photoUrl}
                alt={member.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-emerald-200">
                No photo available
              </div>
            )}
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">
              Meet Our Team
            </p>

            <h1 className="mt-3 text-3xl font-bold sm:text-4xl lg:text-5xl">
              {member.name}
            </h1>

            {member.position && (
              <p className="mt-4 text-lg text-emerald-100 sm:text-xl">
                {member.position}
              </p>
            )}

            <div className="mt-6 h-1 w-20 rounded-full bg-emerald-400" />

            {socialProfiles.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-3">
                {socialProfiles.map(({ key, label, url }) => (
                  <a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-white/20 px-4 py-2 text-sm font-medium transition hover:bg-white/10"
                  >
                    {label} ↗
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <article className="rounded-2xl bg-white p-6 shadow-sm sm:p-10">
          <h2 className="text-2xl font-bold text-gray-900">
            About {member.name}
          </h2>


          {member.biography ? (
            <RichTextContent
              content={member.biography}
              className="mt-5 text-base leading-8 text-gray-600 [&_h1]:mb-4 [&_h1]:mt-6 [&_h1]:text-3xl [&_h1]:font-bold [&_h2]:mb-3 [&_h2]:mt-5 [&_h2]:text-2xl [&_h2]:font-bold [&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:text-xl [&_h3]:font-semibold [&_p]:mb-4 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-1 [&_a]:text-emerald-700 [&_a]:underline [&_strong]:font-bold [&_em]:italic"
            />
          ) : (
            <p className="mt-5 text-gray-500">
              More information about this team member will be available soon.
            </p>
          )}

        </article>

        <div className="mt-8 text-center">
          <a
            href="/team"
            className="inline-flex items-center gap-2 font-semibold text-emerald-700 transition hover:text-emerald-900"
          >
            <span aria-hidden="true">←</span>
            Back to Our Team
          </a>
        </div>
      </section>
    </main>
  );
}
