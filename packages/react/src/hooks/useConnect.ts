import { useCallback, useEffect, useState } from "react";
import { AppClient, ConnectError } from "@farcaster/connect";
import QRCode from "qrcode";

interface UseConnectArgs {
  siweUri: string;
  domain: string;
  appClient?: AppClient;
}

function useConnect(args: UseConnectArgs) {
  const { appClient, siweUri, domain } = args;

  const [qrCodeURI, setQrCodeURI] = useState<string>();
  const [enabled, setEnabled] = useState<boolean>(false);
  const [channelToken, setChannelToken] = useState<string>();
  const [connectURI, setConnectURI] = useState<string>();
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<ConnectError>();

  const resetState = async () => {
    setChannelToken(undefined);
    setIsError(false);
    setIsSuccess(false);
    setError(undefined);
  };

  const connect = useCallback(async () => {
    if (appClient && !channelToken) {
      const {
        data,
        isError: isConnectError,
        error: connectError,
      } = await appClient.connect({
        siweUri,
        domain,
      });
      if (isConnectError) {
        console.log(connectError);
        setIsError(true);
        setError(connectError);
      } else {
        setChannelToken(data.channelToken);
        setConnectURI(data.connectURI);
        setIsSuccess(true);
      }
    }
  }, [appClient, domain, siweUri, channelToken]);

  const reconnect = useCallback(async () => {
    await resetState();
    connect();
  }, [connect]);

  const generateQRCode = useCallback(async () => {
    if (connectURI) {
      const qrCode = await QRCode.toDataURL(connectURI);
      setQrCodeURI(qrCode);
    }
  }, [connectURI]);

  useEffect(() => {
    if (connectURI) {
      generateQRCode();
    }
  }, [connectURI, generateQRCode]);

  useEffect(() => {
    if (enabled) {
      connect();
    }
  }, [enabled, connect]);

  return {
    connect: () => setEnabled(true),
    reconnect,
    isSuccess,
    isError,
    error,
    data: { channelToken, connectURI, qrCodeURI },
  };
}

export default useConnect;