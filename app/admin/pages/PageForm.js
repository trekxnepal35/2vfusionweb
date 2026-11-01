"use client";

import { useEffect, useMemo, useState } from "react";
import RichTextContent from "@/app/components/RichTextContent";
import RichTextEditor from "@/app/components/admin/RichTextEditor";


/*

PAGE FORM
File:
app/admin/pages/PageForm.js

Latest version:

* Dynamic PageType ObjectId
* Dynamic Region ObjectId
* Multiple page images
* Image preview
* Image alt text
* Image remove
* Image reorder / move up / move down
* First image is primary image
* Fixed pricing
* PAX-based pricing
* Trek details
* Tour details
* Itinerary
* Inclusions
* Exclusions
* Important information
* SEO
* Publishing
 =========================================================
 */

export default function PageForm({
  initialData = {},
  onSubmit,
  loading = false,
}) {
  /*
  ==
  
  # HELPERS
  
  */

  function getId(value) {
    if (!value) return "";


    if (typeof value === "object" && value._id) {
      return String(value._id);
    }

    return String(value);


  }

  /*
 
 # IMAGE INITIAL DATA
 
 */

  function getInitialImages() {
    /*
    ------------------------------------------------------
    NEW MULTIPLE IMAGE FORMAT
    ------------------------------------------------------
    */


    if (
      Array.isArray(initialData.images) &&
      initialData.images.length > 0
    ) {
      return initialData.images
        .map((item) => {
          /*
          Support both:
    
          {
            url: "...",
            alt: "..."
          }
    
          and simple string URLs.
          */

          if (typeof item === "string") {
            return {
              url: item,
              alt: "",
              storage: "",
              publicId: "",
              key: "",
            };
          }

          return {
            url: item?.url || "",
            alt: item?.alt || "",
            storage: item?.storage || "",
            publicId: item?.publicId || "",
            key: item?.key || "",
          };
        })
        .filter((item) => item.url || item.alt);
    }

    /*
    ------------------------------------------------------
    OLD SINGLE IMAGE FORMAT
    ------------------------------------------------------
    
    Existing pages using imageUrl are automatically
    converted into the first gallery image.
    */

    if (initialData.imageUrl) {
      return [
        {
          url: initialData.imageUrl,
          alt: "",
          storage: "",
          publicId: "",
          key: "",
        },
      ];
    }

    return [];


  }

  /*
  
  # INITIAL FORM DATA
  
  */

  const [formData, setFormData] = useState({
    /*
    ======================================================
    BASIC INFORMATION
    ======================================================
    */


    title: initialData.title || "",

    slug: initialData.slug || "",

    pageType: getId(initialData.pageType),

    region: getId(initialData.region),

    description: initialData.description || "",

    content: initialData.content || "",

    highlight: initialData.highlight || "",

    /*
======================================================
TEAM PROFILE
======================================================
*/

    teamProfile: {
      name: initialData.teamProfile?.name || "",
      position: initialData.teamProfile?.position || "",
      biography: initialData.teamProfile?.biography || "",
      photoUrl: initialData.teamProfile?.photoUrl || "",
      photoStorage: initialData.teamProfile?.photoStorage || "",
      photoPublicId: initialData.teamProfile?.photoPublicId || "",
      photoKey: initialData.teamProfile?.photoKey || "",
      socialLinks: {
        linkedin: initialData.teamProfile?.socialLinks?.linkedin || "",
        instagram: initialData.teamProfile?.socialLinks?.instagram || "",
        facebook: initialData.teamProfile?.socialLinks?.facebook || "",
        website: initialData.teamProfile?.socialLinks?.website || "",
      },
    },


    professionalGuide: {
      name: initialData.professionalGuide?.name || "",
      photoUrl: initialData.professionalGuide?.photoUrl || "",
      photoStorage: initialData.professionalGuide?.photoStorage || "cloudinary",
      photoPublicId: initialData.professionalGuide?.photoPublicId || "",
      photoKey: initialData.professionalGuide?.photoKey || "",

      qualifications: initialData.professionalGuide?.qualifications || "",
      certifications: initialData.professionalGuide?.certifications || "",

      languages: Array.isArray(initialData.professionalGuide?.languages)
        ? initialData.professionalGuide.languages
        : [],

      experienceYears: initialData.professionalGuide?.experienceYears ?? 0,

      specialties: Array.isArray(initialData.professionalGuide?.specialties)
        ? initialData.professionalGuide.specialties
        : [],

      biography: initialData.professionalGuide?.biography || "",

      socialLinks: {
        linkedin: initialData.professionalGuide?.socialLinks?.linkedin || "",
        instagram: initialData.professionalGuide?.socialLinks?.instagram || "",
        facebook: initialData.professionalGuide?.socialLinks?.facebook || "",
        website: initialData.professionalGuide?.socialLinks?.website || "",
      },
    },


    /*
 ------------------------------------------------------
 LEGACY PRIMARY IMAGE
 ------------------------------------------------------
 
 Kept for backward compatibility.
 The first image in images becomes imageUrl.
 */

    imageUrl: initialData.imageUrl || "",

    /*
    ------------------------------------------------------
    IMAGE STORAGE
    ------------------------------------------------------
    
    Controls where NEW images are uploaded.
    
    none       = manual image URL / no upload
    cloudinary = Cloudinary only
    s3         = AWS S3 only
    */

    imageStorage:
      initialData.imageStorage || "cloudinary",

    /*
    ------------------------------------------------------
    MULTIPLE IMAGES
    ------------------------------------------------------
    */

    images: getInitialImages(),

    /*
    ======================================================
    PRICE
    ======================================================
    */

    price: {
      currency:
        initialData.price?.currency || "USD",

      pricingType:
        initialData.price?.pricingType || "fixed",

      amount:
        initialData.price?.amount ?? "",

      paxPrices:
        Array.isArray(initialData.price?.paxPrices)
          ? initialData.price.paxPrices.map((item) => ({
            minPax: item.minPax ?? "",
            maxPax: item.maxPax ?? "",
            pricePerPax:
              item.pricePerPax ?? "",
          }))
          : [],
    },

    /*
    ======================================================
    TREK DETAILS
    ======================================================
    */

    trekDetails: {
      duration:
        initialData.trekDetails?.duration || "",

      maxAltitude:
        initialData.trekDetails?.maxAltitude || "",

      difficulty:
        initialData.trekDetails?.difficulty || "",

      bestSeason:
        initialData.trekDetails?.bestSeason || "",

      startingPoint:
        initialData.trekDetails?.startingPoint || "",

      endingPoint:
        initialData.trekDetails?.endingPoint || "",

      accommodation:
        initialData.trekDetails?.accommodation || "",

      meals:
        initialData.trekDetails?.meals || "",

      groupSize:
        initialData.trekDetails?.groupSize || "",

      permits:
        initialData.trekDetails?.permits || "",

      transportation:
        initialData.trekDetails?.transportation || "",

      guide:
        initialData.trekDetails?.guide || "",
    },

    /*
    ======================================================
    TOUR DETAILS
    ======================================================
    */

    tourDetails: {
      duration:
        initialData.tourDetails?.duration || "",

      tourType:
        initialData.tourDetails?.tourType || "",

      destination:
        initialData.tourDetails?.destination || "",

      bestSeason:
        initialData.tourDetails?.bestSeason || "",

      groupSize:
        initialData.tourDetails?.groupSize || "",

      accommodation:
        initialData.tourDetails?.accommodation || "",

      transportation:
        initialData.tourDetails?.transportation || "",
    },

    /*
    ======================================================
    ITINERARY
    ======================================================
    */

    itinerary:
      Array.isArray(initialData.itinerary)
        ? initialData.itinerary.map(
          (item, index) => ({
            day:
              item.day ??
              index + 1,

            title:
              item.title || "",

            description:
              item.description || "",

            accommodation:
              item.accommodation || "",

            meal:
              item.meal || "",

            altitude:
              item.altitude || "",

            walkingHours:
              item.walkingHours ?? "",
          })
        )
        : [],

    /*
    ======================================================
    INCLUSIONS
    ======================================================
    */

    inclusions:
      Array.isArray(initialData.inclusions)
        ? initialData.inclusions
        : [],

    /*
    ======================================================
    EXCLUSIONS
    ======================================================
    */

    exclusions:
      Array.isArray(initialData.exclusions)
        ? initialData.exclusions
        : [],

    /*
    ======================================================
    IMPORTANT INFORMATION
    ======================================================
    */

    importantInformation:
      initialData.importantInformation || "",



    /*
======================================================
FAQ MAP IMAGE
======================================================
*/

    faqImageUrl:
      initialData.faqImageUrl || "",

    faqImageStorage:
      initialData.faqImageStorage || "none",

    faqImageKey:
      initialData.faqImageKey || "",



    /*
    ======================================================
    FAQS
    ======================================================
    */

    faqs:
      Array.isArray(initialData.faqs)
        ? initialData.faqs.map((item) => ({
          question:
            item.question || "",
          answer:
            item.answer || "",
        }))
        : [],

    /*
======================================================
YouTube Videos
======================================================
*/
    youtubeVideos:
      Array.isArray(initialData.youtubeVideos)
        ? initialData.youtubeVideos.map((item) => ({
          title: item.title || "",
          url: item.url || "",
        }))
        : [],

    /*
======================================================
PUBLISHING
======================================================
*/

    published:
      initialData.published ?? false,

    order:
      initialData.order ?? 0,

    /*
    ======================================================
    SEO
    ======================================================
    */

    seo: {
      metaTitle:
        initialData.seo?.metaTitle || "",

      metaDescription:
        initialData.seo?.metaDescription || "",

      keywords:
        Array.isArray(initialData.seo?.keywords)
          ? initialData.seo.keywords
          : [],

      ogTitle:
        initialData.seo?.ogTitle || "",

      ogDescription:
        initialData.seo?.ogDescription || "",

      ogImage:
        initialData.seo?.ogImage || "",

      canonicalUrl:
        initialData.seo?.canonicalUrl || "",

      noIndex:
        initialData.seo?.noIndex ?? false,
    },


  });



  /*
  
  # PAGE TYPES
  
  */

  const [pageTypes, setPageTypes] = useState([]);

  const [loadingPageTypes, setLoadingPageTypes] =
    useState(true);

  const [pageTypeError, setPageTypeError] =
    useState("");

  /*
 
 # REGIONS
 
 */

  const [regions, setRegions] = useState([]);

  const [loadingRegions, setLoadingRegions] =
    useState(true);

  const [regionError, setRegionError] =
    useState("");

  /*
  
  # FORM ERROR
  
  */

  const [formError, setFormError] =
    useState("");

  /*
------------------------------------------------------
IMAGE UPLOAD
------------------------------------------------------
*/

  const [uploadingImages, setUploadingImages] =
    useState(false);

  const [uploadError, setUploadError] =
    useState("");

  /*
  
  # LOAD PAGE TYPES
  
  */

  useEffect(() => {
    let mounted = true;


    async function loadPageTypes() {
      try {
        setLoadingPageTypes(true);
        setPageTypeError("");

        const response = await fetch(
          "/api/page-types",
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const result =
          await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message ||
            "Failed to load page types."
          );
        }

        if (mounted) {
          setPageTypes(
            Array.isArray(result.data)
              ? result.data
              : []
          );
        }
      } catch (error) {
        console.error(
          "Failed to load page types:",
          error
        );

        if (mounted) {
          setPageTypeError(
            error.message ||
            "Failed to load page types."
          );
        }
      } finally {
        if (mounted) {
          setLoadingPageTypes(false);
        }
      }
    }

    loadPageTypes();

    return () => {
      mounted = false;
    };


  }, []);

  /*
  
  # LOAD REGIONS
  
  */

  useEffect(() => {
    let mounted = true;


    async function loadRegions() {
      try {
        setLoadingRegions(true);
        setRegionError("");

        const response = await fetch(
          "/api/regions",
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const result =
          await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message ||
            "Failed to load regions."
          );
        }

        if (mounted) {
          setRegions(
            Array.isArray(result.data)
              ? result.data
              : []
          );
        }
      } catch (error) {
        console.error(
          "Failed to load regions:",
          error
        );

        if (mounted) {
          setRegionError(
            error.message ||
            "Failed to load regions."
          );
        }
      } finally {
        if (mounted) {
          setLoadingRegions(false);
        }
      }
    }

    loadRegions();

    return () => {
      mounted = false;
    };


  }, []);

  /*
  
  # SELECTED PAGE TYPE
  
  */

  const selectedPageType = useMemo(() => {
    return pageTypes.find(
      (type) =>
        String(type._id) ===
        String(formData.pageType)
    );
  }, [pageTypes, formData.pageType]);

  /*
  
  # PAGE TYPE SLUG
  
  */

  const pageTypeSlug =
    selectedPageType?.slug
      ?.toLowerCase()
      ?.trim() || "";

  /*
  
  # PAGE TYPE CONDITIONS
  
  */

  const isTrek =
    pageTypeSlug === "trek";

  const isTour =
    pageTypeSlug === "tour";

  const isGeneral =
    pageTypeSlug === "general";

  const isWellness =
    pageTypeSlug === "wellness";

  const isTeam =
    pageTypeSlug === "team";

  const isGuide =
    pageTypeSlug === "guide";



  /*
  
  # EXPERIENCE PAGE
  
  */

  const isExperience =
    isTrek || isTour || isGeneral || isWellness;

  /*
  
  # BASIC INPUT
  
  */

  function handleChange(e) {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;


    setFormData((prev) => ({
      ...prev,

      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));

    setFormError("");


  }

  /*
  
  # PAGE TYPE CHANGE
  
  */

  function handlePageTypeChange(e) {
    const value = e.target.value;


    setFormData((prev) => ({
      ...prev,

      pageType: value,

      region: prev.region,
    }));

    setFormError("");


  }

  /*
  
  # REGION CHANGE
  
  */

  function handleRegionChange(e) {
    const value = e.target.value;


    setFormData((prev) => ({
      ...prev,

      region: value,
    }));

    setFormError("");


  }

  /*
  
  # PRICE CHANGE
  
  */

  function handlePriceChange(e) {
    const {
      name,
      value,
    } = e.target;


    setFormData((prev) => ({
      ...prev,

      price: {
        ...prev.price,

        [name]: value,
      },
    }));

    setFormError("");


  }

  /*
  
  # TREK DETAILS CHANGE
  
  */

  function handleTrekChange(e) {
    const {
      name,
      value,
    } = e.target;


    setFormData((prev) => ({
      ...prev,

      trekDetails: {
        ...prev.trekDetails,

        [name]: value,
      },
    }));


  }

  /*
  
  # TOUR DETAILS CHANGE
  
  */

  function handleTourChange(e) {
    const {
      name,
      value,
    } = e.target;


    setFormData((prev) => ({
      ...prev,

      tourDetails: {
        ...prev.tourDetails,

        [name]: value,
      },
    }));


  }

  /*
========================================================
FAQ IMAGE UPLOAD STATE
========================================================
*/

  const [faqImageUploading, setFaqImageUploading] =
    useState(false);

  const [faqImageUploadError, setFaqImageUploadError] =
    useState("");

  const [faqImageUploadStorage, setFaqImageUploadStorage] =
    useState("cloudinary");

  /*
  Handle Map Image FQA 
  */
  function handleFaqImageUrlChange(e) {
    const { value } = e.target;

    setFormData((prev) => ({
      ...prev,
      faqImageUrl: value,
    }));

    setFormError("");
  }

  /*
========================================================
UPLOAD FAQ IMAGE
========================================================
*/


  async function handleFaqImageUpload(e) {
    const file = e.target.files?.[0];

    if (!file) return;

    /*
    ======================================================
    GET SELECTED STORAGE
    ======================================================
    */

    const storage = formData.faqImageStorage;

    if (
      storage !== "cloudinary" &&
      storage !== "s3"
    ) {
      setFormError(
        "Please select Cloudinary or S3 before uploading the FAQ image."
      );

      e.target.value = "";

      return;
    }

    /*
    ======================================================
    CHECK FILE TYPE
    ======================================================
    */

    if (!file.type.startsWith("image/")) {
      setFormError(
        "Please select a valid image file."
      );

      e.target.value = "";

      return;
    }

    /*
    ======================================================
    CHECK FILE SIZE
    ======================================================
    */

    if (file.size > 10 * 1024 * 1024) {
      setFormError(
        "FAQ image must be 10 MB or smaller."
      );

      e.target.value = "";

      return;
    }

    try {
      setFormError("");

      /*
      ====================================================
      CREATE FORM DATA
      ====================================================
      */

      const uploadData = new FormData();

      uploadData.append(
        "storage",
        storage
      );

      uploadData.append(
        "files",
        file
      );

      /*
      ====================================================
      UPLOAD IMAGE
      ====================================================
      */

      const response = await fetch(
        "/api/uploads/images",
        {
          method: "POST",
          body: uploadData,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.error ||
          "FAQ image upload failed."
        );
      }

      /*
      ====================================================
      GET UPLOADED IMAGE
      ====================================================
      */

      const uploadedImage =
        Array.isArray(result?.data)
          ? result.data[0]
          : null;

      if (!uploadedImage?.url) {
        throw new Error(
          "Upload succeeded but no image URL was returned."
        );
      }

      /*
      ====================================================
      UPDATE FORM DATA
      ====================================================
      */

      setFormData((prev) => ({
        ...prev,

        faqImageUrl:
          uploadedImage.url,

        faqImageStorage:
          uploadedImage.storage ||
          storage,

        faqImageKey:
          uploadedImage.key || "",
      }));

    } catch (error) {

      console.error(
        "FAQ image upload error:",
        error
      );

      setFormError(
        error.message ||
        "Failed to upload FAQ image."
      );

    } finally {

      e.target.value = "";

    }
  }

  function addFaq() {
    setFormData((prev) => ({
      ...prev,

      faqs: [
        ...prev.faqs,
        {
          question: "",
          answer: "",
        },
      ],
    }));

    setFormError("");
  }

  function removeFaq(index) {
    setFormData((prev) => ({
      ...prev,

      faqs: prev.faqs.filter(
        (_, i) => i !== index
      ),
    }));

    setFormError("");
  }

  function handleFaqChange(
    index,
    field,
    value
  ) {
    setFormData((prev) => ({
      ...prev,

      faqs: prev.faqs.map(
        (item, i) =>
          i === index
            ? {
              ...item,
              [field]: value,
            }
            : item
      ),
    }));

    setFormError("");
  }

  function getCleanFaqs() {
    return formData.faqs
      .map((item) => ({
        question: String(
          item.question || ""
        ).trim(),

        answer: String(
          item.answer || ""
        ).trim(),
      }))
      .filter(
        (item) =>
          item.question ||
          item.answer
      );
  }


  /*
  
  # YouTube Handlers
  
  */
  function addYoutubeVideo() {
    setFormData((prev) => ({
      ...prev,
      youtubeVideos: [
        ...prev.youtubeVideos,
        {
          title: "",
          url: "",
        },
      ],
    }));

    setFormError("");
  }

  function removeYoutubeVideo(index) {
    setFormData((prev) => ({
      ...prev,
      youtubeVideos: prev.youtubeVideos.filter(
        (_, i) => i !== index
      ),
    }));

    setFormError("");
  }

  function handleYoutubeVideoChange(index, field, value) {
    setFormData((prev) => ({
      ...prev,
      youtubeVideos: prev.youtubeVideos.map(
        (item, i) =>
          i === index
            ? {
              ...item,
              [field]: value,
            }
            : item
      ),
    }));

    setFormError("");
  }

  function getCleanYoutubeVideos() {
    return formData.youtubeVideos
      .map((item) => ({
        title: String(item.title || "").trim(),
        url: String(item.url || "").trim(),
      }))
      .filter(
        (item) =>
          item.title ||
          item.url
      );
  }


  /*
  
  # SEO CHANGE
  
  */

  function handleSeoChange(e) {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;


    setFormData((prev) => ({
      ...prev,

      seo: {
        ...prev.seo,

        [name]:
          type === "checkbox"
            ? checked
            : value,
      },
    }));


  }

  /*
  
  # MULTIPLE IMAGES
  
  */

  function addImage() {
    setFormData((prev) => ({
      ...prev,

      images: [
        ...prev.images,

        {
          url: "",
          alt: "",
          storage: "",
          publicId: "",
          key: "",
        },
      ],
    }));

    setFormError("");
  }

  /*
  
  # REMOVE IMAGE
  
  */

  function removeImage(index) {
    setFormData((prev) => ({
      ...prev,


      images:
        prev.images.filter(
          (_, i) => i !== index
        ),
    }));

    setFormError("");


  }

  /*
  
  # UPDATE IMAGE
  
  */

  function handleImageChange(
    index,
    field,
    value
  ) {
    setFormData((prev) => ({
      ...prev,


      images:
        prev.images.map(
          (item, i) =>
            i === index
              ? {
                ...item,
                [field]: value,
              }
              : item
        ),
    }));

    setFormError("");


  }


  /*
------------------------------------------------------
UPLOAD IMAGE FILES
------------------------------------------------------
*/

  async function handleImageUpload(e) {
    const files = Array.from(
      e.target.files || []
    );

    if (files.length === 0) {
      return;
    }

    setUploadError("");
    setFormError("");
    setUploadingImages(true);

    try {
      /*
      --------------------------------------------------
      GET SELECTED STORAGE
      --------------------------------------------------
      */

      const storage =
        formData.imageStorage;

      if (
        storage !== "cloudinary" &&
        storage !== "s3"
      ) {
        throw new Error(
          "Please select Cloudinary or AWS S3 before uploading images."
        );
      }

      /*
      --------------------------------------------------
      PREPARE FORM DATA
      --------------------------------------------------
      */

      const uploadData =
        new FormData();

      uploadData.append(
        "storage",
        storage
      );

      files.forEach((file) => {
        uploadData.append(
          "files",
          file
        );
      });

      /*
      --------------------------------------------------
      SEND TO SERVER
      --------------------------------------------------
      */

      const response =
        await fetch(
          "/api/uploads/images",
          {
            method: "POST",
            body: uploadData,
          }
        );

      const result =
        await response.json();

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
          "Failed to upload images."
        );
      }

      /*
      --------------------------------------------------
      ADD UPLOADED IMAGES TO EXISTING GALLERY
      --------------------------------------------------
      */

      const uploadedImages =
        Array.isArray(result.data)
          ? result.data
          : [];

      setFormData((prev) => ({
        ...prev,

        images: [
          ...prev.images,
          ...uploadedImages,
        ],
      }));

      /*
      --------------------------------------------------
      CLEAR FILE INPUT
      --------------------------------------------------
      */

      e.target.value = "";

    } catch (error) {
      console.error(
        "Image upload error:",
        error
      );

      setUploadError(
        error.message ||
        "Failed to upload images."
      );

    } finally {
      setUploadingImages(false);
    }
  }


  /*
  ------------------------------------------------------
  UPLOAD TEAM PROFILE PHOTO
  ------------------------------------------------------
  */
  async function handleTeamProfilePhotoUpload(e) {
    const file = e.target.files?.[0];

    if (!file) return;

    setUploadError("");
    setFormError("");
    setUploadingImages(true);

    try {
      const storage = formData.imageStorage;

      if (storage !== "cloudinary" && storage !== "s3") {
        throw new Error(
          "Please select Cloudinary or AWS S3 before uploading."
        );
      }

      const uploadData = new FormData();
      uploadData.append("storage", storage);
      uploadData.append("files", file);

      const response = await fetch("/api/uploads/images", {
        method: "POST",
        body: uploadData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to upload profile photo."
        );
      }

      const uploadedPhoto = result.data?.[0];

      if (!uploadedPhoto?.url) {
        throw new Error("The uploaded photo URL was not returned.");
      }

      setFormData((prev) => ({
        ...prev,
        teamProfile: {
          ...prev.teamProfile,
          photoUrl: uploadedPhoto.url,
          photoStorage: uploadedPhoto.storage || storage,
          photoPublicId: uploadedPhoto.publicId || "",
          photoKey: uploadedPhoto.key || "",
        },
      }));

      e.target.value = "";
    } catch (error) {
      console.error("Team profile photo upload error:", error);

      setUploadError(
        error.message || "Failed to upload profile photo."
      );
    } finally {
      setUploadingImages(false);
    }
  }


  const handleProfessionalGuidePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert("Please upload a JPG, PNG, WebP, or GIF image.");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Maximum file size is 5 MB.");
      e.target.value = "";
      return;
    }

    setUploadingImages(true);

    try {
      const uploadData = new FormData();
      uploadData.append(
        "storage",
        ["cloudinary", "s3"].includes(formData.professionalGuide.photoStorage)
          ? formData.professionalGuide.photoStorage
          : "cloudinary"
      );
      uploadData.append("files", file);

      const response = await fetch("/api/uploads/images", {
        method: "POST",
        body: uploadData,
      });

      const result = await response.json();

      if (!response.ok || !result.success || !result.data?.[0]?.url) {
        throw new Error(result.message || "Photo upload failed.");
      }

      const uploadedImage = result.data[0];

      setFormData((prev) => ({
        ...prev,
        professionalGuide: {
          ...prev.professionalGuide,
          photoUrl: uploadedImage.url,
          photoStorage: uploadedImage.storage || "",
          photoPublicId: uploadedImage.publicId || "",
          photoKey: uploadedImage.key || "",
        },
      }));
    } catch (error) {
      console.error("Professional guide photo upload failed:", error);
      alert(error.message || "Failed to upload the guide photo.");
    } finally {
      setUploadingImages(false);
      e.target.value = "";
    }
  };

  /*
  
  # MOVE IMAGE
  
  */

  function moveImage(
    index,
    direction
  ) {
    setFormData((prev) => {
      const images = [
        ...prev.images,
      ];

      const newIndex =
        direction === "up"
          ? index - 1
          : index + 1;

      if (
        newIndex < 0 ||
        newIndex >= images.length
      ) {
        return prev;
      }

      const current =
        images[index];

      images[index] =
        images[newIndex];

      images[newIndex] =
        current;

      return {
        ...prev,
        images,
      };
    });

    setFormError("");


  }

  /*
  
  # PAX PRICE
  
  */

  function addPaxTier() {
    setFormData((prev) => ({
      ...prev,


      price: {
        ...prev.price,

        paxPrices: [
          ...prev.price.paxPrices,

          {
            minPax: "",
            maxPax: "",
            pricePerPax: "",
          },
        ],
      },
    }));

    setFormError("");


  }

  /*
  
  # REMOVE PAX TIER
  
  */

  function removePaxTier(index) {
    setFormData((prev) => ({
      ...prev,


      price: {
        ...prev.price,

        paxPrices:
          prev.price.paxPrices.filter(
            (_, i) => i !== index
          ),
      },
    }));

    setFormError("");

  }

  /*
  
  # UPDATE PAX TIER
  
  */

  function handlePaxPriceChange(
    index,
    field,
    value
  ) {
    setFormData((prev) => ({
      ...prev,


      price: {
        ...prev.price,

        paxPrices:
          prev.price.paxPrices.map(
            (item, i) =>
              i === index
                ? {
                  ...item,
                  [field]: value,
                }
                : item
          ),
      },
    }));

    setFormError("");


  }

  /*
  
  # ITINERARY
  
  */

  function addItinerary() {
    setFormData((prev) => ({
      ...prev,


      itinerary: [
        ...prev.itinerary,

        {
          day:
            prev.itinerary.length + 1,

          title: "",

          description: "",

          accommodation: "",

          meal: "",

          altitude: "",

          walkingHours: "",
        },
      ],
    }));


  }

  /*
  
  # REMOVE ITINERARY
  
  */

  function removeItinerary(index) {
    setFormData((prev) => ({
      ...prev,

      itinerary:
        prev.itinerary
          .filter(
            (_, i) => i !== index
          )
          .map(
            (item, i) => ({
              ...item,
              day: i + 1,
            })
          ),
    }));


  }

  /*
  
  # UPDATE ITINERARY
  
  */

  function handleItineraryChange(
    index,
    field,
    value
  ) {
    setFormData((prev) => ({
      ...prev,


      itinerary:
        prev.itinerary.map(
          (item, i) =>
            i === index
              ? {
                ...item,
                [field]: value,
              }
              : item
        ),
    }));


  }

  /*
  
  # INCLUSIONS
  
  */

  function addInclusion() {
    setFormData((prev) => ({
      ...prev,


      inclusions: [
        ...prev.inclusions,
        "",
      ],
    }));


  }

  function removeInclusion(index) {
    setFormData((prev) => ({
      ...prev,


      inclusions:
        prev.inclusions.filter(
          (_, i) => i !== index
        ),
    }));


  }

  function handleInclusionChange(
    index,
    value
  ) {
    setFormData((prev) => ({
      ...prev,


      inclusions:
        prev.inclusions.map(
          (item, i) =>
            i === index
              ? value
              : item
        ),
    }));


  }

  /*
 
 # EXCLUSIONS
 
 */

  function addExclusion() {
    setFormData((prev) => ({
      ...prev,

      exclusions: [
        ...prev.exclusions,
        "",
      ],
    }));


  }

  function removeExclusion(index) {
    setFormData((prev) => ({
      ...prev,


      exclusions:
        prev.exclusions.filter(
          (_, i) => i !== index
        ),
    }));


  }

  function handleExclusionChange(
    index,
    value
  ) {
    setFormData((prev) => ({
      ...prev,


      exclusions:
        prev.exclusions.map(
          (item, i) =>
            i === index
              ? value
              : item
        ),
    }));


  }

  /*
  
  # VALIDATE PAX PRICES
  
  */

  function validatePaxPrices() {
    if (
      formData.price.pricingType !==
      "pax_based"
    ) {
      return true;
    }


    if (
      formData.price.paxPrices.length === 0
    ) {
      setFormError(
        "Please add at least one PAX price tier."
      );

      return false;
    }

    const tiers =
      formData.price.paxPrices
        .map((item, index) => {
          const minPax =
            item.minPax === ""
              ? null
              : Number(item.minPax);

          const maxPax =
            item.maxPax === ""
              ? null
              : Number(item.maxPax);

          const pricePerPax =
            item.pricePerPax === ""
              ? null
              : Number(item.pricePerPax);

          return {
            index,
            minPax,
            maxPax,
            pricePerPax,
          };
        });

    /*
    ------------------------------------------------------
    BASIC VALUE VALIDATION
    ------------------------------------------------------
    */

    for (const tier of tiers) {
      if (
        tier.minPax === null ||
        !Number.isInteger(tier.minPax) ||
        tier.minPax < 1
      ) {
        setFormError(
          `Tier ${tier.index + 1
          }: Minimum PAX must be a whole number greater than 0.`
        );

        return false;
      }

      if (
        tier.pricePerPax === null ||
        !Number.isFinite(
          tier.pricePerPax
        ) ||
        tier.pricePerPax <= 0
      ) {
        setFormError(
          `Tier ${tier.index + 1
          }: Price per PAX must be greater than 0.`
        );

        return false;
      }

      if (
        tier.maxPax !== null &&
        (
          !Number.isInteger(
            tier.maxPax
          ) ||
          tier.maxPax < tier.minPax
        )
      ) {
        setFormError(
          `Tier ${tier.index + 1
          }: Maximum PAX must be greater than or equal to Minimum PAX.`
        );

        return false;
      }
    }

    /*
    ------------------------------------------------------
    SORT BY MINIMUM PAX
    ------------------------------------------------------
    */

    const sortedTiers = [
      ...tiers,
    ].sort(
      (a, b) =>
        a.minPax - b.minPax
    );

    /*
    ------------------------------------------------------
    CHECK OVERLAP
    ------------------------------------------------------
    */

    for (
      let i = 0;
      i < sortedTiers.length - 1;
      i++
    ) {
      const current =
        sortedTiers[i];

      const next =
        sortedTiers[i + 1];

      /*
      Unlimited tier must be final.
      */

      if (
        current.maxPax === null
      ) {
        setFormError(
          "An unlimited PAX tier must be the final tier."
        );

        return false;
      }

      if (
        current.maxPax >=
        next.minPax
      ) {
        setFormError(
          `PAX tiers overlap around ${next.minPax} PAX.`
        );

        return false;
      }
    }

    return true;


  }

  /*
  
  # CLEAN PAX PRICES
  
  */

  function getCleanPaxPrices() {
    return formData.price.paxPrices
      .map((item) => ({
        minPax:
          item.minPax === ""
            ? ""
            : Number(item.minPax),


        maxPax:
          item.maxPax === ""
            ? null
            : Number(item.maxPax),

        pricePerPax:
          item.pricePerPax === ""
            ? ""
            : Number(
              item.pricePerPax
            ),
      }))
      .filter(
        (item) =>
          item.minPax !== "" &&
          item.pricePerPax !== ""
      )
      .sort(
        (a, b) =>
          a.minPax - b.minPax
      );


  }

  /*
  
  # CLEAN ITINERARY
  
  */

  function getCleanItinerary() {
    return formData.itinerary
      .map((item, index) => ({
        day:
          Number(item.day) ||
          index + 1,


        title:
          String(
            item.title || ""
          ).trim(),

        description:
          String(
            item.description || ""
          ).trim(),

        accommodation:
          String(
            item.accommodation ||
            ""
          ).trim(),

        meal:
          String(
            item.meal || ""
          ).trim(),

        altitude:
          String(
            item.altitude || ""
          ).trim(),

        walkingHours:
          item.walkingHours === ""
            ? ""
            : Number(
              item.walkingHours
            ),
      }))
      .filter(
        (item) =>
          item.title ||
          item.description ||
          item.accommodation ||
          item.meal ||
          item.altitude ||
          item.walkingHours !== ""
      )
      .map(
        (item, index) => ({
          ...item,
          day: index + 1,
        })
      );


  }

  /*
  
  # CLEAN STRING ARRAYS
  
  */

  function cleanStringArray(items) {
    return items
      .map((item) =>
        String(item || "").trim()
      )
      .filter(Boolean);
  }

  /*
  
  # CLEAN IMAGES
  
  */

  function getCleanImages() {
    return formData.images
      .map((item) => ({
        url:
          String(
            item?.url || ""
          ).trim(),

        alt:
          String(
            item?.alt || ""
          ).trim(),

        storage:
          item?.storage || "",

        publicId:
          item?.publicId || "",

        key:
          item?.key || "",
      }))
      .filter(
        (item) => item.url
      );
  }

  /*
  
  # FORM SUBMIT
  
  */

  function handleSubmit(e) {
    e.preventDefault();


    setFormError("");

    /*
    ------------------------------------------------------
    PAGE TYPE
    ------------------------------------------------------
    */

    if (!formData.pageType) {
      setFormError(
        "Please select a page type."
      );

      return;
    }

    /*
    ------------------------------------------------------
    TITLE
    ------------------------------------------------------
    */

    if (!formData.title.trim()) {
      setFormError(
        "Page title is required."
      );

      return;
    }

    /*
    ------------------------------------------------------
    SLUG
    ------------------------------------------------------
    */

    if (!formData.slug.trim()) {
      setFormError(
        "Page slug is required."
      );

      return;
    }

    /*
    ------------------------------------------------------
    PRICE
    ------------------------------------------------------
    */

    if (isExperience) {
      if (
        formData.price.pricingType ===
        "fixed"
      ) {
        const amount =
          formData.price.amount === ""
            ? 0
            : Number(
              formData.price.amount
            );

        if (
          !Number.isFinite(amount) ||
          amount < 0
        ) {
          setFormError(
            "Fixed price must be a valid number."
          );

          return;
        }
      }

      if (
        formData.price.pricingType ===
        "pax_based"
      ) {
        if (!validatePaxPrices()) {
          return;
        }
      }
    }

    /*
    ------------------------------------------------------
    CLEAN PAX PRICES
    ------------------------------------------------------
    */

    const cleanedPaxPrices =
      getCleanPaxPrices();

    /*
    ------------------------------------------------------
    CLEAN ITINERARY
    ------------------------------------------------------
    */

    const cleanedItinerary =
      getCleanItinerary();

    /*
    ------------------------------------------------------
    CLEAN Faqs
    ------------------------------------------------------
    */

    const cleanedFaqs =
      getCleanFaqs();

    /*
 ------------------------------------------------------
 CLEAN Faqs
 ------------------------------------------------------
 */
    const cleanedYoutubeVideos =
      getCleanYoutubeVideos();
    /*
    ------------------------------------------------------
    CLEAN IMAGES
    ------------------------------------------------------
    */

    const cleanedImages =
      getCleanImages();

    /*
    ------------------------------------------------------
    PRIMARY IMAGE
    ------------------------------------------------------
    
    First gallery image is automatically the
    primary image / legacy imageUrl.
    */

    const primaryImageUrl =
      cleanedImages[0]?.url || "";

    /*
    ------------------------------------------------------
    PREPARE SUBMIT DATA
    ------------------------------------------------------
    */

    const submitData = {
      title:
        formData.title.trim(),

      slug:
        formData.slug.trim()
          .toLowerCase(),

      pageType:
        formData.pageType,

      /*
      Region is optional.
      Empty value becomes null.
      */

      region:
        formData.region || null,

      description:
        formData.description.trim(),

      content:
        formData.content.trim(),

      highlight:
        formData.highlight.trim(),


      teamProfile: {
        name: formData.teamProfile.name.trim(),
        position: formData.teamProfile.position.trim(),
        photoUrl: formData.teamProfile.photoUrl.trim(),
        photoStorage: formData.teamProfile.photoStorage || "",
        photoPublicId: formData.teamProfile.photoPublicId || "",
        photoKey: formData.teamProfile.photoKey || "",

        biography: formData.teamProfile.biography,
        socialLinks: {
          linkedin: formData.teamProfile.socialLinks.linkedin.trim(),
          instagram: formData.teamProfile.socialLinks.instagram.trim(),
          facebook: formData.teamProfile.socialLinks.facebook.trim(),
          website: formData.teamProfile.socialLinks.website.trim(),
        },
      },

      professionalGuide: formData.professionalGuide,




      /*
 ------------------------------------------------------
 LEGACY IMAGE URL
 ------------------------------------------------------
 The first image is also saved to imageUrl.
 */

      imageUrl:
        primaryImageUrl,

      /*
      ------------------------------------------------------
      IMAGE STORAGE
      ------------------------------------------------------
      */

      imageStorage:
        formData.imageStorage,

      /*
      ------------------------------------------------------
      MULTIPLE IMAGES
      ------------------------------------------------------
      */

      images:
        cleanedImages,

      /*
      ====================================================
      PRICE
      ====================================================
      */

      price: {
        currency:
          formData.price.currency,

        pricingType:
          formData.price.pricingType,

        amount:
          formData.price.amount === ""
            ? 0
            : Number(
              formData.price.amount
            ),

        paxPrices:
          formData.price.pricingType ===
            "pax_based"
            ? cleanedPaxPrices
            : [],
      },

      /*
      ====================================================
      TREK DETAILS
      ====================================================
      */

      trekDetails: {
        duration:
          formData.trekDetails.duration.trim(),

        maxAltitude:
          formData.trekDetails.maxAltitude.trim(),

        difficulty:
          formData.trekDetails.difficulty.trim(),

        bestSeason:
          formData.trekDetails.bestSeason.trim(),

        startingPoint:
          formData.trekDetails.startingPoint.trim(),

        endingPoint:
          formData.trekDetails.endingPoint.trim(),

        accommodation:
          formData.trekDetails.accommodation.trim(),

        meals:
          formData.trekDetails.meals.trim(),

        groupSize:
          formData.trekDetails.groupSize.trim(),

        permits:
          formData.trekDetails.permits.trim(),

        transportation:
          formData.trekDetails.transportation.trim(),

        guide:
          formData.trekDetails.guide.trim(),
      },

      /*
      ====================================================
      TOUR DETAILS
      ====================================================
      */

      tourDetails: {
        duration:
          formData.tourDetails.duration.trim(),

        tourType:
          formData.tourDetails.tourType.trim(),

        destination:
          formData.tourDetails.destination.trim(),

        bestSeason:
          formData.tourDetails.bestSeason.trim(),

        groupSize:
          formData.tourDetails.groupSize.trim(),

        accommodation:
          formData.tourDetails.accommodation.trim(),

        transportation:
          formData.tourDetails.transportation.trim(),
      },

      /*
      ====================================================
      ITINERARY
      ====================================================
      */

      itinerary:
        cleanedItinerary,

      /*
      ====================================================
      INCLUSIONS
      ====================================================
      */

      inclusions:
        cleanStringArray(
          formData.inclusions
        ),

      /*
      ====================================================
      EXCLUSIONS
      ====================================================
      */

      exclusions:
        cleanStringArray(
          formData.exclusions
        ),

      /*
      ====================================================
      IMPORTANT INFORMATION
      ====================================================
      */

      importantInformation:
        formData.importantInformation.trim(),

      /*
====================================================
FAQ IMAGE MAP URL
====================================================
*/
      /*
      ====================================================
      FAQ IMAGE
      ====================================================
      */

      faqImageUrl:
        formData.faqImageUrl.trim(),

      faqImageStorage:
        ["none", "cloudinary", "s3"].includes(
          formData.faqImageStorage
        )
          ? formData.faqImageStorage
          : "none",

      faqImageKey:
        formData.faqImageKey.trim(),



      /*
      ====================================================
      FAQS
      ====================================================
      */

      faqs:
        cleanedFaqs,

      /*
   ====================================================
   YouTube Videos
   ====================================================
   */

      youtubeVideos:
        cleanedYoutubeVideos,
      /*
      ====================================================
      PUBLISHING
      ====================================================
      */

      published:
        Boolean(
          formData.published
        ),

      order:
        Number(
          formData.order || 0
        ),

      /*
      ====================================================
      SEO
      ====================================================
      */

      seo: {
        metaTitle:
          formData.seo.metaTitle.trim(),

        metaDescription:
          formData.seo.metaDescription.trim(),

        keywords:
          cleanStringArray(
            formData.seo.keywords
          ),

        ogTitle:
          formData.seo.ogTitle.trim(),

        ogDescription:
          formData.seo.ogDescription.trim(),

        ogImage:
          formData.seo.ogImage.trim(),

        canonicalUrl:
          formData.seo.canonicalUrl.trim(),

        noIndex:
          Boolean(
            formData.seo.noIndex
          ),
      },
    };

    /*
    ======================================================
    SEND DATA TO PARENT
    ======================================================
    */

    if (onSubmit) {
      onSubmit(submitData);
    }


  }

  /*
  
  # RENDER
  
  */
  console.log("FormData", formData)

  return (<form
    onSubmit={handleSubmit}
    className="space-y-8 pb-12"
  >
    {formError && (<div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
      {formError} </div>
    )}


    {/* =================================================
      BASIC INFORMATION
  ================================================= */}

    <section className="rounded-xl border bg-white p-6 shadow-sm">
      <h2 className="mb-6 text-xl font-bold text-gray-900">
        Basic Information
      </h2>

      <div className="grid gap-6 md:grid-cols-2">

        {/* TITLE */}

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Page Title
          </label>

          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Everest Base Camp Trek"
            required
            className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
          />
        </div>

        {/* SLUG */}

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Slug
          </label>

          <input
            type="text"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            placeholder="everest-base-camp-trek"
            required
            className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
          />

          <p className="mt-1 text-xs text-gray-500">
            Use lowercase letters, numbers and hyphens.
          </p>
        </div>

        {/* PAGE TYPE */}

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Page Type
          </label>

          <select
            value={formData.pageType}
            onChange={
              handlePageTypeChange
            }
            required
            disabled={
              loadingPageTypes
            }
            className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
          >
            <option value="">
              {loadingPageTypes
                ? "Loading Page Types..."
                : "Select Page Type"}
            </option>

            {pageTypes.map(
              (type) => (
                <option
                  key={type._id}
                  value={type._id}
                >
                  {type.name}
                </option>
              )
            )}
          </select>

          {pageTypeError && (
            <p className="mt-1 text-xs text-red-600">
              {pageTypeError}
            </p>
          )}

          {selectedPageType?.description && (
            <p className="mt-2 text-xs text-gray-500">
              {
                selectedPageType.description
              }
            </p>
          )}
        </div>

        {/* REGION */}

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Region
          </label>

          <select
            value={formData.region}
            onChange={
              handleRegionChange
            }
            disabled={
              loadingRegions
            }
            className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
          >
            <option value="">
              {loadingRegions
                ? "Loading Regions..."
                : "No Region"}
            </option>

            {regions.map(
              (region) => (
                <option
                  key={region._id}
                  value={region._id}
                >
                  {region.name}
                </option>
              )
            )}
          </select>

          {regionError && (
            <p className="mt-1 text-xs text-red-600">
              {regionError}
            </p>
          )}

          <p className="mt-1 text-xs text-gray-500">
            Region is optional.
          </p>
        </div>

        {/* =================================================
          PAGE IMAGES
      ================================================= */}

        <div className="md:col-span-2">
          {/* =================================================
  IMAGE STORAGE
================================================= */}

          <div className="mb-6 rounded-xl border bg-gray-50 p-5">

            <div className="mb-4">

              <h4 className="text-base font-semibold text-gray-900">
                Image Storage
              </h4>

              <p className="mt-1 text-sm text-gray-500">
                Choose where new images for this page will be stored.
                Images are uploaded to only one provider.
              </p>

            </div>

            <div className="grid gap-4 md:grid-cols-3">

              {/* NONE */}

              <label className="cursor-pointer">

                <input
                  type="radio"
                  name="imageStorage"
                  value="none"
                  checked={
                    formData.imageStorage === "none"
                  }
                  onChange={handleChange}
                  className="mr-2"
                />

                <span className="text-sm font-medium text-gray-700">
                  None / URL Only
                </span>

              </label>


              {/* CLOUDINARY */}

              <label className="cursor-pointer">

                <input
                  type="radio"
                  name="imageStorage"
                  value="cloudinary"
                  checked={
                    formData.imageStorage ===
                    "cloudinary"
                  }
                  onChange={handleChange}
                  className="mr-2"
                />

                <span className="text-sm font-medium text-gray-700">
                  Cloudinary
                </span>

              </label>


              {/* S3 */}

              <label className="cursor-pointer">

                <input
                  type="radio"
                  name="imageStorage"
                  value="s3"
                  checked={
                    formData.imageStorage === "s3"
                  }
                  onChange={handleChange}
                  className="mr-2"
                />

                <span className="text-sm font-medium text-gray-700">
                  AWS S3
                </span>

              </label>

            </div>

          </div>

          {/* =================================================
              IMAGE FILE UPLOAD
           ================================================= */}

          {formData.imageStorage !== "none" && (

            <div className="mb-6 rounded-xl border bg-white p-5">

              <label className="mb-2 block text-sm font-medium text-gray-700">
                Upload Images
              </label>

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                onChange={handleImageUpload}
                disabled={uploadingImages}
                className="w-full rounded-lg border bg-gray-50 px-4 py-3 text-sm"
              />

              <p className="mt-2 text-xs text-gray-500">
                Selected images will be uploaded to{" "}
                <strong>
                  {formData.imageStorage ===
                    "cloudinary"
                    ? "Cloudinary"
                    : "AWS S3"}
                </strong>{" "}
                only.
              </p>

              {uploadingImages && (
                <p className="mt-3 text-sm font-medium text-blue-600">
                  Uploading images...
                </p>
              )}

              {uploadError && (
                <p className="mt-3 text-sm text-red-600">
                  {uploadError}
                </p>
              )}

            </div>

          )}

          <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">

            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Page Images
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Add multiple images to this page. The first image is the primary / cover image.
              </p>
            </div>

            <button
              type="button"
              onClick={addImage}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              + Add Image
            </button>
          </div>

          {formData.images.length === 0 && (
            <div className="rounded-xl border border-dashed p-8 text-center">

              <div className="text-4xl">
                🖼️
              </div>

              <p className="mt-3 text-sm font-medium text-gray-700">
                No images added yet.
              </p>

              <p className="mt-1 text-xs text-gray-500">
                Add one or more image URLs for this page.
              </p>

              <button
                type="button"
                onClick={addImage}
                className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                + Add First Image
              </button>
            </div>
          )}

          <div className="space-y-5">

            {formData.images.map(
              (
                image,
                index
              ) => (
                <div
                  key={index}
                  className="rounded-xl border bg-gray-50 p-5"
                >

                  {/* IMAGE HEADER */}

                  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                    <div className="flex items-center gap-3">

                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                        {index + 1}
                      </span>

                      <div>
                        <h4 className="font-semibold text-gray-900">
                          Image{" "}
                          {index + 1}
                        </h4>

                        {index === 0 && (
                          <p className="text-xs font-medium text-green-600">
                            Primary / Cover Image
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">

                      {/* MOVE UP */}

                      <button
                        type="button"
                        onClick={() =>
                          moveImage(
                            index,
                            "up"
                          )
                        }
                        disabled={
                          index === 0
                        }
                        className="rounded-lg border bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                        title="Move image up"
                      >
                        ↑ Move Up
                      </button>

                      {/* MOVE DOWN */}

                      <button
                        type="button"
                        onClick={() =>
                          moveImage(
                            index,
                            "down"
                          )
                        }
                        disabled={
                          index ===
                          formData.images
                            .length -
                          1
                        }
                        className="rounded-lg border bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                        title="Move image down"
                      >
                        ↓ Move Down
                      </button>

                      {/* REMOVE */}

                      <button
                        type="button"
                        onClick={() =>
                          removeImage(
                            index
                          )
                        }
                        className="rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">

                    {/* URL */}

                    <div className="md:col-span-2">

                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Image URL
                      </label>

                      <input
                        type="url"
                        value={
                          image.url
                        }
                        onChange={(e) =>
                          handleImageChange(
                            index,
                            "url",
                            e.target.value
                          )
                        }
                        placeholder="https://res.cloudinary.com/..."
                        className="w-full rounded-lg border bg-white px-4 py-3 outline-none focus:border-blue-500"
                      />

                    </div>

                    {/* ALT */}

                    <div className="md:col-span-2">

                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Image Alt Text
                      </label>

                      <input
                        type="text"
                        value={
                          image.alt
                        }
                        onChange={(e) =>
                          handleImageChange(
                            index,
                            "alt",
                            e.target.value
                          )
                        }
                        placeholder="Everest Base Camp Trek Nepal"
                        className="w-full rounded-lg border bg-white px-4 py-3 outline-none focus:border-blue-500"
                      />

                      <p className="mt-1 text-xs text-gray-500">
                        Describe the image for accessibility and SEO.
                      </p>

                    </div>

                    {/* PREVIEW */}

                    <div className="md:col-span-2">

                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Image Preview
                      </label>

                      {image.url ? (
                        <div className="overflow-hidden rounded-xl border bg-white">

                          <img
                            src={
                              image.url
                            }
                            alt={
                              image.alt ||
                              `Page image ${index + 1
                              }`
                            }
                            className="h-64 w-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display =
                                "none";
                            }}
                          />

                        </div>
                      ) : (
                        <div className="flex h-48 items-center justify-center rounded-xl border border-dashed bg-white">

                          <p className="text-sm text-gray-400">
                            Image preview will appear here.
                          </p>

                        </div>
                      )}

                    </div>
                  </div>

                </div>
              )
            )}

          </div>

          {formData.images.length > 1 && (
            <div className="mt-4 rounded-lg bg-blue-50 p-4 text-sm text-blue-700">

              <strong>
                Image order:
              </strong>{" "}
              The first image is used as the primary / cover image.
              Use <strong>Move Up</strong> and{" "}
              <strong>Move Down</strong> to change the order.

            </div>
          )}
        </div>

        {/* DESCRIPTION */}

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Short Description
          </label>

          <textarea
            name="description"
            value={
              formData.description
            }
            onChange={handleChange}
            rows="4"
            placeholder="Write a short description..."
            className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
          />
        </div>

        {/* CONTENT/ Overview */}

        {/* CONTENT / OVERVIEW */}

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Overview
          </label>

          <RichTextEditor
            value={formData.content}
            onChange={(value) =>
              setFormData((prev) => ({
                ...prev,
                content: value,
              }))
            }
            placeholder="Write page overview..."
          />
        </div>
      </div>

      {/* Highlight */}

      <div className="md:col-span-2">
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Highlight
        </label>

        <RichTextEditor
          value={formData.highlight}
          onChange={(value) =>
            setFormData((prev) => ({
              ...prev,
              highlight: value,
            }))
          }
          placeholder="Write key highlights..."
        />
      </div>


      {/* =========================================
            TEAM PROFILE
        ========================================= */}
      {isTeam && (
        <section className="mt-8 rounded-lg border border-gray-200 bg-white p-5">
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-gray-800">
              Team Profile
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Add a team member's details, photo, and social links.
            </p>
          </div>

          <div className="space-y-4">
            {/* FULL NAME */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                value={formData.teamProfile.name}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    teamProfile: {
                      ...prev.teamProfile,
                      name: e.target.value,
                    },
                  }))
                }
                placeholder="Enter team member's name"
                className="w-full rounded-lg border bg-white px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            {/* POSITION */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Position
              </label>
              <input
                type="text"
                value={formData.teamProfile.position}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    teamProfile: {
                      ...prev.teamProfile,
                      position: e.target.value,
                    },
                  }))
                }
                placeholder="e.g. Managing Director"
                className="w-full rounded-lg border bg-white px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            {/* PROFILE PHOTO */}
            <div className="rounded-lg border bg-gray-50 p-4">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Profile Photo Storage
              </label>

              <select
                value={
                  ["cloudinary", "s3"].includes(formData.imageStorage)
                    ? formData.imageStorage
                    : "cloudinary"
                }
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    imageStorage: e.target.value,
                  }))
                }
                className="mb-4 w-full rounded-lg border bg-white px-4 py-3 outline-none focus:border-blue-500"
              >
                <option value="cloudinary">Cloudinary</option>
                <option value="s3">AWS S3</option>
              </select>

              <p className="mb-3 text-xs text-gray-500">
                The profile photo will be uploaded to{" "}
                <strong>
                  {formData.imageStorage === "s3"
                    ? "AWS S3"
                    : "Cloudinary"}
                </strong>
                .
              </p>

              <label className="mb-2 block text-sm font-medium text-gray-700">
                Upload Profile Photo
              </label>

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleTeamProfilePhotoUpload}
                disabled={uploadingImages}
                className="w-full rounded-lg border bg-white px-4 py-3"
              />

              <p className="mt-2 text-xs text-gray-500">
                Supported formats: JPG, PNG, WebP, GIF. Maximum file size: 5 MB.
              </p>

              {uploadingImages && (
                <p className="mt-2 text-sm text-blue-600">
                  Uploading profile photo...
                </p>
              )}

              {formData.teamProfile.photoUrl && (
                <div className="mt-4">
                  <p className="mb-2 text-sm font-medium text-gray-700">
                    Photo Preview
                  </p>
                  <img
                    src={formData.teamProfile.photoUrl}
                    alt="Team profile preview"
                    className="h-32 w-32 rounded-lg border bg-white object-cover"
                  />
                </div>
              )}

              <label className="mb-2 mt-4 block text-sm font-medium text-gray-700">
                Or enter Photo URL
              </label>

              <input
                type="url"
                value={formData.teamProfile.photoUrl}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    teamProfile: {
                      ...prev.teamProfile,
                      photoUrl: e.target.value,
                      photoStorage: "",
                      photoPublicId: "",
                      photoKey: "",
                    },
                  }))
                }
                placeholder="https://example.com/team-member.jpg"
                className="w-full rounded-lg border bg-white px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            {/* BIOGRAPHY */}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Biography
              </label>
              <RichTextEditor
                value={formData.teamProfile.biography}
                onChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    teamProfile: {
                      ...prev.teamProfile,
                      biography: value,
                    },
                  }))
                }
                placeholder="Write the team member's biography..."
              />
            </div>


            {/* LINKEDIN */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                LinkedIn URL
              </label>
              <input
                type="url"
                value={formData.teamProfile.socialLinks.linkedin}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    teamProfile: {
                      ...prev.teamProfile,
                      socialLinks: {
                        ...prev.teamProfile.socialLinks,
                        linkedin: e.target.value,
                      },
                    },
                  }))
                }
                placeholder="https://linkedin.com/in/..."
                className="w-full rounded-lg border bg-white px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            {/* INSTAGRAM */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Instagram URL
              </label>
              <input
                type="url"
                value={formData.teamProfile.socialLinks.instagram}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    teamProfile: {
                      ...prev.teamProfile,
                      socialLinks: {
                        ...prev.teamProfile.socialLinks,
                        instagram: e.target.value,
                      },
                    },
                  }))
                }
                placeholder="https://instagram.com/..."
                className="w-full rounded-lg border bg-white px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            {/* FACEBOOK */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Facebook URL
              </label>
              <input
                type="url"
                value={formData.teamProfile.socialLinks.facebook}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    teamProfile: {
                      ...prev.teamProfile,
                      socialLinks: {
                        ...prev.teamProfile.socialLinks,
                        facebook: e.target.value,
                      },
                    },
                  }))
                }
                placeholder="https://facebook.com/..."
                className="w-full rounded-lg border bg-white px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            {/* PERSONAL WEBSITE */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Personal Website
              </label>
              <input
                type="url"
                value={formData.teamProfile.socialLinks.website}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    teamProfile: {
                      ...prev.teamProfile,
                      socialLinks: {
                        ...prev.teamProfile.socialLinks,
                        website: e.target.value,
                      },
                    },
                  }))
                }
                placeholder="https://example.com"
                className="w-full rounded-lg border bg-white px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </section>

      )}



      {/* =========================================
    PROFESSIONAL GUIDE PROFILE
========================================= */}
      {isGuide && (
        <section className="mt-8 rounded-lg border border-gray-200 bg-white p-5">
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-gray-800">
              Professional Guide Profile
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Add the guide's qualifications, experience, languages, specialties, and biography.
            </p>
          </div>

          <div className="space-y-4">
            {/* FULL NAME */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                value={formData.professionalGuide.name}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    professionalGuide: {
                      ...prev.professionalGuide,
                      name: e.target.value,
                    },
                  }))
                }
                placeholder="Enter guide's full name"
                className="w-full rounded-lg border bg-white px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            {/* PROFILE PHOTO */}
            <div className="rounded-lg border bg-gray-50 p-4">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Guide Profile Photo
              </label>

              <label className="mb-2 block text-sm font-medium text-gray-700">
                Choose Photo Storage
              </label>
              <select
                value={
                  ["cloudinary", "s3"].includes(
                    formData.professionalGuide.photoStorage
                  )
                    ? formData.professionalGuide.photoStorage
                    : "cloudinary"
                }
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    professionalGuide: {
                      ...prev.professionalGuide,
                      photoStorage: e.target.value,
                    },
                  }))
                }
                className="mb-4 w-full rounded-lg border bg-white px-4 py-3 outline-none focus:border-blue-500"
              >
                <option value="cloudinary">Cloudinary</option>
                <option value="s3">AWS S3</option>
              </select>

              <p className="mb-3 text-xs text-gray-500">
                The guide photo will be uploaded to{" "}
                <strong>
                  {formData.professionalGuide.photoStorage === "s3"
                    ? "AWS S3"
                    : "Cloudinary"}
                </strong>.
              </p>

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleProfessionalGuidePhotoUpload}
                disabled={uploadingImages}
                className="w-full rounded-lg border bg-white px-4 py-3"
              />

              <p className="mt-2 text-xs text-gray-500">
                Supported formats: JPG, PNG, WebP, GIF. Maximum file size: 5 MB.
              </p>

              {uploadingImages && (
                <p className="mt-2 text-sm text-blue-600">
                  Uploading photo...
                </p>
              )}

              {formData.professionalGuide.photoUrl && (
                <div className="mt-4">
                  <p className="mb-2 text-sm font-medium text-gray-700">
                    Photo Preview
                  </p>
                  <img
                    src={formData.professionalGuide.photoUrl}
                    alt="Professional guide preview"
                    className="h-32 w-32 rounded-lg border bg-white object-cover"
                  />
                </div>
              )}

              <label className="mb-2 mt-4 block text-sm font-medium text-gray-700">
                Or enter Photo URL
              </label>
              <input
                type="url"
                value={formData.professionalGuide.photoUrl}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    professionalGuide: {
                      ...prev.professionalGuide,
                      photoUrl: e.target.value,
                      photoStorage: "",
                      photoPublicId: "",
                      photoKey: "",
                    },
                  }))
                }
                placeholder="https://example.com/guide.jpg"
                className="w-full rounded-lg border bg-white px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            {/* QUALIFICATIONS */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Qualifications
              </label>
              <input
                type="text"
                value={formData.professionalGuide.qualifications}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    professionalGuide: {
                      ...prev.professionalGuide,
                      qualifications: e.target.value,
                    },
                  }))
                }
                placeholder="e.g. Tourism Management Diploma"
                className="w-full rounded-lg border bg-white px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            {/* CERTIFICATIONS */}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Certifications
              </label>
              <RichTextEditor
                value={formData.professionalGuide.certifications}
                onChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    professionalGuide: {
                      ...prev.professionalGuide,
                      certifications: value,
                    },
                  }))
                }
                placeholder="e.g. Trekking Guide License, First Aid Certificate"
              />
            </div>


            {/* YEARS OF EXPERIENCE */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Years of Experience
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={formData.professionalGuide.experienceYears}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    professionalGuide: {
                      ...prev.professionalGuide,
                      experienceYears: Math.max(0, Number(e.target.value) || 0),
                    },
                  }))
                }
                placeholder="e.g. 8"
                className="w-full rounded-lg border bg-white px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            {/* LANGUAGES */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Languages
              </label>
              <input
                type="text"
                value={formData.professionalGuide.languages.join(", ")}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    professionalGuide: {
                      ...prev.professionalGuide,
                      languages: e.target.value
                        .split(",")
                        .map((item) => item.trim())
                        .filter(Boolean),
                    },
                  }))
                }
                placeholder="e.g. English, Nepali, Hindi"
                className="w-full rounded-lg border bg-white px-4 py-3 outline-none focus:border-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Separate languages with commas.
              </p>
            </div>

            {/* SPECIALTIES */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Specialties
              </label>
              <input
                type="text"
                value={formData.professionalGuide.specialties.join(", ")}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    professionalGuide: {
                      ...prev.professionalGuide,
                      specialties: e.target.value
                        .split(",")
                        .map((item) => item.trim())
                        .filter(Boolean),
                    },
                  }))
                }
                placeholder="e.g. Everest Base Camp, Cultural Tours, Mountaineering"
                className="w-full rounded-lg border bg-white px-4 py-3 outline-none focus:border-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Separate specialties with commas.
              </p>
            </div>

            {/* BIOGRAPHY */}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Biography
              </label>
              <RichTextEditor
                value={formData.professionalGuide.biography}
                onChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    professionalGuide: {
                      ...prev.professionalGuide,
                      biography: value,
                    },
                  }))
                }
                placeholder="Write the professional guide's biography..."
              />
            </div>


            {/* LINKEDIN */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                LinkedIn URL
              </label>
              <input
                type="url"
                value={formData.professionalGuide.socialLinks.linkedin}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    professionalGuide: {
                      ...prev.professionalGuide,
                      socialLinks: {
                        ...prev.professionalGuide.socialLinks,
                        linkedin: e.target.value,
                      },
                    },
                  }))
                }
                placeholder="https://linkedin.com/in/..."
                className="w-full rounded-lg border bg-white px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            {/* INSTAGRAM */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Instagram URL
              </label>
              <input
                type="url"
                value={formData.professionalGuide.socialLinks.instagram}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    professionalGuide: {
                      ...prev.professionalGuide,
                      socialLinks: {
                        ...prev.professionalGuide.socialLinks,
                        instagram: e.target.value,
                      },
                    },
                  }))
                }
                placeholder="https://instagram.com/..."
                className="w-full rounded-lg border bg-white px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            {/* FACEBOOK */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Facebook URL
              </label>
              <input
                type="url"
                value={formData.professionalGuide.socialLinks.facebook}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    professionalGuide: {
                      ...prev.professionalGuide,
                      socialLinks: {
                        ...prev.professionalGuide.socialLinks,
                        facebook: e.target.value,
                      },
                    },
                  }))
                }
                placeholder="https://facebook.com/..."
                className="w-full rounded-lg border bg-white px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            {/* PERSONAL WEBSITE */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Personal Website
              </label>
              <input
                type="url"
                value={formData.professionalGuide.socialLinks.website}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    professionalGuide: {
                      ...prev.professionalGuide,
                      socialLinks: {
                        ...prev.professionalGuide.socialLinks,
                        website: e.target.value,
                      },
                    },
                  }))
                }
                placeholder="https://example.com"
                className="w-full rounded-lg border bg-white px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </section>
      )}




    </section>



    {/* =================================================
      PACKAGE PRICING
  ================================================= */}

    {isExperience && (
      <section className="rounded-xl border bg-white p-6 shadow-sm">

        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            Package Pricing
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Set fixed or PAX-based pricing.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">

          {/* CURRENCY */}

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Currency
            </label>

            <select
              name="currency"
              value={
                formData.price.currency
              }
              onChange={
                handlePriceChange
              }
              className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
            >
              <option value="USD">
                USD - US Dollar
              </option>

              <option value="EUR">
                EUR - Euro
              </option>

              <option value="GBP">
                GBP - British Pound
              </option>

              <option value="AUD">
                AUD - Australian Dollar
              </option>

              <option value="CAD">
                CAD - Canadian Dollar
              </option>

              <option value="NPR">
                NPR - Nepalese Rupee
              </option>
            </select>
          </div>

          {/* PRICING TYPE */}

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Pricing Type
            </label>

            <select
              name="pricingType"
              value={
                formData.price
                  .pricingType
              }
              onChange={
                handlePriceChange
              }
              className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
            >
              <option value="fixed">
                Fixed Price
              </option>

              <option value="pax_based">
                PAX Based Pricing
              </option>
            </select>
          </div>
        </div>

        {/* =================================================
          FIXED PRICE
      ================================================= */}

        {formData.price
          .pricingType ===
          "fixed" && (
            <div className="mt-6 rounded-lg bg-gray-50 p-5">

              <label className="mb-2 block text-sm font-medium text-gray-700">
                Price Per Person
              </label>

              <div className="flex">

                <span className="flex items-center rounded-l-lg border border-r-0 bg-gray-100 px-4 text-sm font-medium text-gray-600">
                  {
                    formData.price
                      .currency
                  }
                </span>

                <input
                  type="number"
                  name="amount"
                  min="0"
                  step="0.01"
                  value={
                    formData.price
                      .amount
                  }
                  onChange={
                    handlePriceChange
                  }
                  placeholder="1500"
                  className="w-full rounded-r-lg border px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <p className="mt-2 text-xs text-gray-500">
                This is the price charged per person.
              </p>
            </div>
          )}

        {/* =================================================
          PAX BASED
      ================================================= */}

        {formData.price
          .pricingType ===
          "pax_based" && (
            <div className="mt-6">

              <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">

                <div>
                  <h3 className="font-semibold text-gray-900">
                    PAX Price Tiers
                  </h3>

                  <p className="text-sm text-gray-500">
                    Define the price per person for different group sizes.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    addPaxTier
                  }
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  + Add Price Tier
                </button>
              </div>

              {formData.price
                .paxPrices.length ===
                0 && (
                  <div className="rounded-lg border border-dashed p-8 text-center">

                    <p className="text-sm text-gray-500">
                      No PAX pricing tiers added.
                    </p>

                    <button
                      type="button"
                      onClick={
                        addPaxTier
                      }
                      className="mt-3 text-sm font-semibold text-blue-600 hover:underline"
                    >
                      Add your first price tier
                    </button>
                  </div>
                )}

              <div className="space-y-4">

                {formData.price
                  .paxPrices
                  .map(
                    (
                      tier,
                      index
                    ) => (
                      <div
                        key={index}
                        className="rounded-xl border bg-gray-50 p-4"
                      >
                        <div className="mb-4 flex items-center justify-between">

                          <h4 className="font-semibold text-gray-800">
                            Tier{" "}
                            {index + 1}
                          </h4>

                          <button
                            type="button"
                            onClick={() =>
                              removePaxTier(
                                index
                              )
                            }
                            className="text-sm font-medium text-red-600 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">

                          {/* MIN */}

                          <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                              Minimum PAX
                            </label>

                            <input
                              type="number"
                              min="1"
                              step="1"
                              value={
                                tier.minPax
                              }
                              onChange={(e) =>
                                handlePaxPriceChange(
                                  index,
                                  "minPax",
                                  e.target.value
                                )
                              }
                              placeholder="1"
                              className="w-full rounded-lg border bg-white px-4 py-3 outline-none focus:border-blue-500"
                            />
                          </div>

                          {/* MAX */}

                          <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                              Maximum PAX
                            </label>

                            <input
                              type="number"
                              min="1"
                              step="1"
                              value={
                                tier.maxPax
                              }
                              onChange={(e) =>
                                handlePaxPriceChange(
                                  index,
                                  "maxPax",
                                  e.target.value
                                )
                              }
                              placeholder="Unlimited"
                              className="w-full rounded-lg border bg-white px-4 py-3 outline-none focus:border-blue-500"
                            />

                            <p className="mt-1 text-xs text-gray-500">
                              Empty = unlimited.
                            </p>
                          </div>

                          {/* PRICE */}

                          <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                              Price Per PAX
                            </label>

                            <div className="flex">

                              <span className="flex items-center rounded-l-lg border border-r-0 bg-gray-100 px-3 text-sm text-gray-600">
                                {
                                  formData
                                    .price
                                    .currency
                                }
                              </span>

                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={
                                  tier.pricePerPax
                                }
                                onChange={(e) =>
                                  handlePaxPriceChange(
                                    index,
                                    "pricePerPax",
                                    e.target.value
                                  )
                                }
                                placeholder="1500"
                                className="w-full rounded-r-lg border bg-white px-4 py-3 outline-none focus:border-blue-500"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  )}
              </div>
            </div>
          )}
      </section>
    )}

    {/* =================================================
      TREK DETAILS
  ================================================= */}

    {isTrek && (
      <section className="rounded-xl border bg-white p-6 shadow-sm">

        <h2 className="mb-6 text-xl font-bold text-gray-900">
          Trek Details
        </h2>

        <div className="grid gap-6 md:grid-cols-2">

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Duration
            </label>

            <input
              type="text"
              name="duration"
              value={
                formData.trekDetails
                  .duration
              }
              onChange={
                handleTrekChange
              }
              placeholder="14 Days"
              className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Difficulty
            </label>

            <input
              type="text"
              name="difficulty"
              value={
                formData.trekDetails
                  .difficulty
              }
              onChange={
                handleTrekChange
              }
              placeholder="Moderate"
              className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Maximum Altitude
            </label>

            <input
              type="text"
              name="maxAltitude"
              value={
                formData.trekDetails
                  .maxAltitude
              }
              onChange={
                handleTrekChange
              }
              placeholder="5,364m"
              className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Best Season
            </label>

            <input
              type="text"
              name="bestSeason"
              value={
                formData.trekDetails
                  .bestSeason
              }
              onChange={
                handleTrekChange
              }
              placeholder="March - May, September - November"
              className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Starting Point
            </label>

            <input
              type="text"
              name="startingPoint"
              value={
                formData.trekDetails
                  .startingPoint
              }
              onChange={
                handleTrekChange
              }
              placeholder="Kathmandu"
              className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Ending Point
            </label>

            <input
              type="text"
              name="endingPoint"
              value={
                formData.trekDetails
                  .endingPoint
              }
              onChange={
                handleTrekChange
              }
              placeholder="Kathmandu"
              className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Accommodation
            </label>

            <input
              type="text"
              name="accommodation"
              value={
                formData.trekDetails
                  .accommodation
              }
              onChange={
                handleTrekChange
              }
              placeholder="Tea House / Lodge"
              className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Meals
            </label>

            <input
              type="text"
              name="meals"
              value={
                formData.trekDetails
                  .meals
              }
              onChange={
                handleTrekChange
              }
              placeholder="Breakfast, Lunch and Dinner"
              className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Group Size
            </label>

            <input
              type="text"
              name="groupSize"
              value={
                formData.trekDetails
                  .groupSize
              }
              onChange={
                handleTrekChange
              }
              placeholder="2 - 15 people"
              className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Permits
            </label>

            <input
              type="text"
              name="permits"
              value={
                formData.trekDetails
                  .permits
              }
              onChange={
                handleTrekChange
              }
              placeholder="TIMS, National Park Permit"
              className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Transportation
            </label>

            <input
              type="text"
              name="transportation"
              value={
                formData.trekDetails
                  .transportation
              }
              onChange={
                handleTrekChange
              }
              placeholder="Private Vehicle / Flight"
              className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Guide
            </label>

            <input
              type="text"
              name="guide"
              value={
                formData.trekDetails
                  .guide
              }
              onChange={
                handleTrekChange
              }
              placeholder="Professional Licensed Guide"
              className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </section>
    )}

    {/* =================================================
      TOUR DETAILS
  ================================================= */}

    {isTour && (
      <section className="rounded-xl border bg-white p-6 shadow-sm">

        <h2 className="mb-6 text-xl font-bold text-gray-900">
          Tour Details
        </h2>

        <div className="grid gap-6 md:grid-cols-2">

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Duration
            </label>

            <input
              type="text"
              name="duration"
              value={
                formData.tourDetails
                  .duration
              }
              onChange={
                handleTourChange
              }
              placeholder="7 Days"
              className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Tour Type
            </label>

            <input
              type="text"
              name="tourType"
              value={
                formData.tourDetails
                  .tourType
              }
              onChange={
                handleTourChange
              }
              placeholder="Cultural Tour"
              className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Destination
            </label>

            <input
              type="text"
              name="destination"
              value={
                formData.tourDetails
                  .destination
              }
              onChange={
                handleTourChange
              }
              placeholder="Kathmandu, Pokhara"
              className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Best Season
            </label>

            <input
              type="text"
              name="bestSeason"
              value={
                formData.tourDetails
                  .bestSeason
              }
              onChange={
                handleTourChange
              }
              placeholder="October - May"
              className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Group Size
            </label>

            <input
              type="text"
              name="groupSize"
              value={
                formData.tourDetails
                  .groupSize
              }
              onChange={
                handleTourChange
              }
              placeholder="2 - 20 people"
              className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Accommodation
            </label>

            <input
              type="text"
              name="accommodation"
              value={
                formData.tourDetails
                  .accommodation
              }
              onChange={
                handleTourChange
              }
              placeholder="Hotel"
              className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Transportation
            </label>

            <input
              type="text"
              name="transportation"
              value={
                formData.tourDetails
                  .transportation
              }
              onChange={
                handleTourChange
              }
              placeholder="Private Vehicle"
              className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </section>
    )}

    {/* =================================================
      ITINERARY
  ================================================= */}

    {isExperience && (
      <section className="rounded-xl border bg-white p-6 shadow-sm">

        <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">

          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Itinerary
            </h2>

            <p className="text-sm text-gray-500">
              Add daily activities, meals, accommodation and altitude.
            </p>
          </div>

          <button
            type="button"
            onClick={
              addItinerary
            }
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            + Add Day
          </button>
        </div>

        {formData.itinerary.length ===
          0 && (
            <div className="rounded-lg border border-dashed p-8 text-center">

              <p className="text-sm text-gray-500">
                No itinerary days added.
              </p>

              <button
                type="button"
                onClick={
                  addItinerary
                }
                className="mt-3 text-sm font-semibold text-blue-600 hover:underline"
              >
                Add Day 1
              </button>
            </div>
          )}

        <div className="space-y-5">

          {formData.itinerary.map(
            (
              item,
              index
            ) => (
              <div
                key={index}
                className="rounded-xl border bg-gray-50 p-5"
              >

                <div className="mb-4 flex items-center justify-between">

                  <h3 className="font-semibold text-gray-900">
                    Day{" "}
                    {index + 1}
                  </h3>

                  <button
                    type="button"
                    onClick={() =>
                      removeItinerary(
                        index
                      )
                    }
                    className="text-sm font-medium text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">

                  {/* DAY */}

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Day
                    </label>

                    <input
                      type="number"
                      min="1"
                      value={
                        item.day
                      }
                      onChange={(e) =>
                        handleItineraryChange(
                          index,
                          "day",
                          e.target.value
                        )
                      }
                      className="w-full rounded-lg border bg-white px-4 py-3 outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* ALTITUDE */}

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Altitude
                    </label>

                    <input
                      type="text"
                      value={
                        item.altitude
                      }
                      onChange={(e) =>
                        handleItineraryChange(
                          index,
                          "altitude",
                          e.target.value
                        )
                      }
                      placeholder="3,440m"
                      className="w-full rounded-lg border bg-white px-4 py-3 outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* TITLE */}

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Day Title
                    </label>

                    <input
                      type="text"
                      value={
                        item.title
                      }
                      onChange={(e) =>
                        handleItineraryChange(
                          index,
                          "title",
                          e.target.value
                        )
                      }
                      placeholder="Kathmandu to Lukla"
                      className="w-full rounded-lg border bg-white px-4 py-3 outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* DESCRIPTION */}

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Description
                    </label>

                    <RichTextEditor
                      value={item.description}
                      onChange={(html) =>
                        handleItineraryChange(
                          index,
                          "description",
                          html
                        )
                      }
                      placeholder="Describe the activities for this day..."
                      className="w-full rounded-lg border bg-white px-4 py-3 outline-none focus:border-blue-500"
                    />


                  </div>

                  {/* ACCOMMODATION */}

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Accommodation
                    </label>

                    <input
                      type="text"
                      value={
                        item.accommodation
                      }
                      onChange={(e) =>
                        handleItineraryChange(
                          index,
                          "accommodation",
                          e.target.value
                        )
                      }
                      placeholder="Tea House / Hotel"
                      className="w-full rounded-lg border bg-white px-4 py-3 outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* MEAL */}

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Meal
                    </label>

                    <input
                      type="text"
                      value={
                        item.meal
                      }
                      onChange={(e) =>
                        handleItineraryChange(
                          index,
                          "meal",
                          e.target.value
                        )
                      }
                      placeholder="Breakfast, Lunch, Dinner"
                      className="w-full rounded-lg border bg-white px-4 py-3 outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* WALKING HOURS */}

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Travel Hours
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={
                        item.walkingHours
                      }
                      onChange={(e) =>
                        handleItineraryChange(
                          index,
                          "walkingHours",
                          e.target.value
                        )
                      }
                      placeholder="5"
                      className="w-full rounded-lg border bg-white px-4 py-3 outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </section>
    )}

    {/* =================================================
      INCLUSIONS / EXCLUSIONS
  ================================================= */}

    {isExperience && (
      <section className="grid gap-8 lg:grid-cols-2">

        {/* INCLUSIONS */}

        <div className="rounded-xl border bg-white p-6 shadow-sm">

          <div className="mb-5 flex items-center justify-between">

            <h2 className="text-xl font-bold text-gray-900">
              Inclusions
            </h2>

            <button
              type="button"
              onClick={
                addInclusion
              }
              className="text-sm font-semibold text-blue-600 hover:underline"
            >
              + Add
            </button>
          </div>

          <div className="space-y-3">

            {formData.inclusions.map(
              (
                item,
                index
              ) => (
                <div
                  key={index}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    value={item}
                    onChange={(e) =>
                      handleInclusionChange(
                        index,
                        e.target.value
                      )
                    }
                    placeholder="Airport pickup"
                    className="flex-1 rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      removeInclusion(
                        index
                      )
                    }
                    className="rounded-lg border px-3 text-red-600 hover:bg-red-50"
                  >
                    ×
                  </button>
                </div>
              )
            )}

            {formData.inclusions
              .length === 0 && (
                <p className="text-sm text-gray-500">
                  No inclusions added.
                </p>
              )}
          </div>
        </div>

        {/* EXCLUSIONS */}

        <div className="rounded-xl border bg-white p-6 shadow-sm">

          <div className="mb-5 flex items-center justify-between">

            <h2 className="text-xl font-bold text-gray-900">
              Exclusions
            </h2>

            <button
              type="button"
              onClick={
                addExclusion
              }
              className="text-sm font-semibold text-blue-600 hover:underline"
            >
              + Add
            </button>
          </div>

          <div className="space-y-3">

            {formData.exclusions.map(
              (
                item,
                index
              ) => (
                <div
                  key={index}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    value={item}
                    onChange={(e) =>
                      handleExclusionChange(
                        index,
                        e.target.value
                      )
                    }
                    placeholder="International airfare"
                    className="flex-1 rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      removeExclusion(
                        index
                      )
                    }
                    className="rounded-lg border px-3 text-red-600 hover:bg-red-50"
                  >
                    ×
                  </button>
                </div>
              )
            )}

            {formData.exclusions
              .length === 0 && (
                <p className="text-sm text-gray-500">
                  No exclusions added.
                </p>
              )}
          </div>
        </div>
      </section>
    )}

    {/* =================================================
      IMPORTANT INFORMATION
  ================================================= */}

    {isExperience && (
      <section className="rounded-xl border bg-white p-6 shadow-sm">

        <h2 className="mb-5 text-xl font-bold text-gray-900">
          Important Information
        </h2>


        <RichTextEditor
          value={formData.importantInformation}
          onChange={(value) =>
            setFormData((prev) => ({
              ...prev,
              importantInformation: value,
            }))
          }
          placeholder="Write important information..."
        />

      </section>
    )}

    {/* =================================================
      Map Image and FAQ
  ================================================= */}


    <section className="rounded-xl border bg-white p-6 shadow-sm">






      {/* MAP IMAGE */}

      <div className="mb-8 rounded-xl border bg-gray-50 p-5">

        <label className="mb-2 block text-sm font-medium text-gray-700">
          MAP Image
        </label>

        <p className="mb-4 text-xs text-gray-500">
          Optional. Choose where the MAP image should be stored.
          You can also enter an image URL manually.
        </p>

        {/* STORAGE */}

        <div className="mb-5">

          <label className="mb-2 block text-sm font-medium text-gray-700">
            Image Storage
          </label>

          <select
            value={formData.faqImageStorage}
            onChange={(e) => {
              const storage = e.target.value;

              setFormData((prev) => ({
                ...prev,
                faqImageStorage: storage,
                faqImageKey:
                  storage === "s3"
                    ? prev.faqImageKey
                    : "",
              }));

              setFormError("");
            }}
            className="w-full rounded-lg border bg-white px-4 py-3 outline-none focus:border-blue-500"
          >

            <option value="none">
              None
            </option>

            <option value="cloudinary">
              Cloudinary
            </option>

            <option value="s3">
              AWS S3
            </option>

          </select>

        </div>

        {/* UPLOAD */}

        {formData.faqImageStorage !== "none" && (
          <div className="mb-5">

            <label className="mb-2 block text-sm font-medium text-gray-700">
              Upload MAP Image
            </label>

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFaqImageUpload}
              className="w-full rounded-lg border bg-white px-4 py-3"
            />

            <p className="mt-2 text-xs text-gray-500">
              Maximum 1 MB. The image will be uploaded to{" "}
              <strong>
                {formData.faqImageStorage === "s3"
                  ? "AWS S3"
                  : "Cloudinary"}
              </strong>
              .
            </p>

          </div>
        )}

        {/* MANUAL URL */}

        <div className="mb-5">

          <label className="mb-2 block text-sm font-medium text-gray-700">
            MAP Image URL
          </label>

          <input
            type="url"
            value={formData.faqImageUrl}
            onChange={handleFaqImageUrlChange}
            placeholder="https://res.cloudinary.com/..."
            className="w-full rounded-lg border bg-white px-4 py-3 outline-none focus:border-blue-500"
          />

          <p className="mt-2 text-xs text-gray-500">
            You can also paste an existing image URL manually.
          </p>

        </div>

        {/* STORAGE INFORMATION */}

        {formData.faqImageUrl && (
          <div className="mb-4 rounded-lg border bg-white p-3 text-sm">

            <div>
              <span className="font-medium">
                Storage:
              </span>{" "}
              {formData.faqImageStorage === "s3"
                ? "AWS S3"
                : formData.faqImageStorage ===
                  "cloudinary"
                  ? "Cloudinary"
                  : "Manual URL"}
            </div>

            {formData.faqImageKey && (
              <div className="mt-1 break-all text-xs text-gray-500">
                S3 Key: {formData.faqImageKey}
              </div>
            )}

          </div>
        )}

        {/* PREVIEW */}

        {formData.faqImageUrl && (
          <div className="mt-4">

            <p className="mb-2 text-sm font-medium text-gray-700">
              Preview
            </p>

            <img
              src={formData.faqImageUrl}
              alt="FAQ section preview"
              className="h-48 w-full rounded-lg border object-cover"
              onError={(e) => {
                e.currentTarget.style.display =
                  "none";
              }}
            />

          </div>
        )}

      </div>


      {/* EMPTY FAQ */}

      {formData.faqs.length === 0 && (
        <div className="rounded-lg border border-dashed p-8 text-center">

          <p className="text-sm text-gray-500">
            No FAQ items added.
          </p>

          <button
            type="button"
            onClick={addFaq}
            className="mt-3 text-sm font-semibold text-blue-600 hover:underline"
          >
            Add your first FAQ
          </button>

        </div>
      )}


      {/* FAQ ITEMS */}

      {formData.faqs.length > 0 && (
        <div className="space-y-5">

          {formData.faqs.map((faq, index) => (

            <div
              key={index}
              className="rounded-xl border bg-gray-50 p-5"
            >

              <div className="mb-4 flex items-center justify-between">

                <h3 className="font-semibold text-gray-900">
                  FAQ {index + 1}
                </h3>

                <button
                  type="button"
                  onClick={() => removeFaq(index)}
                  className="text-sm font-medium text-red-600 hover:text-red-700"
                >
                  Remove
                </button>

              </div>


              {/* QUESTION */}

              <div className="mb-4">

                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Question
                </label>

                <input
                  type="text"
                  value={faq.question}
                  onChange={(e) =>
                    handleFaqChange(
                      index,
                      "question",
                      e.target.value
                    )
                  }
                  placeholder="What is the best season for this trek?"
                  className="w-full rounded-lg border bg-white px-4 py-3 outline-none focus:border-blue-500"
                />

              </div>


              {/* ANSWER */}

              <div>

                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Answer
                </label>

                <RichTextEditor
                  value={faq.answer}
                  onChange={(html) =>
                    handleFaqChange(index, "answer", html)
                  }
                  placeholder={`Write answer for FAQ ${index + 1}...`}
                />

              </div>

            </div>

          ))}

        </div>
      )}


      {/* ADD FAQ BUTTON */}

      <div className="mt-4">

        <button
          type="button"
          onClick={addFaq}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          + Add FAQ
        </button>

      </div>

    </section>



    {/* =========================================
    YOUTUBE VIDEOS
    ========================================= */}

    <div className="mt-8 rounded-lg border border-gray-200 bg-white p-5">

      <div className="mb-5 flex items-center justify-between">

        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            YouTube Videos
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Add YouTube videos for this page.
          </p>
        </div>

        <button
          type="button"
          onClick={addYoutubeVideo}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          + Add YouTube Video
        </button>

      </div>


      {formData.youtubeVideos.length === 0 ? (

        <div className="rounded-md border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
          No YouTube videos added yet.
        </div>

      ) : (

        <div className="space-y-5">

          {formData.youtubeVideos.map(
            (video, index) => (

              <div
                key={index}
                className="rounded-lg border border-gray-200 bg-gray-50 p-4"
              >

                <div className="mb-4 flex items-center justify-between">

                  <h3 className="font-medium text-gray-700">
                    YouTube Video {index + 1}
                  </h3>

                  <button
                    type="button"
                    onClick={() =>
                      removeYoutubeVideo(index)
                    }
                    className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-red-700"
                  >
                    Remove
                  </button>

                </div>


                {/* TITLE */}

                <div className="mb-4">

                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Video Title
                  </label>

                  <input
                    type="text"
                    value={video.title}
                    onChange={(e) =>
                      handleYoutubeVideoChange(
                        index,
                        "title",
                        e.target.value
                      )
                    }
                    placeholder="Enter YouTube video title"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
                  />

                </div>


                {/* URL */}

                <div>

                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    YouTube URL
                  </label>

                  <input
                    type="url"
                    value={video.url}
                    onChange={(e) =>
                      handleYoutubeVideoChange(
                        index,
                        "url",
                        e.target.value
                      )
                    }
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
                  />

                </div>

              </div>

            )
          )}

        </div>

      )}

    </div>


    {/* =================================================
      SEO
  ================================================= */}

    <section className="rounded-xl border bg-white p-6 shadow-sm">

      <h2 className="mb-6 text-xl font-bold text-gray-900">
        SEO Settings
      </h2>

      <div className="space-y-6">

        {/* META TITLE */}

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Meta Title
          </label>

          <input
            type="text"
            name="metaTitle"
            value={
              formData.seo
                .metaTitle
            }
            onChange={
              handleSeoChange
            }
            placeholder="Everest Base Camp Trek | Trek Nepal"
            className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
          />
        </div>

        {/* META DESCRIPTION */}

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Meta Description
          </label>

          <textarea
            name="metaDescription"
            value={
              formData.seo
                .metaDescription
            }
            onChange={
              handleSeoChange
            }
            rows="4"
            placeholder="Explore Everest Base Camp with our professional trekking package..."
            className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
          />
        </div>

        {/* KEYWORDS */}

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Keywords
          </label>

          <input
            type="text"
            value={
              formData.seo.keywords.join(
                ", "
              )
            }
            onChange={(e) => {
              const keywords =
                e.target.value
                  .split(",")
                  .map((item) =>
                    item.trim()
                  )
                  .filter(Boolean);

              setFormData(
                (prev) => ({
                  ...prev,

                  seo: {
                    ...prev.seo,
                    keywords,
                  },
                })
              );
            }}
            placeholder="everest trek, nepal trekking, everest base camp"
            className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
          />

          <p className="mt-1 text-xs text-gray-500">
            Separate keywords with commas.
          </p>
        </div>

        {/* OG TITLE */}

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Open Graph Title
          </label>

          <input
            type="text"
            name="ogTitle"
            value={
              formData.seo
                .ogTitle
            }
            onChange={
              handleSeoChange
            }
            className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
          />
        </div>

        {/* OG DESCRIPTION */}

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Open Graph Description
          </label>

          <textarea
            name="ogDescription"
            value={
              formData.seo
                .ogDescription
            }
            onChange={
              handleSeoChange
            }
            rows="4"
            className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
          />
        </div>

        {/* OG IMAGE */}

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Open Graph Image
          </label>

          <input
            type="url"
            name="ogImage"
            value={
              formData.seo
                .ogImage
            }
            onChange={
              handleSeoChange
            }
            placeholder="https://res.cloudinary.com/..."
            className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
          />
        </div>

        {/* CANONICAL */}

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Canonical URL
          </label>

          <input
            type="url"
            name="canonicalUrl"
            value={
              formData.seo
                .canonicalUrl
            }
            onChange={
              handleSeoChange
            }
            placeholder="https://example.com/everest-base-camp-trek"
            className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
          />
        </div>

        {/* NO INDEX */}

        <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-4">

          <input
            type="checkbox"
            name="noIndex"
            checked={
              formData.seo
                .noIndex
            }
            onChange={
              handleSeoChange
            }
            className="h-5 w-5 rounded"
          />

          <span className="text-sm text-gray-700">
            Prevent search engines from indexing this page.
          </span>
        </label>
      </div>
    </section>

    {/* =================================================
      PUBLISHING
  ================================================= */}

    <section className="rounded-xl border bg-white p-6 shadow-sm">

      <h2 className="mb-6 text-xl font-bold text-gray-900">
        Publishing
      </h2>

      <div className="grid gap-6 md:grid-cols-2">

        {/* ORDER */}

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Display Order
          </label>

          <input
            type="number"
            name="order"
            value={
              formData.order
            }
            onChange={
              handleChange
            }
            min="0"
            step="1"
            className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
          />
        </div>

        {/* PUBLISHED */}

        <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-4">

          <input
            type="checkbox"
            name="published"
            checked={
              formData.published
            }
            onChange={
              handleChange
            }
            className="h-5 w-5 rounded"
          />

          <div>
            <p className="font-medium text-gray-900">
              Publish Page
            </p>

            <p className="text-sm text-gray-500">
              Make this page visible on the website.
            </p>
          </div>
        </label>
      </div>
    </section>

    {/* =================================================
      SUBMIT
  ================================================= */}

    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

      <button
        type="submit"
        disabled={
          loading ||
          loadingPageTypes ||
          !formData.pageType
        }
        className="rounded-lg bg-blue-600 px-8 py-3 font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading
          ? "Saving..."
          : initialData._id
            ? "Update Page"
            : "Create Page"}
      </button>
    </div>
  </form>


  );
}
