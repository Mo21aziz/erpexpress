import React from "react";
import { API_BASE_URL } from "../../api/config";

const EnvironmentInfo: React.FC = () => {
  const isDevelopment = import.meta.env.DEV;
  const environment = import.meta.env.MODE;

  return (
    <div className="p-4 bg-gray-100 rounded-lg mb-4">
      <h3 className="text-lg font-semibold mb-2">Environment Information</h3>
      <div className="space-y-2 text-sm">
        <div>
          <strong>Environment:</strong> {environment}
        </div>
        <div>
          <strong>Development Mode:</strong> {isDevelopment ? "Yes" : "No"}
        </div>
        <div>
          <strong>API Base URL:</strong> {API_BASE_URL}
        </div>
        <div>
          <strong>Environment Variable:</strong>{" "}
          {import.meta.env.VITE_API_BASE_URL || "Not set (using fallback)"}
        </div>
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded border-l-4 border-blue-400">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> To change the API URL, create a
          `.env.development` file in your `web/` directory with:
          <code className="block mt-1 bg-blue-100 p-1 rounded">
            VITE_API_BASE_URL=http://localhost:5000
          </code>
        </p>
      </div>
    </div>
  );
};

export default EnvironmentInfo;
