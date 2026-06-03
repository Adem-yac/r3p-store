import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const getSessionId = () => {
  let sid = sessionStorage.getItem("r3p_sid");
  if (!sid) {
    sid = crypto.randomUUID();
    sessionStorage.setItem("r3p_sid", sid);
  }
  return sid;
};

const PageViewTracker = () => {
  const location = useLocation();

  useEffect(() => {
    // Small delay to let product pages set their title
    const timeout = setTimeout(async () => {
      const path = location.pathname;
      const productMatch = path.match(/^\/product\/(.+)$/);
      const productId = productMatch?.[1];
      const isUuid = productId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(productId);

      // Get product name from DOM h1 if on product page
      let productName: string | null = null;
      if (productId) {
        const h1 = document.querySelector("h1");
        productName = h1?.textContent || null;
      }

      await supabase.from("page_views").insert({
        page: path,
        product_id: isUuid ? productId : null,
        product_name: productName,
        referrer: document.referrer || null,
        user_agent: navigator.userAgent,
        session_id: getSessionId(),
      } as any);
    }, 800);

    return () => clearTimeout(timeout);
  }, [location.pathname]);

  return null;
};

export default PageViewTracker;
