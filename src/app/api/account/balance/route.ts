import { Balance } from "@/app/ctx/acc-ctx/types";
import { generateId } from "ai";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  if (req.method === "POST") {
    const directive = req.headers.get("x-directive");
    const currentBalance = (await req.json()) as Balance;
    switch (directive) {
      case "get":
        return NextResponse.json(currentBalance);
      case "set":
        req.cookies.set(
          "fair-dice-account",
          JSON.stringify({ id: generateId(), balance: currentBalance }),
        );
        return NextResponse.json({ message: "Account Balance updated" });
      default:
        return NextResponse.json(currentBalance);
    }
  }

  return NextResponse.json({
    error: {
      status: 400,
      statusText: "Bad Request",
    },
    message: `${req.method} Method not allowed.`,
  });
}
