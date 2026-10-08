-- Operational journal without a privileged application API key.
-- Data is minimal, with no names/emails/phone numbers or IP addresses.
-- RLS on activity_logs permits only admins to read the results.
CREATE OR REPLACE FUNCTION public.log_business_event()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE event_name text;
DECLARE category_name text;
DECLARE label_value text;
DECLARE details_value jsonb;
DECLARE request_role text;
BEGIN
  request_role := public.current_app_role();
  IF TG_TABLE_NAME = 'contact_submissions' AND TG_OP = 'INSERT' THEN
    event_name := 'contact_submitted'; category_name := 'lead';
    label_value := 'Nouvelle demande de contact';
    details_value := jsonb_build_object('contact_id',NEW.id);
    request_role := 'visitor';
  ELSIF TG_TABLE_NAME = 'valuation_requests' AND TG_OP = 'INSERT' THEN
    event_name := 'valuation_submitted'; category_name := 'lead';
    label_value := 'Nouvelle demande d estimation';
    details_value := jsonb_build_object('valuation_id',NEW.id);
    request_role := 'visitor';
  ELSIF TG_TABLE_NAME = 'newsletter' AND TG_OP = 'INSERT' THEN
    event_name := 'newsletter_subscribe'; category_name := 'engagement';
    label_value := 'Nouvelle inscription';
    details_value := jsonb_build_object('subscription_id',NEW.id);
    request_role := 'visitor';
  ELSIF TG_TABLE_NAME = 'properties' THEN
    IF TG_OP = 'UPDATE' AND
       NEW.status IS NOT DISTINCT FROM OLD.status AND
       NEW.is_published IS NOT DISTINCT FROM OLD.is_published AND
       NEW.price IS NOT DISTINCT FROM OLD.price THEN
      RETURN NEW;
    END IF;
    event_name := CASE WHEN TG_OP='INSERT' THEN 'property_created' ELSE 'property_status_changed' END;
    category_name := 'property'; label_value := NEW.title_fr;
    details_value := jsonb_build_object('property_id',NEW.id);
  ELSIF TG_TABLE_NAME = 'blog_posts' THEN
    event_name := CASE WHEN TG_OP='INSERT' THEN 'blog_created' ELSE 'blog_saved' END;
    category_name := 'admin_action'; label_value := NEW.title_fr;
    details_value := jsonb_build_object('blog_id',NEW.id);
  ELSIF TG_TABLE_NAME = 'faq_items' THEN
    event_name := CASE WHEN TG_OP='INSERT' THEN 'faq_created' ELSE 'faq_updated' END;
    category_name := 'admin_action'; label_value := 'FAQ';
    details_value := jsonb_build_object('faq_id',NEW.id);
  ELSE
    RETURN NEW;
  END IF;
  INSERT INTO public.activity_logs(event_type,event_category,event_label,user_role,details)
  VALUES(event_name,category_name,label_value,request_role,details_value);
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- A telemetry problem must NEVER prevent saving a customer inquiry.
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.log_business_event() FROM PUBLIC;

CREATE TRIGGER contact_activity AFTER INSERT ON public.contact_submissions
FOR EACH ROW EXECUTE FUNCTION public.log_business_event();
CREATE TRIGGER valuation_activity AFTER INSERT ON public.valuation_requests
FOR EACH ROW EXECUTE FUNCTION public.log_business_event();
CREATE TRIGGER newsletter_activity AFTER INSERT ON public.newsletter
FOR EACH ROW EXECUTE FUNCTION public.log_business_event();
CREATE TRIGGER property_activity AFTER INSERT OR UPDATE ON public.properties
FOR EACH ROW EXECUTE FUNCTION public.log_business_event();
CREATE TRIGGER blog_activity AFTER INSERT OR UPDATE ON public.blog_posts
FOR EACH ROW EXECUTE FUNCTION public.log_business_event();
CREATE TRIGGER faq_activity AFTER INSERT OR UPDATE ON public.faq_items
FOR EACH ROW EXECUTE FUNCTION public.log_business_event();

-- Dashboard subscribes to this RLS-restricted table.
ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_logs;
