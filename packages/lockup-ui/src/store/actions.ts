export type Action = {
  type: ActionType;
  item: any;
};

export enum ActionType {
  // Common.
  CommonAppWillStart,
  CommonAppDidStart,
  CommonWalletSetProvider,
  CommonWalletIsConnected,
  CommonNetworkSetUrl,
  CommonOwnedTokenAccountsSet,
  CommonClearStore,
  CommonWalletReset,

  // Lockup.
  LockupSetVestings,
  LockupCreateVesting,

  // Registry.
  RegistryCreateEntity,
  RegistrySetEntities,
  RegistrySetMember,
}
