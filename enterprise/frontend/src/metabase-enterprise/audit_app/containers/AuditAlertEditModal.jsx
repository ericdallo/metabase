import { connect } from "react-redux";
import { push } from "react-router-redux";
import _ from "underscore";
import Alerts from "metabase/entities/alerts";
import AuditNotificationEditModal from "../components/AuditNotificationEditModal";

const mapStateToProps = (state, { alert }) => ({
  item: alert,
  type: "alert",
});

const mapDispatchToProps = {
  onUpdate: (alert, channels) => Alerts.actions.setChannels(alert, channels),
  onDelete: alert =>
    push(`/admin/audit/subscriptions/alerts/${alert.id}/delete`),
};

export default _.compose(
  Alerts.load({
    id: (state, props) => Number.parseInt(props.params.alertId),
  }),
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
)(AuditNotificationEditModal);
