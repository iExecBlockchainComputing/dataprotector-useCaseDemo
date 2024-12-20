import { ProtectedData } from '@iexec/dataprotector';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import {
  AlertOctagon,
  AtSign,
  ChevronLeft,
  Link as LinkIcon,
  Plus,
  User,
} from 'react-feather';
import { Link, useParams } from 'react-router-dom';
import { CircularLoader } from '@/components/CircularLoader.tsx';
import { DocLink } from '@/components/DocLink.tsx';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import { Button } from '@/components/ui/button.tsx';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip.tsx';
import { getDataProtectorClient } from '@/externals/dataProtectorClient.ts';
import { getTypeOfProtectedData } from '@/utils/utils.ts';
import AuthorizedUsersList from './AuthorizedUsersList';
import GrantAccessModal from './GrantAccessModal';

export default function OneProtectedData() {
  const { protectedDataAddress } = useParams();

  const [protectedData, setProtectedData] = useState<ProtectedData>();
  const [goFetchProtectedData, setGoFetchProtectedData] = useState(false);

  //modal state
  const [modalOpen, setModalOpen] = useState(false);

  const queryClient = useQueryClient();

  useEffect(() => {
    const allProtectedData = queryClient.getQueryData<ProtectedData[]>([
      'myProtectedData',
    ]);
    const cachedProtectedData = allProtectedData?.find(
      (oneProtectedData) => oneProtectedData.address === protectedDataAddress
    );
    if (cachedProtectedData) {
      setProtectedData(cachedProtectedData);
    } else {
      setGoFetchProtectedData(true);
    }
  }, []);

  const {
    isLoading: isFetchingProtectedData,
    isError: isGetProtectedDataError,
    error: getProtectedDataError,
  } = useQuery({
    queryKey: ['oneProtectedData', protectedDataAddress],
    queryFn: async () => {
      const { dataProtector } = await getDataProtectorClient();
      const oneProtectedData = await dataProtector.getProtectedData({
        protectedDataAddress,
      });
      setProtectedData(oneProtectedData?.[0]);
      return oneProtectedData;
    },
    enabled: goFetchProtectedData,
  });

  const {
    data: hasSmsSecret,
    isSuccess: isSmsRequestSuccess,
    isError: isCheckSmsSecretError,
  } = useQuery({
    queryKey: ['oneProtectedDataSmsSecret', protectedDataAddress],
    queryFn: async () => {
      const { dataProtector } = await getDataProtectorClient();
      // @ts-expect-error 'iexec' is a protected field but that's fine
      return dataProtector.iexec.dataset.checkDatasetSecretExists(
        protectedData!.address
      );
    },
    enabled: !!protectedData,
  });

  const cid = protectedData?.multiaddr?.replace('/p2p/', '');

  return (
    <div>
      <div className="text-left">
        <Button asChild variant="text" size="sm">
          <Link to={`/protectedData`} className="pl-2">
            <ChevronLeft size="22" />
            <span className="pl-1">Back</span>
          </Link>
        </Button>
      </div>

      {!protectedData && isFetchingProtectedData && (
        <div className="flex flex-col items-center gap-y-4">
          <CircularLoader className="mt-10"></CircularLoader>
          Fetching your protected data...
        </div>
      )}

      {isGetProtectedDataError && (
        <Alert variant="error" className="mt-6">
          <AlertTitle>
            Oops, something went wrong while fetching your protected data.
          </AlertTitle>
          <AlertDescription>
            {getProtectedDataError.toString()}
          </AlertDescription>
        </Alert>
      )}

      {protectedData && (
        <div className="mt-4 rounded-md border border-grey-800/40 py-6 pl-3 pr-5 text-left">
          <ul className="flex flex-col gap-y-4 pl-6">
            <div className="flex items-center">
              <h2 className="m-0 -mb-1 flex-1">{protectedData.name}</h2>
              {isSmsRequestSuccess &&
                !hasSmsSecret &&
                !isCheckSmsSecretError && (
                  <div className="-mt-3">
                    <TooltipProvider delayDuration={0}>
                      <Tooltip>
                        <TooltipTrigger className="cursor-default">
                          <AlertOctagon size="24" className="text-red-500" />
                        </TooltipTrigger>
                        <TooltipContent side="left">
                          This protected data is probably unusable as{' '}
                          <strong>
                            its secret encryption key was
                            <br /> not found
                          </strong>{' '}
                          in the iExec Secret Management Service (SMS).
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                )}
            </div>
            <div>
              <Badge
                variant={
                  getTypeOfProtectedData(protectedData?.schema) ===
                  'Unknown type'
                    ? 'secondary'
                    : 'default'
                }
              >
                {getTypeOfProtectedData(protectedData?.schema)}
              </Badge>
            </div>
            <li
              className="flex items-center gap-x-1.5"
              data-cy="protected-data-address"
            >
              <AtSign size="18" aria-label="user-icon" />
              Protected Data Address: <strong>{protectedData?.address}</strong>
            </li>
            <li
              className="flex items-center gap-x-1.5"
              data-cy="protected-data-owner"
            >
              <User size="18" aria-label="user-icon" />
              Owned by: <strong>{protectedData?.owner}</strong>
            </li>
            <li className="flex items-center gap-x-1.5">
              <LinkIcon size="18" aria-label="user-icon" />
              IPFS link:{' '}
              {protectedData?.multiaddr ? (
                <>
                  <a
                    href={`https://ipfs-gateway.v8-bellecour.iex.ec/ipfs/${cid}`}
                    className="truncate text-link hover:underline"
                  >
                    {protectedData.multiaddr}
                  </a>
                  (encrypted content)
                </>
              ) : (
                <span>Multiaddr is undefined</span>
              )}
            </li>
          </ul>
        </div>
      )}

      <div className="my-10">
        <AuthorizedUsersList />

        <div className="mt-10 text-center">
          <Button
            data-cy="authorize-new-user-button"
            onClick={() => setModalOpen(true)}
            className="pl-4"
          >
            <Plus size="19" />
            <span className="pl-2">Authorize a new user</span>
          </Button>
        </div>

        <DocLink className="mt-20">
          dataprotector-sdk / Methods called in this page:
          <br />
          <div className="mt-1 pl-10">
            -{' '}
            <a
              href="https://beta.tools.docs.iex.ec/tools/dataProtector/dataProtectorCore/getGrantedAccess.html"
              target="_blank"
              rel="noreferrer"
              className="text-link hover:underline"
            >
              getGrantedAccess()
            </a>
          </div>
          <div className="mt-1 pl-10">
            -{' '}
            <a
              href="https://beta.tools.docs.iex.ec/tools/dataProtector/dataProtectorCore/grantAccess.html"
              target="_blank"
              rel="noreferrer"
              className="text-link hover:underline"
            >
              grantAccess()
            </a>
          </div>
          <div className="mt-1 pl-10">
            -{' '}
            <a
              href="https://beta.tools.docs.iex.ec/tools/dataProtector/dataProtectorCore/revokeOneAccess.html"
              target="_blank"
              rel="noreferrer"
              className="text-link hover:underline"
            >
              revokeOneAccess()
            </a>
          </div>
        </DocLink>

        {modalOpen && (
          <GrantAccessModal
            protectedData={protectedData!}
            open={modalOpen}
            onOpenChange={(open: boolean) => {
              if (!open) {
                setModalOpen(false);
              }
            }}
          />
        )}
      </div>
    </div>
  );
}
