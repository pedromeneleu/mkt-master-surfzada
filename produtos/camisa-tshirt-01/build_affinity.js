// Desenha um JSON de camadas (gerado em Python) dentro de uma prancheta do Affinity.
// Substitui o grupo anterior de mesmo nome, se existir.
const { Document } = require('/document.js');
const { Application } = require('/application.js');
const { File } = require('/fs.js');
const { AddChildNodesCommandBuilder, CompoundCommandBuilder, DocumentCommand, InsertionMode, BlendMode } = require('/commands.js');
const { PolyCurveNodeDefinition, ContainerNodeDefinition } = require('/nodes.js');
const { CurveBuilder, Curve, PolyCurve, Rectangle } = require('/geometry.js');
const { FillDescriptor } = require('/fills.js');
const { LineStyleDescriptor } = require('/linestyle.js');
const { RGBA8 } = require('/colours.js');
const { Selection } = require('/selections.js');

const JSON_NAME = 'back.json';
const ARTBOARD = 'COSTAS';
const GROUP = 'ARTE COSTAS';

const doc = Document.current;
const path = Application.userDesktopPath + '\\surfzada_tshirt\\' + JSON_NAME;
const data = JSON.parse(File.readAll(path).toString());
const board = [...doc.currentSpread.children].find(n => n.userDescription == ARTBOARD);
const box = board.artboardInterface.spreadBaseBox;
const ox = box.x, oy = box.y;

// remove versão anterior
const old = [...board.children].find(n => n.userDescription == GROUP);
if (old) doc.executeCommand(DocumentCommand.createDeleteSelection(Selection.create(doc, old)));

const solid = c => FillDescriptor.createSolid(new RGBA8(c[0], c[1], c[2], 255), BlendMode.Normal);

function polyFor(L) {
  const pc = PolyCurve.create();
  let cb = null;
  const flush = () => { if (cb) { pc.addCurve(cb.createCurve()); cb = null; } };
  for (const c of L.contours) {
    const k = c[0];
    if (k == 'M') { flush(); cb = CurveBuilder.create().beginXY(c[1] + ox, c[2] + oy); }
    else if (k == 'L') cb.lineToXY(c[1] + ox, c[2] + oy);
    else if (k == 'C') cb.addBezierXY(c[1] + ox, c[2] + oy, c[3] + ox, c[4] + oy, c[5] + ox, c[6] + oy);
    else if (k == 'Z') { cb.close(); flush(); }
  }
  flush();
  for (const e of L.ellipses)
    pc.addCurve(Curve.createEllipse(new Rectangle(e[0] - e[2] + ox, e[1] - e[2] + oy, 2 * e[2], 2 * e[2])));
  return pc;
}

// grupo
const gb = AddChildNodesCommandBuilder.create();
gb.setInsertionTarget(board);
gb.setInsertionMode(InsertionMode.Inside_AtBack);
const cdef = ContainerNodeDefinition.create();
cdef.userDescription = GROUP;
gb.addContainerNode(cdef);
doc.executeCommand(gb.createCommand());
const group = [...board.children].find(n => n.userDescription == GROUP);

// camadas: num único builder, a última adicionada fica por cima
const b = AddChildNodesCommandBuilder.create();
b.setInsertionTarget(group);
b.setInsertionMode(InsertionMode.Inside_AtFront);
const none = FillDescriptor.createNone();
for (const L of data.layers) {
  const pc = polyFor(L);
  const fill = L.fill ? solid(L.fill) : none;
  const pen = L.stroke ? solid(L.stroke) : none;
  const ls = LineStyleDescriptor.createDefault(L.stroke ? L.width : 0);
  const def = PolyCurveNodeDefinition.create(pc, fill, pen, ls, none);
  def.userDescription = L.name;
  b.addPolyCurveNode(def);
}
doc.executeCommand(b.createCommand());
console.log('ok', ARTBOARD, [...group.children].map(n => n.userDescription).join(' | '));
