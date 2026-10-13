"use client";

import { useState } from "react";

import SignInForm from "@/components/sign-in-form";
import SignUpForm from "@/components/sign-up-form";

export function LoginTabs({ next }: { next?: string }) {
  const [showSignIn, setShowSignIn] = useState(false);

  return showSignIn ? (
    <SignInForm next={next} onSwitchToSignUp={() => setShowSignIn(false)} />
  ) : (
    <SignUpForm next={next} onSwitchToSignIn={() => setShowSignIn(true)} />
  );
}
