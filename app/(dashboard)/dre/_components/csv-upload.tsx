"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { 
  ArrowUpFromLine, 
  X, 
  AlertCircle, 
  Check, 
  Loader2,
  FileSpreadsheet,
  Clock,
  TrendingUp
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";

interface CSVUploadProps {
  onUpload: (file: File) => Promise<void>;
  isUploading: boolean;
  uploadProgress?: number;
  error: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CoinAnimation = () => {
  const coinRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  // Initialize the refs array with nulls
  useEffect(() => {
    coinRefs.current = Array(12).fill(null);
  }, []);
  
  // Animate coins in a separate effect that runs only once after refs are set
  useEffect(() => {
    const nonNullCoins = coinRefs.current.filter(Boolean) as HTMLDivElement[];
    
    nonNullCoins.forEach((coin, index) => {
      const randomDelay = Math.random() * 0.5;
      const randomDuration = 0.8 + Math.random() * 0.5;
      const randomRotation = Math.random() * 1080; // Random rotation between 0-3 full spins
      const randomX = -30 + Math.random() * 60; // Random X position
      
      if (coin) {
        coin.animate([
          { 
            transform: `translateY(0) translateX(0) rotateY(0deg)`, 
            opacity: 0 
          },
          { 
            transform: `translateY(-100px) translateX(${randomX}px) rotateY(${randomRotation}deg)`, 
            opacity: 1 
          },
          { 
            transform: `translateY(-20px) translateX(${randomX * 1.5}px) rotateY(${randomRotation * 1.5}deg)`, 
            opacity: 1 
          },
        ], {
          duration: randomDuration * 1000,
          delay: randomDelay * 1000,
          easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          fill: 'forwards'
        });
      }
    });
  }, []);

  // Safe ref callback that won't cause infinite loops
  const setRef = useCallback((el: HTMLDivElement | null, index: number) => {
    if (coinRefs.current) {
      coinRefs.current[index] = el;
    }
  }, []);

  return (
    <div className="relative h-20">
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          ref={el => setRef(el, i)}
          className="absolute left-1/2 top-full w-8 h-8 -ml-4 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-lg opacity-0"
          style={{
            boxShadow: "0 0 10px rgba(255, 215, 0, 0.6)",
          }}
        >
          <div className="absolute inset-1 rounded-full bg-yellow-300 flex items-center justify-center text-yellow-700 font-bold text-xs">$</div>
        </div>
      ))}
    </div>
  );
};

export const CSVUpload: React.FC<CSVUploadProps> = ({
  onUpload,
  isUploading,
  uploadProgress = 0,
  error,
  open,
  onOpenChange
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error" | "processing">("idle");
  const [showCoinAnimation, setShowCoinAnimation] = useState(false);

  // Reset state when dialog is closed
  useEffect(() => {
    if (!open) {
      // Use a timeout to ensure cleanup happens after animations
      const timer = setTimeout(() => {
        setSelectedFile(null);
        setUploadStatus("idle");
        setShowCoinAnimation(false);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [open]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles?.length) {
      setSelectedFile(acceptedFiles[0]);
      setUploadStatus("idle");
    }
  }, []);
  
  const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv']
    },
    maxFiles: 1
  });
  
  const handleUpload = useCallback(async () => {
    if (!selectedFile || isUploading || uploadStatus === "processing") return;
    
    setUploadStatus("processing");
    
    try {
      await onUpload(selectedFile);
      setUploadStatus("success");
      setShowCoinAnimation(true);
      
      // Auto-close after animation completes
      const timer = setTimeout(() => {
        setShowCoinAnimation(false);
        const closeTimer = setTimeout(() => {
          onOpenChange(false);
        }, 500);
        
        return () => clearTimeout(closeTimer);
      }, 3000);
      
      return () => clearTimeout(timer);
    } catch (err) {
      setUploadStatus("error");
    }
  }, [selectedFile, isUploading, uploadStatus, onUpload, onOpenChange]);
  
  const handleClose = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  // Calculate the border and background styles based on state
  const getBorderStyle = useCallback(() => {
    if (isDragAccept) return "border-green-400 bg-green-50";
    if (isDragReject) return "border-red-400 bg-red-50";
    if (isDragActive) return "border-blue-400 bg-blue-50";
    if (selectedFile) return "border-blue-300 bg-blue-50";
    return "border-gray-300 hover:border-blue-400";
  }, [isDragAccept, isDragReject, isDragActive, selectedFile]);

  const handleRemoveFile = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
  }, []);
  return (
    <DialogContent className="sm:max-w-2xl bg-white dark:bg-gray-900 rounded-xl shadow-xl">
      <DialogHeader>
        <DialogTitle className="flex items-center text-xl">
          <FileSpreadsheet 
            className="h-6 w-6 mr-2 text-blue-700 dark:text-blue-200" 
          />
          Importar dados financeiros da Smart Factor
        </DialogTitle>

        <DialogDescription>
          <p className="text-gray-700 dark:text-gray-200 text-base">
            Faça upload do arquivo CSV da Smart Factor para atualizar sua DRE
          </p>
          
          <span className="text-gray-500 dark:text-gray-300 text-sm block mt-1">
            análise de deduções fiscais e projeção de impostos futuros.
          </span>
        </DialogDescription>
      </DialogHeader>
      
      {error && (
        <Alert variant="destructive" className="mt-2 animate-pulse">
          <AlertCircle className="h-4 w-4 text-red-500 dark:text-red-400" />
          <AlertTitle className="text-red-700 dark:text-red-300">Erro no processamento</AlertTitle>
          <AlertDescription className="text-red-700 dark:text-red-300">
            {error}
          </AlertDescription>
        </Alert>
      )}
      
      <AnimatePresence>
        {uploadStatus === "success" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <Alert className="mt-2 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 dark:bg-green-900 dark:border-green-800">
              <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
              <AlertTitle className="text-green-800 dark:text-green-200">Dados processados com sucesso!</AlertTitle>
              <AlertDescription className="text-green-700 dark:text-green-300">
                Seu arquivo financeiro da Smart Factor foi importado e os dados estão prontos para análise.
              </AlertDescription>
            </Alert>
            
            {showCoinAnimation && <CoinAnimation />}
          </motion.div>
        )}
      </AnimatePresence>
      
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed hover:border-blue-400 hover:shadow-2xl hover:shadow-blue-400/50 rounded-lg p-8 text-center cursor-pointer mt-4 transition-all duration-300 ${getBorderStyle()}`}
      >
        <input {...getInputProps()} />
        
        <motion.div
          whileHover={{ scale: 1.00, boxShadow: "0px 5px 35px rgba(0,0,0,0.15)" }}
          className="p-4"
        >
          <AnimatePresence mode="wait">
            {selectedFile ? (
              <motion.div 
                className="flex flex-col items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                key="selected"
              >
                <div className="text-sm text-gray-700 dark:text-gray-200 mb-3">Arquivo selecionado:</div>
                <motion.div 
                  className="flex items-center bg-white dark:bg-gray-800 px-4 py-3 rounded-lg shadow-md"
                  whileHover={{ y: -2, boxShadow: "0px 6px 12px rgba(0,0,0,0.1)" }}
                >
                  <FileSpreadsheet className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                  <span className="text-blue-600 dark:text-blue-400 font-medium truncate max-w-[200px]">
                    {selectedFile.name}
                  </span>
                  <div className="text-xs text-gray-500 dark:text-gray-300 ml-2">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </div>
                  <button 
                    onClick={handleRemoveFile}
                    className="ml-3 text-gray-400 dark:text-gray-300 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50"
                  >
                    <X className="h-4 w-4 text-gray-400 dark:text-gray-300" />
                  </button>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                key="empty"
              >
                <div className="relative">
                  <motion.div 
                    className="mx-auto h-20 w-20 bg-blue-100  dark:bg-blue-900 rounded-full flex items-center justify-center mb-4"
                    animate={{ 
                      y: isDragActive ? [-5, 0, -5] : 0
                    }}
                    transition={{ 
                      repeat: isDragActive ? Infinity : 0, 
                      duration: 1.5 
                    }}
                  >
                    <ArrowUpFromLine className="h-12 w-12 text-blue-500 dark:text-blue-400" />
                    <motion.div 
                      className="absolute inset-0 rounded-full border-4 border-blue-300 dark:border-blue-600"
                      animate={{ 
                        scale: isDragActive ? [1, 1.1, 1] : 1,
                        opacity: isDragActive ? [0.7, 1, 0.7] : 0.7
                      }}
                      transition={{ 
                        repeat: isDragActive ? Infinity : 0, 
                        duration: 2 
                      }}
                    />
                  </motion.div>
                </div>
                <p className="mt-2 text-base font-medium text-gray-700 dark:text-gray-200">
                  Arraste e solte seu arquivo CSV da Smart Factor
                </p>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                  ou <span className="text-blue-600 hover:underline">clique para selecionar</span>
                </p>
                <div className="mt-4 flex items-center justify-center space-x-6 text-xs text-gray-500">
                  <div className="flex items-center">
                    <FileSpreadsheet className="h-4 w-4 mr-1 text-gray-400 dark:text-gray-300" />
                    <span>Formato CSV</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1 text-gray-400 dark:text-gray-300" />
                    <span>Processamento rápido</span>
                  </div>
                  <div className="flex items-center">
                    <TrendingUp className="h-4 w-4 mr-1 text-gray-400 dark:text-gray-300" />
                    <span>Análise detalhada</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
      
      {(uploadStatus === "processing" || isUploading) && (
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-700 dark:text-gray-200">Processando dados financeiros...</span>
            <span className="text-blue-600 dark:text-blue-400 font-medium">{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
          <p className="text-xs text-gray-500 dark:text-gray-300 mt-2 animate-pulse">
            Analisando estrutura e validando fórmulas da Smart Factor...
          </p>
        </div>
      )}
      
      <DialogFooter className="sm:justify-end mt-4">
        <Button 
          variant="outline" 
          onClick={handleClose}
          className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          disabled={isUploading || uploadStatus === "processing"}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          onClick={handleUpload}
          disabled={!selectedFile || isUploading || uploadStatus === "success" || uploadStatus === "processing"}
          className={`relative overflow-hidden transition-all duration-300 dark:text-white ${
            uploadStatus === "success" 
              ? "bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600" 
              : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-500 dark:hover:from-blue-600 dark:hover:to-indigo-600 dark:text-white dark:hover:text-white"
          }`}
        >
          {uploadStatus === "processing" || isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processando...
            </>
          ) : uploadStatus === "success" ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Concluído
            </>
          ) : (
            <>
              <ArrowUpFromLine className="mr-2 h-4 w-4" />
              Importar e Analisar
            </>
          )}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};