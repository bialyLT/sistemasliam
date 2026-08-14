export type NovedadCategory =
  | "Revista"
  | "Diario"
  | "Publicación"
  | "Comunicado";

export type Novedad = {
  id: string;
  title: string;
  excerpt: string;
  category: NovedadCategory;
  source?: string;
  date: string;
  href: string;
  imageUrl?: string;
};
