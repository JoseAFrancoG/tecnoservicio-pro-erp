import React, { useState, useEffect, useRef, useCallback } from 'react';
import { InventoryItem } from '../../types';
import { Modal } from '../Modal';
import { playScannerBeep } from './soundEffect';
import {
  Camera,
  Barcode as BarcodeIcon,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Search,
  ScanLine,
  Keyboard,
  Package,
} from 'lucide-react';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventoryList: InventoryItem[];
  onItemScanned: (item: InventoryItem) => void;
  title?: string;
  subtitle?: string;
  actionButtonText?: string;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  inventoryList,
  onItemScanned,
  title = 'Lector de Código de Barras de Repuestos',
  subtitle = 'Escanee mediante cámara web o pistola lectora USB / Bluetooth',
  actionButtonText = 'Seleccionar Repuesto',
}) => {
  const [activeTab, setActiveTab] = useState<'camera' | 'hardware'>('camera');
  const [scannedCode, setScannedCode] = useState<string>('');
  const [matchedItem, setMatchedItem] = useState<InventoryItem | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const hardwareInputRef = useRef<HTMLInputElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const processBarcodeValue = useCallback(
    (code: string) => {
      const cleanCode = code.trim().toUpperCase();
      if (!cleanCode) return;

      setScannedCode(cleanCode);

      // Buscar repuesto por SKU exacto o que contenga el código
      const found = inventoryList.find(
        (i) => i.sku.toUpperCase() === cleanCode || i.sku.replace(/-/g, '').toUpperCase() === cleanCode.replace(/-/g, '')
      );

      if (found) {
        playScannerBeep(true);
        setMatchedItem(found);
        setScanError(null);
      } else {
        playScannerBeep(false);
        setMatchedItem(null);
        setScanError(`No se encontró ningún repuesto en almacén con el código SKU: "${cleanCode}"`);
      }
    },
    [inventoryList]
  );

  // Iniciar cámara cuando la pestaña es 'camera'
  const startCamera = async () => {
    try {
      setCameraError(null);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setIsCameraActive(true);
        startBarcodeDetection();
      }
    } catch (err: any) {
      console.warn('No se pudo acceder a la cámara:', err);
      setIsCameraActive(false);
      setCameraError('No se detectó cámara disponible o se denegaron los permisos.');
      setActiveTab('hardware');
    }
  };

  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Detección automática mediante BarcodeDetector nativo
  const startBarcodeDetection = () => {
    const BarcodeDetectorClass = (window as any).BarcodeDetector;
    if (!BarcodeDetectorClass) {
      return;
    }

    try {
      const detector = new BarcodeDetectorClass({
        formats: ['code_128', 'code_39', 'ean_13', 'qr_code'],
      });

      const detectFrame = async () => {
        if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
          try {
            const barcodes = await detector.detect(videoRef.current);
            if (barcodes.length > 0 && barcodes[0].rawValue) {
              processBarcodeValue(barcodes[0].rawValue);
              // Pausa de 1.5s para no leer repetidamente en milisegundos
              await new Promise((resolve) => setTimeout(resolve, 1500));
            }
          } catch (e) {
            // Ignorar errores de frame
          }
        }
        animationFrameRef.current = requestAnimationFrame(detectFrame);
      };

      animationFrameRef.current = requestAnimationFrame(detectFrame);
    } catch (err) {
      console.warn('BarcodeDetector no soportado:', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setMatchedItem(null);
      setScanError(null);
      setScannedCode('');

      if (activeTab === 'camera') {
        startCamera();
      } else {
        setTimeout(() => hardwareInputRef.current?.focus(), 150);
      }
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, activeTab]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processBarcodeValue(scannedCode);
  };

  const handleConfirmSelect = () => {
    if (matchedItem) {
      onItemScanned(matchedItem);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      maxWidth="xl"
    >
      <div className="space-y-4">
        {/* Selector de Modo */}
        <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('camera')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
              activeTab === 'camera'
                ? 'bg-white text-sky-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Escáner por Cámara</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('hardware')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
              activeTab === 'hardware'
                ? 'bg-white text-sky-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarcodeIcon className="w-4 h-4" />
            <span>Pistola Láser / USB</span>
          </button>
        </div>

        {/* MODO 1: CÁMARA */}
        {activeTab === 'camera' && (
          <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-video flex items-center justify-center border border-slate-800 shadow-inner">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              muted
              playsInline
            />

            {/* Retícula visual y rayo láser animado */}
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
              <div className="w-64 h-36 border-2 border-sky-400/80 rounded-2xl relative shadow-[0_0_15px_rgba(56,189,248,0.3)]">
                {/* Esquinas */}
                <div className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-sky-400" />
                <div className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-sky-400" />
                <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-sky-400" />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-sky-400" />

                {/* Línea láser animada */}
                <div className="w-full h-0.5 bg-rose-500 shadow-[0_0_8px_#f43f5e] animate-pulse absolute top-1/2 -translate-y-1/2" />
              </div>
              <p className="text-[11px] font-semibold text-white/90 bg-slate-900/80 px-3 py-1 rounded-full mt-3 backdrop-blur-sm">
                Enfoque el código de barras dentro del recuadro
              </p>
            </div>

            {cameraError && (
              <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-6 text-center text-xs text-rose-300">
                <AlertCircle className="w-8 h-8 text-rose-400 mb-2" />
                <p className="font-semibold">{cameraError}</p>
                <button
                  type="button"
                  onClick={() => setActiveTab('hardware')}
                  className="mt-3 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs"
                >
                  Cambiar a Modo Pistola / Teclado
                </button>
              </div>
            )}
          </div>
        )}

        {/* MODO 2: PISTOLA LÁSER O ENTRADA MANUAL */}
        <div className="space-y-3">
          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <ScanLine className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                ref={hardwareInputRef}
                type="text"
                value={scannedCode}
                onChange={(e) => setScannedCode(e.target.value)}
                placeholder="Escanee con la pistola láser o digite el SKU (ej. REP-SSD-1TB-NVME)..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 font-mono font-bold"
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1.5 shrink-0"
            >
              <Search className="w-3.5 h-3.5 text-sky-400" />
              <span>Buscar</span>
            </button>
          </form>

          {/* Accesos rápidos a códigos de prueba disponibles */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] text-slate-500">
            <span className="font-semibold text-slate-400 shrink-0">Demo Rápido:</span>
            {inventoryList.slice(0, 4).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => processBarcodeValue(item.sku)}
                className="px-2 py-0.5 rounded bg-slate-100 hover:bg-sky-50 hover:text-sky-700 border border-slate-200 font-mono shrink-0 transition"
              >
                {item.sku}
              </button>
            ))}
          </div>
        </div>

        {/* ALERTA: ERROR DE BÚSQUEDA */}
        {scanError && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
            <span>{scanError}</span>
          </div>
        )}

        {/* RESULTADO: REPUESTO LOCALIZADO */}
        {matchedItem && (
          <div className="p-4 rounded-xl border-2 border-emerald-500 bg-emerald-50/50 flex flex-col sm:flex-row items-center justify-between gap-4 transition-all">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-600/20">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                    {matchedItem.sku}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500">{matchedItem.category}</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 mt-1">{matchedItem.name}</h4>
                <div className="flex items-center gap-3 mt-1 text-xs">
                  <span className="font-bold text-emerald-700">{formatCurrency(matchedItem.salePrice)} COP</span>
                  <span className="text-slate-500">•</span>
                  <span className={`font-semibold ${matchedItem.stockQuantity <= matchedItem.minStockAlert ? 'text-rose-600 font-bold' : 'text-slate-700'}`}>
                    Stock: {matchedItem.stockQuantity} unids.
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleConfirmSelect}
              className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/30 transition flex items-center justify-center gap-2 shrink-0"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{actionButtonText}</span>
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};
