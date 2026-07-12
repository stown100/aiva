import { AppHeader } from "@/widgets/app-header";
import { SignInCard } from "@/features/sign-in";

interface AuthPageProps {
  initialError?: boolean;
}

export function AuthPage({ initialError }: AuthPageProps) {
  return (
    <>
      <AppHeader />
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <SignInCard initialError={initialError} />
      </main>
    </>
  );
}
