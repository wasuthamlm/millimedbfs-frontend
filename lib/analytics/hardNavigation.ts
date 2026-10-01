"use client";

// Hard navigation guard (legacy src/lib/analytics/hardNavigation.js): once this
// document has started loading a Meta/TikTok SDK, every in-app navigation becomes a
// full page load. A marketing SDK can't be unloaded from a live document, and it
// keeps collecting URL/referrer/title on its own — replacing the document is the
// only reliable way to stop it before the next page re-checks consent/eligibility.

import { clearMarketingQueue } from "./marketingDispatcher";

declare global {
  interface Window {
    __millimedbfsMarketingSdkTouched?: boolean;
    __millimedbfsHardNavInstalled?: boolean;
  }
}

export const marketingSdkTouched = () => window.__millimedbfsMarketingSdkTouched === true;

/** Set by the pixel loaders BEFORE the script tag is inserted. */
export function markMarketingSdkTouched() {
  window.__millimedbfsMarketingSdkTouched = true;
  installHardNavigationGuard();
}

export const isDispatchBlocked = () => window.__millimedbfsDispatchBlocked === true;

function blockDispatch(reason: string) {
  window.__millimedbfsDispatchBlocked = true;
  clearMarketingQueue(reason);
}

export function hardNavigate(url: string) {
  blockDispatch("hard_navigation");
  window.location.assign(url);
}

const pathOf = (url: string) => {
  try {
    return new URL(url, window.location.href).pathname;
  } catch {
    return null;
  }
};

function shouldTakeOver(url: string | URL | null | undefined): boolean {
  if (!marketingSdkTouched() || !url) return false;
  let u: URL;
  try {
    u = new URL(url, window.location.href);
  } catch {
    return false;
  }
  if (u.origin !== window.location.origin) return false; // cross-origin already replaces the document
  // Same-document anchor jump — nothing to replace.
  if (u.hash && u.pathname === window.location.pathname && u.search === window.location.search) return false;
  return true;
}

function onClickCapture(e: MouseEvent) {
  if (!marketingSdkTouched() || e.defaultPrevented) return;
  if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
  if (!a || a.hasAttribute("download")) return;
  const target = (a.getAttribute("target") || "").toLowerCase();
  if (target && target !== "_self") return;
  if (/^(mailto:|tel:|javascript:)/i.test(a.getAttribute("href") || "")) return;
  if (!shouldTakeOver(a.href)) return;
  e.preventDefault();
  e.stopPropagation();
  hardNavigate(a.href);
}

/** Installs the guard once per document: link clicks, history.push/replaceState, back/forward, bfcache. */
export function installHardNavigationGuard() {
  if (window.__millimedbfsHardNavInstalled) return;
  window.__millimedbfsHardNavInstalled = true;

  document.addEventListener("click", onClickCapture, true);

  const origPush = window.history.pushState.bind(window.history);
  const origReplace = window.history.replaceState.bind(window.history);
  window.history.pushState = function (state: unknown, title: string, url?: string | URL | null) {
    if (url && shouldTakeOver(url) && pathOf(String(url)) !== window.location.pathname) {
      return hardNavigate(new URL(url, window.location.href).href);
    }
    return origPush(state, title, url);
  };
  window.history.replaceState = function (state: unknown, title: string, url?: string | URL | null) {
    if (url && shouldTakeOver(url) && pathOf(String(url)) !== window.location.pathname) {
      return hardNavigate(new URL(url, window.location.href).href);
    }
    return origReplace(state, title, url);
  };

  window.addEventListener("popstate", () => {
    if (!marketingSdkTouched()) return;
    blockDispatch("hard_navigation_popstate");
    window.location.reload();
  });
  window.addEventListener("pageshow", (e) => {
    if (e.persisted && marketingSdkTouched()) {
      blockDispatch("hard_navigation_bfcache");
      window.location.reload();
    }
  });
}
