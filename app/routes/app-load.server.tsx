import { InitialProductLoad, setShopId } from "~/routes/webhook-actions";
import { json } from "@remix-run/node";
import { authenticate } from "~/shopify.server";

export const initialLoadServerRpc = async (orgId: string, shopId: string, request: Request) => {
  const { admin, session } = await authenticate.admin(request);

  if (orgId !== (await setShopId(orgId, shopId))) {
    const message =
      "An error occurred while attempting to set the initialize products import.";
    console.error(message);
    return json({ error: true, message });
  }

  try {
    // @ts-ignore
    const { data } = await admin.rest.resources.Product.all({ session });
    await InitialProductLoad(session.shop, data);
  } catch (e) {
    const error = e as Error;
    const message = "An error occurred while attempting to load products.";
    console.error(message, error);
    return json({ error: true, message: message + " " + error.message });
  }

  console.log("=====================================================", {
    orgId,
    shopId,
  });

  return json({ error: false });
};
