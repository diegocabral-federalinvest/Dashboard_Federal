import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";
import logger from "@/lib/logger";

export interface UploadCSVResponse {
  success: boolean;
  data: {
    id: string;
    filename: string;
    originalFilename: string;
    size: number;
    mimetype: string;
    rows: number;
    processingTime?: number;
    status: string;
    createdAt: string;
    updatedAt: string;
  };
  message?: string;
}

export interface UploadCSVOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  onProgress?: (progress: number) => void;
}

export const useUploadCSV = (options?: UploadCSVOptions) => {
  const queryClient = useQueryClient();
  
  return useMutation<UploadCSVResponse, Error, FormData>({
    mutationFn: async (formData: FormData) => {
      logger.info("Starting CSV file upload", {
        source: "frontend",
        context: "finance:use-upload-csv",
        tags: ["mutation", "upload", "start"],
        data: {
          fileSize: formData.get("file") instanceof File ? (formData.get("file") as File).size : 'unknown',
          fileName: formData.get("file") instanceof File ? (formData.get("file") as File).name : 'unknown'
        }
      });
      
      const controller = new AbortController();
      
      let lastProgress = 0;
      
      const xhr = new XMLHttpRequest();
      
      const uploadPromise = new Promise<UploadCSVResponse>((resolve, reject) => {
        xhr.open("POST", "/api/finance/csv-upload", true);
        
        if (options?.onProgress) {
          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const progress = Math.round((event.loaded / event.total) * 100);
              
              if (progress !== lastProgress) {
                lastProgress = progress;
                options.onProgress!(progress);
                
                if (progress === 25 || progress === 50 || progress === 75 || progress === 100) {
                  logger.debug(`CSV upload progress: ${progress}%`, {
                    source: "frontend",
                    context: "finance:use-upload-csv",
                    tags: ["upload", "progress"],
                    data: { progress }
                  });
                }
              }
            }
          };
        }
        
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText) as UploadCSVResponse;
              
              logger.info("CSV upload completed successfully", {
                source: "frontend",
                context: "finance:use-upload-csv",
                tags: ["upload", "complete", "success"],
                data: {
                  status: xhr.status,
                  response: response
                }
              });
              
              resolve(response);
            } catch (error) {
              logger.error("Error parsing upload response", {
                source: "frontend",
                context: "finance:use-upload-csv",
                tags: ["upload", "error", "parsing"],
                data: {
                  responseText: xhr.responseText,
                  error: error instanceof Error ? error.message : String(error)
                }
              });
              
              reject(new Error("Erro ao processar resposta do servidor"));
            }
          } else {
            let errorMessage = "Erro ao fazer upload do arquivo";
            
            try {
              const errorResponse = JSON.parse(xhr.responseText);
              errorMessage = errorResponse.error || errorMessage;
              
              logger.error("CSV upload server error", {
                source: "frontend",
                context: "finance:use-upload-csv",
                tags: ["upload", "server-error"],
                data: {
                  status: xhr.status,
                  error: errorResponse
                }
              });
            } catch (e) {
              logger.error("CSV upload failed with unknown error", {
                source: "frontend",
                context: "finance:use-upload-csv",
                tags: ["upload", "error", "unknown"],
                data: {
                  status: xhr.status,
                  responseText: xhr.responseText
                }
              });
            }
            
            reject(new Error(errorMessage));
          }
        };
        
        xhr.onerror = () => {
          logger.error("Network error during CSV upload", {
            source: "frontend",
            context: "finance:use-upload-csv",
            tags: ["upload", "network-error"],
            data: {
              status: xhr.status
            }
          });
          
          reject(new Error("Erro de rede ao tentar fazer upload"));
        };
        
        xhr.ontimeout = () => {
          logger.error("CSV upload timed out", {
            source: "frontend",
            context: "finance:use-upload-csv",
            tags: ["upload", "timeout"],
          });
          
          reject(new Error("Tempo de upload excedido. Verifique sua conexão e tente novamente."));
        };
        
        xhr.send(formData);
      });
      
      return uploadPromise;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["dre"] });
      queryClient.invalidateQueries({ queryKey: ["raw-financial-data"] });
      queryClient.invalidateQueries({ queryKey: ["file-uploads"] });
      
      toast.success("Arquivo CSV processado com sucesso", {
        description: "Os dados financeiros foram atualizados."
      });
      
      if (options?.onSuccess) {
        options.onSuccess();
      }
    },
    onError: (error) => {
      logger.error("CSV upload mutation error", {
        source: "frontend",
        context: "finance:use-upload-csv",
        tags: ["upload", "error", "mutation"],
        data: {
          error: error.message,
          stack: error.stack
        }
      });
      
      toast.error("Erro ao processar arquivo CSV", {
        description: error.message || "Verifique o formato do arquivo e tente novamente."
      });
      
      if (options?.onError) {
        options.onError(error);
      }
    }
  });
}; 