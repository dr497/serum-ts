export type Action = {
  type: ActionType;
  item: any;
};

export enum ActionType {
  // Common.
  CommonAppWillBootstrap,
  CommonAppDidBootstrap,
  CommonWalletWillConnect,
  CommonWalletDidConnect,
  CommonWalletSetProvider,
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
  RegistryUpdateEntity,
  RegistrySetMember,
  RegistrySetPools,
  RegistrySetRegistrar,
}
