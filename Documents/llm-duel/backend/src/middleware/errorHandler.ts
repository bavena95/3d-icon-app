import type { Request, Response, NextFunction } from "express";

// Remova o '?' de statusCode para torná-lo obrigatório, como na classe
export interface ApiError extends Error {
  statusCode: number; // <--- Alteração aqui
  details?: any;
}

// A função errorHandler permanece a mesma
export const errorHandler = (err: ApiError, req: Request, res: Response, next: NextFunction) => {
  console.error(`[ERROR] ${err.message}`, {
    stack: err.stack,
    details: err.details,
    path: req.path,
    method: req.method,
  });

  // A lógica aqui já trata o caso de err.statusCode poder não estar definido no objeto de erro genérico
  // antes de ser tipado como ApiError, mas a interface/classe agora exige.
  const statusCode = err.statusCode || 500; 
  const message = err.message || "Erro interno do servidor";

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
      ...(err.details && { details: err.details }),
    },
  });
};

// A classe ApiError permanece a mesma
export class ApiError extends Error {
  statusCode: number; // Já é obrigatório aqui
  details?: any;

  constructor(message: string, statusCode = 500, details?: any) {
    super(message);
    this.statusCode = statusCode; // Sempre definido no construtor
    this.details = details;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  // Métodos estáticos permanecem os mesmos
  static badRequest(message: string, details?: any) {
    return new ApiError(message, 400, details);
  }

  static unauthorized(message = "Não autorizado", details?: any) {
    return new ApiError(message, 401, details);
  }

  static forbidden(message = "Acesso negado", details?: any) {
    return new ApiError(message, 403, details);
  }

  static notFound(message = "Recurso não encontrado", details?: any) {
    return new ApiError(message, 404, details);
  }

  static tooManyRequests(message = "Muitas requisições", details?: any) {
    return new ApiError(message, 429, details);
  }

  static internal(message = "Erro interno do servidor", details?: any) {
    return new ApiError(message, 500, details);
  }
}