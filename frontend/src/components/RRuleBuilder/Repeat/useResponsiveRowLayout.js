// Ported from Repeat/useResponsiveRowLayout.ts.
// React's useState/useEffect -> Solid's createSignal/onMount+onCleanup.
// The DOM-measurement logic itself (getRowMinWidth, ResizeObserver) is
// unchanged.

import { createSignal, onCleanup, onMount } from "solid-js";

const MUI_SPACING_UNIT_PX = 8;
const DEFAULT_SELECT_MIN_WIDTH = 120;
const DEFAULT_ROW_SPACING = 4;

function getSelectWidths(rowSpec) {
  if (rowSpec.selectMinWidths && rowSpec.selectMinWidths.length > 0) {
    return rowSpec.selectMinWidths;
  }
  const count = rowSpec.selectCount ?? 0;
  const selectMinWidth = rowSpec.selectMinWidth ?? DEFAULT_SELECT_MIN_WIDTH;
  return Array.from({ length: count }, () => selectMinWidth);
}

export function getRowMinWidth(rowSpec) {
  const selectWidths = getSelectWidths(rowSpec);
  const itemCount = selectWidths.length + 1;
  const spacing = rowSpec.spacing ?? DEFAULT_ROW_SPACING;
  const gapsWidth = Math.max(itemCount - 1, 0) * spacing * MUI_SPACING_UNIT_PX;
  const selectsWidth = selectWidths.reduce((sum, width) => sum + width, 0);
  return rowSpec.fixedWidth + selectsWidth + gapsWidth;
}

/**
 * @param {Object} params
 * @param {() => HTMLElement | undefined} params.containerRef - getter for the measured element
 * @param {Array<{fixedWidth: number, selectCount?: number, selectMinWidth?: number, selectMinWidths?: number[], spacing?: number}>} params.rowSpecs
 * @param {boolean} [params.enabled]
 * @returns {() => boolean} whether column layout should be used
 */
export function useResponsiveRowLayout({
  containerRef,
  rowSpecs,
  enabled = true,
}) {
  const [useColumnLayout, setUseColumnLayout] = createSignal(false);
  const rowMinWidths = rowSpecs.map((rowSpec) => getRowMinWidth(rowSpec));

  onMount(() => {
    if (!enabled) {
      setUseColumnLayout(false);
      return;
    }

    const container = containerRef();
    if (!container) {
      return;
    }

    const updateLayoutDirection = () => {
      const availableWidth = container.getBoundingClientRect().width;
      const next = rowMinWidths.some(
        (rowMinWidth) => rowMinWidth > availableWidth + 1,
      );
      setUseColumnLayout((prev) => (prev === next ? prev : next));
    };

    updateLayoutDirection();

    if (typeof ResizeObserver !== "undefined") {
      const resizeObserver = new ResizeObserver(updateLayoutDirection);
      resizeObserver.observe(container);
      onCleanup(() => resizeObserver.disconnect());
    } else {
      window.addEventListener("resize", updateLayoutDirection);
      onCleanup(() =>
        window.removeEventListener("resize", updateLayoutDirection),
      );
    }
  });

  return useColumnLayout;
}
