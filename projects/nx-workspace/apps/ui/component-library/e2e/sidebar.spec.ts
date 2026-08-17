import { test, expect } from '@playwright/test';

const MOBILE_VIEWPORT = { width: 390, height: 844 };
const OPEN_MENU_LABEL = 'Open menu';
const UTILITIES_GROUP_LABEL = 'Utilities';
const ALARM_LABEL = 'Alarm';

test.describe('component-library Sidebar (icon-less nav)', () => {
  test.use({ viewport: MOBILE_VIEWPORT });

  test('an icon-less group never collapses on close/hover-out', async ({
    page,
  }) => {
    await page.goto('/');

    const menuButton = page.getByRole('button', { name: OPEN_MENU_LABEL });
    const aside = page.locator('aside');
    const utilitiesToggle = page.getByRole('button', {
      name: UTILITIES_GROUP_LABEL,
    });

    // The sandbox loads with the "Components" group open by default
    // (selectedId defaults to its first entry) - expand "Utilities" instead,
    // without selecting anything in it, so defaultOpenId never changes.
    await menuButton.click();
    await utilitiesToggle.click();
    await expect(utilitiesToggle).toHaveAttribute('aria-expanded', 'true');

    // Tap the backdrop (outside the 256px-wide drawer) rather than the
    // hamburger button - the open drawer visually covers the hamburger, so a
    // real user closes via backdrop tap, and clicking the covered button
    // would just hang waiting for it to become clickable.
    await page.mouse.click(350, 100);
    await expect(aside).toHaveClass(/max-md:-translate-x-full/);

    // None of the Sidebar/Utilities items in this app carry an `icon`, so
    // `canCollapse` is false and `forceExpanded` is permanently true (see
    // libs/@vigilant-broccoli/react-lib/docs/features/sidebar.md) - a
    // collapsed icon-only rail would be entirely blank. That means the
    // mouseleave-collapse guard never even runs here, unlike hearth's
    // icon-bearing nav (apps/hearth/e2e/sidebar.spec.ts), where this same
    // dispatch is the actual regression case for the isNarrowViewport fix.
    await aside.dispatchEvent('mouseout', {
      relatedTarget: null,
      bubbles: true,
    });
    await expect(utilitiesToggle).toHaveAttribute('aria-expanded', 'true');

    await menuButton.click();
    await expect(utilitiesToggle).toHaveAttribute('aria-expanded', 'true');
  });

  test('selecting an item in a different group auto-expands that group', async ({
    page,
  }) => {
    await page.goto('/');

    const menuButton = page.getByRole('button', { name: OPEN_MENU_LABEL });
    const utilitiesToggle = page.getByRole('button', {
      name: UTILITIES_GROUP_LABEL,
    });

    // "Components" is open by default; Utilities starts collapsed.
    await menuButton.click();
    await expect(utilitiesToggle).toHaveAttribute('aria-expanded', 'false');

    // Selecting a Utilities item via search (flat results list, no manual
    // expand) should re-open Utilities via defaultOpenId reactivity, per
    // libs/@vigilant-broccoli/react-lib/docs/features/sidebar.md.
    await page.getByPlaceholder('Search...').fill(ALARM_LABEL);
    await page.getByRole('button', { name: ALARM_LABEL }).click();

    await menuButton.click();
    await expect(utilitiesToggle).toHaveAttribute('aria-expanded', 'true');
  });
});
