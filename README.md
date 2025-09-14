# Monday.com Web Data Connector (WDC)

A Tableau Web Data Connector for integrating Monday.com data with Tableau Desktop.

## Overview

This project provides a modular architecture for creating custom Monday.com data connectors for Tableau. It currently includes an Onboarding Funnel connector and can be easily extended to support additional schemas and data sources.

## Architecture

The connector follows a modular design pattern with the following components:

- **Schema Configuration** (`src/config/schema-config.js`) - Defines table schemas and column mappings
- **API Services** (`src/services/api-service.js`) - Handles Monday.com API communication
- **Data Transformers** (`src/transformers/data-transformer.js`) - Transforms raw data into Tableau-compatible format
- **Connector Factory** (`src/factory/connector-factory.js`) - Creates and configures connector instances

## How to Add New Schemas

### Step 1: Define Schema Configuration

Add your new schema to `src/config/schema-config.js`:

```javascript
class SchemaConfig {
    // Existing getOnboardingFunnelSchema() method...

    static getYourNewBoardSchema() {
        return {
            id: "your_new_board_id",
            alias: "Your New Board - Description",
            columns: [
                { id: "column_1", dataType: tableau.dataTypeEnum.string },
                { id: "column_2", dataType: tableau.dataTypeEnum.int },
                { id: "column_3", dataType: tableau.dataTypeEnum.date },
                { id: "column_4", dataType: tableau.dataTypeEnum.bool },
                { id: "column_5", dataType: tableau.dataTypeEnum.float }
            ]
        };
    }

    static getYourNewBoardColumnMappings() {
        return {
            "monday_column_id_1": "column_1",
            "monday_column_id_2": "column_2",
            "monday_column_id_3": "column_3",
            "monday_column_id_4": "column_4",
            "monday_column_id_5": "column_5"
        };
    }
}
```

**Available Tableau Data Types:**
- `tableau.dataTypeEnum.string` - Text/varchar fields
- `tableau.dataTypeEnum.int` - Integer numbers
- `tableau.dataTypeEnum.float` - Decimal numbers
- `tableau.dataTypeEnum.bool` - Boolean (true/false)
- `tableau.dataTypeEnum.date` - Date fields
- `tableau.dataTypeEnum.datetime` - Date and time fields

### Step 2: Create Schema and Data Providers

Add new provider classes to `src/factory/connector-factory.js`:

```javascript
class YourNewBoardSchemaProvider {
    getSchema() {
        return SchemaConfig.getYourNewBoardSchema();
    }
}

class YourNewBoardDataProvider {
    constructor() {
        this.boardId = YOUR_MONDAY_BOARD_ID; // Replace with actual board ID
    }

    async getData() {
        const connectionData = JSON.parse(tableau.connectionData || '{}');
        const apiToken = connectionData.apiToken;

        if (!apiToken) {
            throw new Error("API token is required");
        }

        const apiService = new MondayApiService(apiToken);
        const columnMappings = SchemaConfig.getYourNewBoardColumnMappings();
        const columnTransformer = new ColumnValueTransformer(columnMappings);
        const itemTransformer = new YourNewBoardItemTransformer(columnTransformer);

        const allData = [];
        let cursor = null;

        do {
            const response = await apiService.fetchYourNewBoardItems(this.boardId, cursor);
            const items = response.data.boards[0].items_page.items || [];
            cursor = response.data.boards[0].items_page.cursor;

            items.forEach(item => {
                const transformedRows = itemTransformer.transform(item);
                allData.push(...transformedRows);
            });
        } while (cursor);

        return allData;
    }
}
```

### Step 3: Add API Service Method

Extend `MondayApiService` in `src/services/api-service.js`:

```javascript
class MondayApiService extends ApiService {
    // Existing methods...

    async fetchYourNewBoardItems(boardId, cursor = null, limit = 50) {
        const query = `
        {
            boards(ids: ${boardId}) {
                items_page(limit: ${limit}${cursor ? `, cursor: "${cursor}"` : ""}) {
                    cursor
                    items {
                        id
                        name
                        column_values(ids: [
                            "monday_column_id_1",
                            "monday_column_id_2",
                            "monday_column_id_3",
                            "monday_column_id_4",
                            "monday_column_id_5"
                        ]) { id text value }
                        // Add any additional fields needed (subitems, linked items, etc.)
                    }
                }
            }
        }`;

        return await this.makeRequest(query);
    }
}
```

### Step 4: Create Data Transformer (Optional)

If you need custom data transformation logic, add a transformer class to `src/transformers/data-transformer.js`:

```javascript
class YourNewBoardItemTransformer extends DataTransformer {
    constructor(columnValueTransformer) {
        super();
        this.columnValueTransformer = columnValueTransformer;
    }

    transform(item) {
        const transformedRow = {
            item_name: item.name, // Monday item name
            ...this.columnValueTransformer.transform(item.column_values)
        };

        // Add any custom transformation logic here
        // For example, handle linked items, subitems, calculations, etc.

        return [transformedRow]; // Return array of rows
    }
}
```

### Step 5: Add Factory Method

Add a factory method to `src/factory/connector-factory.js`:

```javascript
class ConnectorFactory {
    // Existing methods...

    static createYourNewBoardConnector() {
        const schemaProvider = new YourNewBoardSchemaProvider();
        const dataProvider = new YourNewBoardDataProvider();

        return new TableauConnector(schemaProvider, dataProvider);
    }
}
```

### Step 6: Update HTML and Main Connector

Create a new HTML file (e.g., `your-new-board.html`) or update the existing one:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Monday.com WDC - Your New Board</title>
    <script src="https://connectors.tableau.com/libs/tableauwdc-2.3.latest.js"></script>
    <script src="src/config/schema-config.js"></script>
    <script src="src/services/api-service.js"></script>
    <script src="src/transformers/data-transformer.js"></script>
    <script src="src/factory/connector-factory.js"></script>
    <script>
        (function () {
            const connector = ConnectorFactory.createYourNewBoardConnector();
            connector.register();

            document.addEventListener("DOMContentLoaded", function () {
                document.getElementById("fetchButton").addEventListener("click", function () {
                    var apiKeyInput = document.getElementById("apiToken").value.trim();
                    if (!apiKeyInput) {
                        alert("Please enter your Monday API token.");
                        return;
                    }

                    tableau.connectionData = JSON.stringify({ apiToken: apiKeyInput });
                    tableau.connectionName = "Your New Board - Description";
                    tableau.submit();
                });
            });
        })();
    </script>
</head>
<body>
    <h2>Monday.com Your New Board Connector</h2>
    <input type="text" id="apiToken" placeholder="Enter your Monday API Token" />
    <button id="fetchButton">Fetch Data</button>
</body>
</html>
```

## Usage Instructions

### Getting Started

1. **Obtain Monday.com API Token:**
   - Go to your Monday.com account
   - Navigate to Admin → API
   - Generate a new API token
   - Copy the token for use in the connector

2. **Find Your Board ID:**
   - Go to your Monday.com board
   - The board ID is in the URL: `https://yourcompany.monday.com/boards/BOARD_ID`

3. **Identify Column IDs:**
   - Use Monday.com's API explorer or browser developer tools to find column IDs
   - Column IDs are typically like: `"text"`, `"status"`, `"date4"`, `"people"`, etc.

### Using the Connector in Tableau

1. Open Tableau Desktop
2. Under "To a Server" → "More..." → select "Web Data Connector"
3. Enter the URL to your connector HTML file
4. Enter your Monday.com API token
5. Click "Fetch Data"
6. The schema will be loaded and data will be available for analysis

