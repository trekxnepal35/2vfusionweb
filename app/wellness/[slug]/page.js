
import Link from "next/link";
import { notFound } from "next/navigation";
import connectDB from "@/lib/mongodb";
import Page from "@/models/Page";
import PageType from "@/models/PageType";
import { resolveImage } from "@/lib/imageResolver";
import RichTextContent from "@/app/components/RichTextContent";


async function getWellnessPage(slug) {
    await connectDB();

    const wellnessType = await PageType.findOne({
        slug: "wellness",
    }).lean();



    if (!wellnessType) {

        return null;
    }



    const page = await Page.findOne({
        slug: slug.toLowerCase(),
        pageType: wellnessType._id,
    }).lean();


    return page?.published === true ? page : null;
}


export async function generateMetadata({ params }) {
    const { slug } = await params;
    const page = await getWellnessPage(slug);


    if (!page) {

        notFound();
    }

    return {
        title: `${page.title} | WildPath`,
        description:
            page.description?.slice(0, 155) ||
            `Discover ${page.title} with WildPath.`,
    };
}

export default async function WellnessDetailPage({ params }) {
    const { slug } = await params;

    const page = await getWellnessPage(slug);

    if (!page) {
        notFound();
    }

    const heroImage = page.images?.[0];
    const galleryImages = page.images?.slice(1) || [];

    // Pricing and booking information
    const pricingType = page.price?.pricingType || "fixed";
    const fixedPrice = Number(page.price?.amount || 0);
    const paxPrices = Array.isArray(page.price?.paxPrices)
        ? page.price.paxPrices
        : [];

    const experienceType = "wellness";
    const isBookable = await PageType.findOne({
        slug: "wellness",
    }).select("bookable").lean();

    const canBook = isBookable?.bookable === true;


    return (
        <main className="min-h-screen bg-gray-50">
            <section className="bg-emerald-950 px-4 py-12 text-white sm:py-16 lg:py-20">
                <div className="mx-auto max-w-5xl">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">
                        Wellness & Rejuvenation
                    </p>

                    <h1 className="mt-3 text-3xl font-bold sm:text-4xl lg:text-5xl">
                        {page.title}
                    </h1>

                    {page.highlight && (
                        <article className="mt-8 rounded-2xl bg-white p-6 shadow-sm sm:p-10">
                            <h2 className="text-2xl font-bold text-gray-900">
                                Highlights
                            </h2>

                            <RichTextContent
                                content={page.highlight}
                                className="prose mt-5 max-w-none prose-p:leading-8 prose-p:text-gray-700 prose-headings:font-bold prose-headings:text-gray-900 prose-a:text-blue-600 prose-a:hover:underline"
                            />
                        </article>
                    )}

                    {page.description && (
                        <p className="mt-5 max-w-3xl text-base leading-8 text-emerald-100 sm:text-lg">
                            {page.description}
                        </p>
                    )}
                </div>
            </section>

            <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
            <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
    {/* LEFT: MAIN IMAGE */}
    <div className="lg:col-span-2">
        {heroImage && (
            <div className="overflow-hidden rounded-2xl bg-gray-200 shadow-sm">
                <img
                    src={heroImage.url}
                    alt={heroImage.alt}
                    className="max-h-[600px] w-full object-cover"
                />
            </div>
        )}
    </div>

    {/* RIGHT: PRICE AND BOOKING CARD */}
    <aside className="rounded-2xl border border-gray-200 bg-white p-6 shadow-md lg:sticky lg:top-24">
        <h2 className="text-xl font-bold text-gray-900">
            Price / PAX
        </h2>

        {pricingType === "fixed" && fixedPrice > 0 ? (
            <p className="mt-4 text-2xl font-bold text-emerald-800">
                {page.price?.currency || "USD"}{" "}
                {fixedPrice.toLocaleString()}
                <span className="ml-1 text-sm font-normal text-gray-500">
                    / person
                </span>
            </p>
        ) : pricingType === "pax_based" && paxPrices.length > 0 ? (
            <div className="mt-4 space-y-3">
                {paxPrices.map((tier, index) => (
                    <div
                        key={index}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-gray-50 px-3 py-3 text-sm"
                    >
                        <span className="text-gray-600">
                            {tier.minPax}–{tier.maxPax ?? "16+"} people
                        </span>

                        <span className="font-semibold text-gray-900">
                            {page.price?.currency || "USD"}{" "}
                            {Number(tier.pricePerPax || 0).toLocaleString()}
                            <span className="font-normal text-gray-500">
                                {" "}/ person
                            </span>
                        </span>
                    </div>
                ))}
            </div>
        ) : (
            <p className="mt-3 text-sm text-gray-600">
                Contact us for pricing.
            </p>
        )}

        {canBook && (
            <Link
                href={`/booking?experienceId=${page._id.toString()}&experienceType=${experienceType}`}
                className="mt-6 block rounded-lg bg-gray-900 px-4 py-3 text-center font-semibold text-white transition hover:bg-gray-700"
            >
                Book This Experience
            </Link>
        )}

        <Link
            href={`/enquiry?experienceId=${page._id.toString()}&experienceType=${experienceType}`}
            className={`block rounded-lg border border-gray-300 px-4 py-3 text-center font-semibold text-gray-900 transition hover:bg-gray-100 ${
                canBook ? "mt-3" : "mt-6"
            }`}
        >
            Make an Enquiry
        </Link>
    </aside>
</div>

                {page.content && (
                    <article className="rounded-2xl bg-white p-6 shadow-sm sm:p-10">
                        <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                            Discover This Experience
                        </h2>

                        <RichTextContent
                            content={page.content}
                            className="prose max-w-none prose-p:leading-8 prose-p:text-gray-700 prose-headings:font-bold prose-headings:text-gray-900 prose-a:text-blue-600 prose-a:hover:underline"
                        />
                    </article>
                )}

                {galleryImages.length > 0 && (
                    <section className="mt-12">
                        <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                            Wellness Gallery
                        </h2>

                        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {galleryImages.map((image, index) => (
                                <div
                                    key={`${image.url}-${index}`}
                                    className="overflow-hidden rounded-xl bg-gray-200"
                                >
                                    <img
                                        src={image.url}
                                        alt={image.alt}
                                        loading="lazy"
                                        className="h-64 w-full object-cover transition duration-300 hover:scale-105"
                                    />
                                </div>
                            ))}
                        </div>
                    </section>
                )}

               

                {/* BACK TO WELLNESS */}
                <div className="mt-10 text-center">
                    <Link
                        href="/wellness"
                        className="inline-flex items-center gap-2 font-semibold text-emerald-700 transition hover:text-emerald-900"
                    >
                        <span aria-hidden="true">←</span>
                        Back to Wellness
                    </Link>
                </div>

            </section>
        </main>
    );
}
