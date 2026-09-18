import { test, expect } from '@playwright/test';

const MOBILE_VIEWPORT = { width: 390, height: 844 };
const DESKTOP_VIEWPORT = { width: 1280, height: 800 };
const OPEN_MENU_LABEL = 'Open menu';
const COMPONENTS_GROUP_LABEL = 'Components';
const UTILITIES_GROUP_LABEL = 'Utilities';
const ALARM_LABEL = 'Alarm';
const SETTINGS_GROUP_LABEL = 'Settings';
const ICON_MODE_OFF_LABEL = 'Icons: Off';

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

test.describe('component-library Sidebar (icon-less nav, desktop)', () => {
  test.use({ viewport: DESKTOP_VIEWPORT });

  test('content padding stays fixed regardless of hover, since there is no rail to collapse to', async ({
    page,
  }) => {
    await page.goto('/');

    const content = page.locator('div.h-full.overflow-y-auto');
    await expect(content).toHaveCSS('padding-left', '192px');

    await page.getByRole('button', { name: COMPONENTS_GROUP_LABEL }).hover();
    await expect(content).toHaveCSS('padding-left', '192px');
  });
});

test.describe('component-library Sidebar (icon-bearing nav, via Settings > Icons toggle)', () => {
  test.use({ viewport: MOBILE_VIEWPORT });

  test('keeps a manually expanded group open after the drawer closes and reopens', async ({
    page,
  }) => {
    await page.goto('/');

    const menuButton = page.getByRole('button', { name: OPEN_MENU_LABEL });
    const aside = page.locator('aside');
    const utilitiesToggle = page.getByRole('button', {
      name: UTILITIES_GROUP_LABEL,
    });

    // Flip every sidebar item to icon-bearing via Settings > Icons - this is
    // what makes canCollapse/forceExpanded in Sidebar.tsx behave like a real
    // icon-bearing nav (e.g. hearth's), instead of the permanently-expanded
    // icon-less case covered above. Toggling closes the drawer as a side
    // effect (every item click does), so reopen before continuing.
    await menuButton.click();
    await page.getByRole('button', { name: SETTINGS_GROUP_LABEL }).click();
    await page.getByRole('button', { name: ICON_MODE_OFF_LABEL }).click();
    await menuButton.click();

    await utilitiesToggle.click();
    await expect(utilitiesToggle).toHaveAttribute('aria-expanded', 'true');

    // Tap the backdrop (outside the 256px-wide drawer) rather than the
    // hamburger button - the open drawer visually covers the hamburger, so a
    // real user closes via backdrop tap, and clicking the covered button
    // would just hang waiting for it to become clickable.
    await page.mouse.click(350, 100);
    await expect(aside).toHaveClass(/max-md:-translate-x-full/);

    // Simulate the spurious mouseleave Chrome can dispatch on the aside when
    // page content changes under a stationary pointer during navigation
    // (see the fix in libs/@vigilant-broccoli/react-lib Sidebar.tsx). React's
    // onMouseLeave is synthesized from the bubbling native "mouseout" event,
    // not a native "mouseleave" listener, so that's what has to be dispatched
    // here for the handler to actually fire. With icons on, canCollapse is
    // true and forceExpanded correctly tracks mobileOpen, so - unlike the
    // icon-less test above - this dispatch exercises the actual regression
    // case the isNarrowViewport guard fixes.
    await aside.dispatchEvent('mouseout', {
      relatedTarget: null,
      bubbles: true,
    });

    await menuButton.click();
    await expect(utilitiesToggle).toHaveAttribute('aria-expanded', 'true');
  });
});

test.describe('component-library Sidebar (icon-bearing nav, desktop rail hover)', () => {
  test.use({ viewport: DESKTOP_VIEWPORT });

  const enableIconMode = async (page: import('@playwright/test').Page) => {
    // Sidebar starts fully expanded (icon-less); flip to icon-bearing so the
    // desktop rail actually collapses to icon-width when not hovered.
    await page.getByRole('button', { name: SETTINGS_GROUP_LABEL }).click();
    await page.getByRole('button', { name: ICON_MODE_OFF_LABEL }).click();
  };

  test("hovering a group opens that group, not the active selection's group", async ({
    page,
  }) => {
    await page.goto('/');
    await enableIconMode(page);
    await page.mouse.move(900, 400);

    const componentsToggle = page.getByRole('button', {
      name: COMPONENTS_GROUP_LABEL,
    });
    const utilitiesToggle = page.getByRole('button', {
      name: UTILITIES_GROUP_LABEL,
    });

    // "Components" is the active group (selectedId defaults to
    // ALL_ENTRIES[0], an Avatar/Components entry) - hovering "Utilities"
    // directly, e.g. while looking at Avatar and wanting to browse
    // Utilities next, should open Utilities, not the active Components.
    await utilitiesToggle.hover();
    await expect(utilitiesToggle).toHaveAttribute('aria-expanded', 'true');
    await expect(componentsToggle).toHaveAttribute('aria-expanded', 'false');
  });

  test('moving the pointer between group icons switches which group is open', async ({
    page,
  }) => {
    await page.goto('/');
    await enableIconMode(page);
    await page.mouse.move(900, 400);

    const componentsToggle = page.getByRole('button', {
      name: COMPONENTS_GROUP_LABEL,
    });
    const utilitiesToggle = page.getByRole('button', {
      name: UTILITIES_GROUP_LABEL,
    });

    await utilitiesToggle.hover();
    await expect(utilitiesToggle).toHaveAttribute('aria-expanded', 'true');

    await componentsToggle.hover();
    await expect(componentsToggle).toHaveAttribute('aria-expanded', 'true');
    await expect(utilitiesToggle).toHaveAttribute('aria-expanded', 'false');
  });

  test('content padding shifts to match the collapsed/hovered rail width', async ({
    page,
  }) => {
    await page.goto('/');
    await enableIconMode(page);
    await page.mouse.move(900, 400);

    // The content wrapper is a `peer-hover` sibling of the sidebar (which
    // carries the `peer` class) - it should track the rail's own width
    // (md:w-14 collapsed, md:hover:w-48 expanded) rather than staying
    // statically padded for the expanded width.
    const content = page.locator('div.h-full.overflow-y-auto');
    await expect(content).toHaveCSS('padding-left', '56px');

    await page.getByRole('button', { name: COMPONENTS_GROUP_LABEL }).hover();
    await expect(content).toHaveCSS('padding-left', '192px');
  });

  test('does not expand any group on reload until one is hovered', async ({
    page,
  }) => {
    await page.goto('/');
    await enableIconMode(page);
    await page.mouse.move(900, 400);

    await page.reload();

    const componentsToggle = page.getByRole('button', {
      name: COMPONENTS_GROUP_LABEL,
    });
    const utilitiesToggle = page.getByRole('button', {
      name: UTILITIES_GROUP_LABEL,
    });

    // Before any hover: openId must NOT be pre-seeded from defaultOpenId
    // here, or the active group (icons, active styling, and all) would
    // render "open" while the rail is still collapsed to icon-width - see
    // the forceExpanded-gated useState initializer in Sidebar.tsx.
    await expect(componentsToggle).toHaveAttribute('aria-expanded', 'false');

    // Hovering opens whichever group is under the pointer, same as the
    // non-reload case - not necessarily the active one.
    await utilitiesToggle.hover();
    await expect(utilitiesToggle).toHaveAttribute('aria-expanded', 'true');
    await expect(componentsToggle).toHaveAttribute('aria-expanded', 'false');
  });
});
