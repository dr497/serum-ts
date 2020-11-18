import { Action, ActionType } from './actions';
import { PublicKey } from '@solana/web3.js';
import { AccountInfo as TokenAccount, MintInfo } from '@solana/spl-token';
import * as lockup from '@project-serum/lockup';
import * as registry from '@project-serum/registry';
import { PoolState } from '@project-serum/pool';

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
    case ActionType.ConsumeLoginOnceToken:
      newState.common.loginOnceToken = false;
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
    case ActionType.RegistrySetPools:
      newState.registry.pool = action.item.pool;
      newState.registry.poolTokenMint = action.item.poolTokenMint;
      newState.registry.poolVault = action.item.poolVault;
      newState.registry.megaPool = action.item.megaPool;
      newState.registry.megaPoolTokenMint = action.item.megaPoolTokenMint;
      newState.registry.megaPoolVaults = action.item.megaPoolVaults;
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
  loginOnceToken: boolean;
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
  pool?: ProgramAccount<PoolState>;
  poolTokenMint?: ProgramAccount<MintInfo>;
  poolVault?: ProgramAccount<TokenAccount>;
  megaPool?: ProgramAccount<PoolState>;
  megaPoolTokenMint?: ProgramAccount<MintInfo>;
  megaPoolVaults?: ProgramAccount<TokenAccount>[];
};

export const initialState: State = {
  common: {
    loginOnceToken: true,
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
