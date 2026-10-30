/** Catálogo de puertas modernas de metal (PDF "Puertas modernas de metal", 2026). Precios en soles, no incluyen IGV. */
export type Estilo = 'madera' | 'oscuro' | 'claro' | 'vidrio' | 'inox' | 'especial';

export interface Puerta {
  codigo: string;          // "PM 05"
  img: string;             // pm05
  nombre: string;
  precio: number | null;   // null = precio según medida
  detalle?: string;
  medida?: string;
  estilos: Estilo[];
}

export const ESTILOS: { id: Estilo | 'todas'; nombre: string }[] = [
  { id: 'todas', nombre: 'Todas' },
  { id: 'madera', nombre: 'Imitación madera' },
  { id: 'oscuro', nombre: 'Negro y gris' },
  { id: 'claro', nombre: 'Blanco y 2 colores' },
  { id: 'vidrio', nombre: 'Con vidrio' },
  { id: 'inox', nombre: 'Acero inoxidable' },
  { id: 'especial', nombre: 'Arco, pivotante y reja' },
];

const p = (n: number, nombre: string, precio: number | null, estilos: Estilo[], detalle?: string, medida?: string): Puerta => {
  const c = String(n).padStart(2, '0');
  return { codigo: 'PM ' + c, img: 'pm' + c, nombre, precio, estilos, detalle, medida };
};

export const PUERTAS: Puerta[] = [
  p(1, 'Machihembrado liso', 2585, ['madera'], 'Imitación madera brillante'),
  p(2, 'Machihembrado liso', 2585, ['madera'], 'Imitación madera mate'),
  p(3, 'Machihembrado liso gloss', 2585, ['oscuro'], 'Negro mate gloss'),
  p(4, 'Machihembrado liso gloss', 2585, ['oscuro'], 'Gris automotriz brillante'),
  p(5, 'Diseño moderno', 2640, ['madera']),
  p(6, 'Diseño moderno', 2640, ['madera']),
  p(7, 'Vidrio lateral', 2695, ['madera', 'vidrio'], 'Imitación madera brillante, vidrio reflejante de 6 mm'),
  p(8, 'Vidrio lateral', 2695, ['madera', 'vidrio'], 'Imitación madera mate, vidrio reflejante de 6 mm'),
  { ...p(9, 'Estilo repujado', 2695, ['madera', 'especial'], 'Lámina importada metálica a prensa caliente'), codigo: 'PM 09 · 10 · 11' },
  p(12, 'Platinas de acero', 2805, ['madera', 'inox'], 'Platinas empotradas'),
  p(13, 'Platinas de acero', 2805, ['madera', 'inox'], 'Platinas sobrepuestas'),
  p(14, 'Detalles de vidrios', 2805, ['madera', 'vidrio'], 'Imitación madera brillante'),
  p(15, 'Detalles de vidrios', 2805, ['oscuro', 'vidrio'], 'Acabado negro gloss'),
  p(16, 'Vidrio o acero', 2805, ['madera', 'vidrio'], '7 vidrios reflejantes de 6 mm'),
  p(17, 'Vidrio o acero', 2915, ['madera', 'inox'], '7 bandejas de acero de 5 cm'),
  p(18, 'Acabado gloss', 2805, ['oscuro', 'inox'], 'Color aluminio con platinas sobrepuestas'),
  p(19, 'Material importado', 2915, ['madera'], 'Acero galvanizado 0.45 mm, panel de 40 mm con espuma de poliuretano tipo sándwich'),
  p(20, 'Puerta moderna', 2915, ['madera'], 'Estructura con tubo de 6×2'),
  p(21, 'Puerta moderna', 3025, ['madera', 'vidrio'], 'Detalle central de acero con vidrio'),
  p(22, 'Puerta moderna', 2915, ['madera', 'vidrio'], '4 detalles de vidrio reflejante de 6 mm, diseño a tu gusto'),
  p(23, 'Puerta moderna', 2915, ['madera', 'vidrio']),
  p(24, 'Diseño moderno', 2915, ['madera', 'vidrio']),
  p(25, 'Vidrios y estructura', 2915, ['madera', 'vidrio'], 'Vidrio reflejante de 6 mm'),
  p(26, 'Vidrios y estructura', 2915, ['madera', 'vidrio'], 'Vidrio pavonado de 6 mm'),
  p(27, 'Vidrio y acero', 2915, ['madera', 'vidrio']),
  p(28, 'Puerta moderna', 3025, ['madera', 'vidrio']),
  p(29, 'Vidrio y acero', 3135, ['madera', 'vidrio', 'inox'], 'Cuadros y platinas de acero con vidrio pavonado'),
  p(30, 'Vidrio y acero', 3135, ['madera', 'vidrio', 'inox'], 'Triángulos de acero con vidrio reflejante'),
  p(31, 'Estilo en negro', 2915, ['oscuro', 'inox'], '5 platinas de acero de 5 mm, sin marco de hoja'),
  p(32, 'Estilo en negro', 2915, ['oscuro', 'inox'], 'Platinas y bandeja lateral de acero'),
  p(33, 'Estilo en negro', 3025, ['oscuro', 'vidrio', 'inox'], 'Vidrio lateral y 3 platinas de acero'),
  p(34, 'Estilo en negro', 3025, ['oscuro', 'inox'], 'Detalles de cuadro en acero inoxidable'),
  p(35, 'Estilo en blanco', 2805, ['claro', 'inox']),
  p(36, 'Estilo en blanco', 2805, ['claro', 'vidrio']),
  p(37, 'Estilo en blanco', 2650, ['claro', 'vidrio'], 'Con 1 vidrio lateral'),
  p(38, 'Estilo en blanco', 2805, ['claro', 'vidrio'], 'Con 6 vidrios pavonados'),
  p(39, 'Estilo en blanco', 2915, ['claro', 'vidrio', 'inox'], '1 vidrio lateral y 4 platinas de acero inoxidable'),
  p(40, '2 colores modernos', 2915, ['claro'], 'Combina los colores a tu preferencia'),
  p(41, '2 colores modernos', 3025, ['claro', 'vidrio'], 'Combina los colores a tu preferencia'),
  p(42, '2 colores modernos', 2915, ['claro'], 'Combina los colores a tu preferencia'),
  p(43, '2 colores modernos', 2915, ['claro', 'madera'], 'Combina los colores a tu preferencia'),
  p(44, 'Entrecruzado moderno', 2915, ['madera', 'inox']),
  p(45, 'Acero inox y vidrio', 3025, ['claro', 'vidrio', 'inox'], 'Detalle diagonal de acero inoxidable 304 y vidrios'),
  p(46, 'Diseño con acero inox', 3135, ['madera', 'inox'], 'Detalle central de acero inoxidable 304'),
  p(47, 'Diseño con acero inox', 3135, ['madera', 'inox'], 'Detalle lateral de acero inoxidable 304'),
  p(48, 'Diseño 16 bandejas', 3135, ['madera']),
  p(49, 'Diseño media luna', 3190, ['madera', 'vidrio']),
  p(50, 'Diseño con acero inox', 3190, ['madera', 'inox'], '3 líneas de acero inoxidable 304 y bandeja en la parte baja'),
  p(51, 'Diseño moderno', 3190, ['oscuro']),
  p(52, 'Diseño en relieve', 3190, ['oscuro', 'madera']),
  p(53, 'Diseño moderno', 3190, ['claro', 'vidrio'], 'No incluye chapa digital'),
  p(54, 'Diseño con luz LED', 3300, ['oscuro', 'especial']),
  p(55, 'Diseño moderno', 3300, ['oscuro']),
  p(56, 'Diseño en relieve', 3410, ['oscuro', 'vidrio']),
  p(57, 'Medio punto', 3025, ['madera', 'especial']),
  p(58, 'Medio punto', 3135, ['madera', 'especial']),
  p(59, 'Medio punto', 3245, ['madera', 'vidrio', 'especial']),
  p(60, 'Medio punto', 3465, ['madera', 'vidrio', 'especial']),
  p(61, 'Sin contraplacar', 2475, ['madera'], 'Vista interior. Diseño en 1 sola cara'),
  p(62, 'Sin contraplacar', 2475, ['madera'], 'Vista exterior. Diseño en 1 sola cara'),
  p(63, 'Sin contraplacar', 2090, ['oscuro'], 'Vista interior en base. Diseño en 1 sola cara'),
  p(64, 'Sin contraplacar', 2090, ['oscuro'], 'Terminada. Diseño en 1 sola cara'),
  p(65, 'Pivotante', 3685, ['madera', 'especial'], undefined, '2.60 × 1.20 m'),
  p(66, 'Pivotante', 3685, ['madera', 'especial'], undefined, '2.60 × 1.20 m'),
  p(67, 'Modelo con fijas', null, ['claro', 'vidrio', 'especial'], 'Para vanos de 1.20 a 1.50 m o más', 'A medida'),
  p(68, 'Modelo con fijas', null, ['madera', 'vidrio', 'especial'], 'Para vanos de 1.20 a 1.50 m o más', 'A medida'),
  p(69, 'Reja con vidrios', 2805, ['oscuro', 'vidrio', 'inox', 'especial'], 'Vidrio pavonado templado de 8 mm y cuadros de acero inoxidable'),
  p(70, 'Reja y vidrios', 2585, ['madera', 'vidrio', 'especial'], 'Vidrio pavonado templado de 8 mm y tubos redondos de acero inoxidable'),
  p(71, 'Diseño de 2 piezas', 3245, ['oscuro', 'vidrio', 'especial'], 'Estructura en 2 piezas, acabado gloss, cuadros con vidrio, doble seguridad'),
  p(72, 'Diseño de 2 piezas', 3245, ['claro', 'vidrio', 'especial'], 'Estructura en 2 piezas, acabado gloss, cuadros con vidrio, doble seguridad'),
  p(73, 'Reja estructural', 3850, ['madera', 'inox', 'especial'], 'Tubos cruzados de acero inoxidable'),
];
