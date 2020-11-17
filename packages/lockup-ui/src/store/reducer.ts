import { Action, ActionType } from './actions';
import { PublicKey } from '@solana/web3.js';
import { AccountInfo as TokenAccount } from '@solana/spl-token';
import * as lockup from '@project-serum/lockup';
import * as registry from '@project-serum/registry';

export default function reducer(
  state: State = initialState,
  action: Action,
): State {
  const newState = {
    common: { ...state.common },
    lockup: { ...state.lockup },
    registry: { ...state.registry },
  };
  switch (action.type) {
    // Common.
    case ActionType.CommonAppWillStart:
      return newState;
    case ActionType.CommonAppDidStart:
      newState.common.isBootstrapped = true;
      return newState;
    case ActionType.CommonWalletSetProvider:
      newState.common.walletProvider = action.item.walletProvider;
      return newState;
    case ActionType.CommonWalletIsConnected:
      newState.common.walletIsConnected = action.item.walletIsConnected;
      return newState;
    case ActionType.CommonNetworkSetUrl:
      newState.common.networkUrl = action.item.networkUrl;
      return newState;
    case ActionType.CommonOwnedTokenAccountsSet:
      newState.common.ownedTokenAccounts = action.item.ownedTokenAccounts;
      return newState;
    case ActionType.CommonClearStore:
      return { ...initialState };
    case ActionType.CommonWalletReset:
      newState.common.walletIsConnected = false;
      newState.common.ownedTokenAccounts = [];
      newState.lockup.vestings = [];
      return newState;

    // Lockup.
    case ActionType.LockupSetVestings:
      newState.lockup.vestings = action.item.vestingAccounts;
      return newState;
    case ActionType.LockupCreateVesting:
      newState.lockup.vestings.unshift(action.item.vesting);
      return newState;

    // Registry.
    case ActionType.RegistryCreateEntity:
      newState.registry.entities.unshift(action.item.entity);
      return newState;
    case ActionType.RegistrySetEntities:
      newState.registry.entities = action.item.entities;
      return newState;
    case ActionType.RegistrySetMember:
      newState.registry.member = action.item.member;
      return newState;

    // Misc.
    default:
      return newState;
  }
}

export type State = {
  common: CommonState;
  lockup: LockupState;
  registry: RegistryState;
};

export type CommonState = {
  isBootstrapped: boolean;
  walletProvider?: string;
  walletIsConnected: boolean;
  networkUrl?: string;
  ownedTokenAccounts: ProgramAccount<TokenAccount>[];
};

export type LockupState = {
  vestings: ProgramAccount<lockup.accounts.Vesting>[];
};

export type RegistryState = {
  entities: ProgramAccount<registry.accounts.Entity>[];
  member?: ProgramAccount<registry.accounts.Member>;
};

export const initialState: State = {
  common: {
    isBootstrapped: false,
    walletProvider: 'https://www.sollet.io',
    walletIsConnected: false,
    networkUrl: 'https://devnet.solana.com',
    ownedTokenAccounts: [],
  },
  lockup: {
    vestings: [],
  },
  registry: {
    entities: [],
  },
};

export type ProgramAccount<T> = {
  publicKey: PublicKey;
  account: T;
};
