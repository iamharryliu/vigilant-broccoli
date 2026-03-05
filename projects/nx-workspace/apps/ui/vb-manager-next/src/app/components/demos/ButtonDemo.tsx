'use client';

import { Button, Flex, Grid, Heading } from '@radix-ui/themes';

export function ButtonDemo() {
  return (
    <Flex direction="column" gap="6">
      <div>
        <Heading size="4" mb="3">
          Variants
        </Heading>
        <Grid columns="4" gap="3" width="100%">
          <Button>Solid</Button>
          <Button variant="soft">Soft</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
        </Grid>
      </div>

      <div>
        <Heading size="4" mb="3">
          Sizes
        </Heading>
        <Flex gap="3" align="center">
          <Button size="1">Small</Button>
          <Button size="2">Medium</Button>
          <Button size="3">Large</Button>
        </Flex>
      </div>

      <div>
        <Heading size="4" mb="3">
          States
        </Heading>
        <Flex gap="3">
          <Button>Enabled</Button>
          <Button disabled>Disabled</Button>
          <Button loading>Loading</Button>
        </Flex>
      </div>
    </Flex>
  );
}
