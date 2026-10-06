import { AdminScreen } from "@/components/admin/admin-screen";
import { SettingForm } from "@/components/admin/cms-forms";
import { createClient } from "@/lib/supabase/server";
const settings = [
  ["company_name", "Company display name"],
  ["contact_email", "Contact email"],
  ["contact_phone", "Contact phone"],
  ["social_link", "Primary social link"],
  ["default_seo_title", "Default SEO title"],
  ["default_seo_description", "Default SEO description"],
  ["footer_content", "Footer content"],
  ["primary_cta", "Primary CTA"],
  ["business_status", "Business availability"],
];
export default async function SettingsAdmin() {
  const db = await createClient();
  const { data } = db
    ? await db.from("site_settings").select("*")
    : { data: [] };
  return (
    <AdminScreen title="Site settings" adminOnly>
      {settings.map(([key, label]) => (
        <SettingForm
          key={key}
          keyName={key}
          label={label}
          row={(data || []).find((row) => row.key === key)}
        />
      ))}
    </AdminScreen>
  );
}
