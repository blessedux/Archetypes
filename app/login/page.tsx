"use client";

import { ConnectWallet } from "@thirdweb-dev/react";

export default function Login() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black">
      <div className="text-2xl font-bold mb-8 text-white">
        Archetypes of the Collective Unconscious
      </div>
      <ConnectWallet
        theme="dark"
        modalSize="compact"
        welcomeScreen={{
          title: "Welcome to our app",
          subtitle: "Connect your wallet to get started",
        }}
        modalTitleIconUrl=""
        auth={{
          loginOptional: false,
        }}
        switchToActiveChain={true}
        modalTitle="Connect Wallet"
        termsOfServiceUrl=""
        privacyPolicyUrl=""
      />
    </div>
  );
}
