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
  ConsumeLoginOnceToken,

  // Lockup.
  LockupSetVestings,
  LockupCreateVesting,

  // Registry.
  RegistryCreateEntity,
  RegistrySetEntities,
  RegistrySetMember,
}
