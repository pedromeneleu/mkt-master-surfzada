/**
 * Fotos do Andy usadas no carrossel (Drive, fora do git: assets.json). O
 * crédito vai no slide em que a foto aparece. Fontes em creditos-fotos-andy.json.
 */
const foto = (arquivo: string, credito: string) => ({ src: `fotos/andy/${arquivo}`, credito });

export const FOTOS = {
  trofeu2002: foto('curtindo-titulo-2002-beijo-trofeu.jpg', 'Foto: Pierre Tostee / WSL'),
  podioPipe2003: foto('curtindo-pipe-2003-com-slater.jpg', 'Foto: Pierre Tostee / WSL'),
  claimTeahupoo2006: foto('surfando-teahupoo-2006-claim.jpg', 'Foto: Pierre Tostee / WSL'),
  tuboPipe2003: foto('surfando-pipe-2003-tubo.jpg', 'Pierre Tostee / WSL'),
  paz: foto('curtindo-paz-jason-childs.jpg', 'Jason Childs'),
  presidente: foto('curtindo-presidente-2004-steve-sherman.jpg', 'Steve Sherman / Surfing Magazine'),
  tuboTeahupoo: foto('surfando-teahupoo-tubo-de-pe-bielmann.jpg', 'Brian Bielmann'),
  bandeira2010: foto('curtindo-teahupoo-2010-bandeira-bielmann.jpg', 'Foto: Brian Bielmann'),
  carregadoPipe: foto('curtindo-pipe-masters-carregado.jpg', 'Foto: WSL'),
};
