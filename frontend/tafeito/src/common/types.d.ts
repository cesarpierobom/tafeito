export type Tag = {
  color: string;
  etiqueta: string;
}

export type Anexo = {
  id: number;
  mime_type: string;
  nome: string;
  tamanho: number;
}

export type Task = {
  "id": number;
  "descricao": string;
  "concluida": boolean;
  "etiquetas": Tag[];
  "anexos": Array<Anexo>;
  "id_categoria": number;
}

export type Category = {
  "id": number;
  "descricao": string;
}