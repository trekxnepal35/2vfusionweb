
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import Page from "@/models/Page";
import PageType from "@/models/PageType";
import Region from "@/models/Region";
import { verifyAdminToken } from "@/lib/auth";
import { resolvePageImage, resolvePageImages } from "@/lib/imageResolver";


function getAdminFromRequest(request) {

  const token =
    request.cookies.get("admin_token")?.value;

  if (!token) {
    return null;
  }

  return verifyAdminToken(token);
}


/*
========================================
CLEAN PAGE IMAGES
========================================

Supports:

[
  {
    url: "https://example.com/image.jpg",
    alt: "Everest Base Camp"
  }
]

Also supports old string format:

[
  "https://example.com/image.jpg"
]

The first image becomes the primary image.
========================================
*/

function getCleanImages(images) {

  if (!Array.isArray(images)) {
    return [];
  }


  return images

    .map((image) => {

      /*
      ========================================
      OLD STRING IMAGE FORMAT
      ========================================
      */

      if (typeof image === "string") {

        const url =
          image.trim();

        if (!url) {
          return null;
        }


        const fileName =
          url
            .split("/")
            .pop()
            ?.split("?")[0] ||
          "Page image";


        return {
          url,

          alt:
            fileName || "Page image",

          storage: "",

          publicId: "",

          key: "",
        };

      }


      /*
      ========================================
      NEW IMAGE OBJECT
      ========================================
      */

      const url =
        String(
          image?.url || ""
        ).trim();


      if (!url) {
        return null;
      }


      /*
      ----------------------------------------
      ALT TEXT
      ----------------------------------------
      */

      const fileName =
        url
          .split("/")
          .pop()
          ?.split("?")[0] ||
        "Page image";


      const alt =
        String(
          image?.alt || ""
        ).trim() ||
        fileName;


      /*
      ----------------------------------------
      STORAGE
      ----------------------------------------
      */

      const storage =
        image?.storage === "cloudinary" ||
          image?.storage === "s3"
          ? image.storage
          : "";


      /*
      ----------------------------------------
      CLOUDINARY PUBLIC ID
      ----------------------------------------
      */

      const publicId =
        String(
          image?.publicId || ""
        ).trim();


      /*
      ----------------------------------------
      S3 KEY
      ----------------------------------------
      */

      const key =
        String(
          image?.key || ""
        ).trim();


      return {

        url,

        alt,

        storage,

        publicId,

        key,

      };

    })

    .filter(Boolean);

}


/*
========================================
GET PAGES
========================================
*/

export async function GET(request) {

  try {

    await connectDB();

    const { searchParams } =
      new URL(request.url);


    /*
    ========================================
    BASIC FILTERS
    ========================================
    */

    const id =
      searchParams.get("id");

    const slug =
      searchParams.get("slug");

    const pageType =
      searchParams.get("pageType");

    const region =
      searchParams.get("region");

    const published =
      searchParams.get("published");


    /*
    ========================================
    SEARCH / FILTER PARAMETERS
    ========================================
    */

    const search =
      searchParams.get("search");

    const duration =
      searchParams.get("duration");

    const difficulty =
      searchParams.get("difficulty");

    const minPrice =
      searchParams.get("minPrice");

    const maxPrice =
      searchParams.get("maxPrice");


    /*
    ========================================
    PAGINATION
    ========================================
    */

    const requestedPage =
      Number(
        searchParams.get("page") || 1
      );

    const requestedLimit =
      Number(
        searchParams.get("limit") || 600
      );


    const page =
      Number.isInteger(requestedPage) &&
        requestedPage > 0
        ? requestedPage
        : 1;


    const limit =
      Number.isInteger(requestedLimit) &&
        requestedLimit > 0 &&
        requestedLimit <= 600
        ? requestedLimit
        : 10;


    const skip =
      (page - 1) * limit;


    /*
    ========================================
    MAIN FILTER
    ========================================
    */

    const filter = {};


    /*
    ========================================
    FIND BY ID
    ========================================
    */

    if (id) {

      if (
        !mongoose.isValidObjectId(id)
      ) {

        return NextResponse.json(
          {
            success: false,
            message: "Invalid page ID",
          },
          { status: 400 }
        );

      }


      const pageData =
        await Page.findById(id)
          .populate("pageType")
          .populate("region")
          .lean();


      if (!pageData) {

        return NextResponse.json(
          {
            success: false,
            message: "Page not found",
          },
          { status: 404 }
        );

      }
      /*
         
        AWS image resolve
     
         */


      const imageUrl =
        await resolvePageImage(pageData);

      pageData.imageUrl = imageUrl;


      return NextResponse.json({
        success: true,
        data: pageData,
      });

    }


    /*
    ========================================
    FIND BY SLUG
    ========================================
    */

    if (slug) {

      filter.slug =
        String(slug)
          .trim()
          .toLowerCase();

    }


    /*
    ========================================
    SEARCH
    ========================================

    Searches:

    - title
    - slug
    - description
    - content

    ========================================
    */

    if (
      search &&
      String(search).trim()
    ) {

      const searchValue =
        String(search).trim();


      /*
      Escape special regex characters
      so user input cannot break regex.
      */

      const escapedSearch =
        searchValue.replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&"
        );


      filter.$or = [

        {
          title: {
            $regex:
              escapedSearch,
            $options: "i",
          },
        },

        {
          slug: {
            $regex:
              escapedSearch,
            $options: "i",
          },
        },

        {
          description: {
            $regex:
              escapedSearch,
            $options: "i",
          },
        },

        {
          content: {
            $regex:
              escapedSearch,
            $options: "i",
          },
        },
        {
          highlight: {
            $regex:
              escapedSearch,
            $options: "i",
          },
        },

      ];

    }


    /*
    ========================================
    PAGE TYPE
    ========================================
    */

    if (pageType) {

      let pageTypeDoc = null;


      /*
      --------------------------------
      PAGE TYPE CAN BE:

      - ObjectId
      - Slug such as "trek"
      --------------------------------
      */

      if (
        mongoose.isValidObjectId(
          pageType
        )
      ) {

        pageTypeDoc =
          await PageType.findById(
            pageType
          ).lean();

      } else {

        pageTypeDoc =
          await PageType.findOne({

            slug:
              String(pageType)
                .trim()
                .toLowerCase(),

          }).lean();

      }


      /*
      --------------------------------
      PAGE TYPE NOT FOUND
      --------------------------------
      */

      if (!pageTypeDoc) {

        return NextResponse.json({

          success: true,

          data: [],

          pagination: {
            page,
            limit,
            totalItems: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPrevPage:
              page > 1,
          },

        });

      }


      filter.pageType =
        pageTypeDoc._id;

    }


    /*
    ========================================
    REGION
    ========================================
    */

    if (region) {

      let regionDoc = null;


      /*
      --------------------------------
      REGION CAN BE:

      - ObjectId
      - Slug
      --------------------------------
      */

      if (
        mongoose.isValidObjectId(
          region
        )
      ) {

        regionDoc =
          await Region.findById(
            region
          ).lean();

      } else {

        regionDoc =
          await Region.findOne({

            slug:
              String(region)
                .trim()
                .toLowerCase(),

          }).lean();

      }


      /*
      --------------------------------
      REGION NOT FOUND
      --------------------------------
      */

      if (!regionDoc) {

        return NextResponse.json({

          success: true,

          data: [],

          pagination: {
            page,
            limit,
            totalItems: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPrevPage:
              page > 1,
          },

        });

      }


      filter.region =
        regionDoc._id;

    }


    /*
    ========================================
    PUBLISHED
    ========================================
    */

    if (published !== null) {

      filter.published =
        published === "true";

    }


    /*
    ========================================
    DURATION FILTER
    ========================================

    Existing Page model stores duration
    as a STRING.

    Trek:
      trekDetails.duration

    Tour:
      tourDetails.duration

    Examples:

      "14 Days"
      "7 Days"
      "3 Days / 2 Nights"

    ========================================
    */

    if (
      duration &&
      String(duration).trim()
    ) {

      const durationValue =
        String(duration).trim();


      const escapedDuration =
        durationValue.replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&"
        );


      filter.$or = [

        ...(filter.$or || []),

        {
          "trekDetails.duration": {
            $regex:
              escapedDuration,
            $options: "i",
          },
        },

        {
          "tourDetails.duration": {
            $regex:
              escapedDuration,
            $options: "i",
          },
        },

      ];

    }


    /*
    ========================================
    DIFFICULTY FILTER
    ========================================

    Difficulty exists inside:

      trekDetails.difficulty

    Examples:

      Easy
      Moderate
      Challenging
      Difficult

    ========================================
    */

    if (
      difficulty &&
      String(difficulty).trim()
    ) {

      const difficultyValue =
        String(difficulty).trim();


      const escapedDifficulty =
        difficultyValue.replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&"
        );


      filter[
        "trekDetails.difficulty"
      ] = {

        $regex:
          escapedDifficulty,

        $options: "i",

      };

    }


    /*
    ========================================
    PRICE FILTER
    ========================================

    Supports:

      price.amount

    and:

      price.paxPrices.pricePerPax

    ========================================
    */

    const hasMinPrice =
      minPrice !== null &&
      minPrice !== "" &&
      Number.isFinite(
        Number(minPrice)
      );


    const hasMaxPrice =
      maxPrice !== null &&
      maxPrice !== "" &&
      Number.isFinite(
        Number(maxPrice)
      );


    if (
      hasMinPrice ||
      hasMaxPrice
    ) {

      const priceConditions = [];


      /*
      --------------------------------
      FIXED PRICE
      --------------------------------
      */

      const amountCondition = {};


      if (hasMinPrice) {

        amountCondition.$gte =
          Number(minPrice);

      }


      if (hasMaxPrice) {

        amountCondition.$lte =
          Number(maxPrice);

      }


      priceConditions.push({

        "price.amount":
          amountCondition,

      });


      /*
      --------------------------------
      PAX PRICE
      --------------------------------
      */

      const paxPriceCondition = {};


      if (hasMinPrice) {

        paxPriceCondition.$gte =
          Number(minPrice);

      }


      if (hasMaxPrice) {

        paxPriceCondition.$lte =
          Number(maxPrice);

      }


      priceConditions.push({

        "price.paxPrices.pricePerPax":
          paxPriceCondition,

      });


      /*
      --------------------------------
      COMBINE WITH EXISTING $OR
      --------------------------------
      */

      if (filter.$or) {

        const existingOr =
          filter.$or;

        delete filter.$or;

        filter.$and = [

          {
            $or: existingOr,
          },

          {
            $or: priceConditions,
          },

        ];

      } else {

        filter.$or =
          priceConditions;

      }

    }


    /*
    ========================================
    COUNT TOTAL PAGES
    ========================================
    */

    const totalItems =
      await Page.countDocuments(
        filter
      );


    const totalPages =
      totalItems === 0
        ? 0
        : Math.ceil(
          totalItems / limit
        );


    /*
    ========================================
    FIND PAGES
    ========================================
    */

    const pages =
      await Page.find(filter)

        .populate("pageType")

        .populate("region")

        .sort({
          order: 1,
          createdAt: -1,
        })

        .skip(skip)

        .limit(limit)

        .lean();

    //  Solve AWS image
    const pagesWithImages =
      await resolvePageImages(pages);




    /*
    ========================================
    PAGINATION INFORMATION
    ========================================
    */

    const hasNextPage =
      page < totalPages;


    const hasPrevPage =
      page > 1;


    /*
    ========================================
    RESPONSE
    ========================================
    */

    return NextResponse.json({

      success: true,

      data: pagesWithImages,

      pagination: {

        page,

        limit,

        totalItems,

        totalPages,

        hasNextPage,

        hasPrevPage,

      },

    });


  } catch (error) {

    console.error(
      "GET /api/pages error:",
      error
    );


    /*
    ========================================
    MONGOOSE VALIDATION ERROR
    ========================================
    */

    if (
      error.name ===
      "ValidationError"
    ) {

      const messages =
        Object.values(
          error.errors
        ).map(
          (item) =>
            item.message
        );


      return NextResponse.json(
        {
          success: false,
          message:
            messages.join(", "),
        },
        { status: 400 }
      );

    }


    /*
    ========================================
    CAST ERROR
    ========================================
    */

    if (
      error.name ===
      "CastError"
    ) {

      return NextResponse.json(
        {
          success: false,
          message:
            `Invalid ${error.path ||
            "value"
            }: ${error.value}`,
        },
        { status: 400 }
      );

    }


    /*
    ========================================
    DUPLICATE KEY ERROR
    ========================================
    */

    if (
      error.code === 11000
    ) {

      return NextResponse.json(
        {
          success: false,
          message:
            "A page with this value already exists.",
        },
        { status: 409 }
      );

    }


    /*
    ========================================
    OTHER SERVER ERRORS
    ========================================
    */

    return NextResponse.json(
      {
        success: false,
        message:
          error.message ||
          "Internal server error",
      },
      { status: 500 }
    );

  }

}


/*
========================================
POST CREATE PAGE
========================================
*/

export async function POST(request) {

  try {

    /*
    ========================================
    ADMIN AUTHORIZATION
    ========================================
    */

    const admin =
      getAdminFromRequest(
        request
      );


    if (!admin) {

      return NextResponse.json(
        {
          success: false,
          message:
            "Unauthorized. Admin login required.",
        },
        { status: 401 }
      );

    }


    await connectDB();


    const body =
      await request.json();


    /*
    ========================================
    BASIC VALIDATION
    ========================================
    */

    if (!body.title) {

      return NextResponse.json(
        {
          success: false,
          message:
            "Title is required",
        },
        { status: 400 }
      );

    }


    if (!body.slug) {

      return NextResponse.json(
        {
          success: false,
          message:
            "Slug is required",
        },
        { status: 400 }
      );

    }


    if (!body.pageType) {

      return NextResponse.json(
        {
          success: false,
          message:
            "Page type is required",
        },
        { status: 400 }
      );

    }


    /*
    ========================================
    FIND PAGE TYPE
    ========================================
    */

    let pageType = null;


    /*
    --------------------------------
    PAGE TYPE CAN BE:

    - ObjectId
    - Slug such as "blog"
    --------------------------------
    */

    if (
      mongoose.isValidObjectId(
        body.pageType
      )
    ) {

      pageType =
        await PageType.findById(
          body.pageType
        );

    } else {

      pageType =
        await PageType.findOne({

          slug:
            String(
              body.pageType
            )
              .trim()
              .toLowerCase(),

        });

    }


    /*
    --------------------------------
    INVALID PAGE TYPE
    --------------------------------
    */

    if (!pageType) {

      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid page type",
        },
        { status: 400 }
      );

    }


    /*
    ========================================
    CHECK DUPLICATE SLUG
    ========================================
    */

    const slug =
      String(body.slug)
        .trim()
        .toLowerCase();


    const existingPage =
      await Page.findOne({
        slug,
      });


    if (existingPage) {

      return NextResponse.json(
        {
          success: false,
          message:
            "A page with this slug already exists",
        },
        { status: 409 }
      );

    }


    /*
    ========================================
    REGION
    ========================================
    */

    let regionId = null;


    if (body.region) {

      let region = null;


      /*
      --------------------------------
      REGION CAN BE:

      - ObjectId
      - Slug
      --------------------------------
      */

      if (
        mongoose.isValidObjectId(
          body.region
        )
      ) {

        region =
          await Region.findById(
            body.region
          );

      } else {

        region =
          await Region.findOne({

            slug:
              String(
                body.region
              )
                .trim()
                .toLowerCase(),

          });

      }


      /*
      --------------------------------
      INVALID REGION
      --------------------------------
      */

      if (!region) {

        return NextResponse.json(
          {
            success: false,
            message:
              "Invalid region",
          },
          { status: 400 }
        );

      }


      regionId =
        region._id;

    }


    /*
    ========================================
    PRICE
    ========================================
    */

    const pricingType =
      body.price?.pricingType ===
        "pax_based"
        ? "pax_based"
        : "fixed";


    let paxPrices = [];


    if (
      pricingType ===
      "pax_based"
    ) {

      if (
        !Array.isArray(
          body.price?.paxPrices
        )
      ) {

        return NextResponse.json(
          {
            success: false,
            message:
              "PAX pricing tiers are required",
          },
          { status: 400 }
        );

      }


      paxPrices =
        body.price.paxPrices.map(
          (tier) => ({

            minPax:
              Number(
                tier.minPax
              ),

            maxPax:
              tier.maxPax === "" ||
                tier.maxPax === null ||
                tier.maxPax === undefined
                ? null
                : Number(
                  tier.maxPax
                ),

            pricePerPax:
              Number(
                tier.pricePerPax
              ),

          })
        );

    }


    const price = {

      currency:
        body.price?.currency ||
        "USD",

      pricingType,

      amount:
        body.price?.amount === "" ||
          body.price?.amount ===
          undefined
          ? 0
          : Number(
            body.price.amount
          ),

      paxPrices,

    };


    /*
    ========================================
    MULTIPLE IMAGES
    ========================================
    */

    const images =
      getCleanImages(
        body.images
      );


    /*
    ========================================
    PRIMARY / LEGACY IMAGE
    ========================================

    The first image is the primary image.

    imageUrl is kept for backward
    compatibility with existing pages
    and existing frontend code.

    Priority:

    1. First body.images URL
    2. body.imageUrl
    3. Empty string
    ========================================
    */

    const primaryImageUrl =
      images.length > 0
        ? images[0].url
        : String(
          body.imageUrl || ""
        ).trim();


    /*
    ========================================
    CREATE PAGE
    ========================================
    */

    const page =
      await Page.create({

        title:
          body.title,

        slug,

        pageType:
          pageType._id,

        region:
          regionId,

        /*
        --------------------------------
        PRIMARY / LEGACY IMAGE
        --------------------------------
        */

        imageUrl:
          primaryImageUrl,

        /*
        --------------------------------
        MULTIPLE IMAGES
        --------------------------------
        */

        images,

        description:
          body.description || "",

        content:
          body.content || "",

        highlight:
          body.highlight || "",

        price,

        trekDetails:
          body.trekDetails || {},

        tourDetails:
          body.tourDetails || {},

        itinerary:
          Array.isArray(
            body.itinerary
          )
            ? body.itinerary
            : [],

        inclusions:
          Array.isArray(
            body.inclusions
          )
            ? body.inclusions
            : [],

        exclusions:
          Array.isArray(
            body.exclusions
          )
            ? body.exclusions
            : [],

        importantInformation:
          body.importantInformation ||
          "",

                  /*
          ========================================
          TEAM PROFILE
          ========================================
          */

                  teamProfile: {
                    name: String(
                      body.teamProfile?.name || ""
                    ).trim(),

                    position: String(
                      body.teamProfile?.position || ""
                    ).trim(),

                    biography: String(
                      body.teamProfile?.biography || ""
                    ).trim(),

                    photoUrl: String(
                      body.teamProfile?.photoUrl || ""
                    ).trim(),

                    photoStorage: ["cloudinary", "s3"].includes(
                      body.teamProfile?.photoStorage
                    )
                      ? body.teamProfile.photoStorage
                      : "",

                    photoPublicId: String(
                      body.teamProfile?.photoPublicId || ""
                    ).trim(),

                    photoKey: String(
                      body.teamProfile?.photoKey || ""
                    ).trim(),

                    socialLinks: {
                      linkedin: String(
                        body.teamProfile?.socialLinks?.linkedin || ""
                      ).trim(),

                      instagram: String(
                        body.teamProfile?.socialLinks?.instagram || ""
                      ).trim(),

                      facebook: String(
                        body.teamProfile?.socialLinks?.facebook || ""
                      ).trim(),

                      website: String(
                        body.teamProfile?.socialLinks?.website || ""
                      ).trim(),
                    },
                  },

                  professionalGuide: {
                    name: String(
                      body.professionalGuide?.name || ""
                    ).trim(),
                  
                    photoUrl: String(
                      body.professionalGuide?.photoUrl || ""
                    ).trim(),
                  
                    photoStorage: ["cloudinary", "s3"].includes(
                      body.professionalGuide?.photoStorage
                    )
                      ? body.professionalGuide.photoStorage
                      : "",
                  
                    photoPublicId: String(
                      body.professionalGuide?.photoPublicId || ""
                    ).trim(),
                  
                    photoKey: String(
                      body.professionalGuide?.photoKey || ""
                    ).trim(),
                  
                    qualifications: String(
                      body.professionalGuide?.qualifications || ""
                    ).trim(),
                  
                    certifications: String(
                      body.professionalGuide?.certifications || ""
                    ).trim(),
                  
                    languages: Array.isArray(body.professionalGuide?.languages)
                      ? body.professionalGuide.languages
                          .map((item) => String(item).trim())
                          .filter(Boolean)
                      : [],
                  
                    experienceYears: Math.max(
                      0,
                      Number(body.professionalGuide?.experienceYears) || 0
                    ),
                  
                    specialties: Array.isArray(body.professionalGuide?.specialties)
                      ? body.professionalGuide.specialties
                          .map((item) => String(item).trim())
                          .filter(Boolean)
                      : [],
                  
                    biography: String(
                      body.professionalGuide?.biography || ""
                    ).trim(),
                  
                    socialLinks: {
                      linkedin: String(
                        body.professionalGuide?.socialLinks?.linkedin || ""
                      ).trim(),
                  
                      instagram: String(
                        body.professionalGuide?.socialLinks?.instagram || ""
                      ).trim(),
                  
                      facebook: String(
                        body.professionalGuide?.socialLinks?.facebook || ""
                      ).trim(),
                  
                      website: String(
                        body.professionalGuide?.socialLinks?.website || ""
                      ).trim(),
                    },
                  },
        /*
========================================
FAQ MAP- IMAGE
========================================
*/

        faqImageUrl:
          body.faqImageUrl || "",

        faqImageStorage:
          ["none", "cloudinary", "s3"].includes(
            body.faqImageStorage
          )
            ? body.faqImageStorage
            : "none",

        faqImageKey:
          String(
            body.faqImageKey || ""
          ).trim(),

        /*
        ========================================
        FAQS
        ========================================
        */

        faqs:
          Array.isArray(body.faqs)
            ? body.faqs
            : [],

        /*
   ========================================
  YouTube Videos
   ========================================
   */
        youtubeVideos: Array.isArray(body.youtubeVideos)
          ? body.youtubeVideos
          : [],



        seo:
          body.seo || {},

        published:
          body.published === true,

        order:
          Number(body.order) || 0,

      });

    return NextResponse.json(
      {
        success: true,
        message:
          "Page created successfully",
        data: page,
      },
      { status: 201 }
    );


  } catch (error) {

    console.error(
      "POST /api/pages error:",
      error
    );


    /*
    ========================================
    MONGOOSE VALIDATION ERROR
    ========================================
    */

    if (
      error.name ===
      "ValidationError"
    ) {

      const messages =
        Object.values(
          error.errors
        ).map(
          (item) =>
            item.message
        );


      return NextResponse.json(
        {
          success: false,
          message:
            messages.join(", "),
        },
        { status: 400 }
      );

    }


    /*
    ========================================
    CAST ERROR
    ========================================
    */

    if (
      error.name ===
      "CastError"
    ) {

      return NextResponse.json(
        {
          success: false,
          message:
            `Invalid ${error.path ||
            "value"
            }: ${error.value}`,
        },
        { status: 400 }
      );

    }


    /*
    ========================================
    DUPLICATE KEY ERROR
    ========================================
    */

    if (
      error.code === 11000
    ) {

      return NextResponse.json(
        {
          success: false,
          message:
            "A page with this value already exists.",
        },
        { status: 409 }
      );

    }


    /*
    ========================================
    OTHER SERVER ERRORS
    ========================================
    */

    return NextResponse.json(
      {
        success: false,
        message:
          error.message ||
          "Internal server error",
      },
      { status: 500 }
    );

  }

}
