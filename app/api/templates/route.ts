import { NextResponse } from "next/server";

const baseURL = process.env.BASE_URL;

export async function GET() {
  try {
    const response = await fetch(`${baseURL}/templates`);
    if (!response.ok) {
      throw new Error("Failed to fetch templates");
    }
    const templates = await response.json();
    return NextResponse.json(templates);
  } catch (error) {
    console.error("Error fetching templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch templates" },
      { status: 500 }
    );
  }
}
