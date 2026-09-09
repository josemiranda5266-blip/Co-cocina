import { Category } from '../types';

export const INITIAL_CATEGORIES: Category[] = [
  // Comidas
  {
    id: 'carnes',
    name: 'Carnes',
    slug: 'carnes',
    group: 'Comidas',
    iconName: 'Beef',
    description: 'Milanesas, peceto, estofados y cortes de carne jugosos.',
    subcategories: ['Milanesas', 'Estofados', 'Guisos', 'Cortes al horno', 'Carne picada']
  },
  {
    id: 'pollo',
    name: 'Pollo',
    slug: 'pollo',
    group: 'Comidas',
    iconName: 'Drumstick',
    description: 'Pollo al horno, crocante, a la cacerola, supremo y salteados.',
    subcategories: ['Pollo al horno', 'Supremas', 'Pollo frito', 'Cacerola', 'Relleno']
  },
  {
    id: 'cerdo',
    name: 'Cerdo',
    slug: 'cerdo',
    group: 'Comidas',
    iconName: 'Ham',
    description: 'Bondiola, matambre de cerdo, costillitas a la barbacoa y salteados.',
    subcategories: ['Bondiola', 'Matambrito', 'Costillas', 'Solomillo']
  },
  {
    id: 'pescados',
    name: 'Pescados',
    slug: 'pescados',
    group: 'Comidas',
    iconName: 'Fish',
    description: 'Merluza al horno, salmón, empanizados y filetes a la plancha.',
    subcategories: ['Merluza', 'Salmón', 'Pescado al horno', 'Ceviche']
  },
  {
    id: 'mariscos',
    name: 'Mariscos',
    slug: 'mariscos',
    group: 'Comidas',
    iconName: 'FishSymbol',
    description: 'Calamares, cazuelas de mariscos, langostinos y paellas.',
    subcategories: ['Rabas', 'Cazuela', 'Langostinos', 'Paella']
  },
  {
    id: 'pastas',
    name: 'Pastas',
    slug: 'pastas',
    group: 'Comidas',
    iconName: 'Wheat',
    description: 'Ñoquis, fideos caseros, ravioles, canelones y lasañas.',
    subcategories: ['Ñoquis', 'Ravioles', 'Fideos caseros', 'Lasaña', 'Canelones']
  },
  {
    id: 'arroces',
    name: 'Arroces',
    slug: 'arroces',
    group: 'Comidas',
    iconName: 'CookingPot',
    description: 'Arroz con pollo, risotto cremoso, paellas y guarniciones.',
    subcategories: ['Arroz con pollo', 'Risotto', 'Arroz frito', 'Paella']
  },
  {
    id: 'pizza',
    name: 'Pizza',
    slug: 'pizza',
    group: 'Comidas',
    iconName: 'Pizza',
    description: 'Masa de pizza casera, fugazzeta, napolitana y pizza a la piedra.',
    subcategories: ['Masa casera', 'Fugazzeta', 'Napolitana', 'Sin horno', 'A la piedra']
  },
  {
    id: 'empanadas',
    name: 'Empanadas',
    slug: 'empanadas',
    group: 'Comidas',
    iconName: 'Utensils',
    description: 'Empanadas de carne jugosas, jamón y queso, pollo y verdura.',
    subcategories: ['Carne tucumana', 'Jamón y queso', 'Pollo', 'Masa de empanadas']
  },
  {
    id: 'hamburguesas',
    name: 'Hamburguesas',
    slug: 'hamburguesas',
    group: 'Comidas',
    iconName: 'Sandwich',
    description: 'Smash burgers, caseras clásicas, caseras con queso cheddar y pan de papa.',
    subcategories: ['Smash Burger', 'Pan de papa', 'Caseras con cheddar', 'Lentejas']
  },
  {
    id: 'ensaladas',
    name: 'Ensaladas',
    slug: 'ensaladas',
    group: 'Comidas',
    iconName: 'Salad',
    description: 'Ensalada Caesar, mixtas, tibias, de pasta y opciones nutritivas.',
    subcategories: ['Caesar', 'Proteicas', 'Tíbias', 'De pasta']
  },
  {
    id: 'sopas',
    name: 'Sopas',
    slug: 'sopas',
    group: 'Comidas',
    iconName: 'Soup',
    description: 'Sopa cremosas de zapallo, verduras, minestrone y caldos.',
    subcategories: ['Sopa de crema de zapallo', 'Verduras', 'Minestrone', 'Caldo casero']
  },
  {
    id: 'guisos',
    name: 'Guisos',
    slug: 'guisos',
    group: 'Comidas',
    iconName: 'Flame',
    description: 'Guiso de lentejas, locro criollo, carbonada y guisados reconstituyentes.',
    subcategories: ['Guiso de lentejas', 'Locro', 'Carbonada', 'Guiso de arroz']
  },
  {
    id: 'asados',
    name: 'Asados',
    slug: 'asados',
    group: 'Comidas',
    iconName: 'Flame',
    description: 'Secretos del asado argentino, choripán, provoleta y achuras.',
    subcategories: ['Cortes a la parrilla', 'Provoleta', 'Choripán', 'Chimichurri']
  },
  {
    id: 'sandwiches',
    name: 'Sándwiches',
    slug: 'sandwiches',
    group: 'Comidas',
    iconName: 'Sandwich',
    description: 'Sánguche de milanesa, tostados, lomitos y baquetes rellenos.',
    subcategories: ['Sánguche de milanesa', 'Lomito completo', 'Tostado de miga']
  },

  // Repostería
  {
    id: 'tortas',
    name: 'Tortas',
    slug: 'tortas',
    group: 'Repostería',
    iconName: 'Cake',
    description: 'Chocotorta, Torta Balcarce, bizcochuelos esponjosos y lemon pie.',
    subcategories: ['Chocotorta', 'Lemon Pie', 'Bizcochuelo', 'Torta de chocolate', 'Cheesecake']
  },
  {
    id: 'budines',
    name: 'Budines',
    slug: 'budines',
    group: 'Repostería',
    iconName: 'CakeSlice',
    description: 'Budín de limón y amapolas, banana marmolado, marmolado de vainilla.',
    subcategories: ['Budín de limón', 'Budín de banana', 'Marmolado', 'Sin TACC']
  },
  {
    id: 'galletas',
    name: 'Galletas',
    slug: 'galletas',
    group: 'Repostería',
    iconName: 'Cookie',
    description: 'Galletitas con chispas de chocolate, pepas con dulce de membrillo y polvorones.',
    subcategories: ['Chispas de chocolate', 'Pepas de membrillo', 'Alfajores']
  },
  {
    id: 'panes',
    name: 'Panes',
    slug: 'panes',
    group: 'Repostería',
    iconName: 'Wheat',
    description: 'Pan casero, pan lactal, baguette, masa madre y chipá.',
    subcategories: ['Pan casero de campo', 'Chipá', 'Pan lactal', 'Masa madre']
  },
  {
    id: 'postres',
    name: 'Postres',
    slug: 'postres',
    group: 'Repostería',
    iconName: 'IceCream',
    description: 'Flan casero con dulce de leche, tiramisú, mousse de chocolate y vigilante.',
    subcategories: ['Flan casero', 'Tiramisú', 'Mousse de chocolate', 'Panqueques con ddl']
  },
  {
    id: 'helados',
    name: 'Helados',
    slug: 'helados',
    group: 'Repostería',
    iconName: 'IceCream',
    description: 'Helado casero de dulce de leche, frutilla cremoso y paletas.',
    subcategories: ['Helado de dulce de leche', 'Frutal sin máquina', 'Paletas']
  },

  // Otras
  {
    id: 'desayunos',
    name: 'Desayunos',
    slug: 'desayunos',
    group: 'Otras',
    iconName: 'Coffee',
    description: 'Medialunas caseras, tostadas con huevo, bowls y mates acompañados.',
    subcategories: ['Medialunas', 'Huevos revueltos', 'Pancakes', 'Granola']
  },
  {
    id: 'meriendas',
    name: 'Meriendas',
    slug: 'meriendas',
    group: 'Otras',
    iconName: 'Coffee',
    description: 'Torta frita, scones, bizcochitos de grasa y churros.',
    subcategories: ['Tortas fritas', 'Bizcochitos de grasa', 'Scones', 'Churros']
  },
  {
    id: 'bebidas',
    name: 'Bebidas',
    slug: 'bebidas',
    group: 'Otras',
    iconName: 'Coffee',
    description: 'Licuados de fruta, limonada con menta y jengibre, smoothies y café.',
    subcategories: ['Limonada casera', 'Licuados', 'Smoothies', 'Tragos sin alcohol']
  },
  {
    id: 'salsas',
    name: 'Salsas',
    slug: 'salsas',
    group: 'Otras',
    iconName: 'UtensilsCrossed',
    description: 'Salsa tuco casera, bechamel, chimichurri, criolla y pesto.',
    subcategories: ['Tuco casero', 'Salsa blanca', 'Chimichurri', 'Pesto de albahaca']
  },
  {
    id: 'conservas',
    name: 'Conservas',
    slug: 'conservas',
    group: 'Otras',
    iconName: 'Package',
    description: 'Berenjenas al escabeche, dulce de leche casero y mermeladas de estación.',
    subcategories: ['Escabeche', 'Dulce de leche casero', 'Mermeladas']
  }
];
