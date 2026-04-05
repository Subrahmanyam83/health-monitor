import { NextRequest, NextResponse } from "next/server";

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY!;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") ?? "";
  const location = searchParams.get("location") ?? "";

  if (!RAPIDAPI_KEY) {
    return NextResponse.json({ error: "RAPIDAPI_KEY not configured" }, { status: 500 });
  }

  try {
    const res = await fetch(
      `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(query + " " + location)}&page=1&num_pages=2&date_posted=week`,
      {
        headers: {
          "X-RapidAPI-Key": RAPIDAPI_KEY,
          "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
        },
        cache: "no-store",
      }
    );

    if (!res.ok) throw new Error(`JSearch error: ${res.status}`);
    const json = await res.json();

    const jobs = (json.data ?? []).map((j: {
      job_id: string;
      job_title: string;
      employer_name: string;
      job_city?: string;
      job_country?: string;
      job_description: string;
      job_apply_link: string;
      job_publisher: string;
      job_posted_at_datetime_utc: string;
      job_min_salary?: number;
      job_max_salary?: number;
      job_salary_currency?: string;
    }) => ({
      id: j.job_id,
      title: j.job_title,
      company: j.employer_name,
      location: [j.job_city, j.job_country].filter(Boolean).join(", "),
      description: j.job_description?.slice(0, 500) ?? "",
      applyUrl: j.job_apply_link,
      source: j.job_publisher,
      postedAt: j.job_posted_at_datetime_utc,
      salary: j.job_min_salary
        ? `${j.job_salary_currency ?? ""} ${j.job_min_salary}–${j.job_max_salary}`
        : undefined,
    }));

    return NextResponse.json({ jobs });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Job search failed" }, { status: 500 });
  }
}
