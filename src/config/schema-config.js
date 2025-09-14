class SchemaConfig {
    static getOnboardingFunnelSchema() {
        return {
            id: "onboarding_funnel_full",
            alias: "Onboarding Funnel Board - Full",
            columns: [
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
            ]
        };
    }

    static getColumnMappings() {
        return {
            "mirror52__1": "Brand_Account_Id",
            "people": "underwriter_name",
            "status": "Internal_Status",
            "person": "Internal_Owner",
            "status2": "Status_With_Partner",
            "check": "NMHM",
            "dropdown": "Internal_Rejection_Reason",
            "dropdown5": "Partner_Rejection_Reason",
            "dropdown3": "Withdrawal_on_Hold_Reason",
            "formula": "Onboarding_Total_TTM",
            "dup__of_total_ttm": "Onboarding_Internal_TTM",
            "formula5": "Onboarding_Partner_TTM",
            "date24": "Application_Creation_Date",
            "date__1": "Internal_Review_Date",
            "date09": "Submitted_to_Partner_Date",
            "date6": "Internal_Rejection_Date",
            "date3": "External_Rejection_Date",
            "date23": "Rejection_Withdrawal_Date",
            "date27": "Internal_Withdrawal_Date",
            "date5": "External_Withdrawal_Date",
            "date0": "Application_on_Hold_Date"
        };
    }
}