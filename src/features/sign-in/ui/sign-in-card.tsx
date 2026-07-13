"use client";

import { MailCheck, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

import { SignInStatus, useSignIn } from "../model/use-sign-in";
import { GoogleIcon } from "./google-icon";

interface SignInCardProps {
  initialError?: boolean;
}

export function SignInCard({ initialError = false }: SignInCardProps) {
  const t = useTranslations("auth");
  const { status, sentTo, sendMagicLink, signInWithGoogle, reset } = useSignIn();
  const [email, setEmail] = useState("");

  const showError =
    status === SignInStatus.ERROR || (initialError && status === SignInStatus.IDLE);

  if (status === SignInStatus.SENT && sentTo) {
    return (
      <Card className="w-full max-w-sm text-center">
        <CardContent className="flex flex-col items-center pt-6">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <MailCheck className="size-7" aria-hidden />
          </div>
          <h1 className="mt-4 text-xl font-bold">{t("sentTitle")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("sentDescription", { email: sentTo })}
          </p>
          <Button variant="ghost" className="mt-6" onClick={reset}>
            {t("tryAgain")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center">
        <div className="bg-brand-gradient mx-auto flex size-12 items-center justify-center rounded-2xl text-white">
          <Sparkles className="size-6" aria-hidden />
        </div>
        <CardTitle className="mt-3 text-2xl">{t("title")}</CardTitle>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          variant="outline"
          className="h-11 w-full gap-2"
          disabled={status === SignInStatus.SENDING}
          onClick={() => void signInWithGoogle()}
        >
          <GoogleIcon className="size-4" />
          {t("google")}
        </Button>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          {t("or")}
          <span className="h-px flex-1 bg-border" />
        </div>

        <form
          className="space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            void sendMagicLink(email);
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="sign-in-email">{t("emailLabel")}</Label>
            <Input
              id="sign-in-email"
              type="email"
              required
              autoComplete="email"
              placeholder={t("emailPlaceholder")}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-11"
            />
          </div>

          {showError && <p className="text-sm text-destructive">{t("error")}</p>}

          <Button
            type="submit"
            className="bg-brand-gradient h-11 w-full border-0 text-white"
            disabled={status === SignInStatus.SENDING || email.length === 0}
          >
            {status === SignInStatus.SENDING ? t("sending") : t("sendLink")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
