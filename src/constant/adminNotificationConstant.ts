export = Object.freeze({
  NOTIFICATION_CATEGORY_ARRAY: [
    'New Ticket',
    'New KYC',
    'Update KYC',
    'Block User',
    'Report User',
    'New Manually Withdrawal Request',
    'New Manually Desposit Cash Request'
  ],

  NOTIFICATION_CATEGORY_OBJ: {
    newTicket: 'New Ticket',
    newKYC: 'New KYC',
    updateKYC: 'Update KYC',
    blockUser: 'Block User',
    reportUser: 'Report User',
    newManuallyWithdrawalRequest: 'New Manually Withdrawal Request',
    newManuallyDepositCashRequest: 'New Manually Desposit Cash Request'
  },

  NOTIFICATION_TITLE: {
    blockUser: ':userName Blocked the :blockedUserName.',
  },
});
