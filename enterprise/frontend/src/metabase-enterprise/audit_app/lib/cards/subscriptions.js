export const subscriptions = dashboardName => ({
  card: {
    name: "Subscriptions",
    display: "table",
    dataset_query: {
      type: "internal",
      fn: "metabase-enterprise.audit.pages.subscriptions/subscriptions-table",
      args: [dashboardName],
    },
    visualization_settings: {
      "table.columns": [
        { name: "dashboard_id", enabled: true },
        { name: "recipients", enabled: true },
        { name: "type", enabled: true },
        { name: "collection", enabled: true },
        { name: "frequency", enabled: true },
        {
          name: "last_sent",
          enabled: true,
          date_format: "M/D/YYYY",
        },
        { name: "created_by", enabled: true },
        {
          name: "created_at",
          enabled: true,
          date_format: "M/D/YYYY",
        },
        {
          name: "filters",
          enabled: true,
        },
      ],
    },
  },
});
