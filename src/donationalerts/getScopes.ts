import { DonationAlertsScope } from '$types/donationAlerts';

const getScopes = () => {
  return [DonationAlertsScope.UserShow, DonationAlertsScope.DonationSubscribe];
};

export default getScopes;
