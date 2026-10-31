import AdSlot from "./AdSlot";
import AffiliateBox from "./AffiliateBox";
import SponsorBanner from "./SponsorBanner";
import SupportBox from "./SupportBox";

// One drop-in block with every earning method. Each part hides itself
// unless the admin switched it on, so it is always safe to render.
export default function EarnBlocks({ withAffiliate = true }: { withAffiliate?: boolean }) {
  return (
    <>
      <AdSlot place="inline" />
      {withAffiliate && <AffiliateBox />}
      <SponsorBanner />
      <SupportBox />
    </>
  );
}
