(function () {
    var myConnector = tableau.makeConnector();

    // Step 1: Define schema
    myConnector.getSchema = function (schemaCallback) {
        var cols = [
            { id: "Onboarding_Application", dataType: tableau.dataTypeEnum.string },
            { id: "Brand_Account_Id", dataType: tableau.dataTypeEnum.string },
            { id: "underwriter_name", dataType: tableau.dataTypeEnum.string },
            { id: "Internal_Status", dataType: tableau.dataTypeEnum.string },
            { id: "Internal_Owner", dataType: tableau.dataTypeEnum.string },
            { id: "Status_With_Partner", dataType: tableau.dataTypeEnum.string },
            { id: "NMHM", dataType: tableau.dataTypeEnum.bool },
            { id: "Internal_Rejection_Reason", dataType: tableau.dataTypeEnum.string },
            { id: "Partner_Rejection_Reason", dataType: tableau.dataTypeEnum.string },
            { id: "Withdrawal_on_Hold_Reason", dataType: tableau.dataTypeEnum.string },
            { id: "Onboarding_Total_TTM", dataType: tableau.dataTypeEnum.float },
            { id: "Onboarding_Internal_TTM", dataType: tableau.dataTypeEnum.float },
            { id: "Onboarding_Partner_TTM", dataType: tableau.dataTypeEnum.float },
            { id: "Application_Creation_Date", dataType: tableau.dataTypeEnum.date },
            { id: "Internal_Review_Date", dataType: tableau.dataTypeEnum.date },
            { id: "Submitted_to_Partner_Date", dataType: tableau.dataTypeEnum.date },
            { id: "Internal_Rejection_Date", dataType: tableau.dataTypeEnum.date },
            { id: "External_Rejection_Date", dataType: tableau.dataTypeEnum.date },
            { id: "Rejection_Withdrawal_Date", dataType: tableau.dataTypeEnum.date },
            { id: "Internal_Withdrawal_Date", dataType: tableau.dataTypeEnum.date },
            { id: "External_Withdrawal_Date", dataType: tableau.dataTypeEnum.date },
            { id: "Application_on_Hold_Date", dataType: tableau.dataTypeEnum.date },
            { id: "linked_item_id", dataType: tableau.dataTypeEnum.string },
            { id: "linked_item_name", dataType: tableau.dataTypeEnum.string },
            { id: "subitem_id", dataType: tableau.dataTypeEnum.string }
        ];

        var tableSchema = {
            id: "onboarding_funnel_full",
            alias: "Onboarding Funnel Board - Full",
            columns: cols
        };

        schemaCallback([tableSchema]);
    };

    // Step 2: Fetch data
    myConnector.getData = function (table, doneCallback) {
        var connectionData = JSON.parse(tableau.connectionData || '{}');
        var apiToken = connectionData.apiToken;

        if (!apiToken) {
            alert("Please enter your Monday API token.");
            doneCallback();
            return;
        }

        var allData = [];
        var cursor = null;

        function fetchPage() {
            var query = `
            {
                boards(ids: 6845321751) {
                    items_page(limit: 50${cursor ? `, cursor: "${cursor}"` : ""}) {
                        cursor
                        items {
                            id
                            name
                            column_values(ids: [
                                "people", "status", "person", "status2", "check",
                                "dropdown", "dropdown5", "dropdown3", "formula",
                                "dup__of_total_ttm", "formula5", "date24", "date__1",
                                "date09", "date6", "date3", "date23", "date27",
                                "date5", "date0"
                            ]) { id text value }
                            client_data: linked_items(
                                link_to_item_column_id: "board_relation1__1"
                                linked_board_id: 6820204253
                            ) {
                                id
                                name
                                column_values(ids: ["item_id__1"]) { id text value }
                                subitems { id name }
                            }
                        }
                    }
                }
            }`;

            fetch("https://api.monday.com/v2", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": apiToken
                },
                body: JSON.stringify({ query })
            })
                .then(res => res.json())
                .then(data => {
                    var items = data.data.boards[0].items_page.items || [];
                    cursor = data.data.boards[0].items_page.cursor;

                    items.forEach(item => {
                        var rowBase = { Onboarding_Application: item.name };

                        item.column_values.forEach(col => {
                            switch(col.id) {
                                case "mirror52__1": rowBase.Brand_Account_Id = col.text; break;
                                case "people": rowBase.underwriter_name = col.text; break;
                                case "status": rowBase.Internal_Status = col.text; break;
                                case "person": rowBase.Internal_Owner = col.text; break;
                                case "status2": rowBase.Status_With_Partner = col.text; break;
                                case "check": rowBase.NMHM = col.text === "v" || col.text === "true"; break;
                                case "dropdown": rowBase.Internal_Rejection_Reason = col.text; break;
                                case "dropdown5": rowBase.Partner_Rejection_Reason = col.text; break;
                                case "dropdown3": rowBase.Withdrawal_on_Hold_Reason = col.text; break;
                                case "formula": rowBase.Onboarding_Total_TTM = parseFloat(col.text) || 0; break;
                                case "dup__of_total_ttm": rowBase.Onboarding_Internal_TTM = parseFloat(col.text) || 0; break;
                                case "formula5": rowBase.Onboarding_Partner_TTM = parseFloat(col.text) || 0; break;
                                case "date24": rowBase.Application_Creation_Date = col.text; break;
                                case "date__1": rowBase.Internal_Review_Date = col.text; break;
                                case "date09": rowBase.Submitted_to_Partner_Date = col.text; break;
                                case "date6": rowBase.Internal_Rejection_Date = col.text; break;
                                case "date3": rowBase.External_Rejection_Date = col.text; break;
                                case "date23": rowBase.Rejection_Withdrawal_Date = col.text; break;
                                case "date27": rowBase.Internal_Withdrawal_Date = col.text; break;
                                case "date5": rowBase.External_Withdrawal_Date = col.text; break;
                                case "date0": rowBase.Application_on_Hold_Date = col.text; break;
                            }
                        });

                        // Process linked client items
                        if (item.client_data && item.client_data.length > 0) {
                            item.client_data.forEach(linked => {
                                var linkedRow = Object.assign({}, rowBase);
                                linkedRow.linked_item_id = linked.id;
                                linkedRow.linked_item_name = linked.name;

                                if (linked.subitems && linked.subitems.length > 0) {
                                    linked.subitems.forEach(sub => {
                                        var subRow = Object.assign({}, linkedRow);
                                        subRow.subitem_id = sub.id;
                                        var last6 = sub.id.slice(-6);
                                        subRow.Brand_Account_Id = `FBX-${item.id}-${last6}`;
                                        allData.push(subRow);
                                    });
                                } else {
                                    linkedRow.subitem_id = null;
                                    linkedRow.Brand_Account_Id = `FBX-${item.id}-000000`;
                                    allData.push(linkedRow);
                                }
                            });
                        } else {
                            rowBase.linked_item_id = null;
                            rowBase.linked_item_name = null;
                            rowBase.subitem_id = null;
                            rowBase.Brand_Account_Id = `FBX-${item.id}-000000`;
                            allData.push(rowBase);
                        }
                    });

                    if (cursor) fetchPage();
                    else {
                        table.appendRows(allData);
                        doneCallback();
                    }
                })
                .catch(err => {
                    console.error("Error fetching Monday data:", err);
                    doneCallback();
                });
        }

        fetchPage();
    };

    tableau.registerConnector(myConnector);

    document.addEventListener("DOMContentLoaded", function () {
        document.getElementById("fetchButton").addEventListener("click", function () {
            var apiKeyInput = document.getElementById("apiToken").value.trim();
            if (!apiKeyInput) {
                alert("Please enter your Monday API token.");
                return;
            }

            tableau.connectionData = JSON.stringify({ apiToken: apiKeyInput });
            tableau.connectionName = "Onboarding Funnel Board - Full";
            tableau.submit();
        });
    });

})();
