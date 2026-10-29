
import Link from "next/link";
import connectDB from "@/lib/mongodb";
import Page from "@/models/Page";
import PageType from "@/models/PageType";
import { resolveImage } from "@/lib/imageResolver";
import RichTextContent from "@/app/components/RichTextContent";

export const metadata = {
    title: "Wellness & Rejuvenation | WildPath",
    description:
        "Discover nature-inspired wellness experiences, programs, and retreats with WildPath.",
};

async function getWellnessPages() {
    await connectDB();

    const wellnessType = await PageType.findOne({
        slug: "wellness",
        published: true,
    }).lean();

    if (!wellnessType) {
        return [];
    }

    const pages = await Page.find({
        pageType: wellnessType._id,
        published: true,
    })
        .sort({ createdAt: -1 })
        .lean();

    return Promise.all(
        pages.map(async (page) => {
            const images = Array.isArray(page.images) ? page.images : [];
            const firstImage = images[0];

            const imageUrl = await resolveImage({
                url:
                    typeof firstImage === "string"
                        ? firstImage
                        : firstImage?.url || page.imageUrl || "",
                storage:
                    typeof firstImage === "object"
                        ? firstImage?.storage || page.imageStorage
                        : page.imageStorage,
                key:
                    typeof firstImage === "object"
                        ? firstImage?.key || ""
                        : "",
            });

            return {
                _id: page._id.toString(),
                slug: page.slug,
                title: page.title || "Wellness Experience",
                description: page.description || page.excerpt || "",
                highlight: page.highlight || "",
                imageUrl,

                // Pricing and booking information
                price: page.price || {},
                experienceType: wellnessType.slug,
                isBookable: wellnessType.bookable === true,
            };
        })
    );
}

export default async function WellnessPage() {
    const pages = await getWellnessPages();

    return (
        <main className="min-h-screen bg-gray-50">
            <section className="bg-emerald-950 px-4 py-16 text-center text-white sm:py-20">
                <div className="mx-auto max-w-4xl">
                    <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">
                        Mind, Body & Nature
                    </p>

                    <h1 className="text-3xl font-bold sm:text-4xl lg:text-5xl">
                        Wellness & Rejuvenation
                    </h1>

                    <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-emerald-100 sm:text-lg">
                        Discover peaceful experiences that help you reconnect
                        with nature, relax your mind, and restore your energy.
                    </p>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
                {pages.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center">
                        <h2 className="text-xl font-semibold text-gray-900">
                            Wellness experiences coming soon
                        </h2>

                        <p className="mt-3 text-gray-600">
                            Please check back soon for our wellness programs and experiences.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
                        {pages.map((page) => (
                            <article
                                key={page._id}
                                className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                            >
                                <Link
                                    href={`/wellness/${page.slug}`}
                                    aria-label={`View ${page.title}`}
                                >
                                    <div className="aspect-[4/3] overflow-hidden bg-gray-200">
                                        {page.imageUrl ? (
                                            <img
                                                src={page.imageUrl}
                                                alt={page.title}
                                                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="flex h-full items-center justify-center text-gray-500">
                                                No image available
                                            </div>
                                        )}
                                    </div>
                                </Link>

                                <div className="p-6">
                                    <h2 className="text-xl font-bold text-gray-900">
                                        <Link
                                            href={`/wellness/${page.slug}`}
                                            className="transition hover:text-emerald-700"
                                        >
                                            {page.title}
                                        </Link>
                                    </h2>

                                    {page.highlight && (
                                        <div className="mt-3">
                                            <RichTextContent
                                                content={page.highlight}
                                                className="prose prose-sm max-w-none prose-p:leading-6 prose-p:text-emerald-700 prose-headings:font-bold prose-headings:text-emerald-800 prose-a:text-blue-600 prose-a:hover:underline"
                                            />
                                        </div>
                                    )}

                                    {page.description && (
                                        <div className="mt-4 line-clamp-3 text-sm leading-6 text-gray-600">
                                            <RichTextContent
                                                content={page.description}
                                                className="prose prose-sm max-w-none prose-p:my-0 prose-p:leading-6 prose-p:text-gray-600 prose-headings:font-bold prose-headings:text-gray-900 prose-a:text-blue-600 prose-a:hover:underline"
                                            />
                                        </div>
                                    )}


                                         {/* PRICE */}

                

                    {(() => {
                      const price = page.price;

                      if (!price) return null;

                      let amount = 0;
                      let label = "";

                      // PAX-based pricing: display the minimum price per person
                      if (price.pricingType === "pax_based") {
                        const tiers = Array.isArray(price.paxPrices)
                          ? price.paxPrices
                          : [];


                        const validPrices = tiers
                          .map((tier) => Number(tier.pricePerPax))
                          .filter(
                            (value) => Number.isFinite(value) && value > 0
                          );

                        if (validPrices.length === 0) return null;

                        amount = Math.min(...validPrices);
                        label = " Start From";


                      } else {
                        // Fixed pricing
                        amount = Number(price.amount);


                        if (!Number.isFinite(amount) || amount <= 0) {
                          return null;
                        }


                      }

                      return (<div className="mt-5"> <span className="text-22 font-bold text-gray-900">
                     
                        {label ? `${label} ` : ""} 
                        {price.currency || "USD"}{" "}
                        {amount.toLocaleString("en-US")} </span>


                        <span className="ml-2 text-sm text-gray-500">
                          / person
                        </span>
                      </div>


                      );
                    })()}


                             
                                    {/* EXPLORE WELLNESS */}
                                    <Link
                                        href={`/wellness/${page.slug}`}
                                        className="mt-4 inline-flex items-center gap-2 font-semibold text-emerald-700 hover:text-emerald-900"
                                    >
                                        Explore Wellness
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
