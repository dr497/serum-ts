export type Action = {
  type: ActionType;
  item: any;
};

export enum ActionType {
  CommonWalletSetProvider,
  CommonWalletIsConnected,
  CommonNetworkSetUrl,
  CommonOwnedTokenAccountsSet,
  CommonClearStore,
  CommonWalletReset,
  LockupSetVestings,
  LockupCreateVesting,
  RegistryCreateEntity,
  RegistrySetEntities,
}
