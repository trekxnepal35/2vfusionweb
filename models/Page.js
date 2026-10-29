import mongoose from "mongoose";

/*

# ITINERARY SCHEMA

*/

const itinerarySchema = new mongoose.Schema(
  {
    day: {
      type: Number,
      required: true,
      min: 1,
    },


    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    accommodation: {
      type: String,
      default: "",
      trim: true,
    },

    meal: {
      type: String,
      default: "",
      trim: true,
    },

    altitude: {
      type: String,
      default: "",
      trim: true,
    },

    walkingHours: {
      type: String,
      default: "",
      trim: true,
    },


  },
  {
    _id: false,
  }
);

/*

# PAX PRICE SCHEMA

*/

const paxPriceSchema = new mongoose.Schema(
  {
    minPax: {
      type: Number,
      required: true,
      min: 1,
    },


    maxPax: {
      type: Number,
      default: null,
    },

    pricePerPax: {
      type: Number,
      required: true,
      min: 0,
    },


  },
  {
    _id: false,
  }
);

/*

# PRICE SCHEMA

*/

const priceSchema = new mongoose.Schema(
  {
    currency: {
      type: String,
      default: "USD",
      trim: true,
      uppercase: true,
    },


    pricingType: {
      type: String,
      enum: ["fixed", "pax_based"],
      default: "fixed",
    },

    amount: {
      type: Number,
      default: 0,
      min: 0,
    },

    paxPrices: {
      type: [paxPriceSchema],
      default: [],
    },


  },
  {
    _id: false,
  }
);

/*

# TREK DETAILS SCHEMA

*/

const trekDetailsSchema = new mongoose.Schema(
  {
    duration: {
      type: String,
      default: "",
      trim: true,
    },


    maxAltitude: {
      type: String,
      default: "",
      trim: true,
    },

    difficulty: {
      type: String,
      default: "",
      trim: true,
    },

    bestSeason: {
      type: String,
      default: "",
      trim: true,
    },

    startingPoint: {
      type: String,
      default: "",
      trim: true,
    },

    endingPoint: {
      type: String,
      default: "",
      trim: true,
    },

    accommodation: {
      type: String,
      default: "",
      trim: true,
    },

    meals: {
      type: String,
      default: "",
      trim: true,
    },

    groupSize: {
      type: String,
      default: "",
      trim: true,
    },

    permits: {
      type: String,
      default: "",
      trim: true,
    },

    transportation: {
      type: String,
      default: "",
      trim: true,
    },

    guide: {
      type: String,
      default: "",
      trim: true,
    },


  },
  {
    _id: false,
  }
);

/*

# TOUR DETAILS SCHEMA

*/

const tourDetailsSchema = new mongoose.Schema(
  {
    duration: {
      type: String,
      default: "",
      trim: true,
    },


    tourType: {
      type: String,
      default: "",
      trim: true,
    },

    destination: {
      type: String,
      default: "",
      trim: true,
    },

    bestSeason: {
      type: String,
      default: "",
      trim: true,
    },

    groupSize: {
      type: String,
      default: "",
      trim: true,
    },

    accommodation: {
      type: String,
      default: "",
      trim: true,
    },

    transportation: {
      type: String,
      default: "",
      trim: true,
    },


  },
  {
    _id: false,
  }
);


/*
==================================================
TEAM PROFILE
==================================================
*/

const teamProfileSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "",
      trim: true,
    },

    position: {
      type: String,
      default: "",
      trim: true,
    },

    biography: {
      type: String,
      default: "",
      trim: true,
    },

    photoUrl: {
      type: String,
      default: "",
      trim: true,
    },

    photoStorage: {
      type: String,
      enum: ["", "cloudinary", "s3"],
      default: "",
    },

    photoPublicId: {
      type: String,
      default: "",
      trim: true,
    },

    photoKey: {
      type: String,
      default: "",
      trim: true,
    },

    socialLinks: {
      linkedin: {
        type: String,
        default: "",
        trim: true,
      },

      instagram: {
        type: String,
        default: "",
        trim: true,
      },

      facebook: {
        type: String,
        default: "",
        trim: true,
      },

      website: {
        type: String,
        default: "",
        trim: true,
      },
    },
  },
  {
    _id: false,
  }
);

/*
==================================================
PROFESSIONAL GUIDE PROFILE
==================================================
*/

const professionalGuideSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "",
      trim: true,
    },

    photoUrl: {
      type: String,
      default: "",
      trim: true,
    },

    photoStorage: {
      type: String,
      enum: ["", "cloudinary", "s3"],
      default: "",
    },

    photoPublicId: {
      type: String,
      default: "",
      trim: true,
    },

    photoKey: {
      type: String,
      default: "",
      trim: true,
    },

    qualifications: {
      type: String,
      default: "",
      trim: true,
    },

    certifications: {
      type: String,
      default: "",
      trim: true,
    },

    languages: {
      type: [String],
      default: [],
    },

    experienceYears: {
      type: Number,
      default: 0,
      min: 0,
    },

    specialties: {
      type: [String],
      default: [],
    },

    biography: {
      type: String,
      default: "",
      trim: true,
    },

    socialLinks: {
      linkedin: {
        type: String,
        default: "",
        trim: true,
      },

      instagram: {
        type: String,
        default: "",
        trim: true,
      },

      facebook: {
        type: String,
        default: "",
        trim: true,
      },

      website: {
        type: String,
        default: "",
        trim: true,
      },
    },
  },
  {
    _id: false,
  }
);



/*

# SEO SCHEMA

*/

const seoSchema = new mongoose.Schema(
  {
    metaTitle: {
      type: String,
      default: "",
      trim: true,
    },


    metaDescription: {
      type: String,
      default: "",
      trim: true,
    },

    keywords: {
      type: [String],
      default: [],
    },

    ogTitle: {
      type: String,
      default: "",
      trim: true,
    },

    ogDescription: {
      type: String,
      default: "",
      trim: true,
    },

    ogImage: {
      type: String,
      default: "",
      trim: true,
    },

    canonicalUrl: {
      type: String,
      default: "",
      trim: true,
    },

    noIndex: {
      type: Boolean,
      default: false,
    },


  },
  {
    _id: false,
  }
);

/*

# PAGE SCHEMA

*/

const pageSchema = new mongoose.Schema(
  {
    /*
    ==================================================
    BASIC INFORMATION
    ==================================================
    */


    title: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },


    /*
    ==================================================
    DYNAMIC PAGE TYPE
    ==================================================
    */

    pageType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PageType",
      required: true,
    },


    /*
    ==================================================
    REGION
    ==================================================
    
    Region is optional.
    
    Trek pages can have a region.
    
    General pages can have null.
    */

    region: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Region",
      default: null,
    },


    /*
    ==================================================
    CONTENT
    ==================================================
    */

    imageUrl: {
      type: String,
      default: "",
      trim: true,
    },


    /*
    ==================================================
    IMAGE GALLERY
    ==================================================
    
    Stores multiple image URLs for the page.
    
    imageUrl remains the main / featured image.
    
    gallery contains additional images.
    */
    /*
    images: {
      type: [{
        url: { type: String, required: true },
        alt: { type: String, required: true }
      }],
      default: []
    },
    */

    imageStorage: {
      type: String,
      enum: ["none", "cloudinary", "s3"],
      default: "none",
    },

    images: {
      type: [
        {
          url: {
            type: String,
            required: true,
          },

          alt: {
            type: String,
            required: true,
          },

          storage: {
            type: String,
            enum: ["cloudinary", "s3"],
            required: true,
          },

          publicId: {
            type: String,
            default: "",
          },

          key: {
            type: String,
            default: "",
          },
        },
      ],

      default: [],
    },


    description: {
      type: String,
      default: "",
      trim: true,
    },

    content: {
      type: String,
      default: "",
    },

    highlight: {
      type: String,
      default: "",
    },


    /*
    ==================================================
    PRICING
    ==================================================
    */

    price: {
      type: priceSchema,
      default: () => ({
        currency: "USD",
        pricingType: "fixed",
        amount: 0,
        paxPrices: [],
      }),
    },


    /*
    ==================================================
    TREK DETAILS
    ==================================================
    */

    trekDetails: {
      type: trekDetailsSchema,
      default: () => ({}),
    },


    /*
    ==================================================
    TOUR DETAILS
    ==================================================
    */

    tourDetails: {
      type: tourDetailsSchema,
      default: () => ({}),
    },


    /*
    ==================================================
    ITINERARY
    ==================================================
    */

    itinerary: {
      type: [itinerarySchema],
      default: [],
    },


    /*
    ==================================================
    INCLUSIONS
    ==================================================
    */

    inclusions: {
      type: [String],
      default: [],
    },


    /*
    ==================================================
    EXCLUSIONS
    ==================================================
    */

    exclusions: {
      type: [String],
      default: [],
    },


    /*
    ==================================================
    IMPORTANT INFORMATION
    ==================================================
    */

    importantInformation: {
      type: String,
      default: "",
    },

    /*
    ======================================================
    Map-FAQ IMAGE
    ======================================================
    */


    faqImageUrl: {
      type: String,
      default: "",
      trim: true,
    },

    faqImageStorage: {
      type: String,
      enum: ["none", "cloudinary", "s3"],
      default: "none",
    },

    faqImageKey: {
      type: String,
      default: "",
      trim: true,
    },

    /*
    ======================================================
    FAQS
    ======================================================
    */

    faqs: {
      type: [
        {
          question: {
            type: String,
            default: "",
            trim: true,
          },

          answer: {
            type: String,
            default: "",
            trim: true,
          },
        },
      ],

      default: [],
    },

    /*
    ==================================================
    Youtube Videos
    ==================================================
    */
    youtubeVideos: {
      type: [
        {
          title: {
            type: String,
            default: "",
            trim: true,
          },

          url: {
            type: String,
            default: "",
            trim: true,
          },
        },
      ],
      default: [],
    },




    teamProfile: {
      type: teamProfileSchema,
      default: () => ({}),
    },

    professionalGuide: {
      type: professionalGuideSchema,
      default: () => ({}),
    },

    /*
    ==================================================
    SEO
    ==================================================
    */

    seo: {
      type: seoSchema,
      default: () => ({}),
    },


    /*
    ==================================================
    PUBLISHING
    ==================================================
    */

    published: {
      type: Boolean,
      default: false,
    },

    order: {
      type: Number,
      default: 0,
    },

  },

  /*
  
  # OPTIONS
  
  */

  {
    timestamps: true,
  }
);

/*

# PRICING VALIDATION

*/

pageSchema.pre("validate", async function () {

  /*
  
  # DEFAULT PRICE
  
  */

  if (!this.price) {
    this.price = {
      currency: "USD",
      pricingType: "fixed",
      amount: 0,
      paxPrices: [],
    };
  }

  /*
  
  # FIXED PRICING
  
  */

  if (this.price.pricingType === "fixed") {


    if (
      this.price.amount !== undefined &&
      this.price.amount !== null &&
      Number(this.price.amount) < 0
    ) {
      throw new Error(
        "Fixed price amount cannot be negative"
      );
    }

    /*
    Fixed pricing does not use PAX tiers
    */

    this.price.paxPrices = [];


  }

  /*
  
  # PAX BASED PRICING
  
  */

  if (this.price.pricingType === "pax_based") {


    if (
      !Array.isArray(this.price.paxPrices) ||
      this.price.paxPrices.length === 0
    ) {
      throw new Error(
        "PAX-based pricing requires at least one price tier"
      );
    }


    /*
    ========================================
    VALIDATE EACH TIER
    ========================================
    */

    for (const tier of this.price.paxPrices) {

      /*
      MIN PAX
      */

      if (
        !Number.isInteger(Number(tier.minPax)) ||
        Number(tier.minPax) < 1
      ) {
        throw new Error(
          "Each PAX tier must have a valid minPax"
        );
      }


      /*
      PRICE PER PAX
      */

      if (
        tier.pricePerPax === undefined ||
        tier.pricePerPax === null ||
        !Number.isFinite(
          Number(tier.pricePerPax)
        ) ||
        Number(tier.pricePerPax) < 0
      ) {
        throw new Error(
          "Each PAX tier must have a valid pricePerPax"
        );
      }


      /*
      ========================================
      MAX PAX
      ========================================
      */

      if (
        tier.maxPax !== null &&
        tier.maxPax !== undefined &&
        tier.maxPax !== ""
      ) {

        if (
          !Number.isInteger(
            Number(tier.maxPax)
          ) ||
          Number(tier.maxPax) <
          Number(tier.minPax)
        ) {

          throw new Error(
            "maxPax must be greater than or equal to minPax"
          );
        }
      }
    }


    /*
    ========================================
    SORT TIERS
    ========================================
    */

    this.price.paxPrices.sort(
      (a, b) =>
        Number(a.minPax) -
        Number(b.minPax)
    );


    /*
    ========================================
    CHECK OVERLAPPING TIERS
    ========================================
    */

    for (
      let i = 0;
      i < this.price.paxPrices.length - 1;
      i++
    ) {

      const current =
        this.price.paxPrices[i];

      const nextTier =
        this.price.paxPrices[i + 1];


      /*
      Unlimited tier must be last
      */

      if (
        current.maxPax === null ||
        current.maxPax === undefined ||
        current.maxPax === ""
      ) {
        throw new Error(
          "An unlimited PAX tier must be the final tier"
        );
      }


      /*
      Check overlap
      */

      if (
        Number(current.maxPax) >=
        Number(nextTier.minPax)
      ) {
        throw new Error(
          "PAX pricing tiers cannot overlap"
        );
      }
    }

  }
});

/*

# CREATE / REUSE MODEL

*/

const Page =
  mongoose.models.Page ||
  mongoose.model("Page", pageSchema);

export default Page;
