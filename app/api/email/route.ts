import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { templateId, entries } = await request.json();

  const response = await fetch(
    `https://api.emailit.io/v1/templates/${templateId}/send`,
    {
      method: "POST",
      body: JSON.stringify({
        templateId,
        entries,
      }),
    }
  );

  if (!response.ok) {
    return NextResponse.json(
      { message: "Failed to send email" },
      { status: 500 }
    );
  }

  return NextResponse.json({ message: "Email sent successfully" });
}
