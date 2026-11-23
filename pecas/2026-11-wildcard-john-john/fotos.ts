/**
 * Fotos do John John Florence (Drive, fora do git: assets.json). São de terceiros e o autor de
 * cada uma ainda precisa ser confirmado antes de publicar (ver Créditos no post.md).
 */
const foto = (arquivo: string, credito: string) => ({ src: `fotos/${arquivo}`, credito });

export const FOTOS = {
  /** Na praia, com a onda quebrando atrás (frame de vlog, 738×415). */
  praia: foto('john-john-praia.jpg', 'Foto: reprodução'),
  /** Sentado no estúdio, boné e camiseta Florence (387×516). */
  estudio: foto('john-john-estudio.jpg', 'Foto: reprodução'),
  /** De pé na laje com a prancha, montanhas atrás (680×451). */
  prancha: foto('john-john-prancha-teahupoo.jpg', 'Foto: reprodução'),
};
