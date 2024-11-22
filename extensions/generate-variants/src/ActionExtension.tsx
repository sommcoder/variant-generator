import { useCallback, useEffect, useState } from "react";
import "@shopify/polaris-tokens/css/styles.css";
import {
  reactExtension,
  useApi,
  AdminAction,
  Button,
  Section,
  Badge,
  InlineStack,
  BlockStack,
  Pressable,
  Checkbox,
  Divider,
  Heading,
} from "@shopify/ui-extensions-react/admin";

// The target used here must match the target used in the extension's toml file (./shopify.extension.toml)
const TARGET = "admin.product-details.action.render";

export default reactExtension(TARGET, () => <App />);

function App() {
  // The useApi hook provides access to several useful APIs like i18n, close, and data.
  const { i18n, close, data } = useApi(TARGET);
  console.log({ data });
  const [productTitle, setProductTitle] = useState("");

  // MoneyField
  const [value, setValue] = useState({ amount: 100, currencyCode: "USD" });

  const [active, setActive] = useState(false);

  const toggleModal = useCallback(() => setActive((active) => !active), []);

  const handleChangeValue = (ev) => {
    console.log("ev:", ev);

    setValue((prev) => {
      const newState = prev;

      // return { ...newState, amount: }
    });
  };

  const rows = [
    ["Emerald Silk Gown", "$875.00", 124689, 140, "$122,500.00"],
    ["Mauve Cashmere Scarf", "$230.00", 124533, 83, "$19,090.00"],
    [
      "Navy Merino Wool Blazer with khaki chinos and yellow belt",
      "$445.00",
      124518,
      32,
      "$14,240.00",
    ],
  ];

  const [seqMenu, toggleSeqMenu] = (useState < "none") | ("auto" > "none");
  const handleSeqMenuClick = () =>
    toggleSeqMenu((prev) => {
      console.log("pressable click:", prev);
      return prev === "none" ? "auto" : "none";
    });
  // Use direct API calls to fetch data from Shopify.
  // See https://shopify.dev/docs/api/admin-graphql for more information about Shopify's GraphQL API
  useEffect(() => {
    (async function getProductInfo() {
      const getProductQuery = {
        query: `query Product($id: ID!) {
          product(id: $id) {
            title
          }
        }`,
        variables: { id: data.selected[0].id },
      };

      const res = await fetch("shopify:admin/api/graphql.json", {
        method: "POST",
        body: JSON.stringify(getProductQuery),
      });

      if (!res.ok) {
        console.error("Network error");
      }

      const productData = await res.json();
      setProductTitle(productData.data.product.title);
    })();
  }, [data.selected]);
  return (
    // The AdminAction component provides an API for setting the title and actions of the Action extension wrapper.

    // ! Polaris says don't let action content exceed 1200px and no more than 2 steps of pagination
    <AdminAction
      title="Assign Variant Group"
      // assign will SAVE the metaobject as a metafield to the Product id and then will MUTATE the product's variants based
      primaryAction={<Button onPress={() => {}}>assign</Button>}
      secondaryAction={<Button onPress={() => {}}>close</Button>}
    >
      <Pressable
        padding="base"
        display={seqMenu}
        paddingInlineStart="small"
        maxInlineSize={60}
        onPress={handleSeqMenuClick}
        onClick={handleSeqMenuClick}
      >
        <Section>
          <Checkbox>
            <Heading size={5}>Variant Group #1</Heading>
          </Checkbox>
          <Divider />
          <BlockStack blockGap="small" padding="base">
            <InlineStack>
              <Badge tone="info">name</Badge>
              <Badge tone="info">$10.00</Badge>
            </InlineStack>
            <InlineStack>
              <Badge tone="info">name</Badge>
              <Badge tone="info">$10.00</Badge>
            </InlineStack>
            <InlineStack>
              <Badge tone="info">name</Badge>
              <Badge tone="info">$10.00</Badge>
            </InlineStack>
          </BlockStack>
        </Section>
      </Pressable>
    </AdminAction>
  );
}
