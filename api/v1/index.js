// GET /api/v1
// The index. Hit this and you know the whole API.

import { ok, guard, LICENSE, ATTRIBUTION, METHODOLOGY } from "../_lib/db.js";

export default async function handler(req, res) {
  if (!guard(req, res)) return;

  return ok(res, {
    name: "vaacha Open Data API",
    version: "v1",
    description:
      "Public, read-only data on Nepali political promises and national mega-projects. " +
      "Every entry is backed by a public source. Free to use with attribution.",
    license: LICENSE,
    attribution: ATTRIBUTION,
    methodology: METHODOLOGY,
    auth: "None. No key required.",
    cors: "Open to all origins.",
    endpoints: [
      {
        path: "/api/v1/promises",
        description: "List promises.",
        query: {
          status: "kept | broken | in_progress",
          category: "e.g. Governance, Health",
          politician: "partial name match",
          party: "partial name match",
          province: "e.g. Federal, Bagmati",
          limit: "default 50, max 200",
          offset: "default 0",
        },
        example: "/api/v1/promises?status=broken&limit=5",
      },
      {
        path: "/api/v1/promises/:id",
        description: "One promise, with its full evidence timeline.",
        example: "/api/v1/promises/23",
      },
      {
        path: "/api/v1/projects",
        description:
          "List mega-projects. Includes years_slipped: how far the completion " +
          "deadline has moved from the original.",
        query: { status: "planned | in_progress | stalled | completed | abandoned" },
        example: "/api/v1/projects",
      },
      {
        path: "/api/v1/projects/:id",
        description: "One project, with its full milestone chain (the delay record).",
        example: "/api/v1/projects/1",
      },
      {
        path: "/api/v1/stats",
        description: "Aggregate counts and breakdowns. One call for a dashboard.",
        example: "/api/v1/stats",
      },
    ],
    notes: [
      "Statuses reflect documented outcomes, not opinions. See the methodology link.",
      "This project is independent and not affiliated with any party or government body.",
      "Found an error? The data is only as good as its sources — please report it.",
    ],
  });
}
