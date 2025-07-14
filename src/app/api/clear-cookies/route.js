import { NextResponse } from "next/server";

export async function POST() {
  try {
    const response = NextResponse.json({ success: true });

    // Clear NextAuth cookies
    response.cookies.set("next-auth.session-token", "", {
      expires: new Date(0),
      path: "/",
    });

    response.cookies.set("next-auth.csrf-token", "", {
      expires: new Date(0),
      path: "/",
    });

    response.cookies.set("next-auth.callback-url", "", {
      expires: new Date(0),
      path: "/",
    });

    response.cookies.set("__Secure-next-auth.session-token", "", {
      expires: new Date(0),
      path: "/",
    });

    response.cookies.set("__Host-next-auth.csrf-token", "", {
      expires: new Date(0),
      path: "/",
    });

    // Clear custom auth token
    response.cookies.set("authToken", "", {
      expires: new Date(0),
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Error clearing cookies:", error);
    return NextResponse.json(
      { error: "Failed to clear cookies" },
      { status: 500 }
    );
  }
}
