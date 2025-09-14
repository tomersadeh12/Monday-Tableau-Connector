(function () {
    const connector = ConnectorFactory.createOnboardingFunnelConnector();
    connector.register();

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
