import { EmailParams, MailerSend, Recipient, Sender } from "mailersend";
import {
  app as fbApp,
  fbOrders,
  fbOrganizations,
  fbProducts,
} from "~/firebase/index.server";
import type { Order } from "~/types/order";

const MAILERSEND_API_KEY = process.env["MAILERSEND_API_KEY"];
if (!MAILERSEND_API_KEY) {
  throw new Error("Missing MAILERSEND_API_KEY env variable");
}

function getCustomerObjectFromOrder(order: Order) {
  return {
    firstName: order.customer?.first_name || "",
    lastName: order.customer?.last_name || "",
    shippingAddress: {
      addressLine1: order.shipping_address?.address1 || "",
      addressLine2: order.shipping_address?.address2 || "",
      name: order.shipping_address?.name || "",
      cityLocality: order.shipping_address?.city || "",
      stateProvince: order.shipping_address?.province_code || "",
      postalCode: order.shipping_address?.zip || "",
      countryCode: order.shipping_address?.country_code || "",
    },
  };
}

const mailerSend = new MailerSend({
  apiKey: MAILERSEND_API_KEY,
});

export const OnOrderCreate = async (shop: string, order: Order) => {
  const orgId = await getOrganizationId(shop);
  console.log("onOrderCreate: ", JSON.stringify(order));

  if (!orgId) {
    console.error("store id does not match any organization");
    return;
  }

  const lineItems = order.line_items;
  const records = await Promise.all(
    lineItems
      .map((lineItem) =>
        Array.from(Array(lineItem.quantity).keys()).map((_) => ({
          lineItemId: lineItem.id,
          productId: lineItem.product_id,
          variantId: lineItem.variant_id,
          sku: lineItem.sku,
          title: lineItem.title,
          name: lineItem.name,
          organizationId: orgId,
          source: "shopify",
          orderId: order.id,
          status: "open",
          orderDate: order.processed_at,
          customer: getCustomerObjectFromOrder(order),
        })),
      )
      .flat()
      .map(async (lineItem) => await fbOrders.add(lineItem)),
  );

  console.log(
    `[${shop}] new orders created: `,
    records.map((record) => record.id),
  );
};

export const OnOrderUpdate = async (order: Order) => {
  console.log("OnOrderUpdate: ", order);
  const lineItemTrackingNumberMap = {} as Record<string, string>;
  order.fulfillments.forEach((fulfillment) => {
    fulfillment.line_items.forEach((lineItem) => {
      lineItemTrackingNumberMap[lineItem.id] = fulfillment.tracking_number;
    });
  });

  const orderDocuments = order.line_items.map((lineItem) => {
    let trackingNumber = lineItemTrackingNumberMap[lineItem.id] ?? null;

    let status = "open";
    if (order.cancelled_at) {
      status = "cancelled";
    } else if (lineItem.fulfillment_status === "fulfilled") {
      status = "fulfilled";
    }

    return {
      status,
      trackingNumber,
      lineItemId: lineItem.id,
      sku: lineItem.sku,
      title: lineItem.title,
      name: lineItem.name,
      customer: getCustomerObjectFromOrder(order),
    };
  });

  const batch = fbApp.firestore().batch();
  for (const orderDocument of orderDocuments) {
    const querySnapshot = await fbOrders
      .where("lineItemId", "==", orderDocument.lineItemId)
      .get();

    if (querySnapshot.docs.length === 0) {
      console.error(
        `No order found with lineItemId — ${orderDocument.lineItemId}`,
      );
      continue;
    }

    const orderRef = querySnapshot.docs[0].ref;
    batch.update(orderRef, orderDocument);
  }

  await batch.commit();
};

export const OnProductCreate = async (
  shop: string,
  product: Record<string, any>,
) => {
  const orgId = await getOrganizationId(shop);
  console.log("OnProductCreate: ", JSON.stringify(product));

  if (!orgId) {
    console.error("store id does not match any organization");
    return;
  }

  const productRef = await fbProducts.add({
    shopifyId: product.id,
    name: product.title,
    organizationId: orgId,
    body_html: product.body_html,
    thumbnail: product.image ? product.image.src : "",
    images: product.images
      ? product.images.map((image: { src: string }) => image.src)
      : [],
  });

  const variantsRef = fbProducts.doc(productRef.id).collection("variants");

  const records = await Promise.all(
    product.variants.map(async (variant: any) => {
      await variantsRef.add({
        shopifyId: variant.id,
        productId: product.id,
        name: variant.title,
        sku: variant.sku,
        slug: "",
        thumbnail: variant.images ? variant.images[0].src : "",
        images: variant.images
          ? variant.images.map((image: { src: string }) => image.src)
          : [],
        organizationId: orgId,
        weight: {
          unit: variant.weight_unit,
          value: variant.weight,
        },
      });
      return variant.id;
    }),
  );

  console.log(
    `[${shop}] new products created: `,
    records.map((record) => record.id),
  );
};

export const OnProductUpdate = async (
  shop: string,
  product: Record<string, any>,
) => {
  const orgId = await getOrganizationId(shop);
  console.log("OnProductUpdate: ", JSON.stringify(product));

  if (!orgId) {
    console.error("store id does not match any organization");
    return;
  }

  const querySnapshot = await fbProducts
    .where("shopifyId", "==", product.id)
    .get();

  const productId = querySnapshot.docs[0]?.id;

  if (!productId) {
    console.log("OnProductUpdate: No product found with id " + product.id);
    return;
  }

  await querySnapshot.docs[0].ref.set({
    name: product.title,
    body_html: product.body_html,
    thumbnail: product.image ? product.image.src : "",
    images: product.images
      ? product.images.map((image: { src: string }) => image.src)
      : [],
  });

  const variantsRef = fbProducts
    .doc(querySnapshot.docs[0].id)
    .collection("variants");

  const records = await Promise.all(
    product.variants.map(async (variant: any) => {
      const variantRef = await variantsRef
        .where("shopifyId", "==", variant.id)
        .get();

      await variantRef.docs[0].ref.set({
        shopifyId: variant.id,
        productId: product.id,
        name: variant.title,
        sku: variant.sku,
        slug: "",
        thumbnail: variant.images ? variant.images[0].src : "",
        images: variant.images
          ? variant.images.map((image: { src: string }) => image.src)
          : [],
        organizationId: orgId,
        weight: {
          unit: variant.weight_unit,
          value: variant.weight,
        },
      });

      return variant.id;
    }),
  );

  console.log(
    `[${shop}] product updated: `,
    records.map((record) => record.id),
  );
};

export const InitialProductLoad = async function (
  shop: string,
  products: Record<string, any>[],
) {
  products.map((product: any) => OnProductCreate(shop, product));
};

export async function setShopId(orgId: string, shopId: string) {
  await fbOrganizations.doc(orgId).set(
    {
      shopifyStoreId: shopId,
    },
    { merge: true },
  );

  return (await fbOrganizations.doc(orgId).get()).id;
}

async function getOrganizationId(shop: string) {
  const orgRef = await fbOrganizations
    .where("shopifyStoreId", "==", shop)
    .get();
  if (!orgRef || orgRef.docs.length < 1) {
    console.error("no organization contains shopifyStoreId " + shop);
    return;
  }

  return orgRef.docs[0].id;
}

export const sendGDPREmailRequest = async function (
  _name: string,
  payload: any,
) {
  const sentFrom = new Sender(
    "gdprrequest@distromfg.com",
    "[URGENT] GDPR REQUEST",
  );
  const recipients = [
    new Recipient("david@distromfg.com", "David Diefenderfer"),
    new Recipient("jarek@distromfg.com", "Jarek Ostrowski"),
  ];
  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setReplyTo(sentFrom)
    .setTemplateId("x2p03478389lzdrn")
    .setPersonalization([
      {
        email: "david@distromfg.com",
        data: {
          payload: JSON.stringify(payload),
        },
      },
    ]);

  await mailerSend.email.send(emailParams);
};
