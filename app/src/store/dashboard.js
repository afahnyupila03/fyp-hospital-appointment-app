"use client";

import { useEffect } from "react";

const { useRouter } = require("next/router");
const { AppState } = require("./context");

export default function Dashboard() {
  const { user } = AppState();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/admin/auth");
    }
  }, [user]);

  return <div>Welcome, {user?.name}</div>;
}
