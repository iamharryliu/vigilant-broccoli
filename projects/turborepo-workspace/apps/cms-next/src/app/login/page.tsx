"use client";

import { useState } from "react";
import { Button, Card, Heading, Text, Flex, Box } from "@radix-ui/themes";
import { signIn } from "@/lib/auth-client";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
      });
    } catch (err) {
      setError("Google login failed");
      setLoading(false);
    }
  };

  return (
    <Flex className="min-h-screen" align="center" justify="center">
      <Card size="4" className="w-full max-w-md">
        <Heading size="6" className="mb-6 text-center">
          Sign in to CMS
        </Heading>

        {error && (
          <Box className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
            <Text size="2" color="red">
              {error}
            </Text>
          </Box>
        )}

        <Text size="3" className="mb-6 text-center" color="gray">
          Sign in with your Google account to continue
        </Text>

        <Button
          size="3"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full"
        >
          {loading ? "Signing in..." : "Sign in with Google"}
        </Button>
      </Card>
    </Flex>
  );
}
