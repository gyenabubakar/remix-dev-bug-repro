import { useEffect, useState } from "react";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useActionData, useNavigation, Form } from "@remix-run/react";
import { Page, Layout, Text, Card, Button, TextField } from "@shopify/polaris";

import { authenticate } from "~/shopify.server";
import { initialLoadServerRpc } from "~/routes/app-load.server";
import { orgWithIdExists } from "~/firebase/index.server";
import { z } from "zod";

export const loader: LoaderFunction = async ({ request }) => {
  const { session } = await authenticate.admin(request);

  return json({ shop: session.shop.replace(".myshopify.com", "") });
};

export const action: ActionFunction = async ({ request }) => {
  const { session } = await authenticate.admin(request);

  // ============== MADE IT HERE ==============

  const formData = await request.formData();
  const parsed = z
    .object({ orgId: z.string() })
    .safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return json({
      error: true,
      message: "Invalid request, please try again.",
    });
  }

  const body = parsed.data;

  const orgExists = await orgWithIdExists(body.orgId);
  if (!orgExists) {
    return json({
      error: true,
      message: "Organization doesn't exist, check the ID in Distro again.",
    });
  }

  return await initialLoadServerRpc(body.orgId, session.shop, request);
};

export default function Index() {
  const nav = useNavigation();
  const actionData = useActionData() as { error?: boolean; message?: string };

  const [orgId, setOrgId] = useState("");

  const isLoading =
    ["loading", "submitting"].includes(nav.state) && nav.formMethod === "POST";

  useEffect(() => {
    if (actionData) {
      if (actionData.error && actionData.message) {
        shopify.toast.show(actionData.message, {
          isError: true,
          duration: 5000,
        });
        return;
      }

      if (!actionData.error && parent?.window) {
        parent.window.location.href = "https://dev.distromfg.com";
      }
    }
  }, [actionData]);

  return (
    <Page>
      <div>
        <Layout>
          <Layout.Section>
            <Card>
              <div>
                <Text as="h2" variant="headingMd">
                  Import{isLoading ? "ing" : ""} your products into Distro!
                </Text>
                {isLoading && (
                  <Text as="p" variant="bodySm">
                    You will be redirected when products are done being
                    imported.
                  </Text>
                )}
                <Form method="post">
                  <TextField
                    label="Enter your ID"
                    name="orgId"
                    value={orgId}
                    onChange={setOrgId}
                    autoComplete="off"
                  />
                  <br />
                  <Button loading={isLoading} variant="primary" submit>
                    Import
                  </Button>
                </Form>
              </div>
            </Card>
          </Layout.Section>
        </Layout>
      </div>
    </Page>
  );
}
