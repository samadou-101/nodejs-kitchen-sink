import { useState } from "react";

type GoogleProfile = {
  name: string;
  email: string;
  avatar: string;
};

function parseJwtPayload(token: string): GoogleProfile | null {
  try {
    const payload = token.split(".")[1];
    const decoded = atob(payload);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

function getInitialState() {
  const params = new URLSearchParams(window.location.search);

  const token = params.get("token");
  const errMsg = params.get("error");

  window.history.replaceState({}, "", window.location.pathname);

  if (errMsg) {
    return {
      profile: null,
      error: errMsg,
    };
  }

  if (token) {
    const decoded = parseJwtPayload(token);

    return {
      profile: decoded,
      error: decoded ? null : "Invalid token",
    };
  }

  return {
    profile: null,
    error: null,
  };
}

function OAuth() {
  const initial = getInitialState();

  const [profile, setProfile] = useState<GoogleProfile | null>(initial.profile);
  const [error, setError] = useState<string | null>(initial.error);

  const handleLogin = async () => {
    const res = await fetch("http://localhost:3000/api/auth/oauth/google/url");
    const data = (await res.json()) as { url: string };
    window.location.href = data.url;
  };

  const handleLogout = () => {
    setProfile(null);
    setError(null);
  };

  if (error) {
    return (
      <div className="mx-auto my-8 max-w-md rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-red-600">Error: {error}</p>
        <button
          onClick={handleLogout}
          className="mt-4 rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (profile) {
    return (
      <div className="mx-auto my-8 max-w-md rounded-lg border p-6">
        <div className="flex flex-col items-center gap-4">
          <img
            src={profile.avatar}
            alt={profile.name}
            className="h-20 w-20 rounded-full"
          />
          <div className="text-center">
            <p className="text-lg font-semibold">{profile.name}</p>
            <p className="text-gray-500">{profile.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="rounded bg-gray-800 px-4 py-2 text-white hover:bg-gray-700"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto my-8 max-w-md rounded-lg border p-6 text-center">
      <button
        onClick={handleLogin}
        className="rounded bg-blue-500 px-6 py-3 text-white hover:bg-blue-600"
      >
        Login with Google
      </button>
    </div>
  );
}

export default OAuth;
