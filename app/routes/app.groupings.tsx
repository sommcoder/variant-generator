import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { useAppBridge } from "@shopify/app-bridge-react";
import {
    TextField,
    Button,
    ResourceList,
    Avatar,
    ResourceItem,
    Text,
    Card,
    Filters,
} from "@shopify/polaris";
import type { ResourceListProps } from "@shopify/polaris";
import { authenticate } from "app/shopify.server";
import { useState, useCallback } from "react";

// ! data models:
// represents what the ProductVariant WILL look like
interface MetaObject {
    // variant name:
    [key: string]: {
        //
    };
}
interface AssociatedProducts {
    name: string;
    productId: string;
    variants: {};
}
interface VariantGroupsObj {
    name: string;
    id: string;
    productsAssigned: AssociatedProducts[];
    // what the metaObject looks like
    structure: MetaObject[];
}

/*
 
- when the user creates a new variant group add it the the product or products in the selected collection: 


{
  "metafieldsSetInput": [
    {
      "namespace": "secret_keys",
      "key": "api_key",
      "type": "single_line_text_field",
      "value": "aS1hbS1hLXNlY3JldC1hcGkta2V5Cg==",
      "ownerId": "gid://shopify/AppInstallation/3"
    }
  ]
}
 
*/

// ! each Route can define a loader function that provides data to the route when rendering.
// Treat your `loader`s with the same care as public API endpoints.
export async function loader({ request }: LoaderFunctionArgs) {
    await authenticate.admin(request);
    return null;
}

// loader AND action are SERVER only functions
export async function action({ request }: ActionFunctionArgs) {
    const { admin } = await authenticate.admin(request);

  const response = await admin.graphql(`#graphql query {products(first: 20) {edges {node {id title handle} cursor }}}`);
    const responseJson = await response.json();
    console.log("responseJson:", responseJson);
    return responseJson;
}

export default function GroupingsPage() {
    const fetcher = useFetcher<typeof action>();

    const shopify = useAppBridge();
    const isLoading =
        ["loading", "submitting"].includes(fetcher.state) &&
        fetcher.formMethod === "POST";

    const data = useLoaderData();

    // const data = fetcher.data;
    console.log("data:", data);

    const [selectedItems, setSelectedItems] = useState<
        ResourceListProps["selectedItems"]
    >([]);
    const [sortValue, setSortValue] = useState("DATE_MODIFIED_DESC");
    const [taggedWith, setTaggedWith] = useState<string | undefined>("VIP");
    const [queryValue, setQueryValue] = useState<string | undefined>(undefined);

    /*
   
  1) Should query MetaObject VariantGroupsObj
  2) 
  
   
  */

    const handleTaggedWithChange = useCallback(
        (value: string) => setTaggedWith(value),
        [],
    );
    const handleQueryValueChange = useCallback(
        (value: string) => setQueryValue(value),
        [],
    );
    const handleTaggedWithRemove = useCallback(
        () => setTaggedWith(undefined),
        [],
    );
    const handleQueryValueRemove = useCallback(
        () => setQueryValue(undefined),
        [],
    );
    const handleClearAll = useCallback(() => {
        handleTaggedWithRemove();
        handleQueryValueRemove();
    }, [handleQueryValueRemove, handleTaggedWithRemove]);

    const resourceName = {
        singular: "customer",
        plural: "customers",
    };

    const items = [
        {
            id: "112",
            url: "#",
            name: "Mae Jemison",
            location: "Decatur, USA",
            latestOrderUrl: "orders/1456",
        },
        {
            id: "212",
            url: "#",
            name: "Ellen Ochoa",
            location: "Los Angeles, USA",
            latestOrderUrl: "orders/1457",
        },
    ];

    const promotedBulkActions = [
        {
            content: "Edit customers",
            onAction: () => console.log("Todo: implement bulk edit"),
        },
    ];

    const bulkActions = [
        {
            content: "Add tags",
            onAction: () => console.log("Todo: implement bulk add tags"),
        },
        {
            content: "Remove tags",
            onAction: () => console.log("Todo: implement bulk remove tags"),
        },
        {
            content: "Delete customers",
            onAction: () => console.log("Todo: implement bulk delete"),
        },
    ];

    const filters = [
        {
            key: "taggedWith3",
            label: "Tagged with",
            filter: (
                <TextField
                    label="Tagged with"
                    value={taggedWith}
                    onChange={handleTaggedWithChange}
                    autoComplete="off"
                    labelHidden
                />
            ),
            shortcut: true,
        },
    ];

    const appliedFilters =
        taggedWith && !isEmpty(taggedWith)
            ? [
                {
                    key: "taggedWith3",
                    label: disambiguateLabel("taggedWith3", taggedWith),
                    onRemove: handleTaggedWithRemove,
                },
            ]
            : [];

    const filterControl = (
        <Filters
            queryValue={queryValue}
            filters={filters}
            appliedFilters={appliedFilters}
            onQueryChange={handleQueryValueChange}
            onQueryClear={handleQueryValueRemove}
            onClearAll={handleClearAll}
        >
            <div style={{ paddingLeft: "8px" }}>
                <Button onClick={() => console.log("New filter saved")}>Save</Button>
            </div>
        </Filters>
    );

    return (
        <Card>
            <ResourceList
                resourceName={resourceName}
                items={items}
                renderItem={renderItem}
                selectedItems={selectedItems}
                onSelectionChange={setSelectedItems}
                promotedBulkActions={promotedBulkActions}
                bulkActions={bulkActions}
                sortValue={sortValue}
                sortOptions={[
                    { label: "Newest update", value: "DATE_MODIFIED_DESC" },
                    { label: "Oldest update", value: "DATE_MODIFIED_ASC" },
                ]}
                onSortChange={(selected) => {
                    setSortValue(selected);
                    console.log(`Sort option changed to ${selected}.`);
                }}
                filterControl={filterControl}
            />
        </Card>
    );

    function renderItem(item: (typeof items)[number]) {
        const { id, url, name, location, latestOrderUrl } = item;
        const media = <Avatar customer size="md" name={name} />;
        const shortcutActions = latestOrderUrl
            ? [{ content: "View latest order", url: latestOrderUrl }]
            : undefined;
        return (
            <ResourceItem
                id={id}
                url={url}
                media={media}
                accessibilityLabel={`View details for ${name}`}
                shortcutActions={shortcutActions}
                persistActions
            >
                <Text variant="bodyMd" fontWeight="bold" as="h3">
                    {name}
                </Text>
                <div>{location}</div>
            </ResourceItem>
        );
    }

    function disambiguateLabel(key: string, value: string): string {
        switch (key) {
            case "taggedWith3":
                return `Tagged with ${value}`;
            default:
                return value;
        }
    }

    function isEmpty(value: string): boolean {
        if (Array.isArray(value)) {
            return value.length === 0;
        } else {
            return value === "" || value == null;
        }
    }
}
