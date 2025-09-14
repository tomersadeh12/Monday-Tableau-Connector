class ConnectorFactory {
    static createOnboardingFunnelConnector() {
        const schemaProvider = new OnboardingFunnelSchemaProvider();
        const dataProvider = new OnboardingFunnelDataProvider();
        
        return new TableauConnector(schemaProvider, dataProvider);
    }
}

class TableauConnector {
    constructor(schemaProvider, dataProvider) {
        this.schemaProvider = schemaProvider;
        this.dataProvider = dataProvider;
        this.connector = tableau.makeConnector();
        this._setupConnector();
    }

    _setupConnector() {
        this.connector.getSchema = (schemaCallback) => {
            const schema = this.schemaProvider.getSchema();
            schemaCallback([schema]);
        };

        this.connector.getData = async (table, doneCallback) => {
            try {
                const data = await this.dataProvider.getData();
                table.appendRows(data);
                doneCallback();
            } catch (error) {
                console.error("Error fetching data:", error);
                doneCallback();
            }
        };
    }

    register() {
        tableau.registerConnector(this.connector);
    }
}

class OnboardingFunnelSchemaProvider {
    getSchema() {
        return SchemaConfig.getOnboardingFunnelSchema();
    }
}

class OnboardingFunnelDataProvider {
    constructor() {
        this.boardId = 6845321751;
    }

    async getData() {
        const connectionData = JSON.parse(tableau.connectionData || '{}');
        const apiToken = connectionData.apiToken;

        if (!apiToken) {
            throw new Error("API token is required");
        }

        const apiService = new MondayApiService(apiToken);
        const columnMappings = SchemaConfig.getColumnMappings();
        const columnTransformer = new ColumnValueTransformer(columnMappings);
        const itemTransformer = new OnboardingItemTransformer(columnTransformer);

        const allData = [];
        let cursor = null;

        do {
            const response = await apiService.fetchBoardItems(this.boardId, cursor);
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