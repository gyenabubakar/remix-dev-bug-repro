// noinspection JSUnusedGlobalSymbols

import { authenticate } from "~/shopify.server";
import db from "../db.server";
import {
  sendGDPREmailRequest,
  OnProductCreate,
  OnProductUpdate,
  OnOrderCreate,
  OnOrderUpdate,
} from "~/routes/webhook-actions";
import type {ActionFunction} from "@remix-run/node";
import type {Order} from "~/types/order";

export const action: ActionFunction  = async ({ request }) => {
  const { topic, shop, session, payload } = await authenticate.webhook(request);

  switch (topic) {
    case "APP_UNINSTALLED":
      if (session) {
        await db.session.deleteMany({ where: { shop } });
      }
      break;
    case "CUSTOMERS_DATA_REQUEST":
      // manually send email to distro admins dave & jarek to remove
      await sendGDPREmailRequest("CUSTOMERS_DATA_REQUEST", payload);
      break;
    case "CUSTOMERS_REDACT":
      await sendGDPREmailRequest("CUSTOMERS_REDACT", payload);
      break;
    case "SHOP_REDACT":
      await sendGDPREmailRequest("SHOP_REDACT", payload);
      break;
    case "PRODUCTS_CREATE":
      await OnProductCreate(shop, payload);
      break;
    case "PRODUCTS_UPDATE":
      await OnProductUpdate(shop, payload);
      break;
    case "ORDERS_CREATE":
      await OnOrderCreate(shop, payload as Order);
      break;
    case "ORDERS_UPDATED":
      await OnOrderUpdate(payload as Order);
      break;
    default:
      throw new Response("Unhandled webhook topic", { status: 404 });
  }

  throw new Response();
};
