"use client";

import { useEffect } from "react";
import { canonicalPageId, pushDataLayerEvent } from "@/lib/analytics/dataLayerEvents";
import { declareMarketingEligibility, type EligibilitySource } from "@/lib/analytics/marketingEligibility";

/**
 * Declares whether the page being viewed may be used by marketing pixels
 * ("page" = Page.marketingEligible, "record" = the product/article/contact form).
 * Pages that declare nothing stay ineligible.
 */
export function MarketingEligibility({ kind = "page", eligible }: { kind?: EligibilitySource; eligible: boolean }) {
  useEffect(() => {
    declareMarketingEligibility(kind, eligible === true);
  }, [kind, eligible]);
  return null;
}

/**
 * `view_content` once a real detail page (product / article) is on screen. The
 * record's marketing flag is declared first, so an unreviewed page never reaches a pixel.
 */
export function TrackViewContent({
  contentKey,
  productId,
  sku,
  marketingEligible = false,
}: {
  contentKey: string;
  productId?: string;
  sku?: string;
  marketingEligible?: boolean;
}) {
  useEffect(() => {
    declareMarketingEligibility("record", marketingEligible === true);
    pushDataLayerEvent("view_content", {
      dedupeKey: contentKey,
      params: { page_id: canonicalPageId(), product_id: productId, sku },
    });
  }, [contentKey, productId, sku, marketingEligible]);
  return null;
}
