import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/auth.service';

const Dashboard = () => {
  const { user, token, setUser, logout } = useAuth();
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [isVerifyingPhone, setIsVerifyingPhone] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [is2FAEnabled, setIs2FAEnabled] = useState(user?.is2FAEnabled || false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });
  const [error, setError] = useState<string | null>(null);

  const handleNameUpdate = async () => {
    try {
      setError(null);
      const response = await authService.updateName(formData.name, token!);
      setUser(response.user);
      setIsEditingName(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update name');
    }
  };

  const handlePhoneUpdate = async () => {
    try {
      setError(null);
      const response = await authService.updatePhone(formData.phone, token!);
      setUser(response.user);
      setIsEditingPhone(false);
      // Reset phone verification status
      setIsVerifyingPhone(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update phone');
    }
  };

  const handlePhoneVerification = async () => {
    try {
      setError(null);
      const response = await authService.verifyPhone(verificationCode, token!);
      setUser(response.user);
      setIsVerifyingPhone(false);
      setVerificationCode('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify phone');
    }
  };

  const toggle2FA = async () => {
    try {
      setError(null);
      const response = await authService.toggle2FA(!is2FAEnabled, token!);
      setUser(response.user);
      setIs2FAEnabled(response.user.is2FAEnabled);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle 2FA');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
            </div>
            <div className="flex items-center">
              <button
                onClick={logout}
                className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Information</h2>

            {/* Name Field */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <div className="mt-1 flex items-center">
                {isEditingName ? (
                  <>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="flex-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                    <button
                      onClick={handleNameUpdate}
                      className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setIsEditingName(false)}
                      className="ml-2 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-gray-900">{user?.name}</span>
                    <button
                      onClick={() => setIsEditingName(true)}
                      className="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Edit
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Email Field */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <div className="mt-1 flex items-center">
                <span className="flex-1 text-gray-900">{user?.email}</span>
                <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user?.isEmailVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                  {user?.isEmailVerified ? 'Verified' : 'Unverified'}
                </span>
              </div>
            </div>

            {/* Phone Field */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700">Phone Number</label>
              <div className="mt-1 flex items-center">
                {isEditingPhone ? (
                  <>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="flex-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                    <button
                      onClick={handlePhoneUpdate}
                      className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setIsEditingPhone(false)}
                      className="ml-2 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-gray-900">{user?.phone || 'Null'}</span>
                    <button
                      onClick={() => setIsEditingPhone(true)}
                      className="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Edit
                    </button>
                  </>
                )}
              </div>
              {user?.phone && !user?.isPhoneVerified && (
                <div className="mt-2">
                  <button
                    onClick={() => setIsVerifyingPhone(true)}
                    className="text-sm text-blue-600 hover:text-blue-500"
                  >
                    Verify phone number
                  </button>
                </div>
              )}
            </div>

            {/* Phone Verification Modal */}
            {isVerifyingPhone && (
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
                <div className="bg-white rounded-lg p-6 max-w-md w-full">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Verify Phone Number</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Enter the verification code sent to your phone number
                  </p>
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="Enter verification code"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm mb-4"
                  />
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setIsVerifyingPhone(false)}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handlePhoneVerification}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Verify
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 2FA Toggle */}
            {user?.isPhoneVerified && (
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Two-Factor Authentication</label>
                    <p className="text-sm text-gray-500">Use your phone number for additional security</p>
                  </div>
                  <button
                    onClick={toggle2FA}
                    className={`${is2FAEnabled ? 'bg-blue-600' : 'bg-gray-200'
                      } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                  >
                    <span
                      className={`${is2FAEnabled ? 'translate-x-5' : 'translate-x-0'
                        } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                    />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {error && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
    </div>
  );
};

export default Dashboard; 