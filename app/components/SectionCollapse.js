"use client";

import { useState } from "react";

export default function SectionCollapse({
  title,
  children,
  defaultOpen = true,
  className = "",
}) {
  const [open, setOpen] =
    useState(defaultOpen);

  return (
    <section
      className={`w-full ${className}`}
    >
      {/* ================================
          HEADING
      ================================= */}

      <div className="flex items-center justify-between gap-4">
        <h2 className="text-22 font-bold text-gray-900">
          {title}
        </h2>

        <button
          type="button"
          onClick={() =>
            setOpen((prev) => !prev)
          }
          aria-expanded={open}
          aria-label={
            open
              ? `Collapse ${title}`
              : `Expand ${title}`
          }
          className="
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            rounded-full
            border
            border-gray-300
            bg-white
            text-gray-700
            transition-all
            duration-300
            hover:bg-gray-100
            hover:text-gray-900
          "
        >
          <span
            className={`
              inline-block
              text-lg
              font-bold
              leading-none
              transition-transform
              duration-300
              ${
                open
                  ? "rotate-0"
                  : "-rotate-90"
              }
            `}
          >
            v
          </span>
        </button>
      </div>

      {/* ================================
          CONTENT
      ================================= */}

      <div
        className={`
          grid
          transition-all
          duration-500
          ease-in-out
          ${
            open
              ? "grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0"
          }
        `}
      >
        <div className="overflow-hidden">
          <div className="pt-5">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}