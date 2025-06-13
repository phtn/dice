import { generateId } from "ai";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  if (req.method === "GET") {
    const sS = generateId();
    return NextResponse.json({ sS });
  }
  return NextResponse.json({
    error: {
      status: 400,
      statusText: "Bad Request",
    },
    message: `${req.method} Method not allowed.`,
  });
}
