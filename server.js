const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'princessware_super_secret_key_2026';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD_RAW = process.env.ADMIN_PASSWORD || 'princess2026';

// Generar hash bcrypt de la contraseña por defecto para validación
const ADMIN_PASSWORD_HASH = bcrypt.hashSync(ADMIN_PASSWORD_RAW, 10);

app.use(express.json());
app.use(cookieParser());

// Rutas de archivos
const DATA_DIR = path.join(__dirname, 'data');
const DB_PATH = path.join(DATA_DIR, 'db.json');
const CLIENT_DATA_PATH = path.join(__dirname, 'js', 'data.js');
const ASSETS_DIR = path.join(__dirname, 'assets');

// Asegurar que existan directorios necesarios
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(ASSETS_DIR)) {
  fs.mkdirSync(ASSETS_DIR, { recursive: true });
}

// Datos de semilla (iniciales) - Con sistema de SKU estructurado
const SEED_DATA = {
  CATEGORIES: [
    { id: 'sets', name: 'Sets Completos', desc: 'Baterías listas para tu cocina', img: 'assets/set-stacked-island.jpeg' },
    { id: 'ollas', name: 'Ollas & Cacerolas', desc: 'Cocción profunda y uniforme', img: 'assets/hero-pot-stove.jpeg' },
    { id: 'sartenes', name: 'Sartenes & Asadores', desc: 'Dorá y sellá sin pegarse', img: 'assets/action-chicken.jpeg' },
    { id: 'vapor', name: 'Cocción al Vapor', desc: 'Nutrientes intactos, sin agua', img: 'assets/action-veggies-steam.jpeg' },
  ],
  PRODUCTS: [
    {
      id: 'PW-SET-FAM-18', name: 'Set Familiar Princessware', pieces: '18 piezas', cat: 'sets', img: 'assets/set-two-stacks.jpeg',
      gallery: ['assets/set-two-stacks.jpeg', 'assets/set-stacked-island.jpeg', 'assets/life-food-pans.jpeg'],
      price: 1290000, compare: 1850000, badge: 'Más vendido', rating: 4.9, reviews: 213,
      blurb: 'La batería completa para toda la familia. Cociná varios platos a la vez con cocción uniforme y termo-selladora.',
      desc: 'El Set Familiar reúne todo lo que una cocina necesita: ollas de distintos diámetros, cacerolas, sartén asador y vaporera, todo en acero quirúrgico 18/8. Las tapas con cierre termo-sellador cocinan en el jugo natural de los alimentos, sin aceite ni agua, conservando hasta el 98% de los nutrientes.',
      specs: { material: 'Acero quirúrgico 18/8', apto: 'Gas, eléctrica, vitrocerámica e inducción', incluye: '8 ollas, 4 tapas, sartén asador y vaporera', garantia: 'De por vida' }
    },
    {
      id: 'PW-SET-ESE-09', name: 'Set Esencial', pieces: '9 piezas', cat: 'sets', img: 'assets/set-four-black.jpeg',
      gallery: ['assets/set-four-black.jpeg', 'assets/set-stacked-island.jpeg', 'assets/hero-pot-stove.jpeg'],
      price: 790000, compare: 990000, badge: 'Oferta', rating: 4.8, reviews: 156,
      blurb: 'Lo indispensable en acero quirúrgico 18/8 para el día a día.',
      desc: 'Pensado para arrancar con lo justo y necesario. El Set Esencial trae las piezas que más vas a usar, apilables para ahorrar espacio, con la misma calidad de acero 18/8 de toda la línea.',
      specs: { material: 'Acero quirúrgico 18/8', apto: 'Todas las cocinas, incluida inducción', incluye: '4 ollas, 3 tapas, 1 sartén, 1 vaporera', garantia: 'De por vida' }
    },
    {
      id: 'PW-SET-DUO-06', name: 'Set Dúo Compacto', pieces: '6 piezas', cat: 'sets', img: 'assets/life-food-pans.jpeg',
      gallery: ['assets/life-food-pans.jpeg', 'assets/set-two-stacks.jpeg'],
      price: 560000, compare: null, badge: null, rating: 4.7, reviews: 98,
      blurb: 'Ideal para parejas y espacios chicos. Apilable y práctico.',
      desc: 'El compañero perfecto para departamentos y parejas. Compacto, apilable y completo para el día a día sin ocupar media alacena.',
      specs: { material: 'Acero quirúrgico 18/8', apto: 'Todas las cocinas, incluida inducción', incluye: '3 ollas, 2 tapas, 1 sartén', garantia: 'De por vida' }
    },
    {
      id: 'PW-OLL-PRO-24', name: 'Olla Profunda', pieces: '24 cm', cat: 'ollas', img: 'assets/hero-pot-stove.jpeg',
      gallery: ['assets/hero-pot-stove.jpeg', 'assets/set-stacked-island.jpeg'],
      price: 320000, compare: null, badge: null, rating: 4.9, reviews: 74,
      blurb: 'Guisos, caldos y pastas con cierre termo-sellador.',
      desc: 'Gran capacidad para guisos, caldos y pastas. Su cierre termo-sellador mantiene el calor y reduce los tiempos de cocción.',
      specs: { material: 'Acero quirúrgico 18/8', apto: 'Todas las cocinas, incluida inducción', incluye: '1 olla 24 cm + tapa', garantia: 'De por vida' }
    },
    {
      id: 'PW-CAC-TAP-20', name: 'Cacerola con Tapa', pieces: '20 cm', cat: 'ollas', img: 'assets/action-veggies-steam.jpeg',
      gallery: ['assets/action-veggies-steam.jpeg', 'assets/action-hands-veggies.jpeg'],
      price: 268000, compare: 330000, badge: null, rating: 4.8, reviews: 61,
      blurb: 'Verduras al vapor en su propio jugo, sin perder color.',
      desc: 'La cacerola de uso diario. Cociná verduras al vapor en su propio jugo, sin agua, para que conserven color, textura y vitaminas.',
      specs: { material: 'Acero quirúrgico 18/8', apto: 'Todas las cocinas, incluida inducción', incluye: '1 cacerola 20 cm + tapa', garantia: 'De por vida' }
    },
    {
      id: 'PW-SAR-ASA-28', name: 'Sartén Asador', pieces: '28 cm', cat: 'sartenes', img: 'assets/action-chicken.jpeg',
      gallery: ['assets/action-chicken.jpeg', 'assets/hero-pot-stove.jpeg'],
      price: 245000, compare: null, badge: 'Nuevo', rating: 4.9, reviews: 40,
      blurb: 'Sellá carnes y dorá sin aceite gracias a la base de triple capa.',
      desc: 'Base de triple capa para distribución pareja del calor. Sellá carnes y dorá sin que se pegue ni necesite aceite.',
      specs: { material: 'Acero quirúrgico 18/8', apto: 'Todas las cocinas, incluida inducción', incluye: '1 sartén asador 28 cm', garantia: 'De por vida' }
    },
    {
      id: 'PW-BUD-VAP-MU', name: 'Budinera Vaporera', pieces: 'Multiuso', cat: 'vapor', img: 'assets/action-hands-veggies.jpeg',
      gallery: ['assets/action-hands-veggies.jpeg', 'assets/action-veggies-steam.jpeg'],
      price: 198000, compare: null, badge: null, rating: 4.7, reviews: 33,
      blurb: 'Cociná al vapor en niveles y aprovechá cada hornalla.',
      desc: 'Cociná en varios niveles a la vez y aprovechá una sola hornalla. Ideal para vapor, budines y postres.',
      specs: { material: 'Acero quirúrgico 18/8', apto: 'Todas las cocinas, incluida inducción', incluye: '1 budinera + accesorio vaporera', garantia: 'De por vida' }
    },
    {
      id: 'PW-OLL-FAM-28', name: 'Olla Familiar', pieces: '28 cm', cat: 'ollas', img: 'assets/set-stacked-island.jpeg',
      gallery: ['assets/set-stacked-island.jpeg', 'assets/set-two-stacks.jpeg'],
      price: 360000, compare: null, badge: null, rating: 4.9, reviews: 52,
      blurb: 'Gran capacidad para las comidas que reúnen a todos.',
      desc: 'La olla de las juntadas. Gran capacidad para cocinar para muchos sin resignar la cocción pareja del acero 18/8.',
      specs: { material: 'Acero quirúrgico 18/8', apto: 'Todas las cocinas, incluida inducción', incluye: '1 olla 28 cm + tapa', garantia: 'De por vida' }
    }
  ],
  BENEFITS: [
    { k: 'oil', title: 'Sin aceite ni agua', desc: 'Cociná en el jugo natural de los alimentos.' },
    { k: 'tox', title: 'Cero tóxicos', desc: 'Acero quirúrgico 18/8. Sin teflón, sin PFOA.' },
    { k: 'leaf', title: 'Conserva nutrientes', desc: 'Hasta 98% de vitaminas y minerales.' },
    { k: 'life', title: 'Garantía de por vida', desc: 'Una inversión que dura para siempre.' }
  ],
  RECIPES: [
    { tag: 'Sin aceite', title: 'Pollo dorado al natural', desc: 'Sellado perfecto sin una gota de aceite, en el sartén asador.', img: 'assets/action-chicken.jpeg', time: '35 min', level: 'Fácil' },
    { tag: 'Al vapor', title: 'Verduras crocantes al vapor', desc: 'Color, textura y nutrientes intactos cocinando en su propio jugo.', img: 'assets/action-veggies-steam.jpeg', time: '18 min', level: 'Fácil' },
    { tag: 'Guisos', title: 'Guiso de invierno', desc: 'Cocción lenta y pareja con cierre termo-sellador.', img: 'assets/hero-pot-stove.jpeg', time: '50 min', level: 'Media' },
    { tag: 'Saludable', title: 'Salteado de estación', desc: 'Un wok improvisado con el sartén de triple capa.', img: 'assets/action-hands-veggies.jpeg', time: '20 min', level: 'Fácil' },
    { tag: 'Para compartir', title: 'Pastas para toda la mesa', desc: 'La olla familiar rinde para las juntadas grandes.', img: 'assets/set-stacked-island.jpeg', time: '30 min', level: 'Fácil' },
    { tag: 'Postres', title: 'Budín en vaporera', desc: 'Húmedo y parejo, aprovechando una sola hornalla.', img: 'assets/life-food-pans.jpeg', time: '45 min', level: 'Media' }
  ],
  SETTINGS: {
    whatsapp: '5491100000000',
    instagram: 'princessware.oficial',
    freeShip: 800000,
    headingFont: 'Cormorant Garamond',
    favUpsellText: 'Guardaste estas piezas en tus favoritos 🤍. ¿Querés agregar alguna a tu compra a último momento?',
    favUpsellDiscount: 10,
    shipCABA: 15000,
    shipProvincias: 22000,
    shipInterior: 29000,
    shipExterior: 79000,
    catalogMode: true
  },
  ORDERS: [], // Sistema de pedidos
  LEADS: [],  // CRM de Prospectos de Favoritos
  USERS: []   // Compradores registrados
};

// Cargar base de datos o inicializar
let dbData = {};
if (fs.existsSync(DB_PATH)) {
  try {
    dbData = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  } catch (e) {
    console.error('Error al leer db.json. Usando datos de semilla.');
    dbData = { ...SEED_DATA };
    fs.writeFileSync(DB_PATH, JSON.stringify(dbData, null, 2));
  }
} else {
  dbData = { ...SEED_DATA };
  fs.writeFileSync(DB_PATH, JSON.stringify(dbData, null, 2));
}

// --- MIGRACIÓN / MAPEO DE IDS ANTIGUOS A SKU ---
const SKU_MAPPING = {
  'p1': 'PW-SET-FAM-18',
  'p2': 'PW-SET-ESE-09',
  'p3': 'PW-SET-DUO-06',
  'p4': 'PW-OLL-PRO-24',
  'p5': 'PW-CAC-TAP-20',
  'p6': 'PW-SAR-ASA-28',
  'p7': 'PW-BUD-VAP-MU',
  'p8': 'PW-OLL-FAM-28'
};

let needsMigration = false;
if (dbData.PRODUCTS) {
  dbData.PRODUCTS = dbData.PRODUCTS.map(p => {
    if (SKU_MAPPING[p.id]) {
      p.id = SKU_MAPPING[p.id];
      needsMigration = true;
    }
    return p;
  });
}
if (!dbData.ORDERS) {
  dbData.ORDERS = [];
  needsMigration = true;
}

if (!dbData.LEADS) {
  dbData.LEADS = [];
  needsMigration = true;
}

if (!dbData.USERS) {
  dbData.USERS = [];
  needsMigration = true;
}

if (!dbData.SETTINGS) {
  dbData.SETTINGS = {};
  needsMigration = true;
}
if (dbData.SETTINGS.favUpsellText === undefined) {
  dbData.SETTINGS.favUpsellText = 'Guardaste estas piezas en tus favoritos 🤍. ¿Querés agregar alguna a tu compra a último momento?';
  needsMigration = true;
}
if (dbData.SETTINGS.favUpsellDiscount === undefined) {
  dbData.SETTINGS.favUpsellDiscount = 10;
  needsMigration = true;
}
if (dbData.SETTINGS.shipCABA === undefined) {
  dbData.SETTINGS.shipCABA = 15000;
  needsMigration = true;
}
if (dbData.SETTINGS.shipProvincias === undefined) {
  dbData.SETTINGS.shipProvincias = 22000;
  needsMigration = true;
}
if (dbData.SETTINGS.shipInterior === undefined) {
  dbData.SETTINGS.shipInterior = 29000;
  needsMigration = true;
}
if (dbData.SETTINGS.shipExterior === undefined) {
  dbData.SETTINGS.shipExterior = 79000;
  needsMigration = true;
}
if (dbData.SETTINGS.catalogMode === undefined) {
  dbData.SETTINGS.catalogMode = true;
  needsMigration = true;
}

if (needsMigration) {
  console.log('Migración de IDs a SKUs/Settings completada en la base de datos.');
  fs.writeFileSync(DB_PATH, JSON.stringify(dbData, null, 2));
}

// Regenerar js/data.js inicial por si acaso
syncClientDataFile();

// Función para sincronizar la base de datos y el data.js estático
function syncClientDataFile() {
  const content = `/* data.js — catálogo Princessware (datos compartidos por todas las páginas) */
(function () {
  const fmt = (n) => '$' + Number(n).toLocaleString('es-AR');

  const CATEGORIES = ${JSON.stringify(dbData.CATEGORIES, null, 2)};

  const PRODUCTS = ${JSON.stringify(dbData.PRODUCTS, null, 2)};

  const BENEFITS = ${JSON.stringify(dbData.BENEFITS, null, 2)};

  const RECIPES = ${JSON.stringify(dbData.RECIPES, null, 2)};

  const SETTINGS = ${JSON.stringify(dbData.SETTINGS, null, 2)};

  window.PW = { fmt, CATEGORIES, PRODUCTS, BENEFITS, RECIPES, SETTINGS };
})();
`;
  
  // Guardamos todo en db.json
  fs.writeFileSync(DB_PATH, JSON.stringify(dbData, null, 2));
  // Escribimos data.js para el cliente
  fs.writeFileSync(CLIENT_DATA_PATH, content, 'utf8');
}

// Multer para subida de imágenes
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, ASSETS_DIR);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-');
    cb(null, `${basename}-${Date.now()}${ext}`);
  }
});
const upload = multer({ storage: storage });

// Middleware para verificar autenticación con JWT
const requireAuth = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ error: 'No autorizado, por favor iniciá sesión.' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Sesión expirada o token inválido.' });
  }
};

// --- RUTAS DE AUTENTICACIÓN ---
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Usuario y contraseña son requeridos.' });
  }

  const userMatch = username.toLowerCase() === ADMIN_USERNAME.toLowerCase();
  const passwordMatch = bcrypt.compareSync(password, ADMIN_PASSWORD_HASH);

  if (userMatch && passwordMatch) {
    const token = jwt.sign({ username: ADMIN_USERNAME }, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
    });
    return res.json({ success: true, message: 'Sesión iniciada con éxito.' });
  } else {
    return res.status(401).json({ error: 'Credenciales inválidas.' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token');
  return res.json({ success: true, message: 'Sesión cerrada.' });
});

app.get('/api/auth/verify', (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.json({ authenticated: false });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return res.json({ authenticated: true, username: decoded.username });
  } catch (err) {
    return res.json({ authenticated: false });
  }
});

// --- RUTA PARA SUBIR IMÁGENES ---
app.post('/api/upload', requireAuth, upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'gallery', maxCount: 10 }
]), (req, res) => {
  const response = {
    image: null,
    gallery: []
  };

  if (req.files['image'] && req.files['image'][0]) {
    response.image = `assets/${req.files['image'][0].filename}`;
  }

  if (req.files['gallery']) {
    req.files['gallery'].forEach(file => {
      response.gallery.push(`assets/${file.filename}`);
    });
  }

  return res.json(response);
});

// --- API CATEGORÍAS ---
app.get('/api/categories', (req, res) => {
  res.json(dbData.CATEGORIES);
});

app.post('/api/categories', requireAuth, (req, res) => {
  const { id, name, desc, img } = req.body;
  if (!id || !name) {
    return res.status(400).json({ error: 'El ID y el nombre son obligatorios.' });
  }
  const exists = dbData.CATEGORIES.some(c => c.id === id);
  if (exists) {
    return res.status(400).json({ error: 'Ya existe una categoría con este ID.' });
  }
  const newCat = { id, name, desc: desc || '', img: img || '' };
  dbData.CATEGORIES.push(newCat);
  syncClientDataFile();
  res.status(201).json(newCat);
});

app.put('/api/categories/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  const { name, desc, img } = req.body;
  const catIndex = dbData.CATEGORIES.findIndex(c => c.id === id);
  if (catIndex === -1) {
    return res.status(404).json({ error: 'Categoría no encontrada.' });
  }
  dbData.CATEGORIES[catIndex] = {
    ...dbData.CATEGORIES[catIndex],
    name: name !== undefined ? name : dbData.CATEGORIES[catIndex].name,
    desc: desc !== undefined ? desc : dbData.CATEGORIES[catIndex].desc,
    img: img !== undefined ? img : dbData.CATEGORIES[catIndex].img
  };
  syncClientDataFile();
  res.json(dbData.CATEGORIES[catIndex]);
});

app.delete('/api/categories/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  const catIndex = dbData.CATEGORIES.findIndex(c => c.id === id);
  if (catIndex === -1) {
    return res.status(404).json({ error: 'Categoría no encontrada.' });
  }
  dbData.CATEGORIES.splice(catIndex, 1);
  syncClientDataFile();
  res.json({ success: true, message: 'Categoría eliminada.' });
});

// --- API PRODUCTOS ---
app.get('/api/products', (req, res) => {
  res.json(dbData.PRODUCTS);
});

app.post('/api/products', requireAuth, (req, res) => {
  const { id, name, pieces, cat, img, gallery, price, compare, badge, blurb, desc, specs } = req.body;
  if (!id || !name || !cat) {
    return res.status(400).json({ error: 'El ID, nombre y categoría son obligatorios.' });
  }
  const exists = dbData.PRODUCTS.some(p => p.id === id);
  if (exists) {
    return res.status(400).json({ error: 'Ya existe un producto con este SKU/ID.' });
  }

  const newProduct = {
    id,
    name,
    pieces: pieces || '',
    cat,
    img: img || '',
    gallery: gallery || [],
    price: Number(price) || 0,
    compare: compare ? Number(compare) : null,
    badge: badge || null,
    rating: 5.0,
    reviews: 0,
    blurb: blurb || '',
    desc: desc || '',
    specs: specs || { material: 'Acero quirúrgico 18/8', apto: 'Todas las cocinas', incluye: '', garantia: 'De por vida' }
  };

  dbData.PRODUCTS.push(newProduct);
  syncClientDataFile();
  res.status(201).json(newProduct);
});

app.put('/api/products/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  const fields = req.body;
  const pIndex = dbData.PRODUCTS.findIndex(p => p.id === id);
  if (pIndex === -1) {
    return res.status(404).json({ error: 'Producto no encontrado.' });
  }

  // Prevenir cambio de ID de producto
  delete fields.id;

  if (fields.price !== undefined) fields.price = Number(fields.price) || 0;
  if (fields.compare !== undefined) fields.compare = fields.compare ? Number(fields.compare) : null;

  dbData.PRODUCTS[pIndex] = {
    ...dbData.PRODUCTS[pIndex],
    ...fields
  };

  syncClientDataFile();
  res.json(dbData.PRODUCTS[pIndex]);
});

app.delete('/api/products/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  const pIndex = dbData.PRODUCTS.findIndex(p => p.id === id);
  if (pIndex === -1) {
    return res.status(404).json({ error: 'Producto no encontrado.' });
  }
  dbData.PRODUCTS.splice(pIndex, 1);
  syncClientDataFile();
  res.json({ success: true, message: 'Producto eliminado.' });
});

// --- API RECETAS ---
app.get('/api/recipes', (req, res) => {
  res.json(dbData.RECIPES);
});

app.post('/api/recipes', requireAuth, (req, res) => {
  const { tag, title, desc, img, time, level } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'El título es obligatorio.' });
  }
  const newRecipe = {
    tag: tag || '',
    title,
    desc: desc || '',
    img: img || '',
    time: time || '',
    level: level || 'Fácil'
  };
  dbData.RECIPES.push(newRecipe);
  syncClientDataFile();
  res.status(201).json(newRecipe);
});

app.put('/api/recipes/:index', requireAuth, (req, res) => {
  const index = parseInt(req.params.index);
  if (isNaN(index) || index < 0 || index >= dbData.RECIPES.length) {
    return res.status(404).json({ error: 'Receta no encontrada.' });
  }
  dbData.RECIPES[index] = {
    ...dbData.RECIPES[index],
    ...req.body
  };
  syncClientDataFile();
  res.json(dbData.RECIPES[index]);
});

app.delete('/api/recipes/:index', requireAuth, (req, res) => {
  const index = parseInt(req.params.index);
  if (isNaN(index) || index < 0 || index >= dbData.RECIPES.length) {
    return res.status(404).json({ error: 'Receta no encontrada.' });
  }
  dbData.RECIPES.splice(index, 1);
  syncClientDataFile();
  res.json({ success: true, message: 'Receta eliminada.' });
});

// --- API BENEFICIOS ---
app.get('/api/benefits', (req, res) => {
  res.json(dbData.BENEFITS);
});

app.put('/api/benefits/:k', requireAuth, (req, res) => {
  const { k } = req.params;
  const { title, desc } = req.body;
  const bIndex = dbData.BENEFITS.findIndex(b => b.k === k);
  if (bIndex === -1) {
    return res.status(404).json({ error: 'Beneficio no encontrado.' });
  }
  dbData.BENEFITS[bIndex] = {
    ...dbData.BENEFITS[bIndex],
    title: title !== undefined ? title : dbData.BENEFITS[bIndex].title,
    desc: desc !== undefined ? desc : dbData.BENEFITS[bIndex].desc
  };
  syncClientDataFile();
  res.json(dbData.BENEFITS[bIndex]);
});

// --- API CONFIGURACIONES ---
app.get('/api/settings', (req, res) => {
  res.json(dbData.SETTINGS);
});

app.put('/api/settings', requireAuth, (req, res) => {
  const fields = req.body;
  if (fields.freeShip !== undefined) fields.freeShip = Number(fields.freeShip) || 0;
  if (fields.favUpsellDiscount !== undefined) fields.favUpsellDiscount = Number(fields.favUpsellDiscount) || 0;
  if (fields.shipCABA !== undefined) fields.shipCABA = Number(fields.shipCABA) || 0;
  if (fields.shipProvincias !== undefined) fields.shipProvincias = Number(fields.shipProvincias) || 0;
  if (fields.shipInterior !== undefined) fields.shipInterior = Number(fields.shipInterior) || 0;
  if (fields.shipExterior !== undefined) fields.shipExterior = Number(fields.shipExterior) || 0;
  
  dbData.SETTINGS = {
    ...dbData.SETTINGS,
    ...fields
  };
  syncClientDataFile();
  res.json(dbData.SETTINGS);
});

// --- API PEDIDOS (CRM) ---
app.post('/api/orders', (req, res) => {
  const { 
    clientName, 
    clientPhone, 
    clientAddress, 
    clientEmail, 
    shippingMethod, 
    shippingZone, 
    shippingCost, 
    addressCalle, 
    addressNumero, 
    addressPiso, 
    addressDepto, 
    addressLocalidad, 
    addressDetalle, 
    items, 
    total,
    favs
  } = req.body;

  if (!clientName || !items || items.length === 0) {
    return res.status(400).json({ error: 'Faltan campos obligatorios para registrar el pedido.' });
  }

  // Generar ID correlativo partiendo de 1001
  const lastId = dbData.ORDERS && dbData.ORDERS.length > 0
    ? Math.max(...dbData.ORDERS.map(o => Number(o.id) || 1000))
    : 1000;
  const newId = lastId + 1;

  const newOrder = {
    id: newId,
    date: new Date().toISOString(),
    clientName,
    clientPhone: clientPhone || '',
    clientEmail: clientEmail || '',
    clientAddress: clientAddress || '',
    shippingMethod: shippingMethod || 'Retiro',
    shippingZone: shippingZone || '',
    shippingCost: Number(shippingCost) || 0,
    addressCalle: addressCalle || '',
    addressNumero: addressNumero || '',
    addressPiso: addressPiso || '',
    addressDepto: addressDepto || '',
    addressLocalidad: addressLocalidad || '',
    addressDetalle: addressDetalle || '',
    items,
    total: Number(total) || 0,
    status: 'Pendiente' // Estados: Pendiente, Enviado, Entregado, Cancelado
  };

  if (!dbData.ORDERS) dbData.ORDERS = [];
  dbData.ORDERS.push(newOrder);

  // Buscar si el cliente figura en los leads de favoritos para actualizar su estado a "Compró"
  if (dbData.LEADS) {
    const cleanCPhone = clientPhone ? clientPhone.replace(/[^0-9]/g, '') : '';
    const matchedLead = dbData.LEADS.find(l => {
      const emailMatch = clientEmail && l.email && l.email.toLowerCase().trim() === clientEmail.toLowerCase().trim();
      const cleanLPhone = l.phone ? l.phone.replace(/[^0-9]/g, '') : '';
      const phoneMatch = cleanLPhone && cleanCPhone && 
        (cleanLPhone === cleanCPhone || 
         (cleanLPhone.length >= 8 && cleanCPhone.length >= 8 && cleanLPhone.slice(-8) === cleanCPhone.slice(-8)));
      return emailMatch || phoneMatch;
    });

    if (matchedLead) {
      matchedLead.status = 'Compró';
      matchedLead.name = clientName;
      matchedLead.email = clientEmail || matchedLead.email || '';
      matchedLead.phone = clientPhone;
      // Si el cliente tiene favoritos en esta sesión de compra, actualizamos su listado en el prospecto
      if (favs && Array.isArray(favs) && favs.length > 0) {
        matchedLead.favs = favs;
      }
      matchedLead.date = new Date().toISOString();
    } else if (favs && Array.isArray(favs) && favs.length > 0) {
      // Si el cliente no figuraba como prospecto pero compra teniendo favoritos, lo damos de alta como "Compró"
      const newLead = {
        id: Date.now(),
        date: new Date().toISOString(),
        name: clientName,
        email: clientEmail || '',
        phone: clientPhone,
        favs: favs,
        status: 'Compró'
      };
      dbData.LEADS.push(newLead);
    }
  }
  
  // Guardamos cambios sólo en db.json (por privacidad, no se escribe en js/data.js)
  fs.writeFileSync(DB_PATH, JSON.stringify(dbData, null, 2));

  res.status(201).json(newOrder);
});

app.get('/api/orders', requireAuth, (req, res) => {
  if (!dbData.ORDERS) dbData.ORDERS = [];
  // Devolver de más nuevos a más viejos
  const sorted = [...dbData.ORDERS].sort((a, b) => b.id - a.id);
  res.json(sorted);
});

app.put('/api/orders/:id', requireAuth, (req, res) => {
  const orderId = Number(req.params.id);
  const { status } = req.body;
  
  const oIndex = dbData.ORDERS.findIndex(o => o.id === orderId);
  if (oIndex === -1) {
    return res.status(404).json({ error: 'Pedido no encontrado.' });
  }

  dbData.ORDERS[oIndex].status = status || dbData.ORDERS[oIndex].status;
  
  fs.writeFileSync(DB_PATH, JSON.stringify(dbData, null, 2));
  res.json(dbData.ORDERS[oIndex]);
});

app.delete('/api/orders/:id', requireAuth, (req, res) => {
  const orderId = Number(req.params.id);
  const oIndex = dbData.ORDERS.findIndex(o => o.id === orderId);
  if (oIndex === -1) {
    return res.status(404).json({ error: 'Pedido no encontrado.' });
  }
  
  dbData.ORDERS.splice(oIndex, 1);
  fs.writeFileSync(DB_PATH, JSON.stringify(dbData, null, 2));
  res.json({ success: true, message: 'Pedido eliminado de los registros.' });
});

// --- API PROSPECTOS (LEADS DE FAVORITOS) ---
app.post('/api/leads', (req, res) => {
  const { name, email, phone, favs } = req.body;
  if (!name || !phone || !favs || !Array.isArray(favs)) {
    return res.status(400).json({ error: 'Nombre, teléfono y favoritos son obligatorios.' });
  }

  if (!dbData.LEADS) dbData.LEADS = [];

  // Buscar si ya existe el prospecto por email o teléfono
  let lead = dbData.LEADS.find(l => 
    (email && l.email && l.email.toLowerCase().trim() === email.toLowerCase().trim()) || 
    (l.phone && l.phone.replace(/[^0-9]/g, '') === phone.replace(/[^0-9]/g, ''))
  );

  if (lead) {
    // Si ya existe, actualizamos sus favoritos, contacto y fecha
    lead.name = name;
    lead.email = email || lead.email || '';
    lead.phone = phone;
    lead.favs = favs;
    lead.date = new Date().toISOString();
    lead.status = 'Interesado'; // Reseteamos a interesado por si había comprado y ahora guardó nuevos favoritos
  } else {
    // Si no existe, creamos uno nuevo
    lead = {
      id: Date.now(),
      date: new Date().toISOString(),
      name,
      email: email || '',
      phone,
      favs,
      status: 'Interesado' // Estados: Interesado, Compró
    };
    dbData.LEADS.push(lead);
  }

  fs.writeFileSync(DB_PATH, JSON.stringify(dbData, null, 2));
  res.status(201).json(lead);
});

app.get('/api/leads', requireAuth, (req, res) => {
  if (!dbData.LEADS) dbData.LEADS = [];
  const sorted = [...dbData.LEADS].sort((a, b) => new Date(b.date) - new Date(a.date));
  res.json(sorted);
});

app.delete('/api/leads/:id', requireAuth, (req, res) => {
  const leadId = Number(req.params.id);
  if (!dbData.LEADS) dbData.LEADS = [];
  const idx = dbData.LEADS.findIndex(l => l.id === leadId);
  if (idx === -1) {
    return res.status(404).json({ error: 'Prospecto no encontrado.' });
  }
  dbData.LEADS.splice(idx, 1);
  fs.writeFileSync(DB_PATH, JSON.stringify(dbData, null, 2));
  res.json({ success: true, message: 'Prospecto eliminado.' });
});

// --- MIDDLEWARE AUTH COMPRADOR ---
const requireUserAuth = (req, res, next) => {
  const token = req.cookies.pw_user_token;
  if (!token) return res.status(401).json({ error: 'Sesión de usuario requerida.' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Sesión expirada.' });
  }
};

// --- API USUARIOS (COMPRADORES) ---

// Registro
app.post('/api/users/register', (req, res) => {
  const { name, email, phone, address, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Nombre, email y contraseña son obligatorios.' });
  }
  if (!dbData.USERS) dbData.USERS = [];
  if (dbData.USERS.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(400).json({ error: 'Ya existe una cuenta con ese email.' });
  }
  const newUser = {
    id: Date.now(),
    date: new Date().toISOString(),
    name,
    email: email.toLowerCase().trim(),
    phone: phone || '',
    address: address || '',
    passwordHash: bcrypt.hashSync(password, 10)
  };
  dbData.USERS.push(newUser);
  fs.writeFileSync(DB_PATH, JSON.stringify(dbData, null, 2));
  const token = jwt.sign({ userId: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: '30d' });
  res.cookie('pw_user_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 30 * 24 * 60 * 60 * 1000
  });
  res.status(201).json({ success: true, name: newUser.name, email: newUser.email });
});

// Login
app.post('/api/users/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email y contraseña requeridos.' });
  if (!dbData.USERS) dbData.USERS = [];
  const user = dbData.USERS.find(u => u.email === email.toLowerCase().trim());
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Email o contraseña incorrectos.' });
  }
  const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });
  res.cookie('pw_user_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 30 * 24 * 60 * 60 * 1000
  });
  res.json({ success: true, name: user.name, email: user.email });
});

// Logout
app.post('/api/users/logout', (req, res) => {
  res.clearCookie('pw_user_token');
  res.json({ success: true });
});

// Verificar sesión
app.get('/api/users/me', requireUserAuth, (req, res) => {
  const user = dbData.USERS.find(u => u.id === req.user.userId);
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado.' });
  const { passwordHash, ...safe } = user;
  res.json(safe);
});

// Actualizar perfil
app.put('/api/users/me', requireUserAuth, (req, res) => {
  const idx = dbData.USERS.findIndex(u => u.id === req.user.userId);
  if (idx === -1) return res.status(404).json({ error: 'Usuario no encontrado.' });
  const { name, phone, address } = req.body;
  if (name) dbData.USERS[idx].name = name;
  if (phone !== undefined) dbData.USERS[idx].phone = phone;
  if (address !== undefined) dbData.USERS[idx].address = address;
  fs.writeFileSync(DB_PATH, JSON.stringify(dbData, null, 2));
  const { passwordHash, ...safe } = dbData.USERS[idx];
  res.json(safe);
});

// Listar usuarios (solo admin)
app.get('/api/users', requireAuth, (req, res) => {
  if (!dbData.USERS) return res.json([]);
  const safe = dbData.USERS.map(({ passwordHash, ...u }) => u);
  res.json(safe.sort((a, b) => new Date(b.date) - new Date(a.date)));
});

// Guardar favoritos del usuario logueado
app.put('/api/users/me/favorites', requireUserAuth, (req, res) => {
  const { favorites } = req.body;
  if (!Array.isArray(favorites)) return res.status(400).json({ error: 'favorites debe ser un array.' });
  const idx = dbData.USERS.findIndex(u => u.id === req.user.userId);
  if (idx === -1) return res.status(404).json({ error: 'Usuario no encontrado.' });
  dbData.USERS[idx].favorites = favorites;
  dbData.USERS[idx].favoritesUpdated = new Date().toISOString();
  fs.writeFileSync(DB_PATH, JSON.stringify(dbData, null, 2));
  res.json({ success: true, favorites });
});

// Registrar interés anónimo (visitante sin cuenta que guarda favoritos)
app.post('/api/interest', (req, res) => {
  const { productIds, sessionId } = req.body;
  if (!productIds || !Array.isArray(productIds) || !productIds.length) {
    return res.status(400).json({ error: 'productIds requerido.' });
  }
  if (!dbData.INTERESTS) dbData.INTERESTS = [];
  // Actualizar si ya existe la sesión, si no crear nueva
  const existing = dbData.INTERESTS.find(i => i.sessionId === sessionId);
  if (existing) {
    existing.productIds = productIds;
    existing.updatedAt = new Date().toISOString();
  } else {
    dbData.INTERESTS.push({
      id: Date.now(),
      sessionId: sessionId || String(Date.now()),
      productIds,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }
  // Mantener solo los últimos 200 registros
  if (dbData.INTERESTS.length > 200) {
    dbData.INTERESTS = dbData.INTERESTS.slice(-200);
  }
  fs.writeFileSync(DB_PATH, JSON.stringify(dbData, null, 2));
  res.json({ success: true });
});

// Ver intereses anónimos (solo admin)
app.get('/api/interest', requireAuth, (req, res) => {
  if (!dbData.INTERESTS) return res.json([]);
  res.json([...dbData.INTERESTS].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)));
});

// Eliminar usuario (solo admin)
app.delete('/api/users/:id', requireAuth, (req, res) => {
  const id = Number(req.params.id);
  const idx = dbData.USERS.findIndex(u => u.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Usuario no encontrado.' });
  dbData.USERS.splice(idx, 1);
  fs.writeFileSync(DB_PATH, JSON.stringify(dbData, null, 2));
  res.json({ success: true });
});

// Exportar usuarios a CSV (solo admin)
app.get('/api/users/export', requireAuth, (req, res) => {
  if (!dbData.USERS) return res.send('');
  const rows = ['Nombre,Email,Teléfono,Dirección,Fecha'].concat(
    dbData.USERS.map(u => `"${u.name}","${u.email}","${u.phone || ''}","${u.address || ''}","${u.date}"`)
  );
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="usuarios-princessware.csv"');
  res.send('﻿' + rows.join('\n'));
});

// Servir panel de administración estático
app.use('/admin', express.static(path.join(__dirname, 'admin')));

// Servir el resto del sitio web
app.use(express.static(__dirname));

// Levantar servidor
app.listen(PORT, () => {
  console.log(`Servidor de Princessware corriendo en http://localhost:${PORT}`);
  console.log(`Panel de Administración disponible en http://localhost:${PORT}/admin`);
});
