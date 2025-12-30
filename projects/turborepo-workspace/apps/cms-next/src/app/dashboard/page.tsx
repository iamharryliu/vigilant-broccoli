"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Container, Heading, Text, Card, Flex, Button, Grid } from "@radix-ui/themes";
import { useSession, signOut } from "@/lib/auth-client";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (session?.user) {
      // Fetch user's applications
      fetch("/api/users/applications")
        .then((res) => res.json())
        .then((data) => setApplications(data))
        .catch((err) => console.error("Failed to fetch applications:", err));
    }
  }, [session]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  if (isPending) {
    return (
      <Container size="2" className="min-h-screen flex items-center justify-center">
        <Text>Loading...</Text>
      </Container>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <Container size="4" className="py-8">
      <Flex justify="between" align="center" className="mb-8">
        <div>
          <Heading size="8" className="mb-2">
            Welcome, {session.user.name || session.user.email}
          </Heading>
          <Text size="3" color="gray">
            Your CMS Dashboard
          </Text>
        </div>
        <Button variant="outline" onClick={handleSignOut}>
          Sign Out
        </Button>
      </Flex>

      <Flex direction="column" gap="6">
        <Card>
          <Heading size="5" className="mb-4">
            Quick Actions
          </Heading>
          <Grid columns="3" gap="3">
            <Button size="3" onClick={() => router.push("/users")}>
              Manage Users
            </Button>
            <Button size="3" onClick={() => router.push("/apps")}>
              Manage Apps
            </Button>
            <Button size="3" onClick={() => router.push("/groups")}>
              Manage Groups
            </Button>
          </Grid>
        </Card>

        <Card>
          <Heading size="5" className="mb-4">
            Your Applications
          </Heading>
          {applications.length === 0 ? (
            <Text color="gray">No applications available</Text>
          ) : (
            <Grid columns="2" gap="3">
              {applications.map((app: any) => (
                <Card key={app.id} variant="surface">
                  <Heading size="3">{app.name}</Heading>
                  {app.description && (
                    <Text size="2" color="gray" className="mt-2">
                      {app.description}
                    </Text>
                  )}
                  <Button
                    size="2"
                    variant="soft"
                    className="mt-3"
                    onClick={() => router.push(`/apps/${app.name}/dashboard`)}
                  >
                    Open Dashboard
                  </Button>
                </Card>
              ))}
            </Grid>
          )}
        </Card>
      </Flex>
    </Container>
  );
}
