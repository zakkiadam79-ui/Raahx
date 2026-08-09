// src/pages/SecretAdminLogin.tsx
import React, { useState } from "react";

interface Props {
  onLoginSuccess: () => void;
}

export default function SecretAdminLogin({ onLoginSuccess }: Props) {
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState(false);

  // Set your secret local passcode here
  const SECRET_PASSCODE = "admin123";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === SECRET_PASSCODE) {
      localStorage.setItem("raahx_admin_auth", "true");
      onLoginSuccess();
    } else {
      setError(true);
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
                setError(false);
              }}
              placeholder="Passcode"
              className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#2DD4BF]"
            />
            {error && <p className="text-red-400 text-xs mt-2">Incorrect passcode</p>}
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#14B8A6] hover:bg-[#0d9488] text-white font-semibold rounded-xl transition-colors"
          >
            Authenticate
          </button>
        </form>
      </div>
    </div>
  );
}