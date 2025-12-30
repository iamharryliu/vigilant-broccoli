import { Container, Heading, Text, Button, Flex } from "@radix-ui/themes";
import Link from "next/link";

export default function Home() {
  return (
    <Container size="2" className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Heading size="9" className="mb-4">
          CMS Next
        </Heading>
        <Text size="5" color="gray" className="mb-8">
          Content Management System built with Next.js
        </Text>
        <Flex gap="3" justify="center">
          <Link href="/login">
            <Button size="3">Sign In</Button>
          </Link>
          <Link href="/dashboard">
            <Button size="3" variant="outline">
              Dashboard
            </Button>
          </Link>
        </Flex>
      </div>
    </Container>
  );
}
