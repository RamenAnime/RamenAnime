import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router";
import { trpc } from "@/providers/trpc";

export default function VerifyEmail() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const token = params.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState(t("verifyEmail.verifying"));

  const verifyQuery = trpc.auth.verifyEmail.useQuery(
    { token: token ?? "" },
    { enabled: !!token, retry: false }
  );

  useEffect(() => {
    if (verifyQuery.data) {
      if (verifyQuery.data.verified) {
        setStatus("success");
        setMessage(verifyQuery.data.message);
      } else {
        setStatus("error");
        setMessage(verifyQuery.data.message);
      }
    }
    if (verifyQuery.error) {
      setStatus("error");
      setMessage(verifyQuery.error.message);
    }
  }, [verifyQuery.data, verifyQuery.error]);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage(t("verifyEmail.invalidLink"));
    }
  }, [token, t]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        {status === "loading" && <p>{message}</p>}
        {status === "success" && <p className="text-green-600">{message}</p>}
        {status === "error" && <p className="text-red-600">{message}</p>}
      </div>
    </div>
  );
}
