import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { 
  Camera, 
  CameraOff, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Search, 
  Users, 
  Building, 
  Tag, 
  Clock, 
  RefreshCw,
  Volume2,
  VolumeX,
  Zap,
  ArrowRight
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { performCheckIn } from '../../lib/storage';
import { soundFX } from '../../lib/audio';
import { formatDateTime } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export function QRScannerView({ onCheckInSuccess }) {
  const { adminUser } = useAuth();
  const { info: toastInfo } = useToast();
  
  const [isScanning, setIsScanning] = useState(false);
  const [cameras, setCameras] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [torchOn, setTorchOn] = useState(false);
  
  // Verification Result State: { status: 'SUCCESS' | 'ALREADY_CHECKED_IN' | 'INVALID', record, message }
  const [scanResult, setScanResult] = useState(null);
  const [manualCode, setManualCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [recentScans, setRecentScans] = useState([]);

  const html5QrCodeRef = useRef(null);
  const scannerContainerId = 'reader-qr-container';

  // Discover cameras on mount
  useEffect(() => {
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length) {
          setCameras(devices);
          // Prefer back/environment camera if available
          const backCam = devices.find(d => 
            d.label.toLowerCase().includes('back') || 
            d.label.toLowerCase().includes('rear') || 
            d.label.toLowerCase().includes('environment')
          );
          setSelectedCameraId(backCam ? backCam.id : devices[0].id);
        }
      })
      .catch((err) => {
        console.warn('Unable to get cameras:', err);
      });

    return () => {
      stopScanner();
    };
  }, []);

  const startScanner = async (cameraId) => {
    try {
      const targetCam = cameraId || selectedCameraId;
      if (!targetCam) {
        toastInfo('No camera selected or detected. Please use manual code lookup below.');
        return;
      }

      if (html5QrCodeRef.current) {
        await stopScanner();
      }

      const qrCodeScanner = new Html5Qrcode(scannerContainerId);
      html5QrCodeRef.current = qrCodeScanner;

      await qrCodeScanner.start(
        targetCam,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        onScanSuccess,
        onScanFailure
      );

      setIsScanning(true);
    } catch (err) {
      console.error('Error starting scanner:', err);
      setIsScanning(false);
      toastInfo('Camera access failed. Ensure permission is granted or use manual entry.');
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        await html5QrCodeRef.current.clear();
      } catch (e) {
        console.warn('Error stopping scanner:', e);
      }
      html5QrCodeRef.current = null;
    }
    setIsScanning(false);
  };

  const handleCameraChange = async (e) => {
    const newId = e.target.value;
    setSelectedCameraId(newId);
    if (isScanning) {
      await stopScanner();
      startScanner(newId);
    }
  };

  // Scanner callbacks
  const onScanSuccess = async (decodedText) => {
    if (isProcessing) return;
    processCode(decodedText);
  };

  const onScanFailure = (error) => {
    // ignore frame drop errors
  };

  const processCode = async (code) => {
    if (!code || isProcessing) return;
    setIsProcessing(true);

    try {
      const staffName = adminUser?.name || 'Gate Staff';
      const res = await performCheckIn(code, staffName);
      
      setScanResult(res);

      // Play audio feedback
      if (soundEnabled) {
        if (res.status === 'SUCCESS') {
          soundFX.playSuccess();
        } else if (res.status === 'ALREADY_CHECKED_IN') {
          soundFX.playWarning();
        } else {
          soundFX.playError();
        }
      }

      // Add to recent scans log
      if (res.record) {
        setRecentScans(prev => [
          {
            ...res.record,
            scanStatus: res.status,
            scanTime: new Date().toISOString()
          },
          ...prev.slice(0, 9)
        ]);
      }

      if (res.status === 'SUCCESS' && onCheckInSuccess) {
        onCheckInSuccess(res.record);
      }
    } catch (err) {
      console.error('Check-in process error:', err);
      setScanResult({
        status: 'INVALID',
        message: 'An error occurred during verification.'
      });
      if (soundEnabled) soundFX.playError();
    } finally {
      // Pause slightly before allowing next scan to prevent rapid repeats
      setTimeout(() => {
        setIsProcessing(false);
      }, 1500);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    processCode(manualCode.trim());
    setManualCode('');
  };

  return (
    <div className="space-y-6">
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Camera Scanner & Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-card space-y-4">
            
            {/* Header & Controls */}
            <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-brand-50 text-brand-600">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-slate-900">QR Gate Scanner</h3>
                  <p className="text-xs text-slate-400">Position visitor pass QR code in frame</p>
                </div>
              </div>

              {/* Sound & Toggle buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`p-2 rounded-xl border transition-colors ${
                    soundEnabled 
                      ? 'bg-slate-100 text-slate-700 border-slate-200' 
                      : 'bg-rose-50 text-rose-600 border-rose-200'
                  }`}
                  title={soundEnabled ? 'Mute sound FX' : 'Enable sound FX'}
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>

                {isScanning ? (
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={stopScanner}
                    icon={CameraOff}
                    className="text-xs font-bold"
                  >
                    Stop Camera
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => startScanner()}
                    icon={Camera}
                    className="text-xs font-bold"
                  >
                    Start Camera
                  </Button>
                )}
              </div>
            </div>

            {/* Camera Selector Dropdown */}
            {cameras.length > 1 && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-400">Camera:</span>
                <select
                  value={selectedCameraId}
                  onChange={handleCameraChange}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-brand-500 flex-1 font-medium"
                >
                  {cameras.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label || `Camera ${c.id.substring(0, 5)}...`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Live Camera View Box */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-square max-h-[380px] mx-auto flex items-center justify-center border-4 border-slate-900 shadow-inner">
              <div id={scannerContainerId} className="w-full h-full"></div>
              
              {!isScanning && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white bg-slate-900/95 space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-brand-400">
                    <Camera className="w-8 h-8 opacity-80" />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-base text-white">Camera Standby</h4>
                    <p className="text-xs text-slate-400 max-w-xs mt-1">
                      Click 'Start Camera' to open your webcam or mobile camera for fast barcode scanning.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => startScanner()}
                    className="text-xs font-bold"
                  >
                    Activate Camera
                  </Button>
                </div>
              )}

              {/* Scanning visual overlay frame */}
              {isScanning && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-60 h-60 border-2 border-brand-400/80 rounded-2xl relative">
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-brand-500 -mt-1 -ml-1 rounded-tl-lg"></div>
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-brand-500 -mt-1 -mr-1 rounded-tr-lg"></div>
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-brand-500 -mb-1 -ml-1 rounded-bl-lg"></div>
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-brand-500 -mb-1 -mr-1 rounded-br-lg"></div>
                    <div className="absolute left-2 right-2 h-0.5 bg-brand-500 scanner-laser shadow-glow"></div>
                  </div>
                </div>
              )}
            </div>

            {/* Manual Lookup Input (Fallback / Instant Search) */}
            <div className="pt-3 border-t border-slate-100">
              <form onSubmit={handleManualSubmit} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Manual Entry: Enter Pass ID (e.g. OZ26-48921) or Mobile Number..."
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 font-mono"
                  />
                </div>
                <Button
                  type="submit"
                  variant="dark"
                  size="md"
                  disabled={!manualCode.trim() || isProcessing}
                  className="font-bold text-xs"
                >
                  Verify
                </Button>
              </form>
            </div>

          </div>

        </div>

        {/* Right Column: Instant Verification Feedback Card (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Main Feedback State Display */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-card min-h-[380px] flex flex-col justify-between">
            
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">
                Scan Verification Status
              </span>

              {scanResult ? (
                <div className="space-y-4 animate-fadeIn">
                  
                  {/* Status 1: SUCCESS (Valid & Marked Checked-In) */}
                  {scanResult.status === 'SUCCESS' && (
                    <div className="p-5 rounded-2xl bg-emerald-50 border-2 border-emerald-500 text-emerald-950 space-y-4 shadow-lg shadow-emerald-500/10">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 shadow-md">
                          <CheckCircle2 className="w-7 h-7" />
                        </div>
                        <div>
                          <span className="text-[11px] font-extrabold uppercase tracking-wider bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded">
                            Verified & Admitted
                          </span>
                          <h4 className="font-display font-extrabold text-xl text-emerald-900 mt-0.5">
                            {scanResult.record?.full_name}
                          </h4>
                        </div>
                      </div>

                      <div className="p-3.5 bg-white/90 rounded-xl border border-emerald-200 text-xs space-y-2 text-slate-800">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500">Pass ID:</span>
                          <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                            {scanResult.record?.registration_id}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500">Category:</span>
                          <Badge variant="brand">{scanResult.record?.business_category}</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500">Total Persons:</span>
                          <span className="font-bold text-slate-900">
                            {scanResult.record?.number_of_visitors || 1} Visitor(s)
                          </span>
                        </div>
                        {scanResult.record?.company_name && (
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500">Company:</span>
                            <span className="font-semibold text-slate-800 truncate max-w-[160px]">
                              {scanResult.record?.company_name}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between items-center pt-1 border-t border-slate-100">
                          <span className="text-slate-500">Check-in Time:</span>
                          <span className="font-bold text-emerald-700">
                            {formatDateTime(scanResult.record?.checked_in_at || new Date().toISOString())}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs font-semibold text-emerald-800 text-center">
                        ✨ Access Granted! Welcome to ONEZONE 2K26.
                      </p>
                    </div>
                  )}

                  {/* Status 2: ALREADY CHECKED IN (Warning) */}
                  {scanResult.status === 'ALREADY_CHECKED_IN' && (
                    <div className="p-5 rounded-2xl bg-amber-50 border-2 border-amber-500 text-amber-950 space-y-4 shadow-lg shadow-amber-500/10">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-md">
                          <AlertTriangle className="w-7 h-7" />
                        </div>
                        <div>
                          <span className="text-[11px] font-extrabold uppercase tracking-wider bg-amber-200 text-amber-900 px-2 py-0.5 rounded">
                            Pass Already Used
                          </span>
                          <h4 className="font-display font-extrabold text-xl text-amber-900 mt-0.5">
                            {scanResult.record?.full_name}
                          </h4>
                        </div>
                      </div>

                      <div className="p-3.5 bg-white/90 rounded-xl border border-amber-200 text-xs space-y-2 text-slate-800">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500">Pass ID:</span>
                          <span className="font-mono font-bold text-slate-900">
                            {scanResult.record?.registration_id}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500">Originally Checked-In:</span>
                          <span className="font-bold text-amber-800">
                            {formatDateTime(scanResult.previousCheckInTime || scanResult.record?.checked_in_at || scanResult.record?.updated_at)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500">Verified By:</span>
                          <span className="font-medium text-slate-700">
                            {scanResult.record?.checked_in_by || 'Gate Staff'}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs font-bold text-amber-900 bg-amber-100 p-2.5 rounded-lg text-center">
                        ⚠️ Caution: This pass has already been admitted at the gate.
                      </p>
                    </div>
                  )}

                  {/* Status 3: INVALID / NOT FOUND */}
                  {scanResult.status === 'INVALID' && (
                    <div className="p-5 rounded-2xl bg-rose-50 border-2 border-rose-500 text-rose-950 space-y-4 shadow-lg shadow-rose-500/10">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center flex-shrink-0 shadow-md">
                          <XCircle className="w-7 h-7" />
                        </div>
                        <div>
                          <span className="text-[11px] font-extrabold uppercase tracking-wider bg-rose-200 text-rose-900 px-2 py-0.5 rounded">
                            Invalid Pass
                          </span>
                          <h4 className="font-display font-extrabold text-lg text-rose-900 mt-0.5">
                            Registration Not Found
                          </h4>
                        </div>
                      </div>

                      <p className="text-xs text-rose-800 bg-white/80 p-3 rounded-xl border border-rose-200 leading-relaxed">
                        {scanResult.message || 'The scanned QR code is not recognized in the ONEZONE 2K26 system.'}
                      </p>

                      <p className="text-xs text-slate-600">
                        Visitor can register on the spot using the registration portal.
                      </p>
                    </div>
                  )}

                </div>
              ) : (
                <div className="py-12 text-center text-slate-400 space-y-3">
                  <div className="w-16 h-16 rounded-full bg-slate-100 mx-auto flex items-center justify-center text-slate-300">
                    <Clock className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-700 text-sm">Ready for Scan</h4>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
                      Scan a visitor's QR code or type their registration ID to verify entry instantaneously.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Reset action */}
            {scanResult && (
              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setScanResult(null)}
                  className="text-xs"
                >
                  Clear Screen
                </Button>
              </div>
            )}

          </div>

          {/* Recent Scans Feed */}
          {recentScans.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm space-y-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Recent Terminal Check-Ins ({recentScans.length})
              </span>
              <div className="space-y-2 max-h-[180px] overflow-y-auto">
                {recentScans.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${item.scanStatus === 'SUCCESS' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                      <span className="font-bold text-slate-800">{item.full_name}</span>
                      <span className="font-mono text-slate-400 text-[10px]">({item.registration_id})</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {new Date(item.scanTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
