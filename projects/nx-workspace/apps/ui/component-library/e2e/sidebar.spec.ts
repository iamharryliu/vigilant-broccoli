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

  test('hovering the collapsed rail re-expands the active group', async ({
    page,
  }) => {
    await page.goto('/');

    const componentsToggle = page.getByRole('button', {
      name: COMPONENTS_GROUP_LABEL,
    });

    // Sidebar starts fully expanded (icon-less); flip to icon-bearing so the
    // desktop rail actually collapses to icon-width when not hovered.
    // "Components" is the default active group (selectedId defaults to
    // ALL_ENTRIES[0]).
    await page.getByRole('button', { name: SETTINGS_GROUP_LABEL }).click();
    await page.getByRole('button', { name: ICON_MODE_OFF_LABEL }).click();

    // Real pointer movement (not a synthetic dispatch) - moving off the rail
    // collapses it and its open group; moving back onto it should re-expand
    // straight to the active group via the onMouseEnter + defaultOpenId
    // handling in Sidebar.tsx, not require a fresh click.
    await page.mouse.move(900, 400);
    await expect(componentsToggle).toHaveAttribute('aria-expanded', 'false');

    await page.mouse.move(30, 200);
    await expect(componentsToggle).toHaveAttribute('aria-expanded', 'true');
  });

  test('does not expand the active group on reload until the rail is hovered', async ({
    page,
  }) => {
    await page.goto('/');

    const componentsToggle = page.getByRole('button', {
      name: COMPONENTS_GROUP_LABEL,
    });

    // Icon mode persists via localStorage, so it survives the reload below.
    await page.getByRole('button', { name: SETTINGS_GROUP_LABEL }).click();
    await page.getByRole('button', { name: ICON_MODE_OFF_LABEL }).click();
    await page.mouse.move(900, 400);

    await page.reload();

    // Before any hover: openId must NOT be pre-seeded from defaultOpenId
    // here, or the active group (icons, active styling, and all) would
    // render "open" while the rail is still collapsed to icon-width - see
    // the forceExpanded-gated useState initializer in Sidebar.tsx.
    await expect(componentsToggle).toHaveAttribute('aria-expanded', 'false');

    // Hovering in still opens it on demand, same as the non-reload case.
    await page.mouse.move(30, 200);
    await expect(componentsToggle).toHaveAttribute('aria-expanded', 'true');
  });
});
