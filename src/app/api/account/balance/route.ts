import { UserAccount } from "@/ctx/acc-ctx/types";
import { generateId } from "ai";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  if (req.method === "POST") {
    const directive = req.headers.get("x-directive");
    const account = (await req.json()) as UserAccount;
    switch (directive) {
      case "get":
        return NextResponse.json(account);
      case "set":
        req.cookies.set(
          "fair-dice-account",
          JSON.stringify({ id: generateId(), balance: account.balance }),
        );
        return NextResponse.json({ message: "Account Balance updated" });
      default:
        return NextResponse.json(account.balance);
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
