import { createClient } from '@/lib/supabase/server';
import { FaqJsonLd } from '@/components/seo/JsonLd';
import FaqClient from './FaqClient';

export default async function FaqPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('faq_items')
    .select('id, question, answer, category')
    .eq('is_published', true)
    .order('sort_order', { ascending: true });

  const faqs = (data ?? []) as { id: string; question: string; answer: string; category: string }[];

  return (
    <>
      {faqs.length > 0 && <FaqJsonLd faqs={faqs} />}
      <FaqClient initialFaqs={faqs} />
    </>
  );
}
