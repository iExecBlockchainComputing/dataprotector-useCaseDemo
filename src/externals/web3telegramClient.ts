import { useUserStore } from '@/stores/user.store.ts';
import { IExecWeb3telegram } from '@iexec/web3telegram';
import { Eip1193Provider } from 'ethers';
import { type Connector } from 'wagmi';

let web3telegram: IExecWeb3telegram | null = null;

export function cleanWeb3telegramSDK() {
  web3telegram = null;
}

export async function initWeb3telegramSDK({
  connector,
}: {
  connector?: Connector;
}) {
  const provider = (await connector?.getProvider()) as Eip1193Provider;
  if (!provider) {
    cleanWeb3telegramSDK();
    return;
  }

  // --- With debug SMS
  const iexecOptions = {
    smsURL: 'https://sms.scone-debug.v8-bellecour.iex.ec',
  };
  web3telegram = new IExecWeb3telegram(provider, { iexecOptions });
  console.log('👉 Using debug SMS');

  // --- With prod SMS
  // web3telegram = new IExecWeb3telegram(provider);
  // console.log('👉 Using prod SMS');
}

export async function getWeb3telegramClient(): Promise<{
  web3telegram: IExecWeb3telegram;
}> {
  if (!web3telegram) {
    const connector = useUserStore.getState().connector;
    await initWeb3telegramSDK({ connector });
  }
  if (!web3telegram) {
    throw new Error('IExecWeb3telegram is not initialized');
  }
  return { web3telegram };
}
