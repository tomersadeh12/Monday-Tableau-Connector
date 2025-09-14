class ApiService {
    constructor(apiToken) {
        this.apiToken = apiToken;
        this.baseUrl = "https://api.monday.com/v2";
    }

    async makeRequest(query) {
        if (!this.apiToken) {
            throw new Error("API token is required");
        }

        const response = await fetch(this.baseUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": this.apiToken
            },
            body: JSON.stringify({ query })
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }

        return await response.json();
    }
}

class MondayApiService extends ApiService {
    constructor(apiToken) {
        super(apiToken);
    }

    async fetchBoardItems(boardId, cursor = null, limit = 50) {
        const query = `
        {
            boards(ids: ${boardId}) {
                items_page(limit: ${limit}${cursor ? `, cursor: "${cursor}"` : ""}) {
                    cursor
                    items {
                        id
                        name
                        column_values(ids: [
                            "people", "status", "person", "status2", "check",
                            "dropdown", "dropdown5", "dropdown3", "formula",
                            "dup__of_total_ttm", "formula5", "date24", "date__1",
                            "date09", "date2", "date6", "date3", "date23", "date27",
                            "date5", "date0"
                        ]) { id text value }
                        client_data: linked_items(
                            link_to_item_column_id: "board_relation1__1"
                            linked_board_id: 6820204253
                        ) {
                            id
                            name
                            column_values(ids: ["item_id__1"]) { id text value }
                            subitems { 
                                id 
                                name
                                parent: column_values(ids: ["mirror30__1"]) {
                                    ... on MirrorValue {
                                        mirrored_items {
                                            linked_item { 
                                                id 
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }`;

        return await this.makeRequest(query);
    }
}