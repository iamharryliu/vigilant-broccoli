import { test, expect } from '@playwright/test';

const MOBILE_VIEWPORT = { width: 390, height: 844 };
const DESKTOP_VIEWPORT = { width: 1280, height: 800 };
const OPEN_MENU_LABEL = 'Open menu';
// A bare URL lands on the Components overview, so tests that need an active
// group start on a react-lib entry instead.
const ENTRY_URL = '/alert-dialog';
const LEGACY_ENTRY_URL = '/#alert-dialog';
const AVATAR_LABEL = 'Avatar';
const OVERVIEW_HEADING = 'Components';
// The last section, so it starts below the fold.
const UTILITIES_SECTION_HEADING = '@vigilant-broccoli/react-utility';
const UTILITIES_SECTION_ID = 'vigilant-broccoli-react-utility';
// Top-level groups: every lib nests under the scope group, which holds the
// ENTRY_URL selection; Settings is the other top-level group.
const COMPONENTS_GROUP_LABEL = '@vigilant-broccoli';
const UTILITIES_GROUP_LABEL = 'react-utility';
const COLLAPSED_PADDING = '56px';
const EXPANDED_PADDING = '240px';
const ALARM_LABEL = 'Alarm';
const SETTINGS_GROUP_LABEL = 'Settings';

test.describe('component-library landing page', () => {
  test.use({ viewport: DESKTOP_VIEWPORT });

  test('a bare URL lands on the Components overview', async ({ page }) => {
    await page.goto('/');

    await expect(
      page.getByRole('heading', { name: OVERVIEW_HEADING, exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: COMPONENTS_GROUP_LABEL, exact: true }),
    ).toHaveAttribute('aria-expanded', 'false');
  });

  test('overview links navigate by path and back returns to the overview', async ({
    page,
  }) => {
    await page.goto('/');

    await page.getByRole('link', { name: AVATAR_LABEL, exact: true }).click();
    await expect(page).toHaveURL(/\/avatar$/);
    await expect(
      page.getByRole('heading', { name: AVATAR_LABEL, exact: true }),
    ).toBeVisible();

    await page.goBack();
    await expect(page).toHaveURL(/\/$/);
    await expect(
      page.getByRole('heading', { name: OVERVIEW_HEADING, exact: true }),
    ).toBeVisible();
  });

  test('section headings link to their section', async ({ page }) => {
    await page.goto('/');

    const heading = page.getByRole('link', {
      name: UTILITIES_SECTION_HEADING,
      exact: true,
    });
    await heading.click();
    await expect(page).toHaveURL(new RegExp(`#${UTILITIES_SECTION_ID}$`));
    await expect(heading).toBeInViewport();

    await page.reload();
    await expect(
      page.getByRole('link', { name: UTILITIES_SECTION_HEADING, exact: true }),
    ).toBeInViewport();
  });

  test('a legacy hash link redirects to the entry path', async ({ page }) => {
    await page.goto(LEGACY_ENTRY_URL);

    await expect(page).toHaveURL(new RegExp(`${ENTRY_URL}$`));
  });
});

test.describe('component-library Sidebar (mobile drawer)', () => {
  test.use({ viewport: MOBILE_VIEWPORT });

  test('keeps a manually expanded group open after the drawer closes and reopens', async ({
    page,
  }) => {
    await page.goto(ENTRY_URL);

    const menuButton = page.getByRole('button', { name: OPEN_MENU_LABEL });
    const aside = page.locator('aside');
    const settingsToggle = page.getByRole('button', {
      name: SETTINGS_GROUP_LABEL,
      exact: true,
    });

    await menuButton.click();
    await settingsToggle.click();
    await expect(settingsToggle).toHaveAttribute('aria-expanded', 'true');

    // Tap the backdrop (outside the 256px-wide drawer) rather than the
    // hamburger button - the open drawer visually covers the hamburger, so a
    // real user closes via backdrop tap, and clicking the covered button
    // would just hang waiting for it to become clickable.
    await page.mouse.click(350, 100);
    await expect(aside).toHaveClass(/max-md:-translate-x-full/);

    // Simulate the spurious mouseleave Chrome can dispatch on the aside when
    // page content changes under a stationary pointer during navigation
    // (see the fix in libs/@vigilant-broccoli/react-lib-higher-level
    // Sidebar.tsx). React's onMouseLeave is synthesized from the bubbling
    // native "mouseout" event, not a native "mouseleave" listener, so that's
    // what has to be dispatched here for the handler to actually fire. Every
    // item carries an icon, so canCollapse is true and forceExpanded tracks
    // mobileOpen - this dispatch exercises the regression case the
    // isNarrowViewport guard fixes.
    await aside.dispatchEvent('mouseout', {
      relatedTarget: null,
      bubbles: true,
    });

    await menuButton.click();
    await expect(settingsToggle).toHaveAttribute('aria-expanded', 'true');
  });

  test('selecting an item in a different nested group auto-expands that group', async ({
    page,
  }) => {
    await page.goto(ENTRY_URL);

    const menuButton = page.getByRole('button', { name: OPEN_MENU_LABEL });
    const utilitiesToggle = page.getByRole('button', {
      name: UTILITIES_GROUP_LABEL,
      exact: true,
    });

    // The nested "react-lib" group holds the ENTRY_URL selection, so
    // react-utility starts collapsed.
    await menuButton.click();
    await expect(utilitiesToggle).toHaveAttribute('aria-expanded', 'false');

    // Selecting a react-utility item via search (flat results list, no manual
    // expand) should open react-utility because it now holds the active item,
    // per libs/@vigilant-broccoli/react-lib-higher-level/docs/features/sidebar.md.
    await page.getByPlaceholder('Search...').fill(ALARM_LABEL);
    await page.getByRole('button', { name: ALARM_LABEL }).click();

    await menuButton.click();
    await expect(utilitiesToggle).toHaveAttribute('aria-expanded', 'true');
  });
});

test.describe('component-library Sidebar (desktop rail hover)', () => {
  test.use({ viewport: DESKTOP_VIEWPORT });

  test("hovering a group opens that group, not the active selection's group", async ({
    page,
  }) => {
    await page.goto(ENTRY_URL);
    await page.mouse.move(900, 400);

    const componentsToggle = page.getByRole('button', {
      name: COMPONENTS_GROUP_LABEL,
      exact: true,
    });
    const settingsToggle = page.getByRole('button', {
      name: SETTINGS_GROUP_LABEL,
      exact: true,
    });

    // "@vigilant-broccoli" is the active group (ENTRY_URL selects an
    // alert-dialog/react-lib entry) - hovering "Settings" directly should
    // open Settings, not the active group.
    await settingsToggle.hover();
    await expect(settingsToggle).toHaveAttribute('aria-expanded', 'true');
    await expect(componentsToggle).toHaveAttribute('aria-expanded', 'false');
  });

  test('moving the pointer between group icons switches which group is open', async ({
    page,
  }) => {
    await page.goto(ENTRY_URL);
    await page.mouse.move(900, 400);

    const componentsToggle = page.getByRole('button', {
      name: COMPONENTS_GROUP_LABEL,
      exact: true,
    });
    const settingsToggle = page.getByRole('button', {
      name: SETTINGS_GROUP_LABEL,
      exact: true,
    });

    await settingsToggle.hover();
    await expect(settingsToggle).toHaveAttribute('aria-expanded', 'true');

    await componentsToggle.hover();
    await expect(componentsToggle).toHaveAttribute('aria-expanded', 'true');
    await expect(settingsToggle).toHaveAttribute('aria-expanded', 'false');
  });

  test('content padding shifts to match the collapsed/hovered rail width', async ({
    page,
  }) => {
    await page.goto(ENTRY_URL);
    await page.mouse.move(900, 400);

    // The content wrapper is a `peer-hover` sibling of the sidebar (which
    // carries the `peer` class) - it should track the rail's own width
    // (md:w-14 collapsed, md:hover:w-60 expanded) rather than staying
    // statically padded for the expanded width.
    const content = page.locator('div.h-full.overflow-y-auto');
    await expect(content).toHaveCSS('padding-left', COLLAPSED_PADDING);

    await page
      .getByRole('button', { name: COMPONENTS_GROUP_LABEL, exact: true })
      .hover();
    await expect(content).toHaveCSS('padding-left', EXPANDED_PADDING);
  });

  test('does not expand any group on load until one is hovered', async ({
    page,
  }) => {
    await page.goto(ENTRY_URL);
    await page.mouse.move(900, 400);

    const componentsToggle = page.getByRole('button', {
      name: COMPONENTS_GROUP_LABEL,
      exact: true,
    });
    const settingsToggle = page.getByRole('button', {
      name: SETTINGS_GROUP_LABEL,
      exact: true,
    });

    // Before any hover: openId must NOT be pre-seeded from defaultOpenId
    // here, or the active group (icons, active styling, and all) would
    // render "open" while the rail is still collapsed to icon-width - see
    // the forceExpanded-gated useState initializer in Sidebar.tsx.
    await expect(componentsToggle).toHaveAttribute('aria-expanded', 'false');

    // Hovering opens whichever group is under the pointer, not necessarily
    // the active one.
    await settingsToggle.hover();
    await expect(settingsToggle).toHaveAttribute('aria-expanded', 'true');
    await expect(componentsToggle).toHaveAttribute('aria-expanded', 'false');
  });
});
