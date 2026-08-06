-- CreateTable
CREATE TABLE "SiteHeaderConfig" (
    "id" TEXT NOT NULL,
    "layout" TEXT NOT NULL DEFAULT 'logo-left-menu-center',
    "height" TEXT NOT NULL DEFAULT 'standard',
    "shadow" TEXT NOT NULL DEFAULT 'strong',
    "position" TEXT NOT NULL DEFAULT 'fixed-top',
    "bgColor" TEXT NOT NULL DEFAULT '#032f87',
    "textColor" TEXT NOT NULL DEFAULT '#ffffff',
    "hoverBgColor" TEXT NOT NULL DEFAULT '#fed22f',
    "hoverTextColor" TEXT NOT NULL DEFAULT '#000000',
    "activeBgColor" TEXT NOT NULL DEFAULT '#fed22f',
    "activeTextColor" TEXT NOT NULL DEFAULT '#000000',
    "iconTextColor" TEXT NOT NULL DEFAULT '#fed22f',
    "logoMode" TEXT NOT NULL DEFAULT 'site-settings',
    "logoTextTh" TEXT,
    "logoTextEn" TEXT,
    "menuWrap" TEXT NOT NULL DEFAULT 'single-line',
    "menuFontSize" TEXT NOT NULL DEFAULT 'normal',
    "menuLevels" INTEGER NOT NULL DEFAULT 2,
    "submenuStyle" TEXT NOT NULL DEFAULT 'click-open',
    "submenuChildBehavior" TEXT NOT NULL DEFAULT 'below-parent',
    "showSearch" BOOLEAN NOT NULL DEFAULT false,
    "showLanguage" BOOLEAN NOT NULL DEFAULT true,
    "showAccount" BOOLEAN NOT NULL DEFAULT false,
    "showCart" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteHeaderConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteBannerConfig" (
    "id" TEXT NOT NULL,
    "transitionEffect" TEXT NOT NULL DEFAULT 'fade',
    "direction" TEXT NOT NULL DEFAULT 'ltr',
    "transitionSpeedMs" INTEGER NOT NULL DEFAULT 700,
    "displayDurationMs" INTEGER NOT NULL DEFAULT 5000,
    "autoplay" BOOLEAN NOT NULL DEFAULT true,
    "loop" BOOLEAN NOT NULL DEFAULT true,
    "pauseOnHover" BOOLEAN NOT NULL DEFAULT true,
    "showArrows" BOOLEAN NOT NULL DEFAULT true,
    "showDots" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteBannerConfig_pkey" PRIMARY KEY ("id")
);
