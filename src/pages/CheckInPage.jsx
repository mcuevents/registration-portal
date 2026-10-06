import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { 
  QrCode, 
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
  Volume2, 
  VolumeX, 
  ArrowLeft, 
  RefreshCw, 
  ShieldCheck, 
  Sparkles,
  Phone,
  Mail,
  MapPin,
  ChevronRight,
  ExternalLink,
  Layers,
  Zap
} from 'lucide-react';
import { performCheckIn, getAllRegistrations, calculateMetrics } from '../lib/storage';
import { soundFX } from '../lib/audio';
import { formatDateTime } from '../lib/utils';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { EVENT_DETAILS } from '../lib/constants';

export function CheckInPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [cameras, setCameras] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // Verification Result: { status: 'SUCCESS' | 'ALREADY_CHECKED_IN' | 'INVALID', record, message, previousCheckInTime, targetCode }
  const [scanResult, setScanResult] = useState(null);
  const [manualCode, setManualCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [metrics, setMetrics] = useState({ totalRegistrations: 0, checkedInCount: 0, todayRegistrations: 0 });
  const [recentCheckIns, setRecentCheckIns] = useState([]);
  const [cameraError, setCameraError] = useState('');

  const html5QrCodeRef = useRef(null);
  const scannerContainerId = 'dedicated-qr-reader';

  const loadStats = async () => {
    const list = await getAllRegistrations();
    setMetrics(calculateMetrics(list));
  };

  useEffect(() => {
    loadStats();

    // Discover available camera devices
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length > 0) {
          setCameras(devices);
          // Prefer back / rear camera for scanning
          const backCam = devices.find(d => 
            d.label.toLowerCase().includes('back') || 
            d.label.toLowerCase().includes('rear') || 
            d.label.toLowerCase().includes('environment')
          );
          setSelectedCameraId(backCam ? backCam.id : devices[0].id);
        }
      })
      .catch((err) => {
        console.warn('Camera detection error:', err);
        setCameraError('Camera access not available or permission denied.');
      });

    return () => {
      stopScanner();
    };
  }, []);

  const startScanner = async (camId) => {
    setCameraError('');
    try {
      const targetCam = camId || selectedCameraId || (cameras[0]?.id);
      if (!targetCam) {
        setCameraError('No camera found on this device. Please use manual Pass ID entry below.');
        return;
      }

      if (html5QrCodeRef.current) {
        await stopScanner();
      }

      const qrScanner = new Html5Qrcode(scannerContainerId);
      html5QrCodeRef.current = qrScanner;

      await qrScanner.start(
        targetCam,
        {
          fps: 10,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            const qrEdge = Math.floor(minEdge * 0.72);
            return { width: qrEdge, height: qrEdge };
          },
          aspectRatio: 1.0,
        },
        onScanSuccess,
        onScanFailure
      );

      setIsScanning(true);
    } catch (err) {
      console.error('Error starting camera scanner:', err);
      setIsScanning(false);
      setCameraError('Camera access failed. Please check browser permissions or use manual entry.');
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

  const onScanSuccess = (decodedText) => {
    if (isProcessing) return;
    processCheckInCode(decodedText);
  };

  const onScanFailure = (error) => {
    // ignore dropped frames
  };

  const processCheckInCode = async (rawCode) => {
    if (!rawCode || isProcessing) return;
    setIsProcessing(true);

    try {
      const res = await performCheckIn(rawCode, 'Event Gate Terminal');
      setScanResult(res);

      // Trigger audio & haptic feedback
      if (soundEnabled) {
        if (res.status === 'SUCCESS') {
          soundFX.playSuccess();
        } else if (res.status === 'ALREADY_CHECKED_IN') {
          soundFX.playWarning();
        } else {
          soundFX.playError();
        }
      }

      // Mobile haptic vibration if available
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        if (res.status === 'SUCCESS') {
          navigator.vibrate([80, 40, 80]);
        } else if (res.status === 'ALREADY_CHECKED_IN') {
          navigator.vibrate([150]);
        } else {
          navigator.vibrate([200, 100, 200]);
        }
      }

      // Add to recent admissions stream if valid
      if (res.record) {
        setRecentCheckIns(prev => [
          {
            ...res.record,
            scanStatus: res.status,
            scanTime: new Date().toISOString()
          },
          ...prev.filter(r => r.registration_id !== res.record.registration_id).slice(0, 7)
        ]);
      }

      // Refresh live KPI metrics
      loadStats();
    } catch (err) {
      console.error('Check-in error:', err);
      setScanResult({
        status: 'INVALID',
        targetCode: rawCode,
        message: 'An error occurred while verifying the pass.'
      });
      if (soundEnabled) soundFX.playError();
    } finally {
      setTimeout(() => {
        setIsProcessing(false);
      }, 1200);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    processCheckInCode(manualCode.trim());
    setManualCode('');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-brand-500 selection:text-white">
      
      {/* Top Mobile-Friendly Header */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3 sm:px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          
          <div className="flex items-center gap-3">
            <Link 
              to="/admin" 
              className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              title="Return to Admin Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-amber-500 flex items-center justify-center text-white font-mono font-black text-sm shadow-md shadow-brand-500/20">
                1Z
              </div>
              <div>
                <h1 className="font-display font-extrabold text-base text-white tracking-tight leading-none flex items-center gap-2">
                  <span>QR Check-In Terminal</span>
                  <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-mono px-2 py-0.5 rounded-full border border-emerald-500/30">
                    LIVE
                  </span>
                </h1>
                <p className="text-[11px] text-slate-400 font-medium">
                  CODISSIA Hall B • {EVENT_DETAILS.dateFormatted}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Metrics & Sound Control */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-800/80 border border-slate-700 text-xs">
              <span className="text-slate-400">Admitted:</span>
              <span className="font-mono font-bold text-emerald-400">
                {metrics.checkedInCount} / {metrics.totalRegistrations}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-xl border transition-colors ${
                soundEnabled 
                  ? 'bg-slate-800 text-brand-400 border-slate-700 hover:bg-slate-700' 
                  : 'bg-rose-950/60 text-rose-400 border-rose-800/80'
              }`}
              title={soundEnabled ? 'Mute Beep Audio' : 'Unmute Audio'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>

        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-6">
        
        {/* Live Gate Scanner & Verification Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
          
          {/* Column 1: Scanner Viewport (7 cols) */}
          <div className="md:col-span-6 space-y-4">
            
            <div className="bg-slate-900 rounded-3xl border border-slate-800 p-4 sm:p-5 shadow-2xl space-y-4">
              
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-brand-400" />
                  <span>Camera Scanner</span>
                </span>

                {isScanning ? (
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={stopScanner}
                    icon={CameraOff}
                    className="text-xs font-bold"
                  >
                    Turn Off
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => startScanner()}
                    icon={Camera}
                    className="text-xs font-bold shadow-lg shadow-brand-500/20"
                  >
                    Start Scanner
                  </Button>
                )}
              </div>

              {/* Camera Selector */}
              {cameras.length > 1 && (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-slate-400">Lens:</span>
                  <select
                    value={selectedCameraId}
                    onChange={handleCameraChange}
                    className="text-xs bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-brand-500 text-slate-300 flex-1 font-medium"
                  >
                    {cameras.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label || `Camera ${c.id.substring(0, 5)}...`}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Viewport Box */}
              <div className="relative rounded-2xl overflow-hidden bg-black aspect-square max-h-[340px] mx-auto flex items-center justify-center border-2 border-slate-800 shadow-inner">
                <div id={scannerContainerId} className="w-full h-full"></div>

                {!isScanning && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white bg-slate-950/90 space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-brand-400 shadow-lg">
                      <QrCode className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-sm text-white">Scanner Ready</h4>
                      <p className="text-xs text-slate-400 mt-1 max-w-xs">
                        Point camera at visitor badge QR or enter Pass ID manually.
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => startScanner()}
                      className="text-xs font-bold"
                    >
                      Tap to Scan
                    </Button>
                  </div>
                )}

                {/* Scanning Laser Line */}
                {isScanning && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-56 h-56 border-2 border-brand-400/80 rounded-2xl relative">
                      <div className="absolute top-0 left-0 w-5 h-5 border-t-4 border-l-4 border-brand-500 -mt-0.5 -ml-0.5 rounded-tl"></div>
                      <div className="absolute top-0 right-0 w-5 h-5 border-t-4 border-r-4 border-brand-500 -mt-0.5 -mr-0.5 rounded-tr"></div>
                      <div className="absolute bottom-0 left-0 w-5 h-5 border-b-4 border-l-4 border-brand-500 -mb-0.5 -ml-0.5 rounded-bl"></div>
                      <div className="absolute bottom-0 right-0 w-5 h-5 border-b-4 border-r-4 border-brand-500 -mb-0.5 -mr-0.5 rounded-br"></div>
                      <div className="absolute left-2 right-2 h-0.5 bg-brand-400 scanner-laser shadow-glow"></div>
                    </div>
                  </div>
                )}
              </div>

              {cameraError && (
                <p className="text-xs text-rose-400 bg-rose-950/50 p-2.5 rounded-xl border border-rose-900/80 text-center">
                  {cameraError}
                </p>
              )}

              {/* Manual Pass ID Entry */}
              <form onSubmit={handleManualSubmit} className="pt-2 border-t border-slate-800 flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Enter Pass ID (e.g. OZ26-48921A)..."
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 font-mono"
                  />
                </div>
                <Button
                  type="submit"
                  size="sm"
                  variant="dark"
                  disabled={!manualCode.trim() || isProcessing}
                  className="text-xs font-bold"
                >
                  Verify
                </Button>
              </form>

            </div>

          </div>

          {/* Column 2: Real-time Scan Result Card (5 cols) */}
          <div className="md:col-span-6 space-y-4">
            
            <div className="bg-slate-900 rounded-3xl border border-slate-800 p-5 shadow-2xl min-h-[380px] flex flex-col justify-between">
              
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">
                  Verification Status
                </span>

                {/* State 0: Waiting for scan */}
                {!scanResult && (
                  <div className="py-12 text-center text-slate-500 space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-800 mx-auto flex items-center justify-center text-slate-400">
                      <QrCode className="w-6 h-6 opacity-60" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-300">Ready for Next Attendee</h4>
                      <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                        Scan QR pass code on smartphone or paper badge to check in.
                      </p>
                    </div>
                  </div>
                )}

                {/* State 1: SUCCESS (Valid & Just Checked In) */}
                {scanResult?.status === 'SUCCESS' && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-emerald-950/90 border-2 border-emerald-500 text-emerald-100 space-y-4 shadow-xl shadow-emerald-500/10 animate-scaleUp">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/30">
                        <CheckCircle2 className="w-7 h-7" />
                      </div>
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-800 text-emerald-200 px-2 py-0.5 rounded">
                          Checked In & Admitted
                        </span>
                        <h3 className="font-display font-black text-xl text-white mt-1">
                          {scanResult.record?.name || scanResult.record?.full_name}
                        </h3>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-900/90 rounded-xl border border-emerald-900/80 text-xs space-y-2 text-slate-300">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Pass ID:</span>
                        <span className="font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                          {scanResult.record?.registration_id}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Sector:</span>
                        <Badge variant="brand">{scanResult.record?.category || scanResult.record?.business_category}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Visitors Admitted:</span>
                        <span className="font-bold text-white">
                          {scanResult.record?.visitor_count || scanResult.record?.number_of_visitors || 1} Person(s)
                        </span>
                      </div>
                      {(scanResult.record?.company || scanResult.record?.company_name) && (
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Company:</span>
                          <span className="font-semibold text-slate-200 truncate max-w-[170px]">
                            {scanResult.record?.company || scanResult.record?.company_name}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between items-center pt-1 border-t border-slate-800">
                        <span className="text-slate-400">Check-in Recorded:</span>
                        <span className="font-bold text-emerald-400">
                          {formatDateTime(scanResult.record?.checked_in_at || new Date().toISOString())}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-emerald-300 font-bold">✨ Access Granted to Hall B</span>
                      <button 
                        onClick={() => setScanResult(null)}
                        className="text-xs text-slate-400 hover:text-white underline font-semibold"
                      >
                        Next Scan
                      </button>
                    </div>
                  </div>
                )}

                {/* State 2: ALREADY CHECKED IN */}
                {scanResult?.status === 'ALREADY_CHECKED_IN' && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-amber-950/90 border-2 border-amber-500 text-amber-100 space-y-4 shadow-xl shadow-amber-500/10 animate-scaleUp">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-500/30">
                        <AlertTriangle className="w-7 h-7" />
                      </div>
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider bg-amber-800 text-amber-200 px-2 py-0.5 rounded">
                          Pass Already Used
                        </span>
                        <h3 className="font-display font-black text-xl text-white mt-1">
                          {scanResult.record?.name || scanResult.record?.full_name}
                        </h3>
                      </div>
                    </div>

                    <div className="p-3.5 bg-slate-900/90 rounded-xl border border-amber-900/80 text-xs space-y-2 text-slate-300">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Pass ID:</span>
                        <span className="font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                          {scanResult.record?.registration_id}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Previous Check-in Time:</span>
                        <span className="font-bold text-amber-400">
                          {formatDateTime(scanResult.previousCheckInTime || scanResult.record?.checked_in_at || scanResult.record?.updated_at)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Accompanying Visitors:</span>
                        <span className="font-bold text-white">
                          {scanResult.record?.visitor_count || scanResult.record?.number_of_visitors || 1} Person(s)
                        </span>
                      </div>
                      {(scanResult.record?.company || scanResult.record?.company_name) && (
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Company:</span>
                          <span className="text-slate-200">
                            {scanResult.record?.company || scanResult.record?.company_name}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-amber-300 font-semibold">⚠️ Duplicate pass scan detected</span>
                      <button 
                        onClick={() => setScanResult(null)}
                        className="text-xs text-slate-400 hover:text-white underline font-semibold"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                )}

                {/* State 3: INVALID PASS */}
                {scanResult?.status === 'INVALID' && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-rose-950/90 border-2 border-rose-500 text-rose-100 space-y-4 shadow-xl shadow-rose-500/10 animate-scaleUp">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center flex-shrink-0 shadow-lg shadow-rose-500/30">
                        <XCircle className="w-7 h-7" />
                      </div>
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider bg-rose-800 text-rose-200 px-2 py-0.5 rounded">
                          Verification Error
                        </span>
                        <h3 className="font-display font-black text-xl text-white mt-1">
                          Invalid Pass
                        </h3>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-900/90 rounded-xl border border-rose-900/80 text-xs space-y-2 text-slate-300">
                      <p className="text-rose-200 font-medium">
                        {scanResult.message || 'Registration pass not recognized in system.'}
                      </p>
                      {scanResult.targetCode && (
                        <p className="text-[11px] text-slate-400 font-mono">
                          Scanned Code: <span className="text-white">{scanResult.targetCode}</span>
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-rose-300 font-semibold">Please guide visitor to Help Desk</span>
                      <button 
                        onClick={() => setScanResult(null)}
                        className="text-xs text-slate-400 hover:text-white underline font-semibold"
                      >
                        Try Again
                      </button>
                    </div>
                  </div>
                )}

              </div>

              {/* Quick Simulator Buttons for Instant Testing */}
              <div className="pt-4 border-t border-slate-800 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  Quick Demo / Simulator Codes
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => processCheckInCode('OZ26-48921A')}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold border border-slate-700 transition-colors truncate"
                    title="Test Valid Pass"
                  >
                    Valid Pass
                  </button>
                  <button
                    onClick={() => processCheckInCode('OZ26-92147B')}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-[11px] font-bold border border-slate-700 transition-colors truncate"
                    title="Test Already Checked-In Pass"
                  >
                    Already Used
                  </button>
                  <button
                    onClick={() => processCheckInCode('OZ26-INVALID99')}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 text-[11px] font-bold border border-slate-700 transition-colors truncate"
                    title="Test Invalid Pass"
                  >
                    Invalid Code
                  </button>
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* Recent Admissions Stream */}
        {recentCheckIns.length > 0 && (
          <div className="bg-slate-900 rounded-3xl border border-slate-800 p-5 space-y-3 shadow-lg">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-400" />
                <span>Recent Gate Admissions Stream</span>
              </span>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800">
                {recentCheckIns.length} recorded
              </span>
            </div>

            <div className="space-y-2">
              {recentCheckIns.map((item, idx) => (
                <div 
                  key={item.registration_id + idx}
                  className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold font-mono text-[11px] border border-emerald-500/30">
                      ✓
                    </div>
                    <div>
                      <div className="font-bold text-white">{item.name || item.full_name}</div>
                      <div className="text-slate-400 text-[11px] flex items-center gap-1.5 font-mono">
                        <span>{item.registration_id}</span>
                        <span>•</span>
                        <span>{item.visitor_count || item.number_of_visitors || 1} Person(s)</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <Badge variant="brand" className="text-[10px]">
                      {item.category || item.business_category}
                    </Badge>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {new Date(item.scanTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-3 px-4 text-center text-xs text-slate-500">
        ONEZONE 2K26 Gate Control System • CODISSIA Hall B
      </footer>

    </div>
  );
}
