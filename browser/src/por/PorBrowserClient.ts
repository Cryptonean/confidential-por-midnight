import * as CompiledContract from '@midnight-ntwrk/compact-js/effect/CompiledContract';
import {
  deployContract,
  findDeployedContract,
  getPublicStates,
} from '@midnight-ntwrk/midnight-js-contracts';
import type { WitnessInputs } from '../browser-circuit/witnesses.js';
import { makeWitnesses } from '../browser-circuit/witnesses.js';
import { Contract, ledger } from '@por/contract-gen';
import type { PorProviders } from '../providers/buildBrowserProviders';
import { describeLaceTxError } from '../wallet/walletReadiness';

export interface DeployResult {
  contractAddress: string;
  deployTxId: string;
  blockHeight: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  deployed: any;
}

export interface SubmitProofResult {
  txId: string;
  blockHeight: number;
}

export interface SolvencyState {
  solvent: boolean;
  published: boolean;
  reservesSnapshot: bigint;
  reservesSlot: bigint;
  owner: Uint8Array;
  liabilitiesRoot: Uint8Array;
}

function buildCompiledContract(witnessInputs: WitnessInputs) {
  const witnesses = makeWitnesses(witnessInputs);
  return CompiledContract.make('por', Contract as never).pipe(
    CompiledContract.withWitnesses(witnesses as never),
  );
}

export async function deployPorContract(
  providers: PorProviders,
  witnessInputs: WitnessInputs,
): Promise<DeployResult> {
  try {
    const compiledContract = buildCompiledContract(witnessInputs);
    const deployed = await deployContract(providers as never, {
      compiledContract,
      privateStateId: 'porState',
      initialPrivateState: {},
    } as never);

    return {
      contractAddress: deployed.deployTxData.public.contractAddress as string,
      deployTxId: deployed.deployTxData.public.txId as string,
      blockHeight: deployed.deployTxData.public.blockHeight as number,
      deployed,
    };
  } catch (error) {
    throw describeLaceTxError(error, 'deploy');
  }
}

export async function joinPorContract(
  providers: PorProviders,
  contractAddress: string,
  witnessInputs: WitnessInputs,
): Promise<DeployResult> {
  try {
    const compiledContract = buildCompiledContract(witnessInputs);
    const deployed = await findDeployedContract(providers as never, {
      contractAddress,
      compiledContract,
      privateStateId: 'porState',
      initialPrivateState: {},
    } as never);

    return {
      contractAddress,
      deployTxId: '',
      blockHeight: 0,
      deployed,
    };
  } catch (error) {
    throw describeLaceTxError(error, 'deploy');
  }
}

const JOIN_TIMEOUT_MS = 60_000;

export async function joinPorContractWithTimeout(
  providers: PorProviders,
  contractAddress: string,
  witnessInputs: WitnessInputs,
  timeoutMs = JOIN_TIMEOUT_MS,
): Promise<DeployResult> {
  return Promise.race([
    joinPorContract(providers, contractAddress, witnessInputs),
    new Promise<never>((_, reject) => {
      setTimeout(
        () =>
          reject(
            new Error(
              `Timed out rejoining contract after ${timeoutMs / 1000}s (indexer sync can be slow). ` +
                'Click Rejoin contract or Deploy fresh.',
            ),
          ),
        timeoutMs,
      );
    }),
  ]);
}

export async function submitPorProof(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  deployed: any,
  reserves: bigint,
  slot: bigint,
): Promise<SubmitProofResult> {
  try {
    const callRes = await deployed.callTx.proveSolvency(reserves, slot);
    return {
      txId: callRes.public.txId as string,
      blockHeight: callRes.public.blockHeight as number,
    };
  } catch (error) {
    throw describeLaceTxError(error, 'prove');
  }
}

export async function readPorState(
  providers: PorProviders,
  contractAddress: string,
): Promise<SolvencyState> {
  const pub = await getPublicStates(providers.publicDataProvider, contractAddress);
  const led = ledger((pub?.contractState as { data: unknown }).data as never);
  return {
    solvent: led.solvent,
    published: led.published,
    reservesSnapshot: led.reservesSnapshot,
    reservesSlot: led.reservesSlot,
    owner: led.owner,
    liabilitiesRoot: led.liabilitiesRoot,
  };
}

export function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function formatLovelace(lovelace: bigint): string {
  const whole = lovelace / 1_000_000n;
  const frac = lovelace % 1_000_000n;
  if (frac === 0n) return `${whole} ADA`;
  return `${whole}.${frac.toString().padStart(6, '0').replace(/0+$/, '')} ADA`;
}
