import Link from "next/link";
import { notFound } from "next/navigation";

import connectDB from "@/lib/mongodb";
import Page from "@/models/Page";
import PageType from "@/models/PageType";
import Region from "@/models/Region";
import { resolvePageImages } from "@/lib/imageResolver";


/*
====================================================
REGION TREKS PAGE
====================================================
*/

export default async function RegionTreksPage({ params }) {

  /*
  ==================================================
  GET REGION SLUG
  ==================================================
  */

  const { regionSlug } = await params;


  /*
  ==================================================
  CONNECT DATABASE
  ==================================================
  */

  await connectDB();


  /*
  ==================================================
  FIND REGION
  ==================================================
  */

  const region = await Region.findOne({
    slug: regionSlug,
    published: true,
  }).lean();


  /*
  ==================================================
  REGION NOT FOUND
  ==================================================
  */

  if (!region) {

    notFound();

  }


  /*
  ==================================================
  FIND TREK PAGE TYPE
  ==================================================
  */

  const trekPageType = await PageType.findOne({
    slug: "trek",
    published: true,
  }).lean();


  /*
  ==================================================
  PAGE TYPE NOT FOUND
  ==================================================
  */

  if (!trekPageType) {

    notFound();

  }


  /*
  ==================================================
  GET REGION TREKS
  ==================================================
  */

  const treks = await Page.find({
    pageType: trekPageType._id,
    region: region._id,
    published: true,
  })
    .populate(
      "region",
      "name slug description imageUrl"
    )
    .sort({
      order: 1,
      createdAt: -1,
    })
    .lean();

  const treksWithSignedImages =
    await resolvePageImages(treks);

  /*
  ==================================================
  PAGE TITLE
  ==================================================
  */

  const pageTitle = `${region.name} Treks`;


  /*
  ==================================================
  RETURN PAGE
  ==================================================
  */

  return (

    <main className="min-h-screen bg-gray-50">

      {/* ============================================
          HERO
      ============================================ */}

      <section className="bg-gray-900 px-6 py-20 text-white">

        <div className="mx-auto max-w-full">

          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-gray-300">
            Trekking Region
          </p>

          <h1 className="text-4xl font-bold md:text-5xl">
            {pageTitle}
          </h1>

          {region.description && (

            <p className="mt-5 max-w-3xl text-lg leading-8 text-gray-300">
              {region.description}
            </p>

          )}

        </div>

      </section>


      {/* ============================================
          TREKS
      ============================================ */}

      <section className="px-6 py-16">

        <div className="mx-auto max-w-full">

          {/* ==========================================
              BREADCRUMB
          ========================================== */}

          <div className="mb-8 flex flex-wrap gap-2 text-sm text-gray-500">

            <Link
              href="/"
              className="hover:text-gray-900"
            >
              Home
            </Link>

            <span>/</span>

            <Link
              href="/treks"
              className="hover:text-gray-900"
            >
              Treks
            </Link>

            <span>/</span>

            <span className="text-gray-900">
              {region.name}
            </span>

          </div>


          {/* ==========================================
              NO TREKS
          ========================================== */}

          {treks.length === 0 ? (

            <div className="rounded-xl bg-white p-10 text-center shadow">

              <h2 className="text-xl font-semibold text-gray-800">
                No treks available in this region
              </h2>

              <p className="mt-2 text-gray-500">
                Trekking packages for this region will appear here.
              </p>

            </div>

          ) : (

            /* ========================================
               TREK GRID
            ======================================== */

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">

              {treksWithSignedImages.map((trek) => (

                <article
                  key={trek._id.toString()}
                  className="overflow-hidden rounded-xl bg-white shadow-md transition hover:-translate-y-1 hover:shadow-xl"
                >

                  {/* IMAGE */}

                  {trek.imageUrl ? (

                    <img
                      src={trek.imageUrl}
                      alt={trek.title}
                      className="h-56 w-full object-cover"
                    />

                  ) : (

                    <div className="flex h-56 items-center justify-center bg-gray-200 text-gray-500">
                      No Image
                    </div>

                  )}


                  <div className="p-6">

                    <h2 className="text-xl font-bold text-gray-900">
                      {trek.title}
                    </h2>


                    {trek.description && (

                      <p className="mt-3 line-clamp-3 text-gray-600">
                        {trek.description}
                      </p>

                    )}


                    <div className="mt-5 space-y-2 text-sm text-gray-600">

                      {trek.trekDetails?.duration && (
                        <p>
                          <strong>Duration:</strong>{" "}
                          {trek.trekDetails.duration}
                        </p>
                      )}

                      {trek.trekDetails?.difficulty && (
                        <p>
                          <strong>Difficulty:</strong>{" "}
                          {trek.trekDetails.difficulty}
                        </p>
                      )}

                      {trek.trekDetails?.maxAltitude && (
                        <p>
                          <strong>Max Altitude:</strong>{" "}
                          {trek.trekDetails.maxAltitude}
                        </p>
                      )}

                    </div>


                   {/* PRICE */}

{(() => {
const price = trek.price;

if (!price) return null;

let amount = 0;
let label = "";

// PAX-based pricing: show the minimum price per person
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
label = "Start From";


} else {
// Fixed pricing
amount = Number(price.amount);


if (!Number.isFinite(amount) || amount <= 0) {
  return null;
}


}

return ( <div className="mt-5"> <span className="text-22 font-bold text-gray-900">
{label ? `${label} ` : ""}
{price.currency || "USD"}{" "}
{amount.toLocaleString("en-US")} </span>


  <span className="ml-2 text-sm text-gray-500">
    / person
  </span>
</div>


);
})()}



                    <Link
                      href={`/treks/trek/${trek.slug}`}
                      className="mt-6 inline-block rounded-lg bg-gray-900 px-5 py-3 font-semibold text-white hover:bg-gray-700"
                    >
                      View Trek
                    </Link>

                  </div>

                </article>

              ))}

            </div>

          )}

        </div>

      </section>

    </main>

  );

}


/*
====================================================
DYNAMIC METADATA
====================================================
*/

export async function generateMetadata({ params }) {

  const { regionSlug } = await params;

  await connectDB();

  const region = await Region.findOne({
    slug: regionSlug,
    published: true,
  }).lean();


  if (!region) {

    return {
      title: "Region Not Found",
    };

  }


  return {

    title: `${region.name} Treks | Trekking in Nepal`,

    description:
      region.description ||
      `Explore trekking adventures in ${region.name}, Nepal.`,

  };

}