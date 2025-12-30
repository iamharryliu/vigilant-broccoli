import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserApplications } from "@/lib/auth-utils";
import { headers } from "next/headers";

export async function GET(request: NextRequest) {
  console.log('findme', process.env.GOOGLE_AUTH_PROVIDER_CLIENT_ID, process.env.GOOGLE_AUTH_PROVIDER_CLIENT_SECRET

)
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const applications = await getUserApplications(session.user.id);
    return NextResponse.json(applications);
  } catch (error) {
    console.error("Error fetching applications:", error);
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}
