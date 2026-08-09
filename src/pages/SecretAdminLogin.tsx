import React, { useState } from "react";

interface Props {
  onLoginSuccess: () => void;
}

interface LoginResponse {
  authenticated?: boolean;
}

export default function SecretAdminLogin({ onLoginSuccess }: Props) {
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ secret: passcode }),
      });

      let data: LoginResponse = {};
      try {
        data = (await response.json()) as LoginResponse;
      } catch {
        // Keep the client-side error generic if the server did not return JSON.
      }

      if (response.status === 401) {
        setError("Incorrect passcode");
        return;
      }

      if (response.status === 429) {
        setError("Too many attempts. Please try again later.");
        return;
      }

      if (!response.ok || data.authenticated !== true) {
        setError("Admin authentication is temporarily unavailable.");
        return;
      }

      onLoginSuccess();
    } catch {
      setError("Unable to contact the authentication server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D2B24] flex items-center justify-center px-4">
      <div className="bg-[#123832] border border-white/10 p-8 rounded-2xl max-w-md w-full shadow-2xl">
        <h1 className="text-2xl font-bold text-white text-center mb-2">Portal Access</h1>
        <p className="text-sm text-gray-400 text-center mb-6">Enter authorized access key</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              value={passcode}
              onChange={(e) => {
                setPasscode(e.target.value);
                setError(null);
              }}
              placeholder="Passcode"
              autoComplete="current-password"
              disabled={isSubmitting}
              className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#2DD4BF] disabled:opacity-60"
            />
            {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-[#14B8A6] hover:bg-[#0d9488] text-white font-semibold rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Authenticating..." : "Authenticate"}
          </button>
        </form>
      </div>
    </div>
  );
}
