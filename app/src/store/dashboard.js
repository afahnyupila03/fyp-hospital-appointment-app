"use client";

import { useEffect } from "react";

const { useRouter } = require("next/router");
const { AppState } = require("./context");

export default function Dashboard() {
  const { user } = AppState();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/auth/admin");
    }
  }, [user]);

  return <div>Welcome, {user?.name}</div>;
}
