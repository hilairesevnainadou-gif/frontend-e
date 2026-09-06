"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

const COLLAPSED_PARAGRAPHS = 4;

/**
 * Supplier copy arrives as plain text with real line breaks — rendering it in a
 * single <p> collapsed a 4 000-character spec sheet into one unreadable block.
 */
export default function ProductDescription({
  description,
}: {
  description: string;
}) {
  const [expanded, setExpanded] = useState(false);

  const blocks = description
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (blocks.length === 0) return null;

  const isLong = blocks.length > COLLAPSED_PARAGRAPHS;
  const visible = expanded || !isLong ? blocks : blocks.slice(0, COLLAPSED_PARAGRAPHS);

  return (
    <section className="mb-16 scroll-mt-24" id="description">
      <h2 className="text-xl font-semibold text-foreground mb-5">
        Description et caractéristiques
      </h2>

      <div className="relative">
        <div
          className={cn(
            "max-w-3xl space-y-3 text-muted-foreground leading-relaxed",
            isLong && !expanded && "pb-4"
          )}
        >
          {visible.map((block, i) =>
            block.startsWith("•") ? (
              <p key={i} className="flex gap-2.5 pl-1">
                <span className="text-primary shrink-0">•</span>
                <span>{block.replace(/^•\s*/, "")}</span>
              </p>
            ) : (
              <p key={i}>{block}</p>
            )
          )}
        </div>

        {isLong && !expanded && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent" />
        )}
      </div>

      {isLong && (
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
        >
          {expanded ? "Réduire" : "Lire la suite"}
          <ChevronDown
            className={cn("ml-2 h-4 w-4 transition-transform", expanded && "rotate-180")}
          />
        </Button>
      )}
    </section>
  );
}
