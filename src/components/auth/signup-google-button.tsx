"use client";

import { useRouter } from "next/navigation";
import { useGoogleLogin } from "@react-oauth/google";
import { toast } from "sonner";
import {
  SIGNUP_SESSION_STORAGE_KEY,
  type SignupSession,
} from "@/types/auth";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { isGoogleOAuthConfigured } from "@/components/providers/google-oauth-provider";
import { splitFullName } from "@/lib/phone";
import { safeSessionSetItem } from "@/lib/safe-storage";

type GoogleUserInfo = {
  email?: string;
  name?: string;
  sub?: string;
};

function GoogleSignupButtonInner() {
  const router = useRouter();

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const response = await fetch(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: {
              Authorization: `Bearer ${tokenResponse.access_token}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error("Failed to load Google profile");
        }

        const profile = (await response.json()) as GoogleUserInfo;
        const fullName = profile.name?.trim() || "Sportxo User";
        const { first_name, last_name } = splitFullName(fullName);

        const session: SignupSession = {
          mode: "google",
          countryCode: "+91",
          phoneNumber: "",
          phone_code: "",
          mobile_number: "",
          email: profile.email,
          fullName,
          first_name,
          last_name,
          googleId: profile.sub,
        };

        safeSessionSetItem(SIGNUP_SESSION_STORAGE_KEY, JSON.stringify(session));
        toast.success("Signed in with Google");
        router.push("/signup/phone");
      } catch {
        toast.error("Could not read your Google profile. Please try again.");
      }
    },
    onError: () => {
      toast.error("Google sign-in was cancelled or failed.");
    },
  });

  return <GoogleSignInButton onClick={() => googleLogin()} />;
}

export function SignupGoogleButton() {
  if (!isGoogleOAuthConfigured()) {
    return (
      <GoogleSignInButton
        onClick={() => {
          toast.error("Google sign-in is not configured yet.", {
            description: "Add NEXT_PUBLIC_GOOGLE_CLIENT_ID to .env.local",
          });
        }}
      />
    );
  }

  return <GoogleSignupButtonInner />;
}
