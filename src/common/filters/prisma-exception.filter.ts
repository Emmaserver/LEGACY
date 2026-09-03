import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  ConflictException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    switch (exception.code) {
      case 'P2002': {
        const campo = this.extractUniqueField(exception);
        const conflictException = new ConflictException(
          `Já existe um registo com o mesmo valor no campo: ${campo}`,
        );
        return this.sendResponse(host, conflictException);
      }
      case 'P2025': {
        const notFoundException = new NotFoundException(
          'Registo não encontrado',
        );
        return this.sendResponse(host, notFoundException);
      }
      default: {
        const internalError = new InternalServerErrorException(
          'Erro interno ao processar o pedido',
        );
        return this.sendResponse(host, internalError);
      }
    }
  }

  private extractUniqueField(
    exception: Prisma.PrismaClientKnownRequestError,
  ): string {
    const meta = exception.meta as any;

    // Formato clássico (Prisma < 7 ou sem driver adapter)
    if (Array.isArray(meta?.target)) {
      return meta.target.join(', ');
    }

    // Formato com driver adapter (Prisma 7+): nome da constraint no PostgreSQL,
    // padrão "<tabela>_<campo>_key"
    const constraintIndex: string | undefined =
      meta?.driverAdapterError?.cause?.constraint?.index;

    if (constraintIndex) {
      const semTabela = constraintIndex.replace(/^[a-z_]+?_/, '');
      const campo = semTabela.replace(/_key$/, '');
      return campo;
    }

    return 'campo único';
  }

  private sendResponse(host: ArgumentsHost, exception: any) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    response.status(status).json(exceptionResponse);
  }
}
