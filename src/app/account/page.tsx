import Link from "next/link";
import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/site-settings";
import styles from "../Placeholder.module.css";

export async function generateMetadata(): Promise<Metadata> {
  const { siteName } = await getSiteSettings();
  return {
    title: "Account",
    description: `Account`,
  };
}

export default async function AccountPage() {
  const { siteName, contactEmail: CONTACT_EMAIL, siteUrl } = await getSiteSettings();
  const domain = siteUrl.replace(/^https?:\/\//, "");
  return (
    <div className={styles.page}>
      <span className={styles.kicker}>Account</span>
      <h1 className={styles.title}>Accounts aren&apos;t open yet</h1>
      <p className={styles.text}>
        {siteName} doesn&apos;t require sign-in today — everything runs right in your browser. This
        is where account features will live once they launch.
      </p>
      <Link href="/" className={styles.back}>
        Back to Home
      </Link>
    </div>
  );
}
