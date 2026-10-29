import Link from "next/link";

import connectDB from "@/lib/mongodb";
import Page from "@/models/Page";
import PageType from "@/models/PageType";
import { resolvePageImages } from "@/lib/imageResolver";
import Region from "@/models/Region";



/*
====================================================
TOURS PAGE
====================================================
*/

export const metadata = {
  title: "Tours in Nepal",
  description:
    "Explore cultural, sightseeing and adventure tours throughout Nepal.",
};


export default async function ToursPage() {

  /*
  ==================================================
  CONNECT DATABASE
  ==================================================
  */

  await connectDB();


  /*
  ==================================================
  FIND TOUR PAGE TYPE
  ==================================================
  */

  const tourPageType = await PageType.findOne({
    slug: "tour",
    published: true,
  }).lean();


  /*
  ==================================================
  PAGE TYPE NOT FOUND
  ==================================================
  */

  if (!tourPageType) {

    return (

      <main className="min-h-screen px-6 py-16">

        <div className="mx-auto max-w-6xl">

          <h1 className="mb-4 text-4xl font-bold">
            Tours in Nepal
          </h1>

          <p className="text-gray-600">
            Tour page type has not been configured yet.
          </p>

        </div>

      </main>

    );

  }


  /*
  ==================================================
  GET TOURS
  ==================================================
  */

  const tourDocuments = await Page.find({
    pageType: tourPageType._id,
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




  /*
====================================================
RESOLVE TOUR CARD IMAGES
====================================================
*/

  const tours =
    await resolvePageImages(tourDocuments);


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

        <div className="mx-auto max-w-6xl">

          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-gray-300">
            Explore Nepal
          </p>

          <h1 className="text-4xl font-bold md:text-5xl">
            Tours in Nepal
          </h1>

          <p className="mt-5 max-w-3xl text-lg leading-8 text-gray-300">
            Discover Nepal's culture, heritage, landscapes and
            unforgettable travel experiences.
          </p>

        </div>

      </section>


      {/* ============================================
          TOUR LIST
      ============================================ */}

      <section className="px-6 py-16">

        <div className="mx-auto max-w-full">

          <div className="mb-10">

            <h2 className="text-3xl font-bold text-gray-900">
              Our Tour Packages
            </h2>

            <p className="mt-2 text-gray-600">
              Choose from our available Nepal tour experiences.
            </p>

          </div>


          {/* ==========================================
              NO TOURS
          ========================================== */}

          {tours.length === 0 ? (

            <div className="rounded-xl bg-white p-10 text-center shadow">

              <h2 className="text-xl font-semibold text-gray-800">
                No tours available
              </h2>

              <p className="mt-2 text-gray-500">
                Tour packages will appear here once published.
              </p>

            </div>

          ) : (

            /* ========================================
               TOUR GRID
            ======================================== */

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">

              {tours.map((tour) => (

                <article
                  key={tour._id.toString()}
                  className="overflow-hidden rounded-xl bg-white shadow-md transition hover:-translate-y-1 hover:shadow-xl"
                >

                  {/* ==================================
                      IMAGE
                  ================================== */}

                  {tour.imageUrl ? (

                    <img
                      src={tour.imageUrl}
                      alt={tour.title}
                      className="h-56 w-full object-cover"
                    />

                  ) : (

                    <div className="flex h-56 items-center justify-center bg-gray-200 text-gray-500">
                      No Image
                    </div>

                  )}


                  {/* ==================================
                      CONTENT
                  ================================== */}

                  <div className="p-6">

                    <h2 className="text-xl font-bold text-gray-900">
                      {tour.title}
                    </h2>


                    {/* DESCRIPTION */}

                    {tour.description && (

                      <p className="mt-3 line-clamp-3 text-gray-600">
                        {tour.description}
                      </p>

                    )}


                    {/* TOUR DETAILS */}

                    <div className="mt-5 space-y-2 text-sm text-gray-600">

                      {tour.tourDetails?.duration && (

                        <p>
                          <strong>Duration:</strong>{" "}
                          {tour.tourDetails.duration}
                        </p>

                      )}


                      {tour.tourDetails?.tourType && (

                        <p>
                          <strong>Tour Type:</strong>{" "}
                          {tour.tourDetails.tourType}
                        </p>

                      )}


                      {tour.tourDetails?.destination && (

                        <p>
                          <strong>Destination:</strong>{" "}
                          {tour.tourDetails.destination}
                        </p>

                      )}


                      {tour.tourDetails?.bestSeason && (

                        <p>
                          <strong>Best Season:</strong>{" "}
                          {tour.tourDetails.bestSeason}
                        </p>

                      )}

                    </div>


                    {/* PRICE */}

                

                    {(() => {
                      const price = tour.price;

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



                    {/* BUTTON */}

                    <Link
                      href={`/tours/${tour.slug}`}
                      className="mt-6 inline-block rounded-lg bg-gray-900 px-5 py-3 font-semibold text-white transition hover:bg-gray-700"
                    >
                      View Tour
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