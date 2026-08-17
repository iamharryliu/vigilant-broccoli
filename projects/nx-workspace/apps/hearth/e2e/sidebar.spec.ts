import { test, expect } from '@playwright/test';

const SANDBOX_PATH = '/dev/sidebar-sandbox';
const MOBILE_VIEWPORT = { width: 390, height: 844 };
const DESKTOP_VIEWPORT = { width: 1280, height: 800 };
const OPEN_MENU_LABEL = 'Open menu';
const HOME_GROUP_LABEL = 'Home';
const HOME_CHILD_LABEL = 'Whiteboard';
const DEV_FEATURES_GROUP_LABEL = 'Dev Features';

test.describe('hearth Sidebar sandbox (icon-bearing nav) - mobile drawer', () => {
  test.use({ viewport: MOBILE_VIEWPORT });

  test('keeps the Home group open after the drawer closes and reopens', async ({
    page,
  }) => {
    await page.goto(SANDBOX_PATH);

    const menuButton = page.getByRole('button', { name: OPEN_MENU_LABEL });
    const aside = page.locator('aside');
    const homeToggle = page.getByRole('button', { name: HOME_GROUP_LABEL });

    await menuButton.click();
    await homeToggle.click();
    await expect(homeToggle).toHaveAttribute('aria-expanded', 'true');
    await expect(
      page.getByRole('link', { name: HOME_CHILD_LABEL }),
    ).toBeVisible();

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
    // here for the handler to actually fire.
    await aside.dispatchEvent('mouseout', {
      relatedTarget: null,
      bubbles: true,
    });

    await menuButton.click();

    await expect(homeToggle).toHaveAttribute('aria-expanded', 'true');
  });
});

test.describe('hearth Sidebar sandbox (icon-bearing nav) - desktop rail', () => {
  test.use({ viewport: DESKTOP_VIEWPORT });

  test('collapses an open group on real hover-out (unaffected by the mobile guard)', async ({
    page,
  }) => {
    await page.goto(SANDBOX_PATH);

    const devFeaturesToggle = page.getByRole('button', {
      name: DEV_FEATURES_GROUP_LABEL,
    });

    await devFeaturesToggle.hover();
    await devFeaturesToggle.click();
    await expect(devFeaturesToggle).toHaveAttribute('aria-expanded', 'true');

    // Real pointer movement off the rail - desktop hover-collapse should
    // still fire; only the mobile-drawer path is guarded.
    await page.mouse.move(900, 400);

    await expect(devFeaturesToggle).toHaveAttribute('aria-expanded', 'false');
  });
});
