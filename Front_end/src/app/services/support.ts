export interface SoporteArchivo {
  id: string;
  archivo_url: string;
}

export interface SoporteTicket {
  id: string;
  ticket_codigo: string;
  asunto: string;
  descripcion: string;
  estado: string;
  creado_en: string;

  estudiante_nombre?: string;
  fecha_nacimiento?: string;
  matricula?: string;
  role?: number;

  soporte_archivos: SoporteArchivo[];
}