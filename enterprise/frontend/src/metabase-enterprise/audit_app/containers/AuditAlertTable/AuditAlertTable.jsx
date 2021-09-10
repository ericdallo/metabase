import { connect } from "react-redux";
import { push } from "react-router-redux";
import { t } from "ttag";
import * as AlertCards from "../../lib/cards/alerts";
import AuditTableWithSearch from "../AuditTableWithSearch";

const mapStateToProps = () => ({
  table: AlertCards.table(),
  placeholder: t`Filter by question name`,
});

const mapDispatchToProps = {
  onVisualizationClick: ({ id }) =>
    push(`/admin/audit/subscriptions/alerts/${id}/edit`),
  onRemoveRow: ({ id }) =>
    push(`/admin/audit/subscriptions/alerts/${id}/delete`),
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(AuditTableWithSearch);
