
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import Page from "@/models/Page";
import PageType from "@/models/PageType";
import Region from "@/models/Region";
import { verifyAdminToken } from "@/lib/auth";



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

The first image is the primary image.
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

        let storage = "";

        if (
          url.includes("res.cloudinary.com")
        ) {
          storage = "cloudinary";
        }

        if (
          url.includes(".s3.") ||
          url.includes(".amazonaws.com/")
        ) {
          storage = "s3";
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

          storage,

          publicId: "",

          key: "",
        };
      }


      /*
      ========================================
      IMAGE OBJECT
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
      ========================================
      ALT TEXT
      ========================================
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
      ========================================
      STORAGE
      ========================================
      */

      let storage =
        image?.storage === "cloudinary" ||
          image?.storage === "s3"
          ? image.storage
          : "";


      /*
      ----------------------------------------
      INFER STORAGE FROM URL
      ----------------------------------------
      */

      if (!storage) {

        if (
          url.includes("res.cloudinary.com")
        ) {
          storage = "cloudinary";
        }

        if (
          url.includes(".s3.") ||
          url.includes(".amazonaws.com/")
        ) {
          storage = "s3";
        }
      }


      /*
      ========================================
      RETURN IMAGE
      ========================================
      */

      return {
        url,

        alt,

        storage,

        publicId:
          String(
            image?.publicId || ""
          ).trim(),

        key:
          String(
            image?.key || ""
          ).trim(),
      };

    })
    .filter(Boolean);

}


/*
========================================
GET SINGLE PAGE
========================================
*/

export async function GET(
  request,
  { params }
) {

  try {

    await connectDB();

    const { id } =
      await params;


    const page =
      await Page.findById(id)

        .populate("pageType")

        .populate("region")

        .lean();


    if (!page) {

      return NextResponse.json(
        {
          success: false,
          message:
            "Page not found",
        },
        { status: 404 }
      );

    }


    return NextResponse.json({

      success: true,

      data: page,

    });


  } catch (error) {

    console.error(
      "GET page error:",
      error
    );


    return NextResponse.json(
      {
        success: false,
        message:
          error.message,
      },
      { status: 500 }
    );

  }

}


/*
========================================
PUT UPDATE PAGE
========================================
*/

export async function PUT(
  request,
  { params }
) {

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


    const { id } =
      await params;


    const body =
      await request.json();


    /*
    ========================================
    FIND EXISTING PAGE
    ========================================
    */

    const existingPage =
      await Page.findById(id);


    if (!existingPage) {

      return NextResponse.json(
        {
          success: false,
          message:
            "Page not found",
        },
        { status: 404 }
      );

    }


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
    PAGE TYPE
    ========================================
    */

    let pageType = null;


    /*
    --------------------------------
    PAGE TYPE CAN BE:

    - ObjectId
    - Slug
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
    SLUG
    ========================================
    */

    const slug =
      String(body.slug)
        .trim()
        .toLowerCase();


    const duplicate =
      await Page.findOne({

        slug,

        _id: {
          $ne: id,
        },

      });


    if (duplicate) {

      return NextResponse.json(
        {
          success: false,
          message:
            "Another page already uses this slug",
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


    /*
    ========================================
    MULTIPLE IMAGES
    ========================================
    */

    let images;


    /*
    ----------------------------------------
    IF IMAGES WERE SENT
    ----------------------------------------

    Replace the existing image list with
    the new ordered image list.

    This is important because the admin
    PageForm can reorder/remove images.
    ----------------------------------------
    */

    if (
      Array.isArray(
        body.images
      )
    ) {

      images =
        getCleanImages(
          body.images
        );

    }


    /*
    ----------------------------------------
    IF IMAGES WERE NOT SENT
    ----------------------------------------

    Preserve existing images.

    This prevents an older frontend or
    partial update from accidentally
    deleting the gallery.
    ----------------------------------------
    */

    else {

      images =
        Array.isArray(
          existingPage.images
        )
          ? existingPage.images.map(
            (image) => {

              const url =
                String(
                  image?.url || ""
                ).trim();

              if (!url) {
                return null;
              }

              /*
              ========================================
              ALT TEXT
              ========================================
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
              ========================================
              STORAGE
              ========================================
              */

              let storage =
                image?.storage === "cloudinary" ||
                  image?.storage === "s3"
                  ? image.storage
                  : "";


              /*
              ----------------------------------------
              INFER STORAGE FROM URL
              ----------------------------------------
              */

              if (!storage) {

                if (
                  url.includes(
                    "res.cloudinary.com"
                  )
                ) {
                  storage = "cloudinary";
                }

                if (
                  url.includes(".s3.") ||
                  url.includes(
                    ".amazonaws.com/"
                  )
                ) {
                  storage = "s3";
                }

              }


              /*
              ----------------------------------------
              OLD/MANUAL URL
              ----------------------------------------
    
              Manual URLs are allowed.
    
              If the URL is not Cloudinary or S3,
              use "cloudinary" only if your schema
              requires a value.
    
              Otherwise "storage" should be optional
              in the Page model.
              ----------------------------------------
              */

              if (!storage) {
                storage = "cloudinary";
              }


              return {

                url,

                alt,

                storage,

                publicId:
                  String(
                    image?.publicId || ""
                  ).trim(),

                key:
                  String(
                    image?.key || ""
                  ).trim(),

              };

            }
          ).filter(Boolean)

          : [];

    }


    /*
    ========================================
    BACKWARD COMPATIBILITY
    ========================================

    If the existing page has imageUrl but
    no images array, convert imageUrl into
    the first gallery image.

    This allows old pages to continue
    working after the multiple-image update.
    ========================================
    */

    if (
      images.length === 0 &&
      !Array.isArray(body.images) &&
      existingPage.imageUrl
    ) {

      const legacyUrl =
        String(
          existingPage.imageUrl
        ).trim();


      const legacyFileName =
        legacyUrl
          .split("/")
          .pop()
          ?.split("?")[0] ||
        "Page image";


      let legacyStorage = "";


      if (
        legacyUrl.includes(
          "res.cloudinary.com"
        )
      ) {

        legacyStorage =
          "cloudinary";

      }


      if (
        legacyUrl.includes(".s3.") ||
        legacyUrl.includes(
          ".amazonaws.com/"
        )
      ) {

        legacyStorage =
          "s3";

      }


      /*
      ----------------------------------------
      MANUAL URL
      ----------------------------------------
    
      Keep manual image URLs compatible
      with the required storage field.
      ----------------------------------------
      */

      if (!legacyStorage) {
        legacyStorage = "cloudinary";
      }


      images = [

        {
          url: legacyUrl,

          alt:
            legacyFileName,

          storage:
            legacyStorage,

          publicId: "",

          key: "",

        },

      ];

    }


    /*
    ========================================
    PRIMARY IMAGE
    ========================================

    The first image in the ordered array
    is always the primary image.

    imageUrl is kept synchronized for
    backward compatibility.
    ========================================
    */

    const primaryImageUrl =
      images.length > 0

        ? images[0].url

        : Array.isArray(
          body.images
        )

          ? ""

          : String(
            existingPage.imageUrl ||
            ""
          ).trim();


    /*
    ========================================
    UPDATE BASIC FIELDS
    ========================================
    */

    existingPage.title =
      body.title;


    existingPage.slug =
      slug;


    existingPage.pageType =
      pageType._id;


    existingPage.region =
      regionId;


    /*
    ========================================
    PRIMARY / LEGACY IMAGE
    ========================================
    */

    existingPage.imageUrl =
      primaryImageUrl;


    /*
    ========================================
    MULTIPLE IMAGES
    ========================================
    */

    existingPage.images =
      images;


    existingPage.description =
      body.description || "";


    existingPage.content =
      body.content || "";

    existingPage.highlight =
      body.highlight || "";


    /*
    ========================================
    PRICE
    ========================================
    */

    existingPage.price = {

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
    TREK DETAILS
    ========================================
    */

    existingPage.trekDetails =
      body.trekDetails || {};


    /*
    ========================================
    TOUR DETAILS
    ========================================
    */

    existingPage.tourDetails =
      body.tourDetails || {};


    /*
    ========================================
    ITINERARY
    ========================================
    */

    existingPage.itinerary =
      Array.isArray(
        body.itinerary
      )

        ? body.itinerary

        : [];


    /*
    ========================================
    INCLUSIONS
    ========================================
    */

    existingPage.inclusions =
      Array.isArray(
        body.inclusions
      )

        ? body.inclusions

        : [];


    /*
    ========================================
    EXCLUSIONS
    ========================================
    */

    existingPage.exclusions =
      Array.isArray(
        body.exclusions
      )

        ? body.exclusions

        : [];


    /*
    ========================================
    IMPORTANT INFORMATION
    ========================================
    */

    existingPage.importantInformation =
      body.importantInformation || "";


    /*
    ========================================
    TEAM PROFILE
    ========================================
    */

    if (body.teamProfile !== undefined) {
      const team = body.teamProfile || {};

      existingPage.teamProfile = {
        name: String(team.name || "").trim(),

        position: String(team.position || "").trim(),

        biography: String(team.biography || "").trim(),

        photoUrl: String(team.photoUrl || "").trim(),

        photoStorage: ["cloudinary", "s3"].includes(
          team.photoStorage
        )
          ? team.photoStorage
          : "",

        photoPublicId: String(
          team.photoPublicId || ""
        ).trim(),

        photoKey: String(
          team.photoKey || ""
        ).trim(),

        socialLinks: {
          linkedin: String(
            team.socialLinks?.linkedin || ""
          ).trim(),

          instagram: String(
            team.socialLinks?.instagram || ""
          ).trim(),

          facebook: String(
            team.socialLinks?.facebook || ""
          ).trim(),

          website: String(
            team.socialLinks?.website || ""
          ).trim(),
        },
      };
    }


    /*
========================================
PROFESSIONAL GUIDE PROFILE
========================================
*/

    if (body.professionalGuide !== undefined) {
      const guide = body.professionalGuide || {};

      existingPage.professionalGuide = {
        name: String(guide.name || "").trim(),

        photoUrl: String(guide.photoUrl || "").trim(),

        photoStorage: ["cloudinary", "s3"].includes(
          guide.photoStorage
        )
          ? guide.photoStorage
          : "",

        photoPublicId: String(
          guide.photoPublicId || ""
        ).trim(),

        photoKey: String(
          guide.photoKey || ""
        ).trim(),

        qualifications: String(
          guide.qualifications || ""
        ).trim(),

        certifications: String(
          guide.certifications || ""
        ).trim(),

        languages: Array.isArray(guide.languages)
          ? guide.languages
            .map((item) => String(item).trim())
            .filter(Boolean)
          : [],

        experienceYears: Math.max(
          0,
          Number(guide.experienceYears) || 0
        ),

        specialties: Array.isArray(guide.specialties)
          ? guide.specialties
            .map((item) => String(item).trim())
            .filter(Boolean)
          : [],

        biography: String(
          guide.biography || ""
        ).trim(),

        socialLinks: {
          linkedin: String(
            guide.socialLinks?.linkedin || ""
          ).trim(),

          instagram: String(
            guide.socialLinks?.instagram || ""
          ).trim(),

          facebook: String(
            guide.socialLinks?.facebook || ""
          ).trim(),

          website: String(
            guide.socialLinks?.website || ""
          ).trim(),
        },
      };
    }

    /*
========================================
FAQ- MAP- IMAGE
========================================
*/

    /*
 ========================================
 FAQ IMAGE
 ========================================
 */

    existingPage.faqImageUrl =
      body.faqImageUrl || "";

    existingPage.faqImageStorage =
      ["none", "cloudinary", "s3"].includes(
        body.faqImageStorage
      )
        ? body.faqImageStorage
        : "none";

    existingPage.faqImageKey =
      String(
        body.faqImageKey || ""
      ).trim();

    /*
    ========================================
    FAQS
    ========================================
    */

    existingPage.faqs =
      Array.isArray(body.faqs)
        ? body.faqs
        : [];

    /*
       ========================================
       YouTube Video
       ========================================
       */
    existingPage.youtubeVideos = Array.isArray(body.youtubeVideos)
      ? body.youtubeVideos
      : [],

      /*
      ========================================
      SEO
      ========================================
      */

      existingPage.seo =
      body.seo || {};


    /*
    ========================================
    PUBLISHED
    ========================================
    */

    existingPage.published =
      body.published === true;


    /*
    ========================================
    ORDER
    ========================================
    */

    existingPage.order =
      Number(body.order) || 0;


    /*
    ========================================
    SAVE
    ========================================
    */

    await existingPage.save();


    /*
    ========================================
    RESPONSE
    ========================================
    */

    return NextResponse.json({

      success: true,

      message:
        "Page updated successfully",

      data:
        existingPage,

    });


  }

  catch (error) {

    console.error(
      "PUT page error:",
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
        )
          .map(
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
      error.code ===
      11000
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
DELETE PAGE
========================================
*/

export async function DELETE(
  request,
  { params }
) {

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


    const { id } =
      await params;


    const page =
      await Page.findByIdAndDelete(
        id
      );


    if (!page) {

      return NextResponse.json(
        {
          success: false,
          message:
            "Page not found",
        },
        { status: 404 }
      );

    }


    return NextResponse.json({

      success: true,

      message:
        "Page deleted successfully",

    });


  } catch (error) {

    console.error(
      "DELETE page error:",
      error
    );


    return NextResponse.json(
      {
        success: false,
        message:
          error.message,
      },
      { status: 500 }
    );

  }

}
