"use client";

import { useSiteSettings } from "@/components/SiteSettingsProvider";
import styles from "@/app/Home.module.css";

// Replaces the old hard-coded "for sale" bar. Fully controlled from /admin.
export default function AnnouncementBar() {
  const { announcement } = useSiteSettings();
  if (!announcement.enabled || !announcement.text) return null;
  return (
    <div className={styles.forSaleBar} role="banner">
      <span className={styles.forSaleBarText}>{announcement.text}</span>
      {announcement.linkText && announcement.linkUrl && (
        <a href={announcement.linkUrl} className={styles.forSaleBarCta}>
          {announcement.linkText}
        </a>
      )}
    </div>
  );
}
