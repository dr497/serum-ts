import { PublicKey } from '@solana/web3.js';

type Networks = {
  devnet: Network;
  localhost: Network;
};

export type Network = {
  // Cluster.
  url: string;
  explorerClusterSuffix: string;

  // Mints and god accounts.
  srm: PublicKey;
  msrm: PublicKey;
  god: PublicKey;
  megaGod: PublicKey;

  // Registry.
  registryProgramId: PublicKey;
  stakeProgramId: PublicKey;
  registrar: PublicKey;
  retbuf: PublicKey;

  // Lockup.
  lockupProgramId: PublicKey;
  safe: PublicKey;
};

export const networks: Networks = {
  devnet: {
    url: 'https://devnet.solana.com',
    explorerClusterSuffix: 'devnet',
    // Mints and god accounts.
    srm: new PublicKey('2gsgrFTjFsckJiPifzkHP3tznMuqVbh5TTUcVd3iMVQx'),
    msrm: new PublicKey('4gq1S2B4yheTmvy61oArkBqZx7iCid6pvYbn242epFCk'),
    god: new PublicKey('9PRbiYDXcFig3C6cu7VBFuypqbaPfqdq8knY85AgvrKw'),
    megaGod: new PublicKey('dMyk9X7KjyHFAhdDNyEad9k2SaUMQ8Yy42CjMxZfi4V'),
    // Registry.
    registryProgramId: new PublicKey(
      'HM7psK4cwnn7DXmzhRPbABB9vcA5UR4jLgBwGx98Ntqj',
    ),
    stakeProgramId: new PublicKey(
      'FFXx3NM8fXxa4TainZ5o26xrzLuoZQCMZ238cyQGmX8H',
    ),
    registrar: new PublicKey('AraER5NbsTzDQV2h6gGz3b7WHfYAejQQbKdn9aSHaqKi'),
    retbuf: new PublicKey('FR6hFjWLLnwtk7f3MmVnTGgejT77sgE3FdY5MsbNBqVr'),
    // Lockup.
    lockupProgramId: new PublicKey(
      'Fp39W9Ed7Y8YQm4FmgPED62Y2gB5rVHm5aSdswECkdWp',
    ),
    safe: new PublicKey('A85rfmwbGqTKDXZoiVrYNNFbMPoud2sWeAb2HetfmAMB'),
  },
  // Fill in with your local cluster addresses.
  localhost: {
    url: 'http://localhost:8899',
    explorerClusterSuffix: 'localhost',
    // Mints and god accounts.
    srm: new PublicKey('2gsgrFTjFsckJiPifzkHP3tznMuqVbh5TTUcVd3iMVQx'),
    msrm: new PublicKey('4gq1S2B4yheTmvy61oArkBqZx7iCid6pvYbn242epFCk'),
    god: new PublicKey('9PRbiYDXcFig3C6cu7VBFuypqbaPfqdq8knY85AgvrKw'),
    megaGod: new PublicKey('dMyk9X7KjyHFAhdDNyEad9k2SaUMQ8Yy42CjMxZfi4V'),
    // Registry
    registryProgramId: new PublicKey(
      'HM7psK4cwnn7DXmzhRPbABB9vcA5UR4jLgBwGx98Ntqj',
    ),
    stakeProgramId: new PublicKey(
      'FFXx3NM8fXxa4TainZ5o26xrzLuoZQCMZ238cyQGmX8H',
    ),
    registrar: new PublicKey('AraER5NbsTzDQV2h6gGz3b7WHfYAejQQbKdn9aSHaqKi'),
    retbuf: new PublicKey('FR6hFjWLLnwtk7f3MmVnTGgejT77sgE3FdY5MsbNBqVr'),
    // Lockup.
    lockupProgramId: new PublicKey(
      'Fp39W9Ed7Y8YQm4FmgPED62Y2gB5rVHm5aSdswECkdWp',
    ),
    safe: new PublicKey('A85rfmwbGqTKDXZoiVrYNNFbMPoud2sWeAb2HetfmAMB'),
  },
};
