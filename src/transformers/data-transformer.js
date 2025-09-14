class DataTransformer {
    transform(data) {
        throw new Error("Transform method must be implemented");
    }
}

class ColumnValueTransformer extends DataTransformer {
    constructor(columnMappings) {
        super();
        this.columnMappings = columnMappings;
    }

    transform(columnValues) {
        const result = {};
        
        columnValues.forEach(col => {
            const targetField = this.columnMappings[col.id];
            if (targetField) {
                result[targetField] = this._transformValue(col, targetField);
            }
        });

        return result;
    }

    _transformValue(col, fieldName) {
        switch (fieldName) {
            case "NMHM":
                return col.text === "v" || col.text === "true";
            case "Onboarding_Total_TTM":
            case "Onboarding_Internal_TTM":
            case "Onboarding_Partner_TTM":
                return parseFloat(col.text) || 0;
            default:
                return col.text;
        }
    }
}

class OnboardingItemTransformer extends DataTransformer {
    constructor(columnValueTransformer) {
        super();
        this.columnValueTransformer = columnValueTransformer;
    }

    transform(item) {
        const baseRow = {
            Onboarding_Application: item.name,
            ...this.columnValueTransformer.transform(item.column_values)
        };

        const transformedRows = [];

        if (item.client_data && item.client_data.length > 0) {
            item.client_data.forEach(linked => {
                const linkedRow = { ...baseRow };
                linkedRow.linked_item_id = linked.id;
                linkedRow.linked_item_name = linked.name;

                if (linked.subitems && linked.subitems.length > 0) {
                    linked.subitems.forEach(sub => {
                        const subRow = { ...linkedRow };
                        subRow.subitem_id = sub.id;

                        const parentId = sub.parent?.[0]?.mirrored_items?.[0]?.linked_item?.id;
                        const itemIdValue = linked.column_values?.find(cv => cv.id === "item_id__1")?.text || linked.id;
                        const last6OfItemId = itemIdValue.slice(-6);

                        let brandAccountId = parentId
                            ? `FBX-${parentId}-${last6OfItemId}`
                            : `FBX-${linked.id}-${last6OfItemId}`;

                        // 🔑 Handle multiple IDs (split by commas and whitespace)
                        brandAccountId.split(/[,\s]+/).forEach(id => {
                            if (id.trim()) {
                                const rowCopy = { ...subRow, Brand_Account_Id: id.trim() };
                                transformedRows.push(rowCopy);
                            }
                        });
                    });
                } else {
                    linkedRow.subitem_id = null;
                    const last6OfLinked = linked.id.slice(-6);
                    let brandAccountId = `FBX-${linked.id}-${last6OfLinked}`;

                    brandAccountId.split(/[,\s]+/).forEach(id => {
                        if (id.trim()) {
                            const rowCopy = { ...linkedRow, Brand_Account_Id: id.trim() };
                            transformedRows.push(rowCopy);
                        }
                    });
                }
            });
        } else {
            baseRow.linked_item_id = null;
            baseRow.linked_item_name = null;
            baseRow.subitem_id = null;
            let brandAccountId = `FBX-${item.id}-000000`;

            brandAccountId.split(/[,\s]+/).forEach(id => {
                if (id.trim()) {
                    const rowCopy = { ...baseRow, Brand_Account_Id: id.trim() };
                    transformedRows.push(rowCopy);
                }
            });
        }

        return transformedRows;
    }
}
